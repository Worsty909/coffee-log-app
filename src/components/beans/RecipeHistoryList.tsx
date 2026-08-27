import { formatSeconds } from "@/lib/format";

type RecipeListItem = {
  id: string;
  ratio: number;
  coffeeGrams: number;
  waterGrams: number;
  grindSetting: string | null;
  waterTempC: number | null;
  bloomSeconds: number | null;
  targetTotalSeconds: number | null;
  actualTotalSeconds: number | null;
  rating: number | null;
  notes: string | null;
  brewedAt: Date;
  method: { name: string };
};

export function RecipeHistoryList({ recipes }: { recipes: RecipeListItem[] }) {
  if (recipes.length === 0) {
    return <p className="text-neutral-500">Zatím žádný recept. Přidej ho tlačítkem „Nový recept“ výše.</p>;
  }

  return (
    <ul className="space-y-3">
      {recipes.map((recipe) => (
        <li key={recipe.id} className="rounded-md border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-neutral-900">
              {recipe.method.name} · 1:{recipe.ratio} · {recipe.coffeeGrams} g / {recipe.waterGrams} ml
            </p>
            {recipe.rating && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {recipe.rating}/5
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {recipe.brewedAt.toLocaleString("cs-CZ")}
            {recipe.grindSetting ? ` · mletí: ${recipe.grindSetting}` : ""}
            {recipe.waterTempC ? ` · ${recipe.waterTempC} °C` : ""}
            {recipe.bloomSeconds ? ` · bloom ${recipe.bloomSeconds} s` : ""}
            {recipe.actualTotalSeconds
              ? ` · skutečná doba ${formatSeconds(recipe.actualTotalSeconds)}`
              : recipe.targetTotalSeconds
                ? ` · cíl ${formatSeconds(recipe.targetTotalSeconds)}`
                : ""}
          </p>
          {recipe.notes && <p className="mt-2 text-sm text-neutral-700">{recipe.notes}</p>}
        </li>
      ))}
    </ul>
  );
}
