const FAVORITES_KEY = "quotedrop.favorites.v1";
const RECENT_KEY = "quotedrop.recent.v1";

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export const quotePrefs = {
  loadFavorites() {
    return readIds(FAVORITES_KEY);
  },

  saveFavorites(ids: string[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(new Set(ids))));
  },

  loadRecent() {
    return readIds(RECENT_KEY).slice(0, 10);
  },

  addRecent(id: string) {
    if (typeof window === "undefined") return [];
    const next = [id, ...readIds(RECENT_KEY).filter((item) => item !== id)].slice(0, 10);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
  },

  clearRecent() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(RECENT_KEY);
  },
};