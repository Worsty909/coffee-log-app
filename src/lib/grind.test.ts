import { describe, expect, it } from "vitest";
import {
  describeGrindDelta,
  formatGrind,
  fromClicks,
  parseGrind,
  shiftGrind,
  toClicks,
} from "./grind";

describe("toClicks / fromClicks", () => {
  it("převede zápis z mlýnku na kliky", () => {
    expect(toClicks({ rotations: 0, number: 8, clicks: 3 })).toBe(83);
    expect(toClicks({ rotations: 1, number: 0, clicks: 0 })).toBe(100);
    expect(toClicks({ rotations: 2, number: 7, clicks: 0 })).toBe(270);
  });

  it("převod tam a zpátky dá stejné nastavení", () => {
    for (const total of [0, 7, 83, 100, 199, 270, 451]) {
      expect(toClicks(fromClicks(total))).toBe(total);
    }
  });

  it("nejde pod nulu", () => {
    expect(fromClicks(-5)).toEqual({ rotations: 0, number: 0, clicks: 0 });
  });
});

describe("parseGrind", () => {
  it("přečte běžný zápis", () => {
    expect(parseGrind("0.8.3")).toEqual({ rotations: 0, number: 8, clicks: 3 });
    expect(parseGrind(" 1.2.5 ")).toEqual({ rotations: 1, number: 2, clicks: 5 });
  });

  it("odmítne nesmysl a volný text", () => {
    expect(parseGrind("Comandante 25 kliků")).toBeNull();
    expect(parseGrind("0.8")).toBeNull();
    expect(parseGrind("")).toBeNull();
  });

  it("odmítne dvojciferné číslo nebo klik", () => {
    expect(parseGrind("0.12.3")).toBeNull();
    expect(parseGrind("0.8.13")).toBeNull();
  });
});

describe("shiftGrind", () => {
  it("posun o kliky přeteče přes číslo i otáčku", () => {
    // 0.8.3 = 83 kliků; +8 = 91 kliků = 0.9.1
    expect(formatGrind(shiftGrind({ rotations: 0, number: 8, clicks: 3 }, 8))).toBe("0.9.1");
    // 0.9.5 = 95 kliků; +8 = 103 = 1.0.3
    expect(formatGrind(shiftGrind({ rotations: 0, number: 9, clicks: 5 }, 8))).toBe("1.0.3");
  });

  it("umí i jemnější (záporný posun)", () => {
    expect(formatGrind(shiftGrind({ rotations: 1, number: 0, clicks: 2 }, -4))).toBe("0.9.8");
  });
});

describe("describeGrindDelta", () => {
  it("popíše směr i velikost posunu", () => {
    const base = { rotations: 0, number: 8, clicks: 3 };
    expect(describeGrindDelta(base, { rotations: 0, number: 9, clicks: 1 })).toBe(
      "o 8 kliků hrubší",
    );
    expect(describeGrindDelta(base, { rotations: 0, number: 8, clicks: 1 })).toBe(
      "o 2 kliky jemnější",
    );
    expect(describeGrindDelta(base, { rotations: 0, number: 8, clicks: 4 })).toBe(
      "o 1 klik hrubší",
    );
  });

  it("stejné nastavení nemá co popisovat", () => {
    const base = { rotations: 0, number: 8, clicks: 3 };
    expect(describeGrindDelta(base, base)).toBeNull();
  });
});
