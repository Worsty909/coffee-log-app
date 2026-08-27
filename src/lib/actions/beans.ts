"use server";

// Server akce (Next.js Server Actions) pro práci se zrnky. Volají se
// přímo z formulářů, appka díky tomu nepotřebuje samostatnou REST API
// vrstvu — formulář v prohlížeči zavolá tuhle funkci, jako by běžela
// lokálně, ale ve skutečnosti se vykoná na serveru.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage, UploadError } from "@/lib/storage";
import { beanInputSchema } from "@/lib/validation/bean";

export type BeanFormState = {
  error: string | null;
};

function readBeanFormData(formData: FormData) {
  return beanInputSchema.parse({
    roaster: formData.get("roaster"),
    coffeeName: formData.get("coffeeName"),
    originCountry: formData.get("originCountry"),
    region: formData.get("region"),
    process: formData.get("process"),
    roastDate: formData.get("roastDate"),
    sweetness: formData.get("sweetness"),
    acidity: formData.get("acidity"),
    body: formData.get("body"),
    aftertaste: formData.get("aftertaste"),
    notes: formData.get("notes"),
  });
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
  let beanId: string;
  try {
    const data = readBeanFormData(formData);
    const photoUrl = await extractPhotoUrl(formData);
    const bean = await prisma.bean.create({ data: { ...data, photoUrl } });
    beanId = bean.id;
  } catch (error) {
    return { error: describeError(error) };
  }

  revalidatePath("/beans");
  redirect(`/beans/${beanId}`);
}

export async function updateBean(
  beanId: string,
  _prevState: BeanFormState,
  formData: FormData,
): Promise<BeanFormState> {
  try {
    const data = readBeanFormData(formData);
    const photoUrl = await extractPhotoUrl(formData);
    await prisma.bean.update({
      where: { id: beanId },
      data: { ...data, ...(photoUrl ? { photoUrl } : {}) },
    });
  } catch (error) {
    return { error: describeError(error) };
  }

  revalidatePath("/beans");
  revalidatePath(`/beans/${beanId}`);
  redirect(`/beans/${beanId}`);
}

export async function deleteBean(beanId: string): Promise<void> {
  await prisma.bean.delete({ where: { id: beanId } });
  revalidatePath("/beans");
  redirect("/beans");
}

function describeError(error: unknown): string {
  if (error instanceof UploadError) {
    return error.message;
  }
  if (error && typeof error === "object" && "issues" in error) {
    // Chyba z zod validace — vezmeme první hlášku, ať uživatel ví, co opravit.
    const zodError = error as { issues: { message: string }[] };
    return zodError.issues[0]?.message ?? "Neplatná data formuláře.";
  }
  console.error(error);
  return "Něco se nepovedlo. Zkus to prosím znovu.";
}
