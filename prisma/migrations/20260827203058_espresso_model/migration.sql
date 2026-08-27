/*
  Espresso-first datový model.

  POZOR — tahle migrace je ručně upravená. Prisma původně vygenerovala
  DROP + ADD pro přejmenovaná pole Recipe, což by smazalo existující
  záznamy (a na neprázdné tabulce by kvůli NOT NULL bez defaultu
  rovnou selhalo). Nahrazeno za RENAME COLUMN, které data zachová:

    coffeeGrams  -> doseGrams
    waterGrams   -> yieldGrams
    grindSetting -> grindNote   (volný popis mletí; nové strukturované
                                 pole X.X.X je vedle v grindRotations/
                                 grindNumber/grindClicks)
*/
-- CreateEnum
CREATE TYPE "RoastLevel" AS ENUM ('LIGHT', 'MEDIUM_LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK');

-- CreateEnum
CREATE TYPE "MethodKind" AS ENUM ('ESPRESSO', 'FILTER');

-- AlterTable
ALTER TABLE "Bean" ADD COLUMN     "roastLevel" "RoastLevel";

-- AlterTable
ALTER TABLE "BrewMethod" ADD COLUMN     "defaultDoseGrams" DOUBLE PRECISION,
ADD COLUMN     "kind" "MethodKind" NOT NULL DEFAULT 'FILTER',
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable (přejmenování existujících sloupců — data zůstávají)
ALTER TABLE "Recipe" RENAME COLUMN "coffeeGrams" TO "doseGrams";
ALTER TABLE "Recipe" RENAME COLUMN "waterGrams" TO "yieldGrams";
ALTER TABLE "Recipe" RENAME COLUMN "grindSetting" TO "grindNote";

-- AlterTable (nové sloupce)
ALTER TABLE "Recipe" ADD COLUMN     "brewerLabel" TEXT,
ADD COLUMN     "grindClicks" INTEGER,
ADD COLUMN     "grindNumber" INTEGER,
ADD COLUMN     "grindRotations" INTEGER,
ADD COLUMN     "grinderLabel" TEXT,
ADD COLUMN     "profileId" TEXT;

-- CreateTable
CREATE TABLE "PressureProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "methodId" TEXT NOT NULL,
    "defaultRatio" DOUBLE PRECISION,
    "defaultDoseGrams" DOUBLE PRECISION,
    "grindOffsetClicks" INTEGER,
    "waterTempC" DOUBLE PRECISION,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PressureProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PressurePhase" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "targetBarMin" DOUBLE PRECISION,
    "targetBarMax" DOUBLE PRECISION,
    "durationSeconds" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "PressurePhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "grinderName" TEXT NOT NULL DEFAULT '1Zpresso J-Ultra',
    "brewerName" TEXT NOT NULL DEFAULT 'Flair 58+ 2',
    "basketName" TEXT NOT NULL DEFAULT 'IMS Big Bang 58 mm, 18–20 g (H23,5)',
    "screenName" TEXT NOT NULL DEFAULT 'IMS Big Bang puck screen',
    "defaultDoseGrams" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "baseGrindRotations" INTEGER NOT NULL DEFAULT 0,
    "baseGrindNumber" INTEGER NOT NULL DEFAULT 8,
    "baseGrindClicks" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PressureProfile_name_key" ON "PressureProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PressurePhase_profileId_order_key" ON "PressurePhase"("profileId", "order");

-- AddForeignKey
ALTER TABLE "PressureProfile" ADD CONSTRAINT "PressureProfile_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "BrewMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PressurePhase" ADD CONSTRAINT "PressurePhase_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PressureProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PressureProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
