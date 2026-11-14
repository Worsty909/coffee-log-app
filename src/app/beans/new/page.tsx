import { BeanForm } from "@/components/beans/BeanForm";
import { createBean } from "@/lib/actions/beans";

export default function NewBeanPage() {
  return (
    <div className="space-y-6">
      <h1 className="page-title">Nové zrnko</h1>
      <BeanForm action={createBean} submitLabel="Uložit zrnko" />
    </div>
  );
}
