import { describe, expect, it } from "vitest";
import { daysSinceRoast, getFreshness, stageForDays } from "./freshness";

const now = new Date("2026-11-14T10:00:00Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

describe("daysSinceRoast", () => {
  it("počítá celé dny", () => {
    expect(daysSinceRoast(daysAgo(12), now)).toBe(12);
    expect(daysSinceRoast(new Date("2026-11-14T00:00:00Z"), now)).toBe(0);
  });

  it("datum v budoucnosti bere jako neznámé", () => {
    expect(daysSinceRoast(daysAgo(-3), now)).toBeNull();
  });
});

describe("stageForDays", () => {
  it("rozdělí stáří do fází na hranicích", () => {
    expect(stageForDays(0)).toBe("resting");
    expect(stageForDays(6)).toBe("resting");
    expect(stageForDays(7)).toBe("peak");
    expect(stageForDays(42)).toBe("peak");
    expect(stageForDays(43)).toBe("fading");
    expect(stageForDays(70)).toBe("fading");
    expect(stageForDays(71)).toBe("old");
  });
});

describe("getFreshness", () => {
  it("vrací null bez data pražení", () => {
    expect(getFreshness(null, now)).toBeNull();
  });

  it("skloňuje stáří česky", () => {
    expect(getFreshness(daysAgo(0), now)?.ageLabel).toBe("dnes");
    expect(getFreshness(daysAgo(1), now)?.ageLabel).toBe("před 1 dnem");
    expect(getFreshness(daysAgo(12), now)?.ageLabel).toBe("před 12 dny");
  });

  it("přidá popis fáze", () => {
    expect(getFreshness(daysAgo(12), now)).toMatchObject({ stage: "peak", stageLabel: "v nejlepší formě" });
  });
});
