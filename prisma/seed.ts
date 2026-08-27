// Naplní databázi výchozími metodami přípravy s obvyklými poměry
// káva:voda. Spouští se přes `npx prisma db seed` (nebo automaticky
// po `prisma migrate reset`). Je bezpečné spustit vícekrát — `upsert`
// existující metody jen přepíše na tyto výchozí hodnoty, nic
// nezdvojí.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// defaultRatio je jmenovatel poměru 1:N (např. 16 => 1:16).
const defaultMethods = [
  { name: "Espresso", defaultRatio: 2 },
  { name: "V60 (pourover)", defaultRatio: 16 },
  { name: "Moka konvička", defaultRatio: 10 },
  { name: "Aeropress", defaultRatio: 15 },
  { name: "French press", defaultRatio: 15 },
];

async function main() {
  for (const method of defaultMethods) {
    await prisma.brewMethod.upsert({
      where: { name: method.name },
      update: { defaultRatio: method.defaultRatio },
      create: { ...method, isCustom: false },
    });
  }
  console.log(`Seed hotový: ${defaultMethods.length} výchozích metod přípravy.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
