// Převod chyby ze server akce na hlášku pro formulář. Dřív si tohle
// každý soubor s akcemi řešil vlastní kopií.
import { UploadError } from "@/lib/storage";

export function describeActionError(
  error: unknown,
  messages: { duplicate?: string } = {},
): string {
  if (error instanceof UploadError) {
    return error.message;
  }
  if (error && typeof error === "object" && "issues" in error) {
    // Chyba ze zod validace — vezmeme první hlášku, ať je jasné, co opravit.
    const zodError = error as { issues: { message: string }[] };
    return zodError.issues[0]?.message ?? "Neplatná data formuláře.";
  }
  if (error && typeof error === "object" && "code" in error) {
    // Prisma: P2002 = porušená unikátnost, P2025 = záznam už neexistuje,
    // P2003 = odkaz na neexistující záznam (např. mezitím smazané zrnko).
    if (error.code === "P2002" && messages.duplicate) return messages.duplicate;
    if (error.code === "P2025" || error.code === "P2003") {
      return "Záznam už neexistuje — nejspíš byl mezitím smazán.";
    }
  }
  console.error(error);
  return "Něco se nepovedlo. Zkus to prosím znovu.";
}
