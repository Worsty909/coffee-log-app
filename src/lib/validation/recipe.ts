// Validace formuláře receptu (kalkulačka, mletí, časovač).
//
// Formulářová pole jsou textová (viz components/ui/NumberField), takže
// se tu text převádí na čísla — včetně tolerance k desetinné čárce a
// k zápisu času "32" i "2:45".
import { z } from "zod";
import { parseDuration } from "@/lib/format";
import { commaToDot, decimalOrNull, emptyToNull } from "./number";

/** Čas ve tvaru "32" nebo "2:45" → sekundy; prázdné → null. */
const durationField = z
  .string()
  .nullish()
  .transform((text) => (text == null || text.trim() === "" ? null : parseDuration(text)))
  .refine((value) => value === null || value >= 0, "Čas musí být kladný");

/** Jedna číslice nastavení mlýnku (otáčky / číslo / klik). */
const grindDigit = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? 0 : value),
  z.coerce.number().int().min(0).max(9),
);

export const recipeInputSchema = z
  .object({
    beanId: z.string().min(1, "Vyber zrnko"),
    methodId: z.string().min(1, "Vyber metodu přípravy"),
    profileId: z.preprocess(emptyToNull, z.string().nullable()),

    ratio: z.preprocess(commaToDot, z.coerce.number().positive("Poměr musí být kladné číslo")),
    doseGrams: z.preprocess(
      commaToDot,
      z.coerce.number().positive("Dávka musí být kladné číslo"),
    ),
    yieldGrams: z.preprocess(
      commaToDot,
      z.coerce.number().positive("Výdej musí být kladné číslo"),
    ),

    grindRotations: grindDigit,
    grindNumber: grindDigit,
    grindClicks: grindDigit,
    grindNote: z.preprocess(emptyToNull, z.string().trim().nullable()),

    waterTempC: z.preprocess(decimalOrNull, z.coerce.number().nullable()),

    bloomSeconds: durationField,
    targetTotalSeconds: durationField,
    actualTotalSeconds: durationField,

    rating: z.preprocess(emptyToNull, z.coerce.number().int().min(1).max(5).nullable()),
    notes: z.preprocess(emptyToNull, z.string().trim().nullable()),
  })
  .transform((data) => ({
    ...data,
    // Poměr se ukládá odvozeně z dávky a výdeje, ať v databázi vždy
    // sedí dohromady i kdyby formulář poslal nekonzistentní trojici.
    ratio: data.yieldGrams / data.doseGrams,
  }));

export type RecipeInput = z.infer<typeof recipeInputSchema>;

export const customMethodSchema = z.object({
  name: z.string().trim().min(1, "Zadej název metody"),
  // Bez omezení na krok — poměr může být libovolně jemný (2,777).
  defaultRatio: z.preprocess(
    commaToDot,
    z.coerce.number().positive("Poměr musí být kladné číslo"),
  ),
});
