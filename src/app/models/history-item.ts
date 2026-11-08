export interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  createdAt: number;
  /** Relative path under Directory.Data (e.g. `linguo-history/<id>.jpg`); absent for typed-only entries. */
  image?: string;
}
