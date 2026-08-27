// Nastavení appky (vybavení, výchozí dávka, běžné nastavení mlýnku).
//
// V databázi je vždy nejvýš jeden řádek s pevným id "singleton" —
// appka je osobní log jednoho člověka, takže nemá smysl řešit, který
// záznam je "ten můj". Když řádek ještě neexistuje (čerstvá databáze
// bez seedu), vytvoří se s výchozími hodnotami ze schématu.
import { prisma } from "@/lib/prisma";
import type { GrindSetting } from "@/lib/grind";

export const SETTINGS_ID = "singleton";

export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

/** Běžné espresso nastavení mlýnku, od kterého se odvozují posuny profilů. */
export function baseGrindSetting(settings: {
  baseGrindRotations: number;
  baseGrindNumber: number;
  baseGrindClicks: number;
}): GrindSetting {
  return {
    rotations: settings.baseGrindRotations,
    number: settings.baseGrindNumber,
    clicks: settings.baseGrindClicks,
  };
}
