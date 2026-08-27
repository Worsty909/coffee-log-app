"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recipeInputSchema } from "@/lib/validation/recipe";
import { getSettings } from "@/lib/settings";

export type RecipeFormState = {
  error: string | null;
};

export async function createRecipe(
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  let beanId: string;
  try {
    const data = recipeInputSchema.parse(Object.fromEntries(formData));

    // K receptu si uložíme i to, čím se vařilo. Je to snapshot — když si
    // za rok pořídíš jiný mlýnek, stará historie pořád dává smysl.
    const settings = await getSettings();

    const recipe = await prisma.recipe.create({
      data: {
        ...data,
        grinderLabel: settings.grinderName,
        brewerLabel: settings.brewerName,
      },
    });
    beanId = recipe.beanId;
  } catch (error) {
    return { error: describeError(error) };
  }

  revalidatePath(`/beans/${beanId}`);
  redirect(`/beans/${beanId}`);
}

function describeError(error: unknown): string {
  if (error && typeof error === "object" && "issues" in error) {
    const zodError = error as { issues: { message: string }[] };
    return zodError.issues[0]?.message ?? "Neplatná data formuláře.";
  }
  console.error(error);
  return "Něco se nepovedlo. Zkus to prosím znovu.";
}
