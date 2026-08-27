// Výpočetní jádro kalkulačky poměrů.
//
// Vztah mezi třemi hodnotami je jednoduchý:
//
//     výdej = dávka × poměr
//
// (u espressa "dávka 18 g → výdej 50 g" je poměr 2,778; u filtru je
// "výdej" prostě množství vody.)
//
// Zajímavá část je, že uživatel chce zadat *libovolné dvě* hodnoty a
// třetí si nechat dopočítat. Řešíme to explicitně: právě jedno pole je
// označené jako dopočítávané (`derived`) a je jen pro čtení — zbylá dvě
// se zadávají. Přepnutím se dá dopočítávat kterékoliv z nich.
//
// Záměrně to *neodhadujeme* z toho, co uživatel psal naposledy: takové
// chování vychází různě podle pořadí kliknutí a je pak těžké
// předvídat, které číslo appka přepíše.

/** Které ze tří polí kalkulačky. */
export type BrewField = "dose" | "yield" | "ratio";

export const ALL_FIELDS: readonly BrewField[] = ["dose", "yield", "ratio"];

/** Hodnoty kalkulačky tak, jak jsou ve formuláři — tedy jako text. */
export type BrewValues = Record<BrewField, string>;

/**
 * Převede text z formulářového pole na číslo. Prázdné pole, samotné
 * znaménko nebo nesmysl vrací null — díky tomu jde pole vymazat a
 * nechat prázdné, aniž by v něm appka svévolně nechala nulu.
 *
 * Přijímá desetinnou čárku i tečku, ať se dá psát česky ("2,777").
 */
export function parseNumber(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Zaokrouhlí na daný počet desetinných míst a zahodí koncové nuly. */
function roundTo(value: number, decimals: number): string {
  return String(Number(value.toFixed(decimals)));
}

// Dávka i výdej v gramech dávají smysl na desetinu gramu (přesnost
// běžné kávové váhy), poměr chceme jemnější — 18 g → 50 g je 1:2,778.
const GRAMS_DECIMALS = 1;
const RATIO_DECIMALS = 3;

/**
 * Dopočítá hodnotu označeného pole ze zbylých dvou.
 *
 * Pokud se dopočítat nedá (chybí vstup nebo by se dělilo nulou),
 * zůstane dopočítávané pole prázdné — nikdy do něj nedosazujeme nulu,
 * protože ta by se tvářila jako zadaná hodnota.
 */
export function solveBrewValues(values: BrewValues, derived: BrewField): BrewValues {
  const dose = parseNumber(values.dose);
  const yieldValue = parseNumber(values.yield);
  const ratio = parseNumber(values.ratio);

  const solved: BrewValues = { ...values };

  switch (derived) {
    case "yield":
      solved.yield =
        dose !== null && ratio !== null ? roundTo(dose * ratio, GRAMS_DECIMALS) : "";
      break;
    case "dose":
      solved.dose =
        yieldValue !== null && ratio !== null && ratio !== 0
          ? roundTo(yieldValue / ratio, GRAMS_DECIMALS)
          : "";
      break;
    case "ratio":
      solved.ratio =
        yieldValue !== null && dose !== null && dose !== 0
          ? roundTo(yieldValue / dose, RATIO_DECIMALS)
          : "";
      break;
  }

  return solved;
}

/**
 * Zpracuje jednu editaci pole: uloží novou hodnotu a přepočítá
 * dopočítávané pole. Editace samotného dopočítávaného pole se ignoruje
 * (v UI je jen pro čtení).
 */
export function applyBrewEdit(
  values: BrewValues,
  derived: BrewField,
  field: BrewField,
  text: string,
): BrewValues {
  if (field === derived) {
    return values;
  }
  return solveBrewValues({ ...values, [field]: text }, derived);
}

/**
 * Přepne, které pole se dopočítává. Hodnota nového dopočítávaného pole
 * se rovnou přepočítá ze zbylých dvou (ty zůstávají tak, jak je
 * uživatel zadal).
 */
export function changeDerivedField(values: BrewValues, next: BrewField): BrewValues {
  return solveBrewValues(values, next);
}

/**
 * Naformátuje poměr pro zobrazení ("1:2,78"). Používá se jen v UI, ne
 * pro výpočty.
 */
export function formatRatio(ratio: number): string {
  return `1:${Number(ratio.toFixed(RATIO_DECIMALS)).toLocaleString("cs-CZ")}`;
}
