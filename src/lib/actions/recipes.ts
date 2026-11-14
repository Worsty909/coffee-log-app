"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recipeInputSchema } from "@/lib/validation/recipe";
import { requireAuth } from "@/lib/auth/server";
import { describeActionError } from "./errors";
import { getSettings } from "@/lib/settings";

export type RecipeFormState = {
  error: string | null;
};

export async function createRecipe(
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  await requireAuth();
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
    return { error: describeActionError(error) };
  }

  revalidatePath(`/beans/${beanId}`);
  redirect(`/beans/${beanId}`);
}

export async function updateRecipe(
  recipeId: string,
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  await requireAuth();
  let beanId: string;
  try {
    const data = recipeInputSchema.parse(Object.fromEntries(formData));
    // Vybavení (grinderLabel/brewerLabel) se při editaci nepřepisuje —
    // je to snapshot toho, čím se opravdu vařilo, ne aktuální nastavení.
    // Oprava překlepu v receptu nemá měnit, jaké vybavení historie ukazuje.
    const recipe = await prisma.recipe.update({ where: { id: recipeId }, data });
    beanId = recipe.beanId;
  } catch (error) {
    return { error: describeActionError(error) };
  }

  revalidatePath(`/beans/${beanId}`);
  redirect(`/beans/${beanId}`);
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await requireAuth();
  const recipe = await prisma.recipe.delete({ where: { id: recipeId } });
  revalidatePath(`/beans/${recipe.beanId}`);
  redirect(`/beans/${recipe.beanId}`);
}
