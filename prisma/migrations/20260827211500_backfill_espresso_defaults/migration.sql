/*
  Datová migrace: dorovná vestavěná data po přechodu na espresso model.

  Proč je potřeba:

  1) Předchozí migrace přidala sloupec `BrewMethod.kind` s výchozí
     hodnotou FILTER. Metody, které v databázi už byly (včetně
     "Espresso"), tím dostaly FILTER — appka pak espresso větev vůbec
     nezapnula.

  2) Tlakové profily se plní seed skriptem, jenže ten se při nasazení na
     Vercel nespouští (build dělá jen `prisma migrate deploy`). Na
     nasazené appce tak žádné profily nebyly.

  Vestavěná data proto zakládáme přímo tady, aby se produkce spravila
  samotným deployem. Vše je psané tak, aby to šlo spustit opakovaně a
  nepřepsalo to nic, co si uživatel upravil sám:
    - metody a profily se vkládají s ON CONFLICT DO NOTHING podle jména
    - `kind` se dorovnává jen tam, kde ještě odpovídá výchozí hodnotě

  `prisma/seed.ts` zůstává zdrojem pravdy pro čerstvé databáze; tahle
  migrace je jednorázová oprava už existujících.
*/

-- 1) Vestavěné metody přípravy (nové se založí, existující zůstanou).
INSERT INTO "BrewMethod" ("id", "name", "kind", "defaultRatio", "defaultDoseGrams", "isCustom", "sortOrder")
VALUES
  ('mtd_espresso',    'Espresso',       'ESPRESSO', 2,  18, false, 0),
  ('mtd_drip',        'Překapávač',     'FILTER',   16, 30, false, 10),
  ('mtd_v60',         'V60 (pourover)', 'FILTER',   16, 15, false, 11),
  ('mtd_aeropress',   'Aeropress',      'FILTER',   15, 15, false, 12),
  ('mtd_moka',        'Moka konvička',  'FILTER',   10, 15, false, 13),
  ('mtd_frenchpress', 'French press',   'FILTER',   15, 30, false, 14)
ON CONFLICT ("name") DO NOTHING;

-- 2) Dorovnání metod, které v databázi byly už před espresso modelem.
--    Sahá jen na vestavěné metody (isCustom = false), vlastní necháváme být.
UPDATE "BrewMethod"
SET "kind" = 'ESPRESSO', "defaultDoseGrams" = COALESCE("defaultDoseGrams", 18), "sortOrder" = 0
WHERE "name" = 'Espresso' AND "isCustom" = false;

UPDATE "BrewMethod" SET "defaultDoseGrams" = COALESCE("defaultDoseGrams", 30), "sortOrder" = 10
  WHERE "name" = 'Překapávač' AND "isCustom" = false;
UPDATE "BrewMethod" SET "defaultDoseGrams" = COALESCE("defaultDoseGrams", 15), "sortOrder" = 11
  WHERE "name" = 'V60 (pourover)' AND "isCustom" = false;
UPDATE "BrewMethod" SET "defaultDoseGrams" = COALESCE("defaultDoseGrams", 15), "sortOrder" = 12
  WHERE "name" = 'Aeropress' AND "isCustom" = false;
UPDATE "BrewMethod" SET "defaultDoseGrams" = COALESCE("defaultDoseGrams", 15), "sortOrder" = 13
  WHERE "name" = 'Moka konvička' AND "isCustom" = false;
UPDATE "BrewMethod" SET "defaultDoseGrams" = COALESCE("defaultDoseGrams", 30), "sortOrder" = 14
  WHERE "name" = 'French press' AND "isCustom" = false;

-- 3) Tlakové profily pro Flair 58. Navěšují se na metodu Espresso, ať už
--    má jakékoliv id (v existující databázi je jiné než 'mtd_espresso').
INSERT INTO "PressureProfile"
  ("id", "name", "description", "methodId", "defaultRatio", "defaultDoseGrams", "grindOffsetClicks", "waterTempC", "isCustom", "sortOrder")
SELECT v."id", v."name", v."description", m."id", v."defaultRatio", v."defaultDoseGrams", v."grindOffsetClicks", v."waterTempC", false, v."sortOrder"
FROM (VALUES
  ('prof_classic',  'Klasické espresso',
   'Univerzální výchozí bod. Nízkotlaká preinfuze usadí puk a omezí kanálky, pak náběh na plný tlak.',
   2::double precision, 18::double precision, 0, 93::double precision, 0),
  ('prof_blooming', 'Blooming espresso',
   'Krátká preinfuze, pak úplné uvolnění tlaku — puk se nadechne a odplyní. Odpouštěcí profil, sedí na světlá pražení.',
   2.2, 18, 0, 94, 1),
  ('prof_turbo',    'Turbo shot',
   'Hrubší mletí, nižší tlak, delší výdej a krátký čas. Vyšší výtěžnost bez hořkosti — dělané na světlá pražení.',
   2.75, 18, 8, 95, 2),
  ('prof_allonge',  'Turbo allongé',
   'Turbo dotažené do delšího výdeje (1:3–1:4). Čistý, čajový šálek — něco mezi espressem a filtrem.',
   3.5, 18, 12, 95, 3),
  ('prof_lowpress', 'Nízkotlaký lever profil',
   'Dlouhá preinfuze na 3 bar, pak jen 6–7 bar. Pomalý náběh tlaku omezuje kanálky a zvedá výtěžnost.',
   2, 18, -2, 93, 4)
) AS v("id", "name", "description", "defaultRatio", "defaultDoseGrams", "grindOffsetClicks", "waterTempC", "sortOrder")
CROSS JOIN (SELECT "id" FROM "BrewMethod" WHERE "name" = 'Espresso' LIMIT 1) AS m
ON CONFLICT ("name") DO NOTHING;

-- 4) Fáze profilů. Vkládají se jen k profilům, které tahle migrace právě
--    založila (podle pevných id), takže neruší ručně upravené profily.
INSERT INTO "PressurePhase" ("id", "profileId", "order", "label", "targetBarMin", "targetBarMax", "durationSeconds", "note")
SELECT v."id", v."profileId", v."order", v."label", v."targetBarMin", v."targetBarMax", v."durationSeconds", v."note"
FROM (VALUES
  -- Klasické espresso
  ('ph_classic_0', 'prof_classic', 0, 'Preinfuze', 2::double precision, 3::double precision, 10, 'Táhni pomalu, dokud se neobjeví první kapky.'),
  ('ph_classic_1', 'prof_classic', 1, 'Náběh',     6, 9, 5,  'Plynule přidávej tlak, ne skokem.'),
  ('ph_classic_2', 'prof_classic', 2, 'Extrakce',  6, 9, 15, 'Drž tlak, sleduj barvu výtoku.'),
  -- Blooming espresso
  ('ph_bloom_0', 'prof_blooming', 0, 'Smočení',            2, 3, 10, 'Jen namočit puk.'),
  ('ph_bloom_1', 'prof_blooming', 1, 'Bloom (bez tlaku)',  0, 0, 30, 'Úplně povol páku a nech kávu odplynit.'),
  ('ph_bloom_2', 'prof_blooming', 2, 'Náběh',              6, 8, 5,  NULL),
  ('ph_bloom_3', 'prof_blooming', 3, 'Extrakce',           6, 8, 20, NULL),
  -- Turbo shot
  ('ph_turbo_0', 'prof_turbo', 0, 'Krátká preinfuze', 2, 3, 5,  NULL),
  ('ph_turbo_1', 'prof_turbo', 1, 'Extrakce',         5, 6, 15, 'Nižší tlak, voda protéká rychle.'),
  -- Turbo allongé
  ('ph_allonge_0', 'prof_allonge', 0, 'Krátká preinfuze', 2, 3, 5,  NULL),
  ('ph_allonge_1', 'prof_allonge', 1, 'Extrakce',         4, 6, 25, 'Drž nižší tlak, ať to neproteče moc rychle.'),
  -- Nízkotlaký lever profil
  ('ph_lowpress_0', 'prof_lowpress', 0, 'Dlouhá preinfuze', 3, 3, 15, 'Drž 3 bar, dokud nezačne kapat.'),
  ('ph_lowpress_1', 'prof_lowpress', 1, 'Pomalý náběh',     4, 6, 8,  'Postupně, ne skokem.'),
  ('ph_lowpress_2', 'prof_lowpress', 2, 'Extrakce',         6, 7, 15, NULL)
) AS v("id", "profileId", "order", "label", "targetBarMin", "targetBarMax", "durationSeconds", "note")
WHERE EXISTS (SELECT 1 FROM "PressureProfile" p WHERE p."id" = v."profileId")
ON CONFLICT ("profileId", "order") DO NOTHING;

-- 5) Nastavení vybavení — jediný řádek, pokud ještě není.
INSERT INTO "Settings" ("id", "updatedAt") VALUES ('singleton', now())
ON CONFLICT ("id") DO NOTHING;
