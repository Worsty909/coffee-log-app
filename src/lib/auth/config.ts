// Konfigurace přihlášení z proměnných prostředí.
//
// PIN se NIKDY nezapisuje do kódu ani do repozitáře — ani jako hash
// (hash čtyřmístného PINu se dá uhodnout vyzkoušením všech 10 000
// možností za zlomek sekundy). Žije jen v proměnné prostředí APP_PIN
// na serveru, kam se z prohlížeče nedá dostat.
import { deriveSessionKey } from "./session";

export type AuthConfig = {
  pin: string;
  sessionKey: Buffer;
};

/**
 * Vrátí konfiguraci, nebo null, když PIN není nastavený. Bez nastaveného
 * PINu appka zůstává zamčená (viz přihlašovací stránka) — nikdy se
 * neotevře jen proto, že někdo zapomněl proměnnou doplnit.
 */
export function getAuthConfig(): AuthConfig | null {
  const pin = process.env.APP_PIN?.trim();
  if (!pin || !/^\d{4,12}$/.test(pin)) return null;

  // Tajemství pro podpis session. Když není zadané vlastní AUTH_SECRET,
  // poslouží connection string databáze — v produkci obsahuje dlouhé
  // náhodné heslo, existuje jen na serveru a appka bez něj stejně neběží.
  const secret = process.env.AUTH_SECRET?.trim() || process.env.DATABASE_URL;
  if (!secret) return null;

  return { pin, sessionKey: deriveSessionKey(secret, pin) };
}
