"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SETTINGS_ID } from "@/lib/settings";
import { commaToDot } from "@/lib/validation/number";

export type SettingsFormState = {
  error: string | null;
  saved: boolean;
};

const grindDigit = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? 0 : value),
  z.coerce.number().int().min(0).max(9),
);

const settingsSchema = z.object({
  grinderName: z.string().trim().min(1, "Zadej název mlýnku"),
  brewerName: z.string().trim().min(1, "Zadej název kávovaru"),
  basketName: z.string().trim(),
  screenName: z.string().trim(),
  defaultDoseGrams: z.preprocess(
    commaToDot,
    z.coerce.number().positive("Dávka musí být kladné číslo"),
  ),
  baseGrindRotations: grindDigit,
  baseGrindNumber: grindDigit,
  baseGrindClicks: grindDigit,
});

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  try {
    const data = settingsSchema.parse(Object.fromEntries(formData));
    await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: { id: SETTINGS_ID, ...data },
    });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: { message: string }[] };
      return { error: zodError.issues[0]?.message ?? "Neplatná data.", saved: false };
    }
    console.error(error);
    return { error: "Něco se nepovedlo. Zkus to prosím znovu.", saved: false };
  }

  revalidatePath("/settings");
  revalidatePath("/brew/new");
  return { error: null, saved: true };
}
