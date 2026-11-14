import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  deriveSessionKey,
  pinMatches,
  safeNextPath,
  verifySessionToken,
} from "./session";

// Testovací hodnoty — se skutečným PINem appky nemají nic společného.
const key = deriveSessionKey("test-secret", "0000");
const now = 1_800_000_000_000;

describe("session token", () => {
  it("platný token projde", () => {
    expect(verifySessionToken(createSessionToken(key, now), key, now + 1000)).toBe(true);
  });

  it("po vypršení neprojde", () => {
    const token = createSessionToken(key, now);
    const afterExpiry = now + SESSION_MAX_AGE_SECONDS * 1000 + 1;
    expect(verifySessionToken(token, key, afterExpiry)).toBe(false);
  });

  it("prodloužení expirace bez znalosti klíče neprojde", () => {
    const [expiresAt, signature] = createSessionToken(key, now).split(".");
    const forged = `${Number(expiresAt) + 1000}.${signature}`;
    expect(verifySessionToken(forged, key, now)).toBe(false);
  });

  it("token podepsaný jiným tajemstvím neprojde", () => {
    const other = deriveSessionKey("other-secret", "0000");
    expect(verifySessionToken(createSessionToken(other, now), key, now)).toBe(false);
  });

  it("změna PINu zneplatní staré tokeny", () => {
    const afterPinChange = deriveSessionKey("test-secret", "9999");
    expect(verifySessionToken(createSessionToken(key, now), afterPinChange, now)).toBe(false);
  });

  it("odmítne prázdný a poškozený vstup", () => {
    for (const token of [undefined, null, "", "abc", "123.", ".abc", "1e99.x", `${now + 5000}.short`]) {
      expect(verifySessionToken(token, key, now)).toBe(false);
    }
  });
});

describe("pinMatches", () => {
  it("sedí jen přesná shoda", () => {
    expect(pinMatches("0000", "0000")).toBe(true);
    expect(pinMatches("0001", "0000")).toBe(false);
    expect(pinMatches("000", "0000")).toBe(false);
    expect(pinMatches("00000", "0000")).toBe(false);
    expect(pinMatches("", "0000")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("pustí cesty uvnitř appky", () => {
    expect(safeNextPath("/beans/abc?x=1")).toBe("/beans/abc?x=1");
  });

  it("cizí adresy a nesmysly vrací na úvod", () => {
    for (const next of ["https://evil.example", "//evil.example", "/\\evil.example", "beans", "", null, undefined, 5]) {
      expect(safeNextPath(next)).toBe("/");
    }
  });

  it("nevrací zpátky na login", () => {
    expect(safeNextPath("/login")).toBe("/");
    expect(safeNextPath("/login?next=/beans")).toBe("/");
  });
});
