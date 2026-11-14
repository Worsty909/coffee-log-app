"use server";

// Server akce (Next.js Server Actions) pro práci se zrnky. Volají se
// přímo z formulářů, appka díky tomu nepotřebuje samostatnou REST API
// vrstvu — formulář v prohlížeči zavolá tuhle funkci, jako by běžela
// lokálně, ale ve skutečnosti se vykoná na serveru.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/storage";
import { requireAuth } from "@/lib/auth/server";
import { describeActionError } from "./errors";
import { beanInputSchema } from "@/lib/validation/bean";

export type BeanFormState = {
  error: string | null;
};

function readBeanFormData(formData: FormData) {
  // Bereme celý formulář najednou místo vypisování jednotlivých polí —
  // jinak se snadno stane, že se přidá pole do schématu i formuláře, ale
  // zapomene se sem, a hodnota se pak tiše zahazuje. Zod si z toho vezme
  // jen to, co má ve schématu (včetně souboru s fotkou, který ignoruje).
  return beanInputSchema.parse(Object.fromEntries(formData));
}

async function extractPhotoUrl(formData: FormData): Promise<string | undefined> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return undefined;
  }
  return saveUploadedImage(photo);
}

export async function createBean(
  _prevState: BeanFormState,
  formData: FormData,
): Promise<BeanFormState> {
  await requireAuth();
  let beanId: string;
  try {
    const data = readBeanFormData(formData);
    const photoUrl = await extractPhotoUrl(formData);
    const bean = await prisma.bean.create({ data: { ...data, photoUrl } });
    beanId = bean.id;
  } catch (error) {
    return { error: describeActionError(error) };
  }

  revalidatePath("/beans");
  redirect(`/beans/${beanId}`);
}

export async function updateBean(
  beanId: string,
  _prevState: BeanFormState,
  formData: FormData,
): Promise<BeanFormState> {
  await requireAuth();
  try {
    const data = readBeanFormData(formData);
    const photoUrl = await extractPhotoUrl(formData);
    await prisma.bean.update({
      where: { id: beanId },
      data: { ...data, ...(photoUrl ? { photoUrl } : {}) },
    });
  } catch (error) {
    return { error: describeActionError(error) };
  }

  revalidatePath("/beans");
  revalidatePath(`/beans/${beanId}`);
  redirect(`/beans/${beanId}`);
}

export async function deleteBean(beanId: string): Promise<void> {
  await requireAuth();
  await prisma.bean.delete({ where: { id: beanId } });
  revalidatePath("/beans");
  redirect("/beans");
}
