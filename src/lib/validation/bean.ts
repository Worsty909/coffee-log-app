// Validace vstupních dat pro formulář zrnka. Sdílí se mezi server
// akcí (skutečná validace na serveru) a případně formulářem na
// klientovi. Číselné hodnocení chuti je omezené na 1–5, jak žádá zadání
// ("číselné škály, ne volný text").
import { z } from "zod";
import { Process } from "@/generated/prisma/enums";

const ratingSchema = z.coerce.number().int().min(1).max(5).nullable();

// Prázdný string z formuláře převedeme na null, ať nemusí formulář sám řešit,
// jestli pole poslat nebo ne.
const emptyToNull = (value: unknown) => (value === "" ? null : value);

export const beanInputSchema = z.object({
  roaster: z.string().trim().min(1, "Zadej pražírnu"),
  coffeeName: z.string().trim().min(1, "Zadej název kávy"),
  originCountry: z.string().trim().min(1, "Zadej zemi původu"),
  region: z.preprocess(emptyToNull, z.string().trim().nullable()),
  process: z.enum(Process),
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
