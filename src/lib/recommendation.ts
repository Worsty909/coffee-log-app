// Jednoduché heuristiky (žádné strojové učení) pro doporučení dalšího
// pokusu. Vycházejí z toho, co je u espressa nejběžnější příčina
// problému: špatně padnoucí doba průtoku vůči zvolenému poměru.
//
// Všechno jsou vodítka, ne pravda — proto vracíme text s návrhem, ne
// automatickou změnu receptu.
import { describeGrindDelta, fromClicks, shiftGrind, toClicks, type GrindSetting } from "./grind";

export type RecipeForAdvice = {
  rating: number | null;
  actualTotalSeconds: number | null;
  targetTotalSeconds: number | null;
  grindRotations: number | null;
  grindNumber: number | null;
  grindClicks: number | null;
};

export type Advice = {
  text: string;
  /** Konkrétní návrh nastavení mlýnku, pokud ho jde spočítat. */
  suggestedGrind: GrindSetting | null;
};

/** Vytáhne nastavení mlýnku z receptu, pokud je vyplněné celé. */
export function recipeGrind(recipe: RecipeForAdvice): GrindSetting | null {
  if (
    recipe.grindRotations === null ||
    recipe.grindNumber === null ||
    recipe.grindClicks === null
  ) {
    return null;
  }
  return {
    rotations: recipe.grindRotations,
    number: recipe.grindNumber,
    clicks: recipe.grindClicks,
  };
}

// O kolik kliků posunout mletí. J-Ultra má 8 µm na klik, takže pár
// kliků je znatelný, ale ne drastický krok.
const SMALL_STEP = 3;
const BIG_STEP = 6;

/**
 * Doporučení podle poslední přípravy: když šla extrakce výrazně mimo
 * cílový čas, navrhne posun mletí konkrétním počtem kliků.
 *
 * Rychlejší průtok, než byl plán → mletí je moc hrubé → jemněji.
 * Pomalejší → moc jemné → hrubčeji.
 */
export function getTimingAdvice(latest: RecipeForAdvice): Advice | null {
  const { actualTotalSeconds: actual, targetTotalSeconds: target } = latest;
  if (actual === null || target === null || target === 0) return null;

  const diff = actual - target;
  // Do 20 % odchylky to bereme jako v pořádku — na páce se pár sekund
  // sem tam nedá uhlídat.
  const tolerance = Math.max(3, target * 0.2);
  if (Math.abs(diff) <= tolerance) return null;

  const tooSlow = diff > 0;
  const step = Math.abs(diff) > tolerance * 2 ? BIG_STEP : SMALL_STEP;
  const grind = recipeGrind(latest);
  const suggestedGrind = grind ? shiftGrind(grind, tooSlow ? step : -step) : null;

  const direction = tooSlow ? "hrubší" : "jemnější";
  const reason = tooSlow
    ? `Extrakce trvala ${actual} s místo plánovaných ${target} s — voda protékala pomalu.`
    : `Extrakce proběhla za ${actual} s místo plánovaných ${target} s — voda protekla rychle.`;

  const suggestion =
    grind && suggestedGrind
      ? ` Zkus mletí ${describeGrindDelta(grind, suggestedGrind)} (${suggestedGrind.rotations}.${suggestedGrind.number}.${suggestedGrind.clicks}).`
      : ` Zkus ${direction} mletí zhruba o ${step} kliky.`;

  return { text: reason + suggestion, suggestedGrind };
}

/**
 * Doporučení podle klesajícího trendu hodnocení: když poslední tři
 * ohodnocené pokusy jdou dolů, navrhne vrátit se k mletí toho
 * nejlépe hodnoceného.
 *
 * @param recipesNewestFirst recepty seřazené od nejnovějšího po nejstarší
 */
export function getDecliningRatingAdvice(recipesNewestFirst: RecipeForAdvice[]): Advice | null {
  const rated = recipesNewestFirst.filter((recipe) => recipe.rating !== null);
  if (rated.length < 3) return null;

  const [latest, previous, beforeThat] = rated;
  const isDeclining = latest.rating! < previous.rating! && previous.rating! < beforeThat.rating!;
  if (!isDeclining) return null;

  const latestGrind = recipeGrind(latest);
  const bestGrind = recipeGrind(beforeThat);

  if (latestGrind && bestGrind) {
    const delta = describeGrindDelta(latestGrind, bestGrind);
    if (delta) {
      return {
        text: `Poslední tři hodnocení klesají (${beforeThat.rating!} → ${previous.rating!} → ${latest.rating!}). Nejlíp hodnocený pokus měl mletí ${bestGrind.rotations}.${bestGrind.number}.${bestGrind.clicks} — ${delta} než teď. Zkus se k němu vrátit.`,
        suggestedGrind: bestGrind,
      };
    }
  }

  return {
    text: `Poslední tři hodnocení klesají (${beforeThat.rating!} → ${previous.rating!} → ${latest.rating!}). Zkus se vrátit k nastavení, které ti chutnalo, a měnit vždy jen jednu věc.`,
    suggestedGrind: bestGrind,
  };
}

/**
 * Hlavní vstupní bod: vrátí doporučení, která mají u daného zrnka smysl
 * ukázat (nejvýš dvě, aby to nebyla zeď textu).
 */
export function getAdvice(recipesNewestFirst: RecipeForAdvice[]): Advice[] {
  if (recipesNewestFirst.length === 0) return [];

  const advice: Advice[] = [];

  const timing = getTimingAdvice(recipesNewestFirst[0]);
  if (timing) advice.push(timing);

  const declining = getDecliningRatingAdvice(recipesNewestFirst);
  if (declining) advice.push(declining);

  return advice;
}

/** Pomůcka pro testy a případné budoucí ladění kroků. */
export const GRIND_STEPS = { SMALL_STEP, BIG_STEP, fromClicks, toClicks };
