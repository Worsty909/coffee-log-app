import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BeanForm } from "@/components/beans/BeanForm";
import { updateBean } from "@/lib/actions/beans";

export default async function EditBeanPage({
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
      <h1 className="text-2xl font-semibold text-neutral-900">
        Upravit zrnko — {bean.coffeeName}
      </h1>
      <BeanForm action={updateBean.bind(null, bean.id)} initialValues={bean} submitLabel="Uložit změny" />
    </div>
  );
}
