// Jednoduchá heuristika (žádné strojové učení) pro doporučení, když
// hodnocení receptů u jednoho zrnka opakovaně klesá — signál, že se
// vydáváš špatným směrem a stálo by za to zkusit jiné mletí.
type RatedRecipe = { rating: number | null };

/**
 * Vrátí doporučení, pokud poslední tři ohodnocené recepty (od
 * nejnovějšího) mají klesající trend hodnocení, jinak `null`.
 *
 * @param recipesNewestFirst recepty seřazené od nejnovějšího po nejstarší
 */
export function getDecliningRatingRecommendation(recipesNewestFirst: RatedRecipe[]): string | null {
  const ratings = recipesNewestFirst
    .map((recipe) => recipe.rating)
    .filter((rating): rating is number => rating !== null);

  if (ratings.length < 3) {
    return null;
  }

  const [latest, previous, beforeThat] = ratings;
  const isDeclining = latest < previous && previous < beforeThat;

  if (!isDeclining) {
    return null;
  }

  return "Poslední tři hodnocení tohoto zrnka klesají. Zkus příště upravit hrubost mletí (jemnější nebo hrubší) — třeba se tím trend otočí.";
}
