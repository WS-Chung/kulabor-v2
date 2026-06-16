"use client";

import { useEffect, useMemo, useState } from "react";
import { Markdown } from "./Markdown";
import { clsx } from "clsx";
import type { QuizItem } from "@/lib/types";
import { playCorrectSound, playWrongSound, primeAudio } from "@/lib/audio";

const NUM_QUESTIONS = 10;
const ROMAN = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"];
const MUTE_KEY = "quiz_muted_v1";

interface RoundResult {
  qid: number;
  chosen: number;
  correct: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizView({ pool }: { pool: QuizItem[] }) {
  // 진행 상태
  const [active, setActive] = useState(false);
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [finished, setFinished] = useState(false);

  // 오디오 음소거 토글 (localStorage 동기화)
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMuted(window.localStorage.getItem(MUTE_KEY) === "1");
  }, []);
  const toggleMute = () => {
    setMuted((v) => {
      const nv = !v;
      try {
        window.localStorage.setItem(MUTE_KEY, nv ? "1" : "0");
      } catch {}
      return nv;
    });
  };

  const startNew = () => {
    primeAudio();
    const picked = shuffle(pool).slice(0, Math.min(NUM_QUESTIONS, pool.length));
    setQuestions(picked);
    setIdx(0);
    setChosen(null);
    setResults([]);
    setFinished(false);
    setActive(true);
  };

  const reset = () => {
    setActive(false);
    setQuestions([]);
    setIdx(0);
    setChosen(null);
    setResults([]);
    setFinished(false);
  };

  const current = questions[idx];

  const onChoose = (choiceIdx: number) => {
    if (chosen !== null || !current) return; // 잠금
    primeAudio();
    const isCorrect = choiceIdx === current.correct;
    if (!muted) {
      try {
        if (isCorrect) playCorrectSound();
        else playWrongSound();
      } catch {}
    }
    setChosen(choiceIdx);
    setResults((prev) => [
      ...prev,
      { qid: current.id, chosen: choiceIdx, correct: isCorrect },
    ]);
  };

  const onNext = () => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIdx(idx + 1);
    setChosen(null);
  };

  const correctCount = results.filter((r) => r.correct).length;

  // ───── 렌더 ─────

  if (!active) {
    return (
      <div className="space-y-6">
        <Header muted={muted} onToggleMute={toggleMute} />
        <div className="paper-card p-8 md:p-10 text-center space-y-5">
          <div className="text-5xl">🎲</div>
          <h2 className="text-xl font-bold">새 테스트 시작</h2>
          <p className="text-ink-soft text-sm leading-relaxed">
            전체 <strong>{pool.length}문제</strong> 풀에서 <strong>{NUM_QUESTIONS}문제</strong>가 랜덤으로 출제됩니다.<br />
            보기를 클릭하면 즉시 정답 여부와 풀이 해설이 보여집니다.
          </p>
          <div>
            <button onClick={startNew} className="btn-primary text-base">
              🎲 새 테스트 시작
            </button>
          </div>
          <div className="text-xs text-ink-faint">
            🔊 정답·오답에 짧은 효과음이 재생됩니다. 우측 상단 토글로 끌 수 있어요.
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="space-y-6">
        <Header muted={muted} onToggleMute={toggleMute} />
        <ResultSummary
          total={questions.length}
          correct={correctCount}
          results={results}
          questions={questions}
          onRestart={() => {
            reset();
            setTimeout(startNew, 0);
          }}
          onClose={reset}
        />
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-6">
      <Header muted={muted} onToggleMute={toggleMute} />

      <ProgressBar idx={idx} total={questions.length} score={correctCount} />

      <QuizCard
        index={idx}
        q={current}
        chosen={chosen}
        onChoose={onChoose}
      />

      {chosen !== null && (
        <div className="flex justify-end">
          <button onClick={onNext} className="btn-primary text-base quiz-fade-up">
            {idx + 1 < questions.length ? "다음 문제 →" : "결과 보기 →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── 보조 컴포넌트 ───────────────────────── */

function Header({ muted, onToggleMute }: { muted: boolean; onToggleMute: () => void }) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <p className="text-xs tracking-[0.25em] uppercase text-ink-muted">Self Check</p>
        <h1 className="text-2xl md:text-3xl font-bold">📝 자가진단 테스트</h1>
        <p className="text-ink-soft text-sm">
          한 문제씩 풀고, 보기를 누르면 즉시 채점·해설을 보여드립니다.
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "효과음 켜기" : "효과음 끄기"}
        className="btn-ghost text-sm shrink-0"
        title={muted ? "효과음 켜기" : "효과음 끄기"}
      >
        {muted ? "🔇 음소거 ON" : "🔊 효과음 ON"}
      </button>
    </header>
  );
}

function ProgressBar({ idx, total, score }: { idx: number; total: number; score: number }) {
  const pct = ((idx) / total) * 100;
  return (
    <div className="paper-card p-4 md:p-5">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-ink-soft">
          진행 <strong className="text-ink">{idx + 1}</strong> / {total}
        </span>
        <span className="text-ink-soft">
          정답 <strong className="text-amber-warm">{score}</strong> / {idx} 문제
        </span>
      </div>
      <div className="h-2 rounded-full bg-paper-200 overflow-hidden">
        <div
          className="h-full bg-amber-warm transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuizCard({
  index,
  q,
  chosen,
  onChoose,
}: {
  index: number;
  q: QuizItem;
  chosen: number | null;
  onChoose: (i: number) => void;
}) {
  const submitted = chosen !== null;
  const isCorrect = submitted && chosen === q.correct;

  const cardClass = clsx(
    "paper-card p-6 md:p-8 space-y-4",
    submitted && (isCorrect ? "quiz-pop" : "quiz-shake"),
  );

  return (
    <article className={cardClass} key={q.id}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="chip">Q{index + 1}</span>
        <span className="chip">{q.topic}</span>
      </div>
      <div className="text-[15.5px] md:text-base leading-relaxed">
        <Markdown proseSize="base">{q.question}</Markdown>
      </div>

      <ul className="space-y-2.5">
        {q.choices.map((choice, i) => {
          const isAnswer = i === q.correct;
          const isChosen = chosen === i;

          let stateClass: string;
          let suffix: React.ReactNode = null;

          if (!submitted) {
            stateClass =
              "bg-paper-100 ring-sepia-100 hover:bg-paper-200 hover:ring-sepia-300 cursor-pointer";
          } else if (isAnswer) {
            stateClass = "bg-success-paper ring-success-line ring-2";
            suffix = <span className="text-success-ink font-bold ml-2">✓ 정답</span>;
          } else if (isChosen && !isAnswer) {
            stateClass = "bg-error-paper ring-error-line ring-2";
            suffix = <span className="text-error-ink font-bold ml-2">✗ 선택</span>;
          } else {
            stateClass = "bg-paper-100 ring-sepia-100 opacity-70";
          }

          return (
            <li key={i}>
              <button
                type="button"
                disabled={submitted}
                onClick={() => onChoose(i)}
                className={clsx(
                  "w-full text-left flex items-start gap-3 rounded-lg ring-1 px-3.5 py-3 transition-all",
                  stateClass,
                  submitted ? "cursor-default" : "active:scale-[0.99]",
                )}
              >
                <span
                  className={clsx(
                    "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors",
                    !submitted && "bg-paper-200 text-ink-muted",
                    submitted && isAnswer && "bg-success-line text-white",
                    submitted && isChosen && !isAnswer && "bg-error-line text-white",
                    submitted && !isAnswer && !isChosen && "bg-paper-200 text-ink-faint",
                  )}
                >
                  {ROMAN[i]}
                </span>
                <span className="flex-1 leading-relaxed">
                  <Markdown proseSize="sm">{choice}</Markdown>
                </span>
                {suffix}
              </button>
            </li>
          );
        })}
      </ul>

      {submitted && (
        <div className="quiz-fade-up space-y-3">
          <div
            className={clsx(
              "rounded-lg px-4 py-3 text-sm flex items-center gap-2 ring-1",
              isCorrect
                ? "bg-success-paper text-success-ink ring-success-line"
                : "bg-error-paper text-error-ink ring-error-line",
            )}
          >
            <span className="text-lg">{isCorrect ? "🎉" : "🙅"}</span>
            <span>
              {isCorrect
                ? "정답입니다!"
                : `오답입니다. 정답은 ${ROMAN[q.correct]}.`}
            </span>
          </div>
          <div className="rounded-lg bg-paper-200 px-4 py-3 ring-1 ring-sepia-100">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1">
              📘 해설
            </div>
            <Markdown proseSize="sm">{q.explanation}</Markdown>
          </div>
        </div>
      )}
    </article>
  );
}

function ResultSummary({
  total,
  correct,
  results,
  questions,
  onRestart,
  onClose,
}: {
  total: number;
  correct: number;
  results: RoundResult[];
  questions: QuizItem[];
  onRestart: () => void;
  onClose: () => void;
}) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

  const grade =
    pct >= 90 ? { label: "Excellent", emoji: "🏆", tone: "text-success-ink", glow: "quiz-flash-ok" } :
    pct >= 70 ? { label: "Great", emoji: "🌟", tone: "text-amber-warm", glow: "quiz-flash-ok" } :
    pct >= 50 ? { label: "Good", emoji: "👍", tone: "text-ink", glow: "" } :
                { label: "Try Again", emoji: "📚", tone: "text-error-ink", glow: "quiz-flash-bad" };

  // 오답 항목 — 복습용
  const wrongs = useMemo(
    () =>
      results
        .map((r, i) => ({ r, q: questions[i] }))
        .filter(({ r }) => !r.correct),
    [results, questions],
  );

  return (
    <div className="space-y-6">
      <div className={clsx("paper-card p-8 md:p-10 text-center space-y-4", grade.glow)}>
        <div className="text-6xl">{grade.emoji}</div>
        <div className="text-xs tracking-[0.25em] uppercase text-ink-muted">{grade.label}</div>
        <div className={clsx("text-5xl md:text-6xl font-bold tracking-tight", grade.tone)}>
          {correct} / {total}
        </div>
        <div className="text-ink-soft">
          정답률 <strong>{pct}%</strong>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button onClick={onRestart} className="btn-primary">
            🔄 다시 풀기
          </button>
          <button onClick={onClose} className="btn-ghost">
            ⏹ 종료
          </button>
        </div>
      </div>

      {wrongs.length > 0 && (
        <div className="paper-card p-6 md:p-8 space-y-4">
          <h2 className="text-lg md:text-xl font-bold">📚 오답 복습</h2>
          <p className="text-sm text-ink-muted">
            틀린 {wrongs.length}문제를 다시 한 번 살펴보세요.
          </p>
          <div className="deco-rule" />
          <ul className="space-y-4">
            {wrongs.map(({ r, q }) => (
              <li key={r.qid} className="paper-card-soft px-5 py-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="chip">{q.topic}</span>
                  <span className="chip bg-error-paper text-error-ink">
                    선택 {ROMAN[r.chosen]} → 정답 {ROMAN[q.correct]}
                  </span>
                </div>
                <Markdown proseSize="sm">{q.question}</Markdown>
                <div className="rounded-lg bg-paper-200 px-3 py-2 ring-1 ring-sepia-100">
                  <Markdown proseSize="sm">{q.explanation}</Markdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
