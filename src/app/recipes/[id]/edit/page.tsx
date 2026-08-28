import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { baseGrindSetting, getSettings } from "@/lib/settings";
import { BrewForm, type BrewFormPrefill } from "@/components/brew/BrewForm";
import { updateRecipe } from "@/lib/actions/recipes";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { bean: { select: { id: true, roaster: true, coffeeName: true } } },
  });

  if (!recipe) {
    notFound();
  }

  const [methods, profiles, beans, settings] = await Promise.all([
    prisma.brewMethod.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.pressureProfile.findMany({
      orderBy: { sortOrder: "asc" },
      include: { phases: { orderBy: { order: "asc" } } },
    }),
    prisma.bean.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, roaster: true, coffeeName: true },
    }),
    getSettings(),
  ]);

  // Předvyplní se přímo hodnotami tohoto receptu — na rozdíl od nového
  // receptu, kde "prefill" jen navrhuje výchozí bod z posledního pokusu.
  const prefill: BrewFormPrefill = {
    methodId: recipe.methodId,
    profileId: recipe.profileId,
    doseGrams: recipe.doseGrams,
    yieldGrams: recipe.yieldGrams,
    grind:
      recipe.grindRotations !== null && recipe.grindNumber !== null && recipe.grindClicks !== null
        ? { rotations: recipe.grindRotations, number: recipe.grindNumber, clicks: recipe.grindClicks }
        : null,
    waterTempC: recipe.waterTempC,
    rating: recipe.rating,
    notes: recipe.notes,
    actualTotalSeconds: recipe.actualTotalSeconds,
    targetTotalSeconds: recipe.targetTotalSeconds,
    bloomSeconds: recipe.bloomSeconds,
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-stone-100">Upravit recept</h1>
        <p className="mt-1 text-sm text-stone-400">
          <Link href={`/beans/${recipe.bean.id}`} className="text-amber-500 hover:underline">
            {recipe.bean.roaster} — {recipe.bean.coffeeName}
          </Link>
        </p>
      </header>

      <BrewForm
        methods={methods}
        profiles={profiles}
        beans={beans}
        initialBeanId={recipe.bean.id}
        settings={{
          grinderName: settings.grinderName,
          brewerName: settings.brewerName,
          defaultDoseGrams: settings.defaultDoseGrams,
          baseGrind: baseGrindSetting(settings),
        }}
        prefill={prefill}
        action={updateRecipe.bind(null, recipe.id)}
        submitLabel="Uložit změny"
      />
    </div>
  );
}
