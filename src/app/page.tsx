import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatGrind } from "@/lib/grind";
import { formatSeconds } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recentRecipes, beanCount] = await Promise.all([
    prisma.recipe.findMany({
      orderBy: { brewedAt: "desc" },
      take: 5,
      include: {
        bean: { select: { id: true, roaster: true, coffeeName: true } },
        profile: { select: { name: true } },
        method: { select: { name: true } },
      },
    }),
    prisma.bean.count(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-800 bg-gradient-to-b from-stone-900 to-stone-900/40 p-5">
        <h1 className="text-2xl font-semibold text-stone-100">Coffee Log</h1>
        <p className="mt-1 text-sm text-stone-400">
          Deník kávy a kalkulačka espressa pro Flair 58+ 2.
        </p>
        <Link
          href="/brew/new"
          className="mt-4 inline-block rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
        >
          Připravit kávu
        </Link>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-stone-200">Poslední přípravy</h2>
          <Link href="/beans" className="text-xs text-amber-500 hover:underline">
            {beanCount} {beanCount === 1 ? "zrnko" : beanCount < 5 ? "zrnka" : "zrnek"} →
          </Link>
        </div>

        {recentRecipes.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-stone-800 p-6 text-center text-sm text-stone-500">
            Zatím žádná příprava. Začni tlačítkem výše.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentRecipes.map((recipe) => (
              <li key={recipe.id}>
                <Link
                  href={`/beans/${recipe.bean.id}`}
                  className="block rounded-xl border border-stone-800 bg-stone-900/60 p-3 transition hover:border-stone-700"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-stone-100">
                      {recipe.bean.coffeeName}
                    </span>
                    {recipe.rating && (
                      <span className="shrink-0 rounded-full bg-amber-900/40 px-2 py-0.5 text-xs text-amber-300">
                        {recipe.rating}/5
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs tabular-nums text-stone-500">
                    {recipe.profile?.name ?? recipe.method.name} · {recipe.doseGrams} →{" "}
                    {recipe.yieldGrams} g
                    {recipe.grindRotations !== null &&
                      recipe.grindNumber !== null &&
                      recipe.grindClicks !== null &&
                      ` · ${formatGrind({
                        rotations: recipe.grindRotations,
                        number: recipe.grindNumber,
                        clicks: recipe.grindClicks,
                      })}`}
                    {recipe.actualTotalSeconds !== null &&
                      ` · ${formatSeconds(recipe.actualTotalSeconds)}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
