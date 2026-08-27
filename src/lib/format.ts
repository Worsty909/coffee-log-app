// Drobné sdílené formátovací pomůcky pro zobrazení časů v UI.

/** Sekundy → "1:05". */
export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Přečte zadaný čas. Espresso se počítá v sekundách ("32"), filtr spíš
 * v minutách ("2:45") — bereme obojí, ať se nemusí přepínat jednotky.
 *
 * Vrací null pro prázdný nebo nesmyslný vstup (tj. "nevyplněno").
 */
export function parseDuration(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;

  const colonMatch = trimmed.match(/^(\d+)\s*:\s*(\d{1,2})$/);
  if (colonMatch) {
    const minutes = Number(colonMatch[1]);
    const seconds = Number(colonMatch[2]);
    if (seconds > 59) return null;
    return minutes * 60 + seconds;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return null;
}

/**
 * Sekundy zpět do pole formuláře. Pod minutu ukazujeme holé sekundy
 * (u espressa je "32" čitelnější než "0:32"), nad minutu mm:ss.
 */
export function durationToInput(totalSeconds: number | null): string {
  if (totalSeconds === null) return "";
  if (totalSeconds < 60) return String(totalSeconds);
  return formatSeconds(totalSeconds);
}
