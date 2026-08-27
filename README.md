# Coffee Log & Brew Calculator

Osobní deník ochutnávek kávy propojený s kalkulačkou poměrů/extrakce pro
přípravu. Appka si pamatuje, jaká zrnka máš vyzkoušená a jaké recepty
(poměr, mletí, teplota, čas) k nim vedly k dobrému výsledku.

Jde o čistě osobní nástroj — bez přihlašování, bez víc uživatelů. Slouží
jen jako záznam pro jednoho člověka, synchronizovaný mezi zařízeními díky
databázi na netu.

## Tech stack

- **[Next.js](https://nextjs.org)** (React + TypeScript, App Router) — frontend i backend (API routes) v jednom projektu
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
| `npx prisma studio` | vizuální prohlížeč obsahu databáze v prohlížeči |
| `npx prisma migrate dev --name popis_zmeny` | vytvoří a aplikuje novou migraci po úpravě `schema.prisma` |
| `docker compose down` | zastaví lokální databázi |
| `docker compose down -v` | zastaví lokální databázi a smaže i její data |

## Struktura repozitáře

```
prisma/
  schema.prisma      # datový model (Bean, BrewMethod, Recipe)
  migrations/         # historie změn databázového schématu
  seed.ts             # výchozí metody přípravy
src/
  app/
    api/              # API endpointy (Next.js Route Handlers)
    ...                 # stránky appky
  lib/                # sdílený kód (Prisma klient, výpočty, ...)
  generated/prisma/   # kód vygenerovaný Prismou (negituje se, viz .gitignore)
docker-compose.yml     # lokální PostgreSQL pro vývoj
```

## Nasazení zdarma (Vercel + Neon)

Podrobný návod přibude, až bude hotové MVP. V kostce: appka se nasadí na
Vercel (propojení s GitHub repozitářem = automatický deploy při každém
pushi), jako `DATABASE_URL` se ve Vercelu nastaví connection string z
Neon.tech projektu (taky zdarma).
