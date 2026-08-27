import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { baseGrindSetting, getSettings } from "@/lib/settings";
import { BrewForm, type BrewFormPrefill } from "@/components/brew/BrewForm";

// Deník se mění při každém uložení, takže stránku renderujeme vždy
// čerstvou místo statického prerenderu při buildu.
export const dynamic = "force-dynamic";

export default async function NewBrewPage({
  searchParams,
}: {
  searchParams: Promise<{ beanId?: string }>;
}) {
  const { beanId } = await searchParams;

  const [methods, profiles, beans, settings, lastRecipe] = await Promise.all([
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
    beanId ? prisma.recipe.findFirst({ where: { beanId }, orderBy: { brewedAt: "desc" } }) : null,
  ]);

  const bean = beanId ? beans.find((item) => item.id === beanId) : null;

  const prefill: BrewFormPrefill = lastRecipe
    ? {
        methodId: lastRecipe.methodId,
        profileId: lastRecipe.profileId,
        doseGrams: lastRecipe.doseGrams,
        yieldGrams: lastRecipe.yieldGrams,
        grind:
          lastRecipe.grindRotations !== null &&
          lastRecipe.grindNumber !== null &&
          lastRecipe.grindClicks !== null
            ? {
                rotations: lastRecipe.grindRotations,
                number: lastRecipe.grindNumber,
                clicks: lastRecipe.grindClicks,
              }
            : null,
        waterTempC: lastRecipe.waterTempC,
      }
    : null;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-stone-100">Příprava</h1>
        {bean ? (
          <p className="mt-1 text-sm text-stone-400">
            <Link href={`/beans/${bean.id}`} className="text-amber-500 hover:underline">
              {bean.roaster} — {bean.coffeeName}
            </Link>
            {prefill && " · předvyplněno z posledního receptu"}
          </p>
        ) : (
          <p className="mt-1 text-sm text-stone-500">Vyber zrnko a nastav přípravu.</p>
        )}
      </header>

      <BrewForm
        methods={methods}
        profiles={profiles}
        beans={beans}
        initialBeanId={beanId}
        settings={{
          grinderName: settings.grinderName,
          brewerName: settings.brewerName,
          defaultDoseGrams: settings.defaultDoseGrams,
          baseGrind: baseGrindSetting(settings),
        }}
        prefill={prefill}
      />
    </div>
  );
}
