# Coffee Log & Brew Calculator

Osobní deník ochutnávek kávy propojený s kalkulačkou poměrů a extrakce.
Appka je stavěná primárně na **espresso** z pákového kávovaru
(Flair 58+ 2) a ručního mlýnku (1Zpresso J-Ultra); filtrová příprava je
vedlejší, jednodušší větev.

Appka si pamatuje, jaká zrnka máš vyzkoušená a jaké recepty (poměr,
mletí, tlakový profil, teplota, čas) k nim vedly k dobrému výsledku,
nabídne poslední použitý recept jako výchozí bod a poradí konkrétní
posun mletí, když se něco kazí.

Jde o čistě osobní nástroj — bez přihlašování, bez víc uživatelů. Slouží
jen jako záznam pro jednoho člověka, synchronizovaný mezi zařízeními díky
databázi na netu. Appka je zároveň PWA — na mobilu jde "Přidat na
plochu" a chová se jako instalovaná appka.

## Funkce

- **Zrnka**: pražírna, název, původ, zpracování, stupeň pražení, datum
  pražení, hodnocení chuti (sladkost/kyselost/tělo/dochuť na škále 1–5),
  poznámky, volitelná fotka štítku.
- **Kalkulačka poměru**: dávka, výdej a poměr — vyplníš libovolné dvě
  hodnoty a třetí se dopočítá. Které pole se dopočítává, si přepínáš
  sám, takže výsledek nikdy nezávisí na pořadí, v jakém jsi klikal.
  Poměr může být libovolně jemný (1:2,777 pro 18 g → 50 g).
- **Tlakové profily** (espresso): klasické espresso, blooming espresso,
  turbo shot, turbo allongé a nízkotlaký lever profil. Výběr profilu
  nastaví poměr, teplotu a doporučený posun mletí; časovač tě pak
  provede jeho fázemi a u každé ukáže cílový tlak v barech.
- **Mletí v zápisu mlýnku** (X.X.X, např. `0.8.3`): appka z něj počítá
  kliky, takže umí říct „o 6 kliků jemnější" místo vágního „zkus jinou
  hrubost".
- **Filtr**: překapávač, V60, aeropress, moka, french press — poměr,
  vlastní cílový čas a bloom, bez tlakových profilů (pokud si pro
  metodu nezaložíš vlastní recept s fázemi, viz níže).
- **Správa receptů** (`/profiles`): vestavěné i vlastní recepty (šablony
  s fázemi časovače) jdou přímo v appce přejmenovat, upravit i smazat —
  včetně přidávání/mazání/přeřazování jednotlivých fází. Tlak (bar) se
  zadává jen u espressa, u filtru recept obsahuje jen název, délku a
  poznámku fáze.
- **Vybavení**: mlýnek, kávovar, koš a puck screen se nastavují na
  jednom místě a ukládají se ke každému receptu jako snapshot, aby
  historie dávala smysl i po výměně vybavení.
- **Doporučení** (heuristika, ne strojové učení): porovná naměřený čas
  s plánem profilu a navrhne konkrétní nastavení mlýnku; při třech
  klesajících hodnoceních po sobě odkáže na mletí nejlíp hodnoceného
  pokusu.

## Tech stack

- **[Next.js](https://nextjs.org)** (React + TypeScript, App Router) — frontend i backend (Server Actions) v jednom projektu
- **PostgreSQL** + **[Prisma](https://www.prisma.io)** ORM — ukládání dat
- Lokálně: Postgres v Dockeru. V produkci: [Neon](https://neon.tech) (free tier)
- Hosting: [Vercel](https://vercel.com) (free tier)

## Lokální spuštění

Potřebuješ nainstalovaný [Node.js](https://nodejs.org) (verze 20+) a buď
[Docker](https://www.docker.com), nebo vlastní běžící PostgreSQL.

### 1. Instalace závislostí

```bash
npm install
```

(Tím se mimo jiné spustí `prisma generate`, které vygeneruje typovaného
databázového klienta do `src/generated/prisma` — tahle složka se
negituje, po každém `npm install` nebo po úpravě `schema.prisma` je
potřeba ji mít čerstvou, viz `npx prisma generate` v tabulce příkazů
níže.)

### 2. Databáze

Nejjednodušší cesta je pustit si lokální Postgres přes Docker Compose
(soubor `docker-compose.yml` v kořeni repozitáře):

```bash
docker compose up -d
```

Tím se ti na `localhost:5432` rozjede Postgres s uživatelem/heslem/databází
`coffee`/`coffee`/`coffee_log` — přesně to, co appka čeká defaultně.

Pokud máš Postgres už vlastní, uprav si podle něj proměnnou `DATABASE_URL`
(viz krok 3).

### 3. Proměnné prostředí

```bash
cp .env.example .env
```

Výchozí hodnota v `.env.example` sedí na Docker Compose databázi z kroku
2, není potřeba nic měnit, pokud používáš ji.

### 4. Databázové schéma a výchozí data

```bash
npx prisma migrate dev
npx prisma db seed
```

První příkaz vytvoří tabulky podle `prisma/schema.prisma`, druhý naplní
metody přípravy, tlakové profily pro Flair 58 a výchozí nastavení
vybavení. Seed je bezpečné spustit opakovaně — vlastní metody a profily
nechá být, přepíše jen ty výchozí.

> **Pozn. k nasazené appce:** na Vercelu se seed nespouští (build dělá
> jen `prisma migrate deploy`). Vestavěné metody a tlakové profily se
> tam proto zakládají přímo migrací
> `20260827211500_backfill_espresso_defaults`, aby se produkce
> spravila samotným deployem. Seed zůstává pro čerstvé lokální
> databáze.

### 5. Spuštění appky

```bash
npm run dev
```

Appka běží na [http://localhost:3000](http://localhost:3000).

## Užitečné příkazy

| Příkaz | Co dělá |
|---|---|
| `npm run dev` | spustí appku ve vývojovém režimu |
| `npm run build` | produkční build |
| `npm test` | spustí testy výpočtů (poměry, kliky mlýnku, časy, doporučení) |
| `npm run test:watch` | testy průběžně při psaní kódu |
| `npx prisma generate` | znovu vygeneruje databázového klienta (po `npm install` nebo změně schématu) |
| `npx prisma studio` | vizuální prohlížeč obsahu databáze v prohlížeči |
| `npx prisma migrate dev --name popis_zmeny` | vytvoří a aplikuje novou migraci po úpravě `schema.prisma` |
| `docker compose down` | zastaví lokální databázi |
| `docker compose down -v` | zastaví lokální databázi a smaže i její data |

## Struktura repozitáře

```
prisma/
  schema.prisma        # datový model (Bean, BrewMethod, PressureProfile, Recipe, Settings)
  migrations/           # historie změn databázového schématu
  seed.ts               # výchozí metody, tlakové profily a nastavení vybavení
src/
  app/
    beans/               # stránky evidence zrnek (seznam, detail, nový, úprava)
    brew/new/             # kalkulačka, tlakové profily a časovač
    settings/              # nastavení vybavení a výchozích hodnot
    icon.tsx, manifest.ts   # ikona appky a PWA manifest
  components/
    beans/                # formulář a zobrazení zrnka, historie receptů
    brew/                 # kalkulačka poměru, mletí, fázový časovač
    settings/              # formulář nastavení
    ui/                     # sdílené vstupy (číselné pole)
  lib/
    actions/               # Server Actions — veškerá zápisová logika appky
    validation/             # zod schémata pro formuláře
    brew-math.ts             # dopočet dávky/výdeje/poměru (+ testy)
    grind.ts                  # převody nastavení mlýnku X.X.X na kliky (+ testy)
    recommendation.ts          # heuristiky pro doporučení dalšího pokusu (+ testy)
    format.ts                   # časy ("32", "2:45") (+ testy)
    storage.ts                   # ukládání nahraných fotek (viz limitace níže)
    settings.ts                   # čtení nastavení vybavení
    prisma.ts                      # sdílený Prisma klient
  generated/prisma/       # kód vygenerovaný Prismou (negituje se, viz .gitignore)
docker-compose.yml     # lokální PostgreSQL pro vývoj
```

Výpočetní logika je záměrně oddělená od komponent do `src/lib/*.ts` a
pokrytá testy (`npm test`) — dá se v ní tak měnit chování bez toho, abys
musel klikat celou appku, a testy zároveň slouží jako dokumentace toho,
jak se má chovat.

## Nasazení zdarma (Vercel + Neon)

### 1. Databáze na Neon

1. Založ si účet na [neon.tech](https://neon.tech) (free tier stačí) a nový projekt.
2. V Neon dashboardu si zkopíruj **dvě** connection stringy (v UI je přepínáš
   zaškrtávátkem/tlačítkem "Pooled connection"):
   - **pooled** (obsahuje `-pooler` v hostname) — pro běh appky
   - **přímou/direct** (bez `-pooler`) — jen pro migrace

   Migrace (`prisma migrate deploy`) potřebují k databázi přímé spojení,
   protože si při běhu drží tzv. advisory lock — přes connection pooler
   (Neon "pooled"/PgBouncer) se ten lock spolehlivě nezíská a migrace
   spadne na timeoutu. Appka samotná za běhu naopak chce tu poolovanou
   variantu (lépe zvládá hodně krátkých souběžných spojení, typické pro
   serverless).

### 2. Vytvoření tabulek na Neon

Z vlastního počítače (appka tam nemusí běžet, stačí mít nainstalované závislosti):

```bash
DIRECT_URL="<přímá connection string z Neon>" npx prisma migrate deploy
DATABASE_URL="<pooled connection string z Neon>" npx prisma db seed
```

### 3. Deploy na Vercel

1. Na [vercel.com](https://vercel.com) založ nový projekt a propoj ho s tímhle GitHub repozitářem.
2. V nastavení projektu (Environment Variables) přidej **obě** proměnné (pro
   Production i Preview prostředí):
   - `DATABASE_URL` = pooled connection string z Neonu
   - `DIRECT_URL` = přímá connection string z Neonu
3. V nastavení Build & Development Settings nastav **Build Command** na:
   ```
   npx prisma migrate deploy && next build
   ```
   Díky tomu se při každém dalším deploy automaticky aplikují i budoucí migrace (seed skript se spouští jen ručně, viz výše — je bezpečné ho spustit vícekrát, ale není potřeba ho pouštět při každém buildu).
4. Deploy. Vercel appku automaticky znovu nasadí při každém pushi do repozitáře.

### Známé omezení: fotky štítků na Vercelu

`src/lib/storage.ts` teď ukládá nahrané fotky na lokální disk (`public/uploads`)
— to funguje skvěle lokálně nebo na vlastním serveru, ale na Vercelu (a
jiném serverless hostingu) je souborový systém dočasný, takže by nahrané
fotky po čase (nebo dalším deploy) zmizely. Než začneš appku na Vercelu
používat s fotkami, je potřeba `saveUploadedImage` v tomhle souboru
přepsat na nahrávání do [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
(taky free tier) — je to jediné místo v kódu, které se kvůli tomu musí
změnit, zbytek appky pracuje jen s URL, kterou tahle funkce vrátí.
