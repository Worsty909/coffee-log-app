import Link from "next/link";
import { formatSeconds } from "@/lib/format";
import { describeGrindDelta, formatGrind, type GrindSetting } from "@/lib/grind";
import { deleteRecipe } from "@/lib/actions/recipes";
import { DeleteRecipeButton } from "./DeleteRecipeButton";

type RecipeListItem = {
  id: string;
  beanId: string;
  ratio: number;
  doseGrams: number;
  yieldGrams: number;
  grindRotations: number | null;
  grindNumber: number | null;
  grindClicks: number | null;
  grindNote: string | null;
  waterTempC: number | null;
  actualTotalSeconds: number | null;
  targetTotalSeconds: number | null;
  rating: number | null;
  notes: string | null;
  brewedAt: Date;
  method: { name: string };
  profile: { name: string } | null;
};

function grindOf(recipe: RecipeListItem): GrindSetting | null {
  if (recipe.grindRotations === null || recipe.grindNumber === null || recipe.grindClicks === null) {
    return null;
  }
  return {
    rotations: recipe.grindRotations,
    number: recipe.grindNumber,
    clicks: recipe.grindClicks,
  };
}

export function RecipeHistoryList({ recipes }: { recipes: RecipeListItem[] }) {
  if (recipes.length === 0) {
    return (
      <p className="empty">
        Zatím žádný recept. Přidej ho tlačítkem „Připravit“ výše.
      </p>
    );
  }

  // Nejlíp hodnocený pokus (při shodě ten novější) — má smysl ho
  // vyznačit, až když je s čím srovnávat.
  const rated = recipes.filter((recipe) => recipe.rating !== null);
  const bestId =
    rated.length >= 2
      ? rated.reduce((best, recipe) => (recipe.rating! > best.rating! ? recipe : best)).id
      : null;

  return (
    <ul className="space-y-2">
      {recipes.map((recipe, index) => {
        const grind = grindOf(recipe);
        // Rozdíl proti *předchozímu* pokusu (v seznamu je novější první,
        // takže předchozí je ten pod ním) — díky tomu je na první pohled
        // vidět, co se mezi pokusy změnilo.
        const previous = recipes[index + 1];
        const previousGrind = previous ? grindOf(previous) : null;
        const grindDelta =
          grind && previousGrind ? describeGrindDelta(previousGrind, grind) : null;

        return (
          <li
            key={recipe.id}
            className={`rounded-xl border bg-stone-900/60 p-4 ${
              recipe.id === bestId ? "border-amber-800/70" : "border-stone-800"
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-stone-100">
                {recipe.profile?.name ?? recipe.method.name}
                {recipe.id === bestId && (
                  <span className="ml-2 text-xs font-normal text-amber-400">★ nejlepší</span>
                )}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {recipe.rating && (
                  <span className="chip">
                    {recipe.rating}/5
                  </span>
                )}
              </div>
            </div>

            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-stone-400">
              <span>
                {recipe.doseGrams} → {recipe.yieldGrams} g
                <span className="text-stone-600"> (1:{Number(recipe.ratio.toFixed(2))})</span>
              </span>
              {grind && (
                <span>
                  mletí {formatGrind(grind)}
                  {grindDelta && <span className="text-amber-400"> · {grindDelta}</span>}
                </span>
              )}
              {!grind && recipe.grindNote && <span>mletí {recipe.grindNote}</span>}
              {recipe.waterTempC !== null && <span>{recipe.waterTempC} °C</span>}
              {recipe.actualTotalSeconds !== null && (
                <span>
                  {formatSeconds(recipe.actualTotalSeconds)}
                  {recipe.targetTotalSeconds !== null && (
                    <span className="text-stone-600">
                      {" "}
                      / cíl {formatSeconds(recipe.targetTotalSeconds)}
                    </span>
                  )}
                </span>
              )}
            </dl>

            {recipe.notes && <p className="mt-2 text-sm text-stone-300">{recipe.notes}</p>}

            {/* Datum a akce na společném řádku dole — nahoře by se na mobilu
                tloukly s názvem receptu. */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-xs text-stone-600">
                {recipe.brewedAt.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={`/brew/new?beanId=${recipe.beanId}&recipeId=${recipe.id}`}
                  className="text-xs text-amber-500 hover:underline"
                >
                  Zopakovat
                </Link>
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="text-xs text-stone-500 hover:text-stone-300 hover:underline"
                >
                  Upravit
                </Link>
                <DeleteRecipeButton action={deleteRecipe.bind(null, recipe.id)} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
