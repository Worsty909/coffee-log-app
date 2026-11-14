import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatGrind } from "@/lib/grind";
import { formatSeconds } from "@/lib/format";
import { ChevronRightIcon, CupIcon } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

function plural(count: number, one: string, few: string, many: string): string {
  return count === 1 ? one : count >= 2 && count <= 4 ? few : many;
}

export default async function HomePage() {
  const [recentRecipes, beanCount, recipeStats] = await Promise.all([
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
    prisma.recipe.aggregate({ _count: true, _avg: { rating: true } }),
  ]);

  const lastBean = recentRecipes[0]?.bean ?? null;
  const averageRating = recipeStats._avg.rating;

  return (
    <div className="space-y-7">
      <section className="card relative overflow-hidden p-5">
        {/* Dekorace: velký šálek v rohu karty. */}
        <CupIcon
          className="pointer-events-none absolute -right-6 -bottom-8 h-40 w-40 text-amber-500/10"
          strokeWidth={1}
        />
        <p className="eyebrow text-amber-500/80">Deník kávy</p>
        <h1 className="page-title mt-1">Co si dnes uvaříš?</h1>
        <p className="mt-1 max-w-sm text-sm text-stone-400">
          Kalkulačka poměru, časovač po fázích a historie toho, co chutnalo.
        </p>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <Link href="/brew/new" className="btn btn-primary">
            <CupIcon className="h-5 w-5" />
            Připravit kávu
          </Link>
          {lastBean && (
            <Link href={`/brew/new?beanId=${lastBean.id}`} className="btn btn-secondary">
              Znovu {lastBean.coffeeName}
            </Link>
          )}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5">
        <Stat value={String(beanCount)} label={plural(beanCount, "zrnko", "zrnka", "zrnek")} href="/beans" />
        <Stat
          value={String(recipeStats._count)}
          label={plural(recipeStats._count, "příprava", "přípravy", "příprav")}
        />
        <Stat
          value={averageRating === null ? "–" : averageRating.toFixed(1).replace(".", ",")}
          label="průměr z 5"
        />
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="section-title">Poslední přípravy</h2>
          <Link href="/beans" className="text-xs text-amber-500 hover:underline">
            Všechna zrnka →
          </Link>
        </div>

        {recentRecipes.length === 0 ? (
          <p className="empty mt-3">Zatím žádná příprava. Začni tlačítkem výše.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentRecipes.map((recipe) => (
              <li key={recipe.id}>
                <Link href={`/beans/${recipe.bean.id}`} className="card flex items-center gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-stone-100">
                        {recipe.bean.coffeeName}
                      </span>
                      {recipe.rating && <span className="chip shrink-0">{recipe.rating}/5</span>}
                    </div>
                    <p className="mt-1 truncate text-xs tabular-nums text-stone-500">
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
                  </div>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-stone-600" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label, href }: { value: string; label: string; href?: string }) {
  const content = (
    <>
      <p className="font-display text-2xl font-semibold tabular-nums text-stone-50">{value}</p>
      <p className="mt-0.5 text-xs text-stone-500">{label}</p>
    </>
  );
  return href ? (
    <Link href={href} className="card block px-3 py-3 text-center">
      {content}
    </Link>
  ) : (
    <div className="card px-3 py-3 text-center">{content}</div>
  );
}
