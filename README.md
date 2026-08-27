# Coffee Log & Brew Calculator

Osobní deník ochutnávek kávy propojený s kalkulačkou poměrů/extrakce pro
přípravu. Appka si pamatuje, jaká zrnka máš vyzkoušená a jaké recepty
(poměr, mletí, teplota, čas) k nim vedly k dobrému výsledku, nabídne
poslední použitý recept jako výchozí bod a upozorní, když hodnocení u
zrnka opakovaně klesá.

Jde o čistě osobní nástroj — bez přihlašování, bez víc uživatelů. Slouží
jen jako záznam pro jednoho člověka, synchronizovaný mezi zařízeními díky
databázi na netu. Appka je zároveň PWA — na mobilu jde "Přidat na
plochu" a chová se jako instalovaná appka.

## Funkce

- **Zrnka**: pražírna, název, původ, zpracování, datum pražení, hodnocení
  chuti (sladkost/kyselost/tělo/dochuť na škále 1–5), poznámky, volitelná
  fotka štítku.
- **Kalkulačka**: výběr metody (espresso, V60, moka, aeropress, french
  press, nebo vlastní), obousměrný přepočet káva↔voda podle poměru nebo
  počtu šálků, časovač s bloom fází.
- **Propojení**: historie receptů u každého zrnka, předvyplnění z
  posledně použitého receptu, upozornění při klesajícím trendu hodnocení.

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
tabulku metod přípravy (espresso, V60, moka, aeropress, french press)
výchozími poměry káva:voda.

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
| `npx prisma generate` | znovu vygeneruje databázového klienta (po `npm install` nebo změně schématu) |
| `npx prisma studio` | vizuální prohlížeč obsahu databáze v prohlížeči |
| `npx prisma migrate dev --name popis_zmeny` | vytvoří a aplikuje novou migraci po úpravě `schema.prisma` |
| `docker compose down` | zastaví lokální databázi |
| `docker compose down -v` | zastaví lokální databázi a smaže i její data |

## Struktura repozitáře

```
prisma/
  schema.prisma        # datový model (Bean, BrewMethod, Recipe)
  migrations/           # historie změn databázového schématu
  seed.ts               # výchozí metody přípravy
src/
  app/
    beans/               # stránky evidence zrnek (seznam, detail, nový, úprava)
    brew/new/             # kalkulačka poměrů a časovač
    icon.tsx, manifest.ts # ikona appky a PWA manifest
  components/
    beans/                # formulář a zobrazení zrnka, historie receptů
    brew/                 # kalkulačka, časovač, přidání vlastní metody
  lib/
    actions/               # Server Actions — veškerá zápisová logika appky
    validation/             # zod schémata pro formuláře
    recommendation.ts        # heuristika pro doporučení při klesajícím hodnocení
    storage.ts                # ukládání nahraných fotek (viz limitace níže)
    prisma.ts                  # sdílený Prisma klient
  generated/prisma/       # kód vygenerovaný Prismou (negituje se, viz .gitignore)
docker-compose.yml     # lokální PostgreSQL pro vývoj
```

## Nasazení zdarma (Vercel + Neon)

### 1. Databáze na Neon

1. Založ si účet na [neon.tech](https://neon.tech) (free tier stačí) a nový projekt.
2. V Neon dashboardu zkopíruj **pooled connection string** (pro serverless prostředí jako Vercel je potřeba ten "pooled", ne přímý).

### 2. Vytvoření tabulek na Neon

Z vlastního počítače (appka tam nemusí běžet, stačí mít nainstalované závislosti):

```bash
DATABASE_URL="<connection string z Neon>" npx prisma migrate deploy
DATABASE_URL="<connection string z Neon>" npx prisma db seed
```

### 3. Deploy na Vercel

1. Na [vercel.com](https://vercel.com) založ nový projekt a propoj ho s tímhle GitHub repozitářem.
2. V nastavení projektu (Environment Variables) přidej `DATABASE_URL` s connection stringem z Neon.
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
