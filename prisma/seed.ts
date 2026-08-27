// Naplní databázi výchozími metodami přípravy, tlakovými profily pro
// Flair 58+ 2 a nastavením vybavení. Spouští se přes `npx prisma db seed`
// (nebo automaticky po `prisma migrate reset`).
//
// Je bezpečné spustit vícekrát — všechno jde přes `upsert`, takže se nic
// nezdvojí. Vlastní (uživatelské) metody a profily zůstávají nedotčené,
// seed sahá jen na ty výchozí.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { MethodKind } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// `defaultRatio` je jmenovatel poměru dávka:výdej — u espressa 2 znamená
// 18 g → 36 g, u filtru 16 znamená 1:16 (káva:voda).
const methods = [
  { name: "Espresso", kind: MethodKind.ESPRESSO, defaultRatio: 2, defaultDoseGrams: 18, sortOrder: 0 },
  { name: "Překapávač", kind: MethodKind.FILTER, defaultRatio: 16, defaultDoseGrams: 30, sortOrder: 10 },
  { name: "V60 (pourover)", kind: MethodKind.FILTER, defaultRatio: 16, defaultDoseGrams: 15, sortOrder: 11 },
  { name: "Aeropress", kind: MethodKind.FILTER, defaultRatio: 15, defaultDoseGrams: 15, sortOrder: 12 },
  { name: "Moka konvička", kind: MethodKind.FILTER, defaultRatio: 10, defaultDoseGrams: 15, sortOrder: 13 },
  { name: "French press", kind: MethodKind.FILTER, defaultRatio: 15, defaultDoseGrams: 30, sortOrder: 14 },
];

// Tlakové profily pro pákový Flair 58+ 2.
//
// `grindOffsetClicks` je doporučený posun oproti tvému běžnému espresso
// nastavení mlýnku (kladné = hrubší). Turbo shot potřebuje výrazně
// hrubší mletí, aby voda protekla rychle při nižším tlaku; blooming a
// klasika jedou zhruba na stejném mletí.
//
// Fáze jsou vodítko, ne dogma — na páce se tlak drží rukou, takže tam,
// kde má smysl rozsah, je uvedený rozsah.
const espressoProfiles = [
  {
    name: "Klasické espresso",
    description:
      "Univerzální výchozí bod. Nízkotlaká preinfuze usadí puk a omezí kanálky, pak náběh na plný tlak.",
    defaultRatio: 2,
    defaultDoseGrams: 18,
    grindOffsetClicks: 0,
    waterTempC: 93,
    sortOrder: 0,
    phases: [
      { label: "Preinfuze", targetBarMin: 2, targetBarMax: 3, durationSeconds: 10, note: "Táhni pomalu, dokud se neobjeví první kapky." },
      { label: "Náběh", targetBarMin: 6, targetBarMax: 9, durationSeconds: 5, note: "Plynule přidávej tlak, ne skokem." },
      { label: "Extrakce", targetBarMin: 6, targetBarMax: 9, durationSeconds: 15, note: "Drž tlak, sleduj barvu výtoku." },
    ],
  },
  {
    name: "Blooming espresso",
    description:
      "Krátká preinfuze, pak úplné uvolnění tlaku — puk se nadechne a odplyní. Odpouštěcí profil, sedí na světlá pražení.",
    defaultRatio: 2.2,
    defaultDoseGrams: 18,
    grindOffsetClicks: 0,
    waterTempC: 94,
    sortOrder: 1,
    phases: [
      { label: "Smočení", targetBarMin: 2, targetBarMax: 3, durationSeconds: 10, note: "Jen namočit puk." },
      { label: "Bloom (bez tlaku)", targetBarMin: 0, targetBarMax: 0, durationSeconds: 30, note: "Úplně povol páku a nech kávu odplynit." },
      { label: "Náběh", targetBarMin: 6, targetBarMax: 8, durationSeconds: 5, note: null },
      { label: "Extrakce", targetBarMin: 6, targetBarMax: 8, durationSeconds: 20, note: null },
    ],
  },
  {
    name: "Turbo shot",
    description:
      "Hrubší mletí, nižší tlak, delší výdej a krátký čas. Vyšší výtěžnost bez hořkosti — dělané na světlá pražení.",
    defaultRatio: 2.75,
    defaultDoseGrams: 18,
    grindOffsetClicks: 8,
    waterTempC: 95,
    sortOrder: 2,
    phases: [
      { label: "Krátká preinfuze", targetBarMin: 2, targetBarMax: 3, durationSeconds: 5, note: null },
      { label: "Extrakce", targetBarMin: 5, targetBarMax: 6, durationSeconds: 15, note: "Nižší tlak, voda protéká rychle." },
    ],
  },
  {
    name: "Turbo allongé",
    description:
      "Turbo dotažené do delšího výdeje (1:3–1:4). Čistý, čajový šálek — něco mezi espressem a filtrem.",
    defaultRatio: 3.5,
    defaultDoseGrams: 18,
    grindOffsetClicks: 12,
    waterTempC: 95,
    sortOrder: 3,
    phases: [
      { label: "Krátká preinfuze", targetBarMin: 2, targetBarMax: 3, durationSeconds: 5, note: null },
      { label: "Extrakce", targetBarMin: 4, targetBarMax: 6, durationSeconds: 25, note: "Drž nižší tlak, ať to neproteče moc rychle." },
    ],
  },
  {
    name: "Nízkotlaký lever profil",
    description:
      "Dlouhá preinfuze na 3 bar, pak jen 6–7 bar. Pomalý náběh tlaku omezuje kanálky a zvedá výtěžnost.",
    defaultRatio: 2,
    defaultDoseGrams: 18,
    grindOffsetClicks: -2,
    waterTempC: 93,
    sortOrder: 4,
    phases: [
      { label: "Dlouhá preinfuze", targetBarMin: 3, targetBarMax: 3, durationSeconds: 15, note: "Drž 3 bar, dokud nezačne kapat." },
      { label: "Pomalý náběh", targetBarMin: 4, targetBarMax: 6, durationSeconds: 8, note: "Postupně, ne skokem." },
      { label: "Extrakce", targetBarMin: 6, targetBarMax: 7, durationSeconds: 15, note: null },
    ],
  },
];

async function main() {
  for (const method of methods) {
    await prisma.brewMethod.upsert({
      where: { name: method.name },
      update: {
        kind: method.kind,
        defaultRatio: method.defaultRatio,
        defaultDoseGrams: method.defaultDoseGrams,
        sortOrder: method.sortOrder,
      },
      create: { ...method, isCustom: false },
    });
  }

  const espresso = await prisma.brewMethod.findUniqueOrThrow({ where: { name: "Espresso" } });

  for (const { phases, ...profile } of espressoProfiles) {
    const saved = await prisma.pressureProfile.upsert({
      where: { name: profile.name },
      update: { ...profile, methodId: espresso.id },
      create: { ...profile, methodId: espresso.id, isCustom: false },
    });

    // Fáze se přepisují celé — jsou to výchozí hodnoty, ne uživatelská data.
    await prisma.pressurePhase.deleteMany({ where: { profileId: saved.id } });
    await prisma.pressurePhase.createMany({
      data: phases.map((phase, index) => ({ ...phase, profileId: saved.id, order: index })),
    });
  }

  // Nastavení vybavení — vytvoří se jen jednou, další spuštění seedu už
  // nepřepíše hodnoty, které sis mezitím upravil v appce.
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  console.log(
    `Seed hotový: ${methods.length} metod, ${espressoProfiles.length} tlakových profilů, nastavení vybavení.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
