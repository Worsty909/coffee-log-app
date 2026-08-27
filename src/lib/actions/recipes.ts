"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recipeInputSchema } from "@/lib/validation/recipe";

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
    const recipe = await prisma.recipe.create({ data });
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
