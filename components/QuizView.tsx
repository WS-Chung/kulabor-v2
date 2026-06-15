"use client";

import { useMemo, useState } from "react";
import { Markdown } from "./Markdown";
import { clsx } from "clsx";
import type { QuizItem } from "@/lib/types";

const NUM_QUESTIONS = 10;
const ROMAN = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"];

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
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  const startNew = () => {
    const picked = shuffle(pool).slice(0, Math.min(NUM_QUESTIONS, pool.length));
    setQuestions(picked);
    setAnswers({});
    setSubmitted({});
    setActive(true);
  };

  const reset = () => {
    setActive(false);
    setQuestions([]);
    setAnswers({});
    setSubmitted({});
  };

  const stats = useMemo(() => {
    const total = questions.length;
    const answered = questions.filter((q) => submitted[q.id]).length;
    const correct = questions.filter(
      (q) => submitted[q.id] && answers[q.id] === q.correct,
    ).length;
    return { total, answered, correct };
  }, [questions, submitted, answers]);

  const allDone = active && questions.length > 0 && stats.answered === questions.length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.25em] uppercase text-ink-muted">Self Check</p>
        <h1 className="text-2xl md:text-3xl font-bold">📝 자가진단 테스트</h1>
        <p className="text-ink-soft">
          전체 <strong>{pool.length}문제 풀</strong>에서 <strong>무작위 {NUM_QUESTIONS}문제</strong>가 출제됩니다.
          답을 제출하면 즉시 정답 여부와 풀이 해설이 보여집니다.
        </p>
      </header>

      {!active ? (
        <div className="paper-card p-8 text-center space-y-4">
          <div className="text-5xl">🎲</div>
          <h2 className="text-xl font-bold">새 테스트 시작</h2>
          <p className="text-ink-soft text-sm">
            ‘새 테스트 시작’을 누르면 {NUM_QUESTIONS}문제가 랜덤으로 추출됩니다.
          </p>
          <div>
            <button onClick={startNew} className="btn-primary">
              🎲 새 테스트 시작
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="paper-card p-5 grid grid-cols-3 gap-4 text-center">
            <Stat label="출제" value={`${stats.total} 문제`} />
            <Stat label="응답 완료" value={`${stats.answered} / ${stats.total}`} />
            <Stat
              label="정답"
              value={`${stats.correct} / ${stats.answered || "-"}`}
              accent
            />
          </div>

          <div className="space-y-5">
            {questions.map((q, i) => (
              <QuizCard
                key={q.id}
                index={i}
                q={q}
                chosen={answers[q.id] ?? null}
                onChoose={(idx) =>
                  setAnswers((a) => ({ ...a, [q.id]: idx }))
                }
                submitted={!!submitted[q.id]}
                onSubmit={() => {
                  if (answers[q.id] == null) return;
                  setSubmitted((s) => ({ ...s, [q.id]: true }));
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {allDone ? (
              <button onClick={() => { reset(); startNew(); }} className="btn-primary">
                🔄 새 테스트 다시 시작
              </button>
            ) : (
              <button onClick={reset} className="btn-ghost">
                ⏹ 이 테스트 종료
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className={clsx("mt-1 text-2xl font-bold", accent && "text-amber-warm")}>
        {value}
      </div>
    </div>
  );
}

function QuizCard({
  index,
  q,
  chosen,
  onChoose,
  submitted,
  onSubmit,
}: {
  index: number;
  q: QuizItem;
  chosen: number | null;
  onChoose: (i: number) => void;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const isCorrect = submitted && chosen === q.correct;
  return (
    <article className="paper-card p-6 space-y-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="chip">Q{index + 1}</span>
        <span className="chip">{q.topic}</span>
      </div>
      <div className="text-[15.5px] md:text-base leading-relaxed">
        <Markdown proseSize="base">{q.question}</Markdown>
      </div>

      <ul className="space-y-2">
        {q.choices.map((choice, i) => {
          const checked = chosen === i;
          const isAnswer = i === q.correct;
          let stateClass =
            "bg-paper-100 ring-sepia-100 hover:bg-paper-200 cursor-pointer";
          if (submitted) {
            if (isAnswer) {
              stateClass = "bg-success-paper ring-success-line";
            } else if (checked && !isAnswer) {
              stateClass = "bg-error-paper ring-error-line";
            } else {
              stateClass = "bg-paper-100 ring-sepia-100 opacity-80";
            }
          } else if (checked) {
            stateClass = "bg-paper-200 ring-amber-warm";
          }

          return (
            <li key={i}>
              <label
                className={clsx(
                  "flex items-start gap-3 rounded-lg ring-1 px-3.5 py-3 transition-colors",
                  stateClass,
                  submitted ? "cursor-default" : "cursor-pointer",
                )}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  className="mt-1 accent-amber-warm"
                  checked={checked}
                  disabled={submitted}
                  onChange={() => onChoose(i)}
                />
                <span className="flex items-baseline gap-2 flex-1">
                  <span className="text-ink-muted text-sm font-medium shrink-0">
                    {ROMAN[i]}.
                  </span>
                  <span className="leading-relaxed">
                    <Markdown proseSize="sm">{choice}</Markdown>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {!submitted ? (
        <div className="flex items-center gap-3">
          <button
            onClick={onSubmit}
            disabled={chosen == null}
            className="btn-primary"
          >
            제출
          </button>
          {chosen == null && (
            <span className="text-xs text-ink-faint">보기를 하나 선택해 주세요</span>
          )}
        </div>
      ) : (
        <div
          className={clsx(
            "rounded-lg px-4 py-3 text-sm",
            isCorrect ? "bg-success-paper text-success-ink ring-1 ring-success-line"
                      : "bg-error-paper text-error-ink ring-1 ring-error-line",
          )}
        >
          {isCorrect
            ? `✅ 정답입니다! (${ROMAN[q.correct]}. ${q.choices[q.correct]})`
            : `❌ 오답입니다. 정답: ${ROMAN[q.correct]}. ${q.choices[q.correct]}`}
        </div>
      )}

      {submitted && (
        <div className="rounded-lg bg-paper-200 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1">
            📘 해설
          </div>
          <Markdown proseSize="sm">{q.explanation}</Markdown>
        </div>
      )}
    </article>
  );
}
