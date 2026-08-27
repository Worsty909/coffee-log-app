import { describe, expect, it } from "vitest";
import {
  getAdvice,
  getDecliningRatingAdvice,
  getTimingAdvice,
  type RecipeForAdvice,
} from "./recommendation";

function recipe(overrides: Partial<RecipeForAdvice> = {}): RecipeForAdvice {
  return {
    rating: null,
    actualTotalSeconds: null,
    targetTotalSeconds: null,
    grindRotations: 0,
    grindNumber: 8,
    grindClicks: 3,
    ...overrides,
  };
}

describe("getTimingAdvice", () => {
  it("mírně pomalá extrakce → malý posun k hrubšímu", () => {
    // Cíl 30 s, skutečnost 38 s: odchylka 8 s je nad tolerancí (6 s),
    // ale pod jejím dvojnásobkem → malý krok 3 kliky. 83 + 3 = 86.
    const advice = getTimingAdvice(
      recipe({ targetTotalSeconds: 30, actualTotalSeconds: 38 }),
    );
    expect(advice?.text).toContain("hrubší");
    expect(advice?.suggestedGrind).toEqual({ rotations: 0, number: 8, clicks: 6 });
  });

  it("výrazně pomalá extrakce → velký posun k hrubšímu", () => {
    // Odchylka 15 s je nad dvojnásobkem tolerance → velký krok 6 kliků.
    const advice = getTimingAdvice(
      recipe({ targetTotalSeconds: 30, actualTotalSeconds: 45 }),
    );
    expect(advice?.suggestedGrind).toEqual({ rotations: 0, number: 8, clicks: 9 });
  });

  it("rychlá extrakce → navrhne jemnější mletí", () => {
    const advice = getTimingAdvice(
      recipe({ targetTotalSeconds: 30, actualTotalSeconds: 15 }),
    );
    expect(advice?.text).toContain("jemnější");
    // Odchylka je větší než dvojnásobek tolerance → velký krok 6 kliků: 83-6=77 → 0.7.7
    expect(advice?.suggestedGrind).toEqual({ rotations: 0, number: 7, clicks: 7 });
  });

  it("malá odchylka se neřeší", () => {
    expect(getTimingAdvice(recipe({ targetTotalSeconds: 30, actualTotalSeconds: 33 }))).toBeNull();
  });

  it("bez naměřeného času nedoporučuje nic", () => {
    expect(getTimingAdvice(recipe({ targetTotalSeconds: 30 }))).toBeNull();
  });

  it("bez vyplněného mletí poradí slovně, ale bez konkrétního nastavení", () => {
    const advice = getTimingAdvice(
      recipe({
        targetTotalSeconds: 30,
        actualTotalSeconds: 45,
        grindRotations: null,
        grindNumber: null,
        grindClicks: null,
      }),
    );
    expect(advice?.suggestedGrind).toBeNull();
    expect(advice?.text).toContain("hrubší");
  });
});

describe("getDecliningRatingAdvice", () => {
  it("klesající trend → nabídne mletí nejlépe hodnoceného pokusu", () => {
    const advice = getDecliningRatingAdvice([
      recipe({ rating: 2, grindNumber: 9, grindClicks: 5 }),
      recipe({ rating: 3, grindNumber: 9, grindClicks: 0 }),
      recipe({ rating: 5, grindNumber: 8, grindClicks: 3 }),
    ]);
    expect(advice?.suggestedGrind).toEqual({ rotations: 0, number: 8, clicks: 3 });
    expect(advice?.text).toContain("5 → 3 → 2");
    expect(advice?.text).toContain("jemnější");
  });

  it("stoupající nebo kolísavý trend se neřeší", () => {
    expect(
      getDecliningRatingAdvice([recipe({ rating: 4 }), recipe({ rating: 3 }), recipe({ rating: 5 })]),
    ).toBeNull();
  });

  it("míň než tři hodnocené pokusy nestačí", () => {
    expect(getDecliningRatingAdvice([recipe({ rating: 2 }), recipe({ rating: 4 })])).toBeNull();
  });
});

describe("getAdvice", () => {
  it("spojí obě doporučení, když platí obě", () => {
    const advice = getAdvice([
      recipe({ rating: 2, targetTotalSeconds: 30, actualTotalSeconds: 50, grindNumber: 9, grindClicks: 5 }),
      recipe({ rating: 3 }),
      recipe({ rating: 5 }),
    ]);
    expect(advice).toHaveLength(2);
  });

  it("prázdná historie nedává doporučení", () => {
    expect(getAdvice([])).toEqual([]);
  });
});
