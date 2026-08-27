/*
  Přejmenuje vlastní metodu přípravy "Blooming espresso" na "Bez receptu".

  Kontext: tahle metoda vznikla ručně přes "Přidat vlastní metodu" ještě
  v době, kdy appka neuměla tlakové profily. Blooming espresso je dnes
  jeden z vestavěných profilů, takže stejnojmenná metoda v seznamu jen
  mátla — slouží nově jako volba "Bez receptu" pro záznam přípravy bez
  konkrétního profilu.

  Podmínky jsou schválně úzké:
    - `isCustom = true` → vestavěných metod se to nedotkne
    - kontrola, že "Bez receptu" ještě neexistuje → `name` je unikátní,
      takže bez ní by migrace na už přejmenované databázi spadla

  Profilu "Blooming espresso" v tabulce PressureProfile se to netýká,
  ten zůstává.
*/
UPDATE "BrewMethod"
SET "name" = 'Bez receptu'
WHERE "name" = 'Blooming espresso'
  AND "isCustom" = true
  AND NOT EXISTS (SELECT 1 FROM "BrewMethod" WHERE "name" = 'Bez receptu');
