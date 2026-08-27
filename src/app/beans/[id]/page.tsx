import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { processLabels } from "@/lib/validation/bean";
import { deleteBean } from "@/lib/actions/beans";
import { DeleteBeanButton } from "@/components/beans/DeleteBeanButton";
import { RatingDisplay } from "@/components/beans/RatingDisplay";

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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">{bean.roaster}</p>
          <h1 className="text-2xl font-semibold text-neutral-900">{bean.coffeeName}</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/brew/new?beanId=${bean.id}`}
            className="rounded-md bg-amber-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-900"
          >
            Nový recept
          </Link>
          <Link
            href={`/beans/${bean.id}/edit`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Upravit
          </Link>
          <DeleteBeanButton action={deleteBean.bind(null, bean.id)} />
        </div>
      </div>

      {bean.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- lokální upload, ne optimalizovaný Next Image zdroj
        <img
          src={bean.photoUrl}
          alt={`Fotka štítku – ${bean.coffeeName}`}
          className="h-48 w-48 rounded-md object-cover"
        />
      )}

      <dl className="grid gap-4 sm:grid-cols-2">
        <Info label="Původ" value={`${bean.originCountry}${bean.region ? `, ${bean.region}` : ""}`} />
        <Info label="Zpracování" value={processLabels[bean.process]} />
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
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Poznámky</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-800">{bean.notes}</p>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-1 text-sm text-neutral-800">{value}</dd>
    </div>
  );
}
