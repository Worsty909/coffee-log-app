import { describe, expect, it } from "vitest";
import { durationToInput, formatSeconds, normalizeDurationInput, parseDuration } from "./format";

describe("parseDuration", () => {
  it("bere holé sekundy (typické pro espresso)", () => {
    expect(parseDuration("32")).toBe(32);
    expect(parseDuration(" 8 ")).toBe(8);
  });

  it("bere zápis mm:ss (typické pro filtr)", () => {
    expect(parseDuration("2:45")).toBe(165);
    expect(parseDuration("1:05")).toBe(65);
    expect(parseDuration("0:30")).toBe(30);
  });

  it("prázdné je nevyplněno, ne nula", () => {
    expect(parseDuration("")).toBeNull();
    expect(parseDuration("   ")).toBeNull();
  });

  it("odmítne nesmysl a nemožné sekundy", () => {
    expect(parseDuration("abc")).toBeNull();
    expect(parseDuration("1:75")).toBeNull();
  });
});

describe("durationToInput", () => {
  it("pod minutu ukazuje holé sekundy", () => {
    expect(durationToInput(32)).toBe("32");
  });

  it("nad minutu ukazuje mm:ss", () => {
    expect(durationToInput(165)).toBe("2:45");
  });

  it("prázdná hodnota zůstává prázdná", () => {
    expect(durationToInput(null)).toBe("");
  });

  it("je zpětně čitelný pro parseDuration", () => {
    for (const seconds of [0, 8, 32, 59, 60, 165, 600]) {
      expect(parseDuration(durationToInput(seconds))).toBe(seconds);
    }
  });
});

describe("formatSeconds", () => {
  it("doplní nulu k sekundám", () => {
    expect(formatSeconds(65)).toBe("1:05");
    expect(formatSeconds(0)).toBe("0:00");
  });
});

describe("čas z číselné klávesnice bez dvojtečky", () => {
  it("čárku i tečku bere jako dvojtečku", () => {
    expect(parseDuration("2,30")).toBe(150);
    expect(parseDuration("2.30")).toBe(150);
    expect(parseDuration("1,5")).toBe(65);
    expect(parseDuration("0,45")).toBe(45);
  });

  it("neplatné sekundy pořád odmítne", () => {
    expect(parseDuration("2,75")).toBeNull();
    expect(parseDuration("1,2,3")).toBeNull();
  });

  it("při psaní přepisuje oddělovač na dvojtečku", () => {
    expect(normalizeDurationInput("2,")).toBe("2:");
    expect(normalizeDurationInput("2,30")).toBe("2:30");
    expect(normalizeDurationInput("2.30")).toBe("2:30");
    expect(normalizeDurationInput("2::3")).toBe("2:3");
    expect(normalizeDurationInput("32")).toBe("32");
    expect(normalizeDurationInput("3x2 s")).toBe("32");
  });
});
