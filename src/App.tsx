import { useState, useEffect } from "react";
import { useWords } from "./hooks/useWords";
import "./App.css";
import { auth, loginWithGoogle, logout } from "./firebase";
import type { User } from "firebase/auth";

type Page = "study" | "add" | "list";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const { words, loading, addWord, deleteWord, updateStatus } = useWords();

  const [page, setPage] = useState<Page>("study");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMeaningVisible, setIsMeaningVisible] = useState(false);

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [topic, setTopic] = useState("General");

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const studyWords = words.filter((item) => item.status !== "memorized");
  const currentWord = studyWords[currentIndex];

  const movePrev = () => {
    setIsMeaningVisible(false);
    setCurrentIndex((prev) => (prev === 0 ? studyWords.length - 1 : prev - 1));
  };

  const moveNext = () => {
    setIsMeaningVisible(false);
    setCurrentIndex((prev) => (prev === studyWords.length - 1 ? 0 : prev + 1));
  };

  const handleStatus = (status: "learning" | "memorized") => {
    if (!currentWord) return;

    updateStatus(currentWord.id, status);
    setIsMeaningVisible(false);

    if (currentIndex >= studyWords.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleAddWord = () => {
    if (!word.trim() || !meaning.trim()) {
      alert("단어와 뜻은 필수입니다.");
      return;
    }

    addWord({
      word,
      meaning,
      example,
      topic,
    });

    setWord("");
    setMeaning("");
    setExample("");
    setTopic("General");
    setPage("study");
  };

  type WordFilter = "all" | "new" | "learning" | "memorized" | "wrong";

  const [wordFilter, setWordFilter] = useState<WordFilter>("all");

  const filteredWords =
    wordFilter === "all"
      ? words
      : words.filter((item) => item.status === wordFilter);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < 50) {
      setTouchStartX(null);
      return;
    }

    if (diff > 0) {
      moveNext();
    } else {
      movePrev();
    }

    setTouchStartX(null);
  };

  const totalCount = words.length;

  const memorizedCount = words.filter(
    (item) => item.status === "memorized"
  ).length;

  const learningCount = words.filter(
    (item) => item.status === "learning"
  ).length;

  const wrongCount = words.filter((item) => item.status === "wrong").length;

  const progress =
    totalCount === 0 ? 0 : Math.round((memorizedCount / totalCount) * 100);

  if (loading) {
    return <div className="loading-screen">단어 불러오는 중...</div>;
  }
  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">IELTS Voca Pocket</p>
        <h1>아이엘츠 단어 암기장</h1>
        {/* <p className="description">
          단어를 넘기면서 뜻을 확인하고, 다시 볼 단어와 암기 완료 단어를
          구분하세요.
        </p> */}
        <div className="auth-box">
          {user ? (
            <>
              <span>{user.isAnonymous ? "익명 사용자" : user.email}</span>
              <button onClick={logout}>로그아웃</button>
            </>
          ) : (
            <button onClick={loginWithGoogle}>Google 로그인</button>
          )}
        </div>
      </section>
      {page !== "study" && (
        <section className="progress-card">
          <div className="progress-top">
            <div>
              <p className="progress-label">암기 진행률</p>
              <h2>{progress}%</h2>
            </div>

            <div className="progress-stats">
              <span>전체 {totalCount}</span>
              <span>외우는 중 {learningCount}</span>
              <span>암기 완료 {memorizedCount}</span>
              <span>오답 {wrongCount}</span>
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>
      )}
      <nav className="tabs">
        <button
          className={page === "study" ? "active" : ""}
          onClick={() => setPage("study")}
        >
          암기 체크
        </button>
        <button
          className={page === "add" ? "active" : ""}
          onClick={() => setPage("add")}
        >
          단어 등록
        </button>
        <button
          className={page === "list" ? "active" : ""}
          onClick={() => setPage("list")}
        >
          단어 목록
        </button>
      </nav>

      {page === "study" && (
        <section className="card study-card">
          <div className="section-header">
            <h2></h2>
            <span>
              {studyWords.length === 0 ? 0 : currentIndex + 1} /{" "}
              {studyWords.length}
            </span>
          </div>

          {!currentWord ? (
            <div className="empty-box">
              외울 단어가 없습니다. 단어를 먼저 등록해 주세요.
            </div>
          ) : (
            <>
              <div
                className="voca-card"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <span className="topic-badge">{currentWord.topic}</span>

                <h3>{currentWord.word}</h3>

                <div
                  className={`meaning-box ${
                    !isMeaningVisible ? "hidden-meaning" : ""
                  }`}
                >
                  {isMeaningVisible ? currentWord.meaning : ""}
                </div>

                {isMeaningVisible && currentWord.example && (
                  <p className="example">"{currentWord.example}"</p>
                )}

                <button
                  className="ghost-button"
                  onClick={() => setIsMeaningVisible((prev) => !prev)}
                >
                  {isMeaningVisible ? "뜻 가리기" : "뜻 보기"}
                </button>
              </div>

              <div className="slide-buttons">
                <button onClick={movePrev}>← 이전</button>
                <button onClick={moveNext}>다음 →</button>
              </div>

              <div className="status-buttons">
                <button onClick={() => handleStatus("learning")}>
                  외우는 중
                </button>
                <button onClick={() => handleStatus("memorized")}>
                  암기 완료
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {page === "add" && (
        <section className="card form-card">
          <h2>단어 등록</h2>

          <div className="form-grid">
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="영어 단어"
            />

            <input
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="뜻"
            />

            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="주제 ex) Environment"
            />

            <input
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="예문"
            />
          </div>

          <button className="primary-button" onClick={handleAddWord}>
            단어 추가
          </button>
        </section>
      )}

      {page === "list" && (
        <section className="card">
          <div className="filter-scroll">
            <div className="filter-buttons">
              <button
                className={wordFilter === "all" ? "active" : ""}
                onClick={() => setWordFilter("all")}
              >
                전체({totalCount})
              </button>

              <button
                className={wordFilter === "new" ? "active" : ""}
                onClick={() => setWordFilter("new")}
              >
                미암기(
                {words.filter((item) => item.status === "new").length})
              </button>

              <button
                className={wordFilter === "learning" ? "active" : ""}
                onClick={() => setWordFilter("learning")}
              >
                외우는 중({learningCount})
              </button>

              <button
                className={wordFilter === "memorized" ? "active" : ""}
                onClick={() => setWordFilter("memorized")}
              >
                암기 완료({memorizedCount})
              </button>
            </div>
          </div>

          <div className="word-list">
            {filteredWords.map((item) => (
              <div className="word-item" key={item.id}>
                <div>
                  <div className="word-title">
                    <strong>{item.word}</strong>
                    <span>{item.topic}</span>
                  </div>

                  <p className="meaning">{item.meaning}</p>

                  {item.example && <p className="example">"{item.example}"</p>}

                  <p className="meta">
                    상태: {item.status} / 오답 {item.wrongCount}회
                  </p>
                </div>

                <div className="actions">
                  <button onClick={() => updateStatus(item.id, "learning")}>
                    외우는 중
                  </button>
                  <button onClick={() => updateStatus(item.id, "memorized")}>
                    암기 완료
                  </button>
                  <button onClick={() => updateStatus(item.id, "new")}>
                    다시 보기
                  </button>
                  <button onClick={() => deleteWord(item.id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
