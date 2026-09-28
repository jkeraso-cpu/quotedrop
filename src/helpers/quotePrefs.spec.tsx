// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { quotePrefs } from "./quotePrefs";

describe("quotePrefs", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists unique favorite IDs", () => {
    quotePrefs.saveFavorites(["q-001", "q-002", "q-001"]);
    expect(quotePrefs.loadFavorites()).toEqual(["q-001", "q-002"]);
  });

  it("stores at most ten recent IDs without duplicates", () => {
    for (let index = 0; index < 12; index += 1) quotePrefs.addRecent(`q-${index}`);
    quotePrefs.addRecent("q-11");

    const recent = quotePrefs.loadRecent();
    expect(recent.length).toBe(10);
    expect(recent[0]).toBe("q-11");
    expect(new Set(recent).size).toBe(recent.length);
  });
});
