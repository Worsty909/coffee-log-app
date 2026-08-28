// Validace formuláře receptu (PressureProfile) včetně jeho fází.
//
// Fáze se z formuláře posílají jako jedno JSON pole (`phasesJson`) místo
// rozepsaných políček `phases[0].label`, `phases[1].label`, ... — u
// dynamicky přidávaných/odebíraných řádků je to jednodušší na čtení i
// zápis než parsování indexovaných názvů polí.
import { z } from "zod";
import { parseDuration } from "@/lib/format";
import { decimalOrNull, emptyToNull } from "./number";

const phaseSchema = z.object({
  label: z.string().trim().min(1, "Každá fáze potřebuje název"),
  // Tlak dává smysl jen u páky (espresso) — u filtru zůstává null a UI
  // pole vůbec nezobrazuje.
  targetBarMin: z.preprocess(decimalOrNull, z.coerce.number().nullable()),
  targetBarMax: z.preprocess(decimalOrNull, z.coerce.number().nullable()),
  // Čas fáze přijímá "45" i "1:30", stejně jako čas celého receptu.
  // Refine s type predikátem, ať zod ví, že po validaci `null` už nemůže
  // nastat — bez toho by výsledný typ zůstal `number | null`.
  durationSeconds: z
    .string()
    .transform((text) => parseDuration(text))
    .refine((value): value is number => value !== null && value > 0, "Délka fáze musí být kladný čas"),
  note: z.preprocess(emptyToNull, z.string().trim().nullable()),
});

export const profileInputSchema = z
  .object({
    name: z.string().trim().min(1, "Zadej název receptu"),
    description: z.preprocess(emptyToNull, z.string().trim().nullable()),
    methodId: z.string().min(1, "Vyber metodu přípravy"),
    defaultRatio: z.preprocess(decimalOrNull, z.coerce.number().positive().nullable()),
    defaultDoseGrams: z.preprocess(decimalOrNull, z.coerce.number().positive().nullable()),
    grindOffsetClicks: z.preprocess(
      emptyToNull,
      z.coerce.number().int().nullable(),
    ),
    waterTempC: z.preprocess(decimalOrNull, z.coerce.number().nullable()),
    phasesJson: z.string(),
  })
  .transform((data, ctx) => {
    let raw: unknown;
    try {
      raw = JSON.parse(data.phasesJson);
    } catch {
      ctx.addIssue({ code: "custom", message: "Neplatná data fází." });
      return z.NEVER;
    }

    const phases = z.array(phaseSchema).min(1, "Recept potřebuje aspoň jednu fázi").safeParse(raw);
    if (!phases.success) {
      ctx.addIssue({
        code: "custom",
        message: phases.error.issues[0]?.message ?? "Neplatné fáze.",
      });
      return z.NEVER;
    }

    return {
      name: data.name,
      description: data.description,
      methodId: data.methodId,
      defaultRatio: data.defaultRatio,
      defaultDoseGrams: data.defaultDoseGrams,
      grindOffsetClicks: data.grindOffsetClicks,
      waterTempC: data.waterTempC,
      phases: phases.data,
    };
  });

export type ProfileInput = z.infer<typeof profileInputSchema>;
