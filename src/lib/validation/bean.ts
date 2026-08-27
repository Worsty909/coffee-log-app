// Validace vstupních dat pro formulář zrnka. Sdílí se mezi server
// akcí (skutečná validace na serveru) a případně formulářem na
// klientovi. Číselné hodnocení chuti je omezené na 1–5, jak žádá zadání
// ("číselné škály, ne volný text").
import { z } from "zod";
import { Process, RoastLevel } from "@/generated/prisma/enums";
import { emptyToNull } from "./number";

const ratingSchema = z.coerce.number().int().min(1).max(5).nullable();

export const beanInputSchema = z.object({
  roaster: z.string().trim().min(1, "Zadej pražírnu"),
  coffeeName: z.string().trim().min(1, "Zadej název kávy"),
  originCountry: z.string().trim().min(1, "Zadej zemi původu"),
  region: z.preprocess(emptyToNull, z.string().trim().nullable()),
  process: z.enum(Process),
  roastLevel: z.preprocess(emptyToNull, z.enum(RoastLevel).nullable()),
  roastDate: z.preprocess(emptyToNull, z.coerce.date().nullable()),
  sweetness: z.preprocess(emptyToNull, ratingSchema),
  acidity: z.preprocess(emptyToNull, ratingSchema),
  body: z.preprocess(emptyToNull, ratingSchema),
  aftertaste: z.preprocess(emptyToNull, ratingSchema),
  notes: z.preprocess(emptyToNull, z.string().trim().nullable()),
});

export type BeanInput = z.infer<typeof beanInputSchema>;

// Popisky procesů pro select v UI — na jednom místě, ať se nerozjíždí
// mezi formulářem a zobrazením.
export const processLabels: Record<Process, string> = {
  WASHED: "Washed (mytý)",
  NATURAL: "Natural (přírodní)",
  HONEY: "Honey",
  OTHER: "Jiné",
};

// Stupeň pražení rozhoduje o tom, který tlakový profil dává smysl —
// světlá pražení těží z bloomingu a turbo shotů, tmavá z klasiky.
export const roastLevelLabels: Record<RoastLevel, string> = {
  LIGHT: "Světlé",
  MEDIUM_LIGHT: "Středně světlé",
  MEDIUM: "Střední",
  MEDIUM_DARK: "Středně tmavé",
  DARK: "Tmavé",
};
