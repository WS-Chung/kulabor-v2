"use client";

import { useEffect, useMemo, useState } from "react";
import { Markdown } from "./Markdown";
import { clsx } from "clsx";
import type { QuizItem } from "@/lib/types";
import { playCorrectSound, playWrongSound, primeAudio } from "@/lib/audio";

const NUM_QUESTIONS = 20;
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
  const [active, setActive] = useState(false);
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [finished, setFinished] = useState(false);

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
    if (chosen !== null || !current) return;
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

  if (!active) {
    return (
      <div className="space-y-7">
        <Header muted={muted} onToggleMute={toggleMute} />
        <div className="surface-card p-9 md:p-12 text-center space-y-5">
          <div className="text-[44px] leading-none">🎲</div>
          <h2 className="text-[21px] font-semibold tracking-[-0.012em]">새 테스트 시작</h2>
          <p className="text-ink-soft text-[14.5px] tracking-[-0.011em] leading-[1.55]">
            전체 <strong className="text-ink">{pool.length}문제</strong> 풀에서 <strong className="text-ink">{NUM_QUESTIONS}문제</strong>가 랜덤으로 출제됩니다.<br />
            보기를 클릭하면 즉시 정답 여부와 풀이 해설이 보여집니다.
          </p>
          <div>
            <button onClick={startNew} className="btn-primary">
              🎲 새 테스트 시작
            </button>
          </div>
          <div className="text-[12px] text-ink-faint tracking-[-0.011em]">
            🔊 정답·오답에 짧은 효과음이 재생됩니다. 우측 상단 토글로 끌 수 있어요.
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="space-y-7">
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
    <div className="space-y-7">
      <Header muted={muted} onToggleMute={toggleMute} />

      <ProgressBar idx={idx} total={questions.length} score={correctCount} />

      <QuizCard index={idx} q={current} chosen={chosen} onChoose={onChoose} />

      {chosen !== null && (
        <div className="flex justify-end">
          <button onClick={onNext} className="btn-primary quiz-fade-up">
            {idx + 1 < questions.length ? "다음 문제 →" : "결과 보기 →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────── 보조 컴포넌트 ───────── */

function Header({ muted, onToggleMute }: { muted: boolean; onToggleMute: () => void }) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <p className="text-[11px] tracking-[0.25em] uppercase text-ink-muted font-medium">
          Self Check
        </p>
        <h1 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.018em] leading-[1.15]">
          자가진단 테스트
        </h1>
        <p className="text-ink-soft text-[15.5px] tracking-[-0.011em]">
          한 문제씩 풀고, 보기를 누르면 즉시 채점·해설이 보여집니다.
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "효과음 켜기" : "효과음 끄기"}
        className="btn-ghost shrink-0"
        title={muted ? "효과음 켜기" : "효과음 끄기"}
      >
        {muted ? "🔇 음소거" : "🔊 효과음"}
      </button>
    </header>
  );
}

function ProgressBar({ idx, total, score }: { idx: number; total: number; score: number }) {
  const pct = (idx / total) * 100;
  return (
    <div className="surface-card p-4 md:p-5">
      <div className="flex items-center justify-between text-[13px] mb-2 tracking-[-0.011em]">
        <span className="text-ink-soft">
          진행 <strong className="text-ink">{idx + 1}</strong> / {total}
        </span>
        <span className="text-ink-soft">
          정답 <strong className="text-action">{score}</strong> / {idx} 문제
        </span>
      </div>
      <div className="h-1.5 rounded-pill bg-divider-soft overflow-hidden">
        <div
          className="h-full bg-action transition-all duration-500"
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
    "surface-card p-6 md:p-8 space-y-5",
    submitted && (isCorrect ? "quiz-pop" : "quiz-shake"),
  );

  return (
    <article className={cardClass} key={q.id}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="chip">Q{index + 1}</span>
        <span className="chip">{q.topic}</span>
      </div>
      <div className="text-[16px] md:text-[17px] leading-[1.5] tracking-[-0.011em]">
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
              "bg-canvas ring-divider-soft hover:bg-parchment hover:ring-hairline cursor-pointer";
          } else if (isAnswer) {
            stateClass = "bg-ok-bg ring-ok-line ring-2";
            suffix = <span className="text-ok-fg font-semibold ml-2 text-[12.5px] tracking-[-0.011em] shrink-0">✓ 정답</span>;
          } else if (isChosen && !isAnswer) {
            stateClass = "bg-err-bg ring-err-line ring-2";
            suffix = <span className="text-err-fg font-semibold ml-2 text-[12.5px] tracking-[-0.011em] shrink-0">✗ 선택</span>;
          } else {
            stateClass = "bg-canvas ring-divider-soft opacity-70";
          }

          return (
            <li key={i}>
              <button
                type="button"
                disabled={submitted}
                onClick={() => onChoose(i)}
                className={clsx(
                  "w-full text-left flex items-start gap-3 rounded-lg ring-1 px-4 py-3 transition-all",
                  stateClass,
                  submitted ? "cursor-default" : "active:scale-[0.99]",
                )}
              >
                <span
                  className={clsx(
                    "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-pill text-[11.5px] font-semibold shrink-0 transition-colors tracking-[-0.011em]",
                    !submitted && "bg-parchment text-ink-muted",
                    submitted && isAnswer && "bg-ok-line text-canvas",
                    submitted && isChosen && !isAnswer && "bg-err-line text-canvas",
                    submitted && !isAnswer && !isChosen && "bg-parchment text-ink-faint",
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
              "rounded-lg px-4 py-3 text-[14.5px] flex items-center gap-2 ring-1 tracking-[-0.011em]",
              isCorrect
                ? "bg-ok-bg text-ok-fg ring-ok-line"
                : "bg-err-bg text-err-fg ring-err-line",
            )}
          >
            <span className="text-[18px]">{isCorrect ? "🎉" : "🙅"}</span>
            <span>
              {isCorrect
                ? "정답입니다!"
                : `오답입니다. 정답은 ${ROMAN[q.correct]}.`}
            </span>
          </div>
          <div className="rounded-lg bg-parchment px-4 py-3 ring-1 ring-divider-soft">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-1">
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
    pct >= 90 ? { label: "Excellent", emoji: "🏆", tone: "text-ok-fg", glow: "quiz-flash-ok" } :
    pct >= 70 ? { label: "Great", emoji: "🌟", tone: "text-action", glow: "quiz-flash-ok" } :
    pct >= 50 ? { label: "Good", emoji: "👍", tone: "text-ink", glow: "" } :
                { label: "Try Again", emoji: "📚", tone: "text-err-fg", glow: "quiz-flash-bad" };

  const wrongs = useMemo(
    () =>
      results
        .map((r, i) => ({ r, q: questions[i] }))
        .filter(({ r }) => !r.correct),
    [results, questions],
  );

  return (
    <div className="space-y-7">
      <div className={clsx("surface-card p-9 md:p-12 text-center space-y-3", grade.glow)}>
        <div className="text-[56px] leading-none">{grade.emoji}</div>
        <div className="text-[11px] tracking-[0.25em] uppercase text-ink-muted font-medium">
          {grade.label}
        </div>
        <div className={clsx("text-[44px] md:text-[56px] font-semibold tracking-[-0.018em] leading-none", grade.tone)}>
          {correct} / {total}
        </div>
        <div className="text-ink-soft tracking-[-0.011em]">
          정답률 <strong className="text-ink">{pct}%</strong>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          <button onClick={onRestart} className="btn-primary">
            🔄 다시 풀기
          </button>
          <button onClick={onClose} className="btn-ghost">
            ⏹ 종료
          </button>
        </div>
      </div>

      {wrongs.length > 0 && (
        <div className="surface-card p-6 md:p-9 space-y-4">
          <h2 className="text-[19px] md:text-[21px] font-semibold tracking-[-0.012em]">📚 오답 복습</h2>
          <p className="text-[13.5px] text-ink-muted tracking-[-0.011em]">
            틀린 {wrongs.length}문제를 다시 한 번 살펴보세요.
          </p>
          <div className="h-px bg-divider-soft" />
          <ul className="space-y-3">
            {wrongs.map(({ r, q }) => (
              <li key={r.qid} className="rounded-lg bg-parchment ring-1 ring-divider-soft px-5 py-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="chip">{q.topic}</span>
                  <span className="chip bg-err-bg text-err-fg ring-err-line">
                    선택 {ROMAN[r.chosen]} → 정답 {ROMAN[q.correct]}
                  </span>
                </div>
                <Markdown proseSize="sm">{q.question}</Markdown>
                <div className="rounded-md bg-canvas px-3 py-2 ring-1 ring-divider-soft">
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
