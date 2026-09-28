export type Quote = {
  id: string;
  text: string;
  author: string;
  category: string;
  tags: string[];
};

export type ThemeMode = "light" | "dark" | "auto";
export type CardFormat = "square" | "portrait" | "landscape";
export type CardAlign = "left" | "center";
export type CardFont = "serif" | "sans";
