"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { customMethodSchema } from "@/lib/validation/recipe";

export type MethodFormState = {
  error: string | null;
};

export async function createCustomMethod(
  _prevState: MethodFormState,
  formData: FormData,
): Promise<MethodFormState> {
  try {
    const data = customMethodSchema.parse({
      name: formData.get("name"),
      defaultRatio: formData.get("defaultRatio"),
    });
    await prisma.brewMethod.create({ data: { ...data, isCustom: true } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { error: "Metoda s tímhle názvem už existuje." };
    }
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: { message: string }[] };
      return { error: zodError.issues[0]?.message ?? "Neplatná data formuláře." };
    }
    console.error(error);
    return { error: "Něco se nepovedlo. Zkus to prosím znovu." };
  }

  revalidatePath("/brew/new");
  return { error: null };
}
