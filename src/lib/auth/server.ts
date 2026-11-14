// Serverová část přihlášení: čtení cookie a kontrola PINu proti zámku.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthConfig } from "./config";
import { FREE_ATTEMPTS, lockMinutesAfter } from "./lockout";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  pinMatches,
  verifySessionToken,
} from "./session";

export async function isAuthenticated(): Promise<boolean> {
  const config = getAuthConfig();
  if (!config) return false;
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value, config.sessionKey);
}

/**
 * Volá se na začátku každé server akce. Stránky hlídá proxy
 * (src/proxy.ts), ale server akce jsou veřejně dosažitelné POST
 * endpointy — proto si přihlášení ověřují ještě samy a nespoléhají na
 * to, že se k nim request dostal správnou cestou.
 */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export async function startSession(): Promise<void> {
  const config = getAuthConfig();
  if (!config) return;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(config.sessionKey), {
    httpOnly: true, // JavaScript na stránce se k tokenu nedostane
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export type LoginResult =
  | { status: "ok" }
  | { status: "not-configured" }
  | { status: "invalid"; attemptsLeft: number; lockedUntil: Date | null }
  | { status: "locked"; lockedUntil: Date };

/**
 * Zkontroluje PIN. Celé to běží v jedné transakci se zamčeným řádkem
 * počítadla, takže ani hromada souběžných requestů nedostane víc pokusů,
 * než kolik zámek dovoluje.
 */
export async function attemptLogin(candidate: string): Promise<LoginResult> {
  const config = getAuthConfig();
  if (!config) return { status: "not-configured" };

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`INSERT INTO "LoginThrottle" ("id") VALUES ('singleton') ON CONFLICT DO NOTHING`;
    const [row] = await tx.$queryRaw<{ failedAttempts: number; lockedUntil: Date | null }[]>`
      SELECT "failedAttempts", "lockedUntil" FROM "LoginThrottle" WHERE "id" = 'singleton' FOR UPDATE`;

    const now = new Date();
    if (row.lockedUntil && row.lockedUntil > now) {
      // Během zámku se PIN vůbec nevyhodnocuje — ani ten správný.
      return { status: "locked", lockedUntil: row.lockedUntil } as const;
    }

    if (pinMatches(candidate, config.pin)) {
      await tx.loginThrottle.update({
        where: { id: "singleton" },
        data: { failedAttempts: 0, lockedUntil: null },
      });
      return { status: "ok" } as const;
    }

    const failedAttempts = row.failedAttempts + 1;
    const lockMinutes = lockMinutesAfter(failedAttempts);
    const lockedUntil = lockMinutes > 0 ? new Date(now.getTime() + lockMinutes * 60_000) : null;
    await tx.loginThrottle.update({
      where: { id: "singleton" },
      data: { failedAttempts, lockedUntil },
    });
    return {
      status: "invalid",
      attemptsLeft: Math.max(0, FREE_ATTEMPTS - failedAttempts),
      lockedUntil,
    } as const;
  });
}
