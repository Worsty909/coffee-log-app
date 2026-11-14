import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { processLabels, roastLevelLabels } from "@/lib/validation/bean";
import { deleteBean } from "@/lib/actions/beans";
import { DeleteBeanButton } from "@/components/beans/DeleteBeanButton";
import { RatingDisplay } from "@/components/beans/RatingDisplay";
import { RecipeHistoryList } from "@/components/beans/RecipeHistoryList";
import { getAdvice } from "@/lib/recommendation";
import { getFreshness } from "@/lib/freshness";

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
  const freshness = getFreshness(bean.roastDate);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="eyebrow text-amber-500/80">{bean.roaster}</p>
          <h1 className="page-title">{bean.coffeeName}</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/brew/new?beanId=${bean.id}`}
            className="btn btn-sm btn-primary"
          >
            Připravit
          </Link>
          <Link
            href={`/beans/${bean.id}/edit`}
            className="btn btn-sm btn-secondary"
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
          className="h-40 w-40 rounded-2xl border border-line object-cover"
        />
      )}

      <dl className="card grid grid-cols-2 gap-4 p-4">
        <Info label="Původ" value={`${bean.originCountry}${bean.region ? `, ${bean.region}` : ""}`} />
        <Info label="Zpracování" value={processLabels[bean.process]} />
        <Info
          label="Pražení"
          value={bean.roastLevel ? roastLevelLabels[bean.roastLevel] : "neuvedeno"}
        />
        <Info
          label="Datum pražení"
          value={
            bean.roastDate
              ? `${bean.roastDate.toLocaleDateString("cs-CZ", { timeZone: "UTC" })}${
                  freshness ? ` · ${freshness.ageLabel}, ${freshness.stageLabel}` : ""
                }`
              : "neuvedeno"
          }
        />
      </dl>

      <div className="card grid grid-cols-2 gap-4 p-4">
        <RatingDisplay label="Sladkost" value={bean.sweetness} />
        <RatingDisplay label="Kyselost" value={bean.acidity} />
        <RatingDisplay label="Tělo" value={bean.body} />
        <RatingDisplay label="Dochuť" value={bean.aftertaste} />
      </div>

      {bean.notes && (
        <div>
          <p className="eyebrow">Poznámky</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-stone-300">{bean.notes}</p>
        </div>
      )}

      {advice.length > 0 && (
        <div className="space-y-2">
          {advice.map((item, index) => (
            <p
              key={index}
              className="rounded-2xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm leading-relaxed text-amber-100"
            >
              {item.text}
            </p>
          ))}
        </div>
      )}

      <section>
        <h2 className="section-title">
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
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-sm text-stone-200">{value}</dd>
    </div>
  );
}
