import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { processLabels, roastLevelLabels } from "@/lib/validation/bean";

export const dynamic = "force-dynamic";

export default async function BeansPage() {
  const beans = await prisma.bean.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { recipes: true } } },
  });

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-100">Zrnka</h1>
        <Link
          href="/beans/new"
          className="rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
        >
          + Nové zrnko
        </Link>
      </header>

      {beans.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-800 p-6 text-center text-sm text-stone-500">
          Zatím tu nic není. Přidej první zrnko tlačítkem výše.
        </p>
      ) : (
        <ul className="space-y-2">
          {beans.map((bean) => (
            <li key={bean.id}>
              <Link
                href={`/beans/${bean.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-3 transition hover:border-stone-700"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-100">{bean.coffeeName}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {bean.roaster} · {bean.originCountry}
                    {bean.region ? `, ${bean.region}` : ""} · {processLabels[bean.process]}
                    {bean.roastLevel ? ` · ${roastLevelLabels[bean.roastLevel]}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-stone-500">
                  {bean._count.recipes}×
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
