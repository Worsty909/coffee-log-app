import { prisma } from "@/lib/prisma";
import { AddCustomMethodForm } from "@/components/brew/AddCustomMethodForm";
import { BrewCalculatorForm } from "@/components/brew/BrewCalculatorForm";

export default async function NewBrewPage({
  searchParams,
}: {
  searchParams: Promise<{ beanId?: string }>;
}) {
  const { beanId } = await searchParams;

  const [methods, beans] = await Promise.all([
    prisma.brewMethod.findMany({ orderBy: { name: "asc" } }),
    prisma.bean.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, roaster: true, coffeeName: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Kalkulačka a časovač</h1>

      <AddCustomMethodForm />

      <BrewCalculatorForm methods={methods} beans={beans} initialBeanId={beanId} />
    </div>
  );
}
