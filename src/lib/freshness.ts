// Čerstvost zrnka podle data pražení. Espresso po pražení pár dní
// odplyňuje a pak má několik týdnů nejlepší formu — appka to u zrnka
// připomene, protože to mění, jak se šálek chová (čerstvé zrno teče
// rychleji a pění, staré ztrácí cremu a chuť).
//
// Hranice jsou orientační vodítko, ne pravidlo — stejně jako doporučení
// v recommendation.ts.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type FreshnessStage = "resting" | "peak" | "fading" | "old";

export type Freshness = {
  days: number;
  stage: FreshnessStage;
  /** "dnes", "před 1 dnem", "před 12 dny" */
  ageLabel: string;
  /** Krátký komentář k fázi, např. "v nejlepší formě". */
  stageLabel: string;
};

const STAGE_LABELS: Record<FreshnessStage, string> = {
  resting: "ještě odpočívá",
  peak: "v nejlepší formě",
  fading: "pomalu vyprchává",
  old: "za zenitem",
};

/** Celé dny od pražení; null pro datum v budoucnosti (překlep). */
export function daysSinceRoast(roastDate: Date, now: Date = new Date()): number | null {
  const days = Math.floor((now.getTime() - roastDate.getTime()) / MS_PER_DAY);
  return days < 0 ? null : days;
}

export function stageForDays(days: number): FreshnessStage {
  if (days < 7) return "resting";
  if (days <= 42) return "peak";
  if (days <= 70) return "fading";
  return "old";
}

export function getFreshness(roastDate: Date | null, now: Date = new Date()): Freshness | null {
  if (!roastDate) return null;
  const days = daysSinceRoast(roastDate, now);
  if (days === null) return null;

  const stage = stageForDays(days);
  const ageLabel = days === 0 ? "dnes" : days === 1 ? "před 1 dnem" : `před ${days} dny`;
  return { days, stage, ageLabel, stageLabel: STAGE_LABELS[stage] };
}
