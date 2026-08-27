import { describe, expect, it } from "vitest";
import {
  applyBrewEdit,
  changeDerivedField,
  parseNumber,
  solveBrewValues,
  type BrewValues,
} from "./brew-math";

describe("parseNumber", () => {
  it("čte desetinnou tečku i čárku", () => {
    expect(parseNumber("2.777")).toBe(2.777);
    expect(parseNumber("2,777")).toBe(2.777);
  });

  it("prázdné a nesmyslné pole vrací null, ne nulu", () => {
    // Tohle je jádro opravy editace: vymazané pole nesmí spadnout na 0,
    // jinak by další psaní dalo číslo začínající nulou.
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("   ")).toBeNull();
    expect(parseNumber("-")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
});

describe("solveBrewValues", () => {
  it("dopočítá výdej z dávky a poměru", () => {
    const result = solveBrewValues({ dose: "18", yield: "", ratio: "2" }, "yield");
    expect(result.yield).toBe("36");
  });

  it("dopočítá poměr z dávky a výdeje — případ ze zadání (18 g → 50 g)", () => {
    const result = solveBrewValues({ dose: "18", yield: "50", ratio: "" }, "ratio");
    expect(result.ratio).toBe("2.778");
  });

  it("dopočítá dávku z výdeje a poměru", () => {
    const result = solveBrewValues({ dose: "", yield: "50", ratio: "2.5" }, "dose");
    expect(result.dose).toBe("20");
  });

  it("zvládne jemný poměr ze zadání (2,777 z 18 g dá 50 g)", () => {
    const result = solveBrewValues({ dose: "18", yield: "", ratio: "2,777" }, "yield");
    expect(result.yield).toBe("50");
  });

  it("nechá dopočítávané pole prázdné, když chybí vstup", () => {
    const result = solveBrewValues({ dose: "", yield: "50", ratio: "" }, "ratio");
    expect(result.ratio).toBe("");
  });

  it("nedělí nulou", () => {
    expect(solveBrewValues({ dose: "0", yield: "50", ratio: "" }, "ratio").ratio).toBe("");
    expect(solveBrewValues({ dose: "", yield: "50", ratio: "0" }, "dose").dose).toBe("");
  });
});

describe("applyBrewEdit", () => {
  it("editace dávky přepočítá výdej při zachovaném poměru", () => {
    const values = applyBrewEdit({ dose: "18", yield: "36", ratio: "2" }, "yield", "dose", "20");
    expect(values.yield).toBe("40");
    expect(values.ratio).toBe("2");
  });

  it("editace poměru přepočítá výdej, dávka zůstává", () => {
    const values = applyBrewEdit({ dose: "18", yield: "36", ratio: "2" }, "yield", "ratio", "2.5");
    expect(values.dose).toBe("18");
    expect(values.yield).toBe("45");
  });

  it("dopočítávané pole nejde přepsat", () => {
    const values = applyBrewEdit({ dose: "18", yield: "36", ratio: "2" }, "yield", "yield", "99");
    expect(values.yield).toBe("36");
  });

  it("pole jde vymazat, aniž by se objevila nula", () => {
    const values = applyBrewEdit({ dose: "18", yield: "36", ratio: "2" }, "yield", "dose", "");
    expect(values.dose).toBe("");
    expect(values.yield).toBe("");
  });

  it("zvládne postupné psaní čísla po znacích bez vedoucí nuly", () => {
    // Uživatel smaže pole a píše "18": mezistav "1" musí zůstat "1".
    let values: BrewValues = { dose: "18", yield: "36", ratio: "2" };
    values = applyBrewEdit(values, "yield", "dose", "");
    values = applyBrewEdit(values, "yield", "dose", "1");
    expect(values.dose).toBe("1");
    values = applyBrewEdit(values, "yield", "dose", "18");
    expect(values.dose).toBe("18");
  });
});

describe("changeDerivedField", () => {
  it("scénář ze zadání: přepnu dopočet na poměr a zadám 18 g → 50 g", () => {
    let values: BrewValues = { dose: "18", yield: "36", ratio: "2" };

    // Uživatel chce znát poměr pro svůj oblíbený výdej.
    values = changeDerivedField(values, "ratio");
    values = applyBrewEdit(values, "ratio", "yield", "50");
    expect(values.ratio).toBe("2.778");
    expect(values.dose).toBe("18");

    // Přepne zpátky na dopočet výdeje a zvedne dávku — poměr se drží.
    values = changeDerivedField(values, "yield");
    values = applyBrewEdit(values, "yield", "dose", "20");
    expect(values.ratio).toBe("2.778");
    expect(values.yield).toBe("55.6");
  });
});
