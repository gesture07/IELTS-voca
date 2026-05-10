import type { Word } from "../types/word";

export const initialWords: Word[] = [
  {
    id: "1",
    word: "sustainable",
    meaning: "지속 가능한",
    example: "Governments should promote sustainable development.",
    topic: "Environment",
    status: "new",
    wrongCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    word: "curriculum",
    meaning: "교육 과정",
    example: "Schools should update their curriculum regularly.",
    topic: "Education",
    status: "new",
    wrongCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    word: "inequality",
    meaning: "불평등",
    example: "Income inequality remains a serious social problem.",
    topic: "Society",
    status: "new",
    wrongCount: 0,
    createdAt: new Date().toISOString(),
  },
];