import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { processLabels } from "@/lib/validation/bean";

export default async function BeansPage() {
  const beans = await prisma.bean.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Zrnka</h1>
        <Link
          href="/beans/new"
          className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
        >
          + Nové zrnko
        </Link>
      </div>

      {beans.length === 0 ? (
        <p className="text-neutral-500">
          Zatím tu nic není. Přidej první zrnko tlačítkem výše.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
          {beans.map((bean) => (
            <li key={bean.id}>
              <Link
                href={`/beans/${bean.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-neutral-50"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {bean.roaster} — {bean.coffeeName}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {bean.originCountry}
                    {bean.region ? `, ${bean.region}` : ""} · {processLabels[bean.process]}
                  </p>
                </div>
                {bean.roastDate && (
                  <span className="shrink-0 text-sm text-neutral-500">
                    praženo {bean.roastDate.toLocaleDateString("cs-CZ")}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
