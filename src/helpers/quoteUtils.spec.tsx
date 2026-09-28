import { describe, expect, it } from "vitest";
import { quoteData } from "./quoteData";
import { quoteUtils } from "./quoteUtils";

describe("quoteUtils", () => {
  it("ships at least 100 unique quotes in 12 categories", () => {
    expect(quoteData.length).toBeGreaterThanOrEqual(100);
    expect(new Set(quoteData.map((quote) => quote.id)).size).toBe(quoteData.length);
    expect(new Set(quoteData.map((quote) => quote.text.toLowerCase())).size).toBe(quoteData.length);
    expect(new Set(quoteData.map((quote) => quote.category)).size).toBe(12);
  });

  it("searches text, author, category, and tags", () => {
    expect(quoteUtils.search("Epictetus").some((quote) => quote.author === "Epictetus")).toBe(true);
    expect(quoteUtils.search("discipline").length).toBeGreaterThan(0);
    expect(quoteUtils.search("Creativity").length).toBeGreaterThan(0);
  });

  it("filters categories", () => {
    const quotes = quoteUtils.filterByCategory("Love");
    expect(quotes.length).toBeGreaterThan(0);
    expect(quotes.every((quote) => quote.category === "Love")).toBe(true);
  });

  it("avoids immediately repeating a random quote", () => {
    const current = quoteData[0];
    const next = quoteUtils.random(current.id, quoteData, () => 0);
    expect(next?.id).not.toBe(current.id);
  });

  it("keeps the daily quote stable for one local day", () => {
    const morning = quoteUtils.daily(new Date(2026, 8, 28, 8), quoteData);
    const evening = quoteUtils.daily(new Date(2026, 8, 28, 20), quoteData);
    expect(morning?.id).toBe(evening?.id);
  });

  it("formats copy text and sanitizes filenames", () => {
    expect(quoteUtils.formatCopy(quoteData[0])).toContain(" — ");
    expect(quoteUtils.sanitizeFilename("Maya Angelou")).toBe("quotedrop-maya-angelou.png");
  });

  it("reduces text scale for very long quotes", () => {
    expect(quoteUtils.fontScale("short")).toBe(1);
    expect(quoteUtils.fontScale("x".repeat(230))).toBeLessThan(0.7);
  });
});
