-- CreateEnum
CREATE TYPE "Process" AS ENUM ('WASHED', 'NATURAL', 'HONEY', 'OTHER');

-- CreateTable
CREATE TABLE "Bean" (
    "id" TEXT NOT NULL,
    "roaster" TEXT NOT NULL,
    "coffeeName" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "region" TEXT,
    "process" "Process" NOT NULL,
    "roastDate" TIMESTAMP(3),
    "sweetness" INTEGER,
    "acidity" INTEGER,
    "body" INTEGER,
    "aftertaste" INTEGER,
    "notes" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bean_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrewMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultRatio" DOUBLE PRECISION NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrewMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "beanId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "coffeeGrams" DOUBLE PRECISION NOT NULL,
    "waterGrams" DOUBLE PRECISION NOT NULL,
    "grindSetting" TEXT,
    "waterTempC" DOUBLE PRECISION,
    "bloomSeconds" INTEGER,
    "targetTotalSeconds" INTEGER,
    "actualTotalSeconds" INTEGER,
    "rating" INTEGER,
    "notes" TEXT,
    "brewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bean_roaster_idx" ON "Bean"("roaster");

-- CreateIndex
CREATE UNIQUE INDEX "BrewMethod_name_key" ON "BrewMethod"("name");

-- CreateIndex
CREATE INDEX "Recipe_beanId_brewedAt_idx" ON "Recipe"("beanId", "brewedAt");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_beanId_fkey" FOREIGN KEY ("beanId") REFERENCES "Bean"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "BrewMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
