// Validace formuláře receptu (kalkulačka + časovač). Minuty a sekundy
// přicházejí z formuláře zvlášť (je to pro člověka čitelnější než jedno
// pole "počet sekund") a tady se sečtou na celkový počet sekund, jak to
// čeká databáze. Nulový čas (0 min 0 s) znamená "nevyplněno".
import { z } from "zod";

const emptyToNull = (value: unknown) => (value === "" ? null : value);
const emptyToZero = (value: unknown) => (value === "" || value === null || value === undefined ? 0 : value);

function minutesSecondsToTotalOrNull(minutes: number, seconds: number): number | null {
  const total = minutes * 60 + seconds;
  return total > 0 ? total : null;
}

export const recipeInputSchema = z
  .object({
    beanId: z.string().min(1, "Vyber zrnko"),
    methodId: z.string().min(1, "Vyber metodu přípravy"),
    ratio: z.coerce.number().positive("Poměr musí být kladné číslo"),
    coffeeGrams: z.coerce.number().positive("Gramáž kávy musí být kladné číslo"),
    waterGrams: z.coerce.number().positive("Množství vody musí být kladné číslo"),
    grindSetting: z.preprocess(emptyToNull, z.string().trim().nullable()),
    waterTempC: z.preprocess(emptyToNull, z.coerce.number().nullable()),
    bloomSeconds: z.preprocess(emptyToNull, z.coerce.number().int().nonnegative().nullable()),
    targetTotalMinutes: z.preprocess(emptyToZero, z.coerce.number().int().nonnegative()),
    targetTotalSecondsPart: z.preprocess(emptyToZero, z.coerce.number().int().min(0).max(59)),
    actualTotalMinutes: z.preprocess(emptyToZero, z.coerce.number().int().nonnegative()),
    actualTotalSecondsPart: z.preprocess(emptyToZero, z.coerce.number().int().min(0).max(59)),
    rating: z.preprocess(emptyToNull, z.coerce.number().int().min(1).max(5).nullable()),
    notes: z.preprocess(emptyToNull, z.string().trim().nullable()),
  })
  .transform((data) => ({
    beanId: data.beanId,
    methodId: data.methodId,
    ratio: data.ratio,
    coffeeGrams: data.coffeeGrams,
    waterGrams: data.waterGrams,
    grindSetting: data.grindSetting,
    waterTempC: data.waterTempC,
    bloomSeconds: data.bloomSeconds,
    targetTotalSeconds: minutesSecondsToTotalOrNull(data.targetTotalMinutes, data.targetTotalSecondsPart),
    actualTotalSeconds: minutesSecondsToTotalOrNull(data.actualTotalMinutes, data.actualTotalSecondsPart),
    rating: data.rating,
    notes: data.notes,
  }));

export type RecipeInput = z.infer<typeof recipeInputSchema>;

export const customMethodSchema = z.object({
  name: z.string().trim().min(1, "Zadej název metody"),
  defaultRatio: z.coerce.number().positive("Poměr musí být kladné číslo"),
});
