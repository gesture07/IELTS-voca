import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../firebase";
import type { Word, WordStatus } from "../types/word";

export const useWords = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeWords: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeWords) {
        unsubscribeWords();
      }

      if (!user) {
        setWords([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const wordsRef = collection(db, "users", user.uid, "words");
      const q = query(wordsRef, orderBy("createdAt", "desc"));

      unsubscribeWords = onSnapshot(q, (snapshot) => {
        const data: Word[] = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as Omit<Word, "id">),
        }));

        setWords(data);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeWords) {
        unsubscribeWords();
      }
    };
  }, []);

  const addWord = async (
    word: Omit<Word, "id" | "status" | "wrongCount" | "createdAt">
  ) => {
    const user = auth.currentUser;

    if (!user) {
      alert("로그인 후 단어를 추가할 수 있습니다.");
      return;
    }

    const wordsRef = collection(db, "users", user.uid, "words");

    await addDoc(wordsRef, {
      ...word,
      status: "new",
      wrongCount: 0,
      createdAt: Date.now(),
    });
  };

  const deleteWord = async (id: string) => {
    const user = auth.currentUser;

    if (!user) return;

    const wordRef = doc(db, "users", user.uid, "words", id);
    await deleteDoc(wordRef);
  };

  const updateStatus = async (id: string, status: WordStatus) => {
    const user = auth.currentUser;

    if (!user) return;

    const wordRef = doc(db, "users", user.uid, "words", id);

    await updateDoc(wordRef, {
      status,
    });
  };

  const increaseWrongCount = async (id: string, currentWrongCount: number) => {
    const user = auth.currentUser;

    if (!user) return;

    const wordRef = doc(db, "users", user.uid, "words", id);

    await updateDoc(wordRef, {
      wrongCount: currentWrongCount + 1,
      status: "wrong",
    });
  };

  return {
    words,
    loading,
    addWord,
    deleteWord,
    updateStatus,
    increaseWrongCount,
  };
};
