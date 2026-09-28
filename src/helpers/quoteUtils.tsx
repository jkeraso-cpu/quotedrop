import { quoteData } from "./quoteData";

type Quote = (typeof quoteData)[number];

const normalize = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

export const quoteUtils = {
  search(query: string, quotes: readonly Quote[] = quoteData) {
    const needle = normalize(query);
    if (!needle) return [...quotes];
    return quotes.filter((quote) =>
      [
        quote.text,
        quote.author,
        quote.category,
        ...quote.tags,
      ].some((value) => normalize(value).includes(needle)),
    );
  },

  filterByCategory(category: string, quotes: readonly Quote[] = quoteData) {
    if (!category || category === "All") return [...quotes];
    return quotes.filter((quote) => quote.category === category);
  },

  random(currentId?: string, quotes: readonly Quote[] = quoteData, random = Math.random) {
    if (quotes.length === 0) return null;
    if (quotes.length === 1) return quotes[0];
    const candidates = currentId ? quotes.filter((quote) => quote.id !== currentId) : [...quotes];
    return candidates[Math.floor(random() * candidates.length)] ?? candidates[0];
  },

  daily(date: Date, quotes: readonly Quote[] = quoteData) {
    if (quotes.length === 0) return null;
    const key = Number(
      `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`,
    );
    return quotes[key % quotes.length];
  },

  formatCopy(quote: Quote) {
    return `“${quote.text}” — ${quote.author}`;
  },

  sanitizeFilename(author?: string) {
    const cleaned = (author || "card")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
    return `quotedrop-${cleaned || "card"}.png`;
  },

  fontScale(text: string) {
    const length = text.trim().length;
    if (length > 220) return 0.66;
    if (length > 170) return 0.74;
    if (length > 125) return 0.82;
    if (length > 90) return 0.9;
    return 1;
  },
};