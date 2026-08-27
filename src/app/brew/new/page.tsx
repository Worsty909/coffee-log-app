import { prisma } from "@/lib/prisma";
import { AddCustomMethodForm } from "@/components/brew/AddCustomMethodForm";
import { BrewCalculatorForm } from "@/components/brew/BrewCalculatorForm";

export default async function NewBrewPage({
  searchParams,
}: {
  searchParams: Promise<{ beanId?: string }>;
}) {
  const { beanId } = await searchParams;

  const [methods, beans, lastRecipe] = await Promise.all([
    prisma.brewMethod.findMany({ orderBy: { name: "asc" } }),
    prisma.bean.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, roaster: true, coffeeName: true } }),
    beanId
      ? prisma.recipe.findFirst({ where: { beanId }, orderBy: { brewedAt: "desc" } })
      : null,
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Kalkulačka a časovač</h1>
      {lastRecipe && (
        <p className="text-sm text-neutral-500">
          Předvyplnili jsme poslední použitý recept pro tohle zrnko — klidně uprav, co potřebuješ.
        </p>
      )}

      <AddCustomMethodForm />

      <BrewCalculatorForm methods={methods} beans={beans} initialBeanId={beanId} prefill={lastRecipe} />
    </div>
  );
}
