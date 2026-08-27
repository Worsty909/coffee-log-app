// Práce s nastavením mlýnku 1Zpresso J-Ultra.
//
// Mlýnek se nastavuje zápisem X.X.X — otáčky, číslo na kotouči, klik:
//
//     0.8.3  =  0 otáček + číslo 8 + 3 kliky  =  83 kliků od nuly
//
// Na jednu otáčku je 100 kliků a jedno číslo na kotouči je 10 kliků,
// takže se celé nastavení dá převést na jedno číslo (celkový počet
// kliků od nuly). To je praktické: rozdíl dvou nastavení je pak prostý
// rozdíl dvou čísel a appka umí říct "o 8 kliků hrubší" místo vágního
// "zkus jinou hrubost".

export const CLICKS_PER_ROTATION = 100;
export const CLICKS_PER_NUMBER = 10;

export type GrindSetting = {
  rotations: number;
  number: number;
  clicks: number;
};

/** Převede nastavení X.X.X na celkový počet kliků od nuly. */
export function toClicks(setting: GrindSetting): number {
  return (
    setting.rotations * CLICKS_PER_ROTATION +
    setting.number * CLICKS_PER_NUMBER +
    setting.clicks
  );
}

/** Opačný převod — z celkového počtu kliků zpět na zápis X.X.X. */
export function fromClicks(totalClicks: number): GrindSetting {
  const clamped = Math.max(0, Math.round(totalClicks));
  return {
    rotations: Math.floor(clamped / CLICKS_PER_ROTATION),
    number: Math.floor((clamped % CLICKS_PER_ROTATION) / CLICKS_PER_NUMBER),
    clicks: clamped % CLICKS_PER_NUMBER,
  };
}

/** Zápis nastavení tak, jak ho čteš na mlýnku: "0.8.3". */
export function formatGrind(setting: GrindSetting): string {
  return `${setting.rotations}.${setting.number}.${setting.clicks}`;
}

/**
 * Přečte zápis "0.8.3" (tolerantně i s mezerami nebo čárkami). Vrací
 * null, pokud to zápis mlýnku není — volající pak hodnotu bere jako
 * volnou poznámku.
 */
export function parseGrind(text: string): GrindSetting | null {
  const match = text.trim().match(/^(\d+)\s*[.,]\s*(\d+)\s*[.,]\s*(\d+)$/);
  if (!match) return null;

  const [, rotations, number, clicks] = match;
  const setting = {
    rotations: Number(rotations),
    number: Number(number),
    clicks: Number(clicks),
  };

  // Číslo na kotouči i klik jsou jednociferné (0–9); cokoliv jiného je
  // překlep, ne platné nastavení.
  if (setting.number > 9 || setting.clicks > 9) return null;

  return setting;
}

/**
 * Posune nastavení o daný počet kliků (kladné = hrubší) a vrátí nový
 * zápis X.X.X. Používá se pro doporučení "zkus o 8 kliků hrubší" a pro
 * přepočet výchozího nastavení podle zvoleného tlakového profilu.
 */
export function shiftGrind(setting: GrindSetting, offsetClicks: number): GrindSetting {
  return fromClicks(toClicks(setting) + offsetClicks);
}

/**
 * Slovní popis rozdílu dvou nastavení, např. "o 8 kliků hrubší".
 * Vrací null, když jsou nastavení stejná.
 */
export function describeGrindDelta(from: GrindSetting, to: GrindSetting): string | null {
  const delta = toClicks(to) - toClicks(from);
  if (delta === 0) return null;

  const clicks = Math.abs(delta);
  const unit = clicks === 1 ? "klik" : clicks < 5 ? "kliky" : "kliků";
  return `o ${clicks} ${unit} ${delta > 0 ? "hrubší" : "jemnější"}`;
}
