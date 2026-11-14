import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { processLabels, roastLevelLabels } from "@/lib/validation/bean";
import { getFreshness } from "@/lib/freshness";
import { BeanList, type BeanListItem } from "@/components/beans/BeanList";

export const dynamic = "force-dynamic";

export default async function BeansPage() {
  const beans = await prisma.bean.findMany({
    orderBy: { createdAt: "desc" },
    include: { recipes: { select: { rating: true } } },
  });

  const items: BeanListItem[] = beans.map((bean) => {
    const ratings = bean.recipes.flatMap((recipe) => (recipe.rating === null ? [] : [recipe.rating]));
    const freshness = getFreshness(bean.roastDate);
    return {
      id: bean.id,
      coffeeName: bean.coffeeName,
      roaster: bean.roaster,
      origin: `${bean.originCountry}${bean.region ? `, ${bean.region}` : ""}`,
      process: processLabels[bean.process],
      roastLevel: bean.roastLevel ? roastLevelLabels[bean.roastLevel] : null,
      recipeCount: bean.recipes.length,
      bestRating: ratings.length > 0 ? Math.max(...ratings) : null,
      roastAge: freshness ? `praženo ${freshness.ageLabel}` : null,
    };
  });

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="page-title">Zrnka</h1>
        <Link
          href="/beans/new"
          className="btn btn-sm btn-primary"
        >
          + Nové zrnko
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="empty">
          Zatím tu nic není. Přidej první zrnko tlačítkem výše.
        </p>
      ) : (
        <BeanList beans={items} />
      )}
    </div>
  );
}
