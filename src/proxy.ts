// Brána před celou appkou: bez platné přihlašovací cookie se nikdo
// nedostane dál než na /login. Běží před každým requestem (stránky,
// server akce i nahrané fotky v /uploads).
//
// Ověření je jen kontrola podpisu tokenu — žádný dotaz do databáze,
// takže to appku nezpomaluje.
import { NextResponse, type NextRequest } from "next/server";
import { getAuthConfig } from "@/lib/auth/config";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const config = getAuthConfig();
  const authenticated =
    config !== null &&
    verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, config.sessionKey);

  if (pathname === "/login") {
    return authenticated
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Všechno kromě statických souborů Next.js a toho, co prohlížeč
  // potřebuje ještě před přihlášením (ikona a manifest pro "Přidat na
  // plochu"). Nic z toho neobsahuje data z deníku.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico$|icon$|manifest\\.webmanifest$).*)"],
};
