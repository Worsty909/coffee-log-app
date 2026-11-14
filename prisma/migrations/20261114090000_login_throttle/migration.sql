-- CreateTable
CREATE TABLE "LoginThrottle" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "LoginThrottle_pkey" PRIMARY KEY ("id")
);

-- Jediný řádek počítadla — zakládá se rovnou migrací, ať ho appka
-- nemusí vytvářet při prvním přihlášení.
INSERT INTO "LoginThrottle" ("id") VALUES ('singleton') ON CONFLICT DO NOTHING;
