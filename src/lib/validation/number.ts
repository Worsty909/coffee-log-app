// Sdílené pomůcky pro čtení čísel z formulářů.
//
// Formulářová pole v appce jsou textová (viz components/ui/NumberField),
// aby šla normálně editovat a mazat. Sem patří převod toho textu na
// číslo — včetně tolerance k české desetinné čárce.

/** Prázdné pole → null (tj. "nevyplněno"), ne 0. */
export const emptyToNull = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return null;
  return value;
};

/** Prázdné pole → 0. Pro pole, kde nevyplněno znamená nulu (např. minuty). */
export const emptyToZero = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return 0;
  return value;
};

/**
 * Nahradí desetinnou čárku tečkou, aby `z.coerce.number()` přijal i
 * "2,777". Nečíselné vstupy nechává být — o ty se postará zod.
 */
export const commaToDot = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim().replace(",", ".");
  }
  return value;
};

/** Kombinace obou: prázdné → null, jinak text s čárkou převedený na tečku. */
export const decimalOrNull = (value: unknown) => commaToDot(emptyToNull(value));
