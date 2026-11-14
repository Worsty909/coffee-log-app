import { describe, expect, it } from "vitest";
import { FREE_ATTEMPTS, describeWait, lockMinutesAfter } from "./lockout";

describe("lockMinutesAfter", () => {
  it("prvních pár překlepů nezamyká", () => {
    for (let attempts = 0; attempts < FREE_ATTEMPTS; attempts++) {
      expect(lockMinutesAfter(attempts)).toBe(0);
    }
  });

  it("pak se čekání zdvojnásobuje", () => {
    expect(lockMinutesAfter(5)).toBe(1);
    expect(lockMinutesAfter(6)).toBe(2);
    expect(lockMinutesAfter(7)).toBe(4);
    expect(lockMinutesAfter(10)).toBe(32);
  });

  it("strop je jeden den", () => {
    expect(lockMinutesAfter(16)).toBe(24 * 60);
    expect(lockMinutesAfter(1000)).toBe(24 * 60);
  });

  it("vyzkoušet všech 10 000 čtyřmístných PINů by trvalo desítky let", () => {
    let minutes = 0;
    for (let attempts = 1; attempts <= 10_000; attempts++) minutes += lockMinutesAfter(attempts);
    expect(minutes / 60 / 24 / 365).toBeGreaterThan(25);
  });
});

describe("describeWait", () => {
  it("skloňuje minuty a hodiny", () => {
    expect(describeWait(30_000)).toBe("za 1 minutu");
    expect(describeWait(3 * 60_000)).toBe("za 3 minuty");
    expect(describeWait(32 * 60_000)).toBe("za 32 minut");
    expect(describeWait(60 * 60_000)).toBe("za 1 hodinu");
    expect(describeWait(3 * 60 * 60_000)).toBe("za 3 hodiny");
    expect(describeWait(24 * 60 * 60_000)).toBe("za 24 hodin");
  });
});
