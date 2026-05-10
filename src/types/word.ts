export type WordStatus = "new" | "learning" | "memorized" | "wrong";

export type Word = {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  topic: string;
  status: WordStatus;
  wrongCount: number;
  createdAt: string;
};