import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { processLabels, roastLevelLabels } from "@/lib/validation/bean";
import { deleteBean } from "@/lib/actions/beans";
import { DeleteBeanButton } from "@/components/beans/DeleteBeanButton";
import { RatingDisplay } from "@/components/beans/RatingDisplay";
import { RecipeHistoryList } from "@/components/beans/RecipeHistoryList";
import { getAdvice } from "@/lib/recommendation";

export const dynamic = "force-dynamic";

export default async function BeanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bean = await prisma.bean.findUnique({ where: { id } });

  if (!bean) {
    notFound();
  }

  const recipes = await prisma.recipe.findMany({
    where: { beanId: id },
    orderBy: { brewedAt: "desc" },
    include: {
      method: { select: { name: true } },
      profile: { select: { name: true } },
    },
  });

  const advice = getAdvice(recipes);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">{bean.roaster}</p>
          <h1 className="text-2xl font-semibold text-stone-100">{bean.coffeeName}</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/brew/new?beanId=${bean.id}`}
            className="rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            Připravit
          </Link>
          <Link
            href={`/beans/${bean.id}/edit`}
            className="rounded-lg border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-800"
          >
            Upravit
          </Link>
          <DeleteBeanButton action={deleteBean.bind(null, bean.id)} />
        </div>
      </header>

      {bean.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- lokální upload, ne optimalizovaný Next Image zdroj
        <img
          src={bean.photoUrl}
          alt={`Fotka štítku – ${bean.coffeeName}`}
          className="h-40 w-40 rounded-xl object-cover"
        />
      )}

      <dl className="grid gap-4 sm:grid-cols-2">
        <Info label="Původ" value={`${bean.originCountry}${bean.region ? `, ${bean.region}` : ""}`} />
        <Info label="Zpracování" value={processLabels[bean.process]} />
        <Info
          label="Pražení"
          value={bean.roastLevel ? roastLevelLabels[bean.roastLevel] : "neuvedeno"}
        />
        <Info
          label="Datum pražení"
          value={bean.roastDate ? bean.roastDate.toLocaleDateString("cs-CZ") : "neuvedeno"}
        />
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <RatingDisplay label="Sladkost" value={bean.sweetness} />
        <RatingDisplay label="Kyselost" value={bean.acidity} />
        <RatingDisplay label="Tělo" value={bean.body} />
        <RatingDisplay label="Dochuť" value={bean.aftertaste} />
      </div>

      {bean.notes && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Poznámky</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-stone-300">{bean.notes}</p>
        </div>
      )}

      {advice.length > 0 && (
        <div className="space-y-2">
          {advice.map((item, index) => (
            <p
              key={index}
              className="rounded-xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200"
            >
              {item.text}
            </p>
          ))}
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold text-stone-200">
          Historie receptů{recipes.length > 0 && ` (${recipes.length})`}
        </h2>
        <div className="mt-3">
          <RecipeHistoryList recipes={recipes} />
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm text-stone-200">{value}</dd>
    </div>
  );
}
