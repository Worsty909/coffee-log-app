// Přihlašovací session: podepsaný token v httpOnly cookie.
//
// Token má tvar `<expirace v ms>.<HMAC-SHA256 podpis>`. Na serveru se
// nic neukládá — platnost se pozná jen z podpisu, takže ověření nestojí
// žádný dotaz do databáze a zvládne ho i proxy před každým requestem.
//
// Tenhle soubor je čistá logika bez přístupu k cookies a prostředí, aby
// šel testovat (viz session.test.ts). Čtení cookie řeší ./server.ts.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "coffee_session";

/** Jak dlouho vydrží přihlášení na jednom zařízení. */
export const SESSION_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

/**
 * Podpisový klíč. Míchá se do něj i PIN, takže změna PINu automaticky
 * odhlásí všechna zařízení. Samotný PIN jako klíč nestačí — má jen pár
 * tisíc možností a token by šel podvrhnout zkoušením; bezpečnost stojí
 * na `secret`, který musí být dlouhý a náhodný.
 */
export function deriveSessionKey(secret: string, pin: string): Buffer {
  return createHmac("sha256", secret).update(`coffee-log/session/v1/${pin}`).digest();
}

function sign(expiresAt: number, key: Buffer): string {
  return createHmac("sha256", key).update(String(expiresAt)).digest("base64url");
}

export function createSessionToken(key: Buffer, now: number = Date.now()): string {
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;
  return `${expiresAt}.${sign(expiresAt, key)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  key: Buffer,
  now: number = Date.now(),
): boolean {
  if (!token) return false;

  const match = /^(\d{1,16})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return false;

  const expiresAt = Number(match[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;

  const expected = Buffer.from(sign(expiresAt, key));
  const actual = Buffer.from(match[2]);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Porovnání PINu v konstantním čase. Obě strany se nejdřív zahashují,
 * aby měly stejnou délku — z doby odpovědi se tak nedá vyčíst ani délka
 * PINu, ani kolik číslic sedí.
 */
export function pinMatches(candidate: string, pin: string): boolean {
  const key = "coffee-log/pin-compare";
  const a = createHmac("sha256", key).update(candidate).digest();
  const b = createHmac("sha256", key).update(pin).digest();
  return timingSafeEqual(a, b);
}

/**
 * Kam po přihlášení. Bere jen cesty uvnitř appky — jinak by odkaz
 * `/login?next=https://cizi-web` šel zneužít k přesměrování jinam.
 */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/";
  if (next === "/login" || next.startsWith("/login?")) return "/";
  return next;
}
