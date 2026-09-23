"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Markdown } from "./Markdown";
import type { QuizItem } from "@/lib/types";
import { playCorrectSound, playWrongSound, primeAudio } from "@/lib/audio";

/** 한 회차에 출제하는 문항 수. 문제은행 50개 중 무작위로 고른다. */
const NUM_QUESTIONS = 20;
const CHOICE_LABEL = ["①", "②", "③", "④", "⑤"];
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

/**
 * 자가진단 테스트.
 *
 * 문제은행에서 무작위로 20문항을 뽑아 한 문제씩 제시하고, 보기를 클릭하면 즉시 채점한다.
 * 결과 화면에서는 틀린 문항만 모아 해설과 함께 다시 보여 준다.
 */
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

  const toggleMute = () =>
    setMuted((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* 저장 실패는 무시 — 기능에는 영향 없음 */
      }
      return next;
    });

  const topics = useMemo(() => new Set(pool.map((p) => p.topic)).size, [pool]);

  const startNew = () => {
    primeAudio();
    setQuestions(shuffle(pool).slice(0, Math.min(NUM_QUESTIONS, pool.length)));
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
      } catch {
        /* 오디오 차단 환경 무시 */
      }
    }
    setChosen(choiceIdx);
    setResults((prev) => [...prev, { qid: current.id, chosen: choiceIdx, correct: isCorrect }]);
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

  return (
    <div>
      <PageHead muted={muted} onToggleMute={toggleMute} />

      <div className="mx-auto max-w-narrow space-y-6 px-6 py-8 md:px-10 md:py-10">
        {!active && (
          <StartCard pool={pool.length} topics={topics} onStart={startNew} />
        )}

        {active && finished && (
          <ResultSummary
            total={questions.length}
            correct={correctCount}
            results={results}
            questions={questions}
            onRestart={startNew}
            onClose={reset}
          />
        )}

        {active && !finished && current && (
          <>
            <ProgressBar idx={idx} total={questions.length} score={correctCount} />
            <QuizCard index={idx} q={current} chosen={chosen} onChoose={onChoose} />
            {chosen !== null && (
              <div className="flex justify-end">
                <button type="button" onClick={onNext} className="btn-primary quiz-fade-up">
                  {idx + 1 < questions.length ? "다음 문제 →" : "결과 보기 →"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ═════════ 보조 컴포넌트 ═════════ */

function PageHead({ muted, onToggleMute }: { muted: boolean; onToggleMute: () => void }) {
  return (
    <header className="page-head">
      <div className="page-head-inner">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Self Check</p>
            <h1 className="page-title mt-2">자가진단 테스트</h1>
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "효과음 켜기" : "효과음 끄기"}
            className="btn-ghost shrink-0"
          >
            {muted ? "효과음 꺼짐" : "효과음 켜짐"}
          </button>
        </div>
        <p className="page-lede max-w-2xl">
          기출 전 배경지식 점검. 보기 선택 시 즉시 채점, 종료 후 오답 복습.
        </p>
      </div>
    </header>
  );
}

function StartCard({
  pool,
  topics,
  onStart,
}: {
  pool: number;
  topics: number;
  onStart: () => void;
}) {
  return (
    <section className="surface-card overflow-hidden">
      <h2 className="border-b border-hairline bg-surface px-5 py-3 text-label text-ink md:px-7">
        새 테스트 시작
      </h2>
      <div className="space-y-6 px-5 py-7 md:px-7 md:py-9">
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-hairline bg-hairline">
          <Cell label="문제은행" value={`${pool}문제`} />
          <Cell label="출제" value={`${NUM_QUESTIONS}문제`} />
          <Cell label="분야" value={`${topics}개`} />
        </dl>

        <ul className="space-y-1.5 text-[14.5px] leading-[1.7] text-ink-soft">
          <li>· 전체 {pool}문제 중 <strong className="text-ink">{NUM_QUESTIONS}문제</strong>가 무작위로 출제됩니다.</li>
          <li>· 4개 보기 중 하나를 고르면 즉시 채점되며, 한 번 선택하면 바꿀 수 없습니다.</li>
          <li>· 각 해설에는 그 지식이 <strong className="text-ink">어느 학기 어느 문항</strong>에 쓰이는지 표시했습니다.</li>
          <li>· 정답·오답에 짧은 효과음이 재생됩니다. 우측 상단에서 끌 수 있습니다.</li>
        </ul>

        <button type="button" onClick={onStart} className="btn-primary w-full md:w-auto">
          테스트 시작
        </button>
      </div>
    </section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-canvas px-4 py-3.5 text-center">
      <dt className="text-meta uppercase text-ink-muted">{label}</dt>
      <dd className="mt-1 text-[16px] font-bold text-crimson">{value}</dd>
    </div>
  );
}

function ProgressBar({ idx, total, score }: { idx: number; total: number; score: number }) {
  const pct = ((idx + 1) / total) * 100;
  return (
    <div className="surface-card px-4 py-3.5 md:px-5">
      <div className="mb-2 flex items-center justify-between text-[13px]">
        <span className="text-ink-soft">
          진행 <strong className="tabular-nums text-ink">{idx + 1}</strong> / {total}
        </span>
        <span className="text-ink-soft">
          정답 <strong className="tabular-nums text-crimson">{score}</strong>
          {idx > 0 && <span className="text-ink-faint"> / {idx}</span>}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={idx + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        className="h-1.5 overflow-hidden rounded-sm bg-divider-soft"
      >
        <div
          className="h-full bg-crimson transition-all duration-500"
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

  return (
    <article
      key={q.id}
      className={clsx(
        "surface-card overflow-hidden",
        submitted && (isCorrect ? "quiz-pop" : "quiz-shake"),
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-surface px-5 py-2.5 md:px-7">
        <span className="chip chip-crimson">Q{index + 1}</span>
        <span className="chip">{q.topic}</span>
      </div>

      <div className="space-y-5 px-5 py-6 md:px-7">
        <div className="text-[16px] leading-[1.7] text-ink md:text-[17px]">
          <Markdown proseSize="base">{q.question}</Markdown>
        </div>

        <ul className="space-y-2">
          {q.choices.map((choice, i) => {
            const isAnswer = i === q.correct;
            const isChosen = chosen === i;

            let box = "border-hairline bg-canvas hover:border-crimson/40 hover:bg-parchment";
            let badge = "border-rule bg-canvas text-ink-muted";
            let mark: React.ReactNode = null;

            if (submitted) {
              if (isAnswer) {
                box = "border-ok-line bg-ok-bg";
                badge = "border-ok-line bg-ok-line/25 text-ok-fg";
                mark = <Mark tone="ok">정답</Mark>;
              } else if (isChosen) {
                box = "border-err-line bg-err-bg";
                badge = "border-err-line bg-err-line/25 text-err-fg";
                mark = <Mark tone="err">선택</Mark>;
              } else {
                box = "border-hairline bg-canvas opacity-60";
                badge = "border-hairline bg-surface text-ink-faint";
              }
            }

            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => onChoose(i)}
                  className={clsx(
                    "flex w-full items-start gap-3 rounded-sm border px-4 py-3 text-left transition-colors",
                    box,
                    submitted ? "cursor-default" : "cursor-pointer",
                  )}
                >
                  <span
                    className={clsx(
                      "mt-[1px] inline-flex h-6 w-6 shrink-0 items-center justify-center",
                      "rounded-sm border text-[13px] font-bold",
                      badge,
                    )}
                  >
                    {CHOICE_LABEL[i]}
                  </span>
                  {/* button 안이므로 inline 모드(블록 태그 금지) */}
                  <span className="flex-1 text-[14.5px] leading-[1.65] text-ink md:text-[15px]">
                    <Markdown inline>{choice}</Markdown>
                  </span>
                  {mark}
                </button>
              </li>
            );
          })}
        </ul>

        {submitted && (
          <div className="quiz-fade-up space-y-3">
            <p
              className={clsx(
                "rounded-sm border px-4 py-2.5 text-[14.5px] font-semibold",
                isCorrect
                  ? "border-ok-line bg-ok-bg text-ok-fg"
                  : "border-err-line bg-err-bg text-err-fg",
              )}
            >
              {isCorrect
                ? "✓ 정답입니다."
                : `✗ 오답입니다. 정답은 ${CHOICE_LABEL[q.correct]} 입니다.`}
            </p>
            <div className="rounded-sm border border-note-line bg-note-bg px-4 py-3">
              <p className="mb-1 text-eyebrow uppercase text-note-fg">해설</p>
              <Markdown proseSize="sm">{q.explanation}</Markdown>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function Mark({ tone, children }: { tone: "ok" | "err"; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "mt-[3px] shrink-0 text-meta font-bold",
        tone === "ok" ? "text-ok-fg" : "text-err-fg",
      )}
    >
      {tone === "ok" ? "✓ " : "✗ "}
      {children}
    </span>
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
    pct >= 90
      ? { label: "매우 우수", note: "기출 바로 시작 가능", glow: "quiz-flash-ok" }
      : pct >= 70
        ? { label: "양호", note: "틀린 분야만 배경지식 사전에서 보강", glow: "quiz-flash-ok" }
        : pct >= 50
          ? { label: "보통", note: "오답 분야를 배경지식 사전에서 먼저 확인", glow: "" }
          : { label: "보강 필요", note: "배경지식 사전 통독 후 재도전 권장", glow: "quiz-flash-bad" };

  // 결과 인덱스가 아니라 qid 로 문항을 찾는다. 인덱스 매칭은 순서가 어긋나면 다른 문항이 붙는다.
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const wrongs = useMemo(
    () =>
      results
        .filter((r) => !r.correct)
        .map((r) => ({ r, q: byId.get(r.qid) }))
        .filter((x): x is { r: RoundResult; q: QuizItem } => !!x.q),
    [results, byId],
  );

  // 분야별 정답률
  const byTopic = useMemo(() => {
    const m = new Map<string, { ok: number; n: number }>();
    for (const r of results) {
      const q = byId.get(r.qid);
      if (!q) continue;
      const cur = m.get(q.topic) ?? { ok: 0, n: 0 };
      cur.n += 1;
      if (r.correct) cur.ok += 1;
      m.set(q.topic, cur);
    }
    return [...m.entries()].sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
  }, [results, byId]);

  return (
    <div className="space-y-6">
      {/* 점수 */}
      <section className={clsx("surface-card overflow-hidden", grade.glow)}>
        <h2 className="border-b border-hairline bg-surface px-5 py-3 text-label text-ink md:px-7">
          결과
        </h2>
        <div className="px-5 py-8 text-center md:px-7">
          <p className="text-eyebrow uppercase text-crimson">{grade.label}</p>
          <p className="mt-3 text-[44px] font-bold leading-none tabular-nums text-crimson md:text-[52px]">
            {correct}
            <span className="text-[24px] text-ink-faint"> / {total}</span>
          </p>
          <p className="mt-3 text-[15px] text-ink-soft">
            정답률 <strong className="tabular-nums text-ink">{pct}%</strong>
          </p>
          <p className="mt-1 text-[13.5px] text-ink-muted">{grade.note}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onRestart} className="btn-primary">
              다시 풀기
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              종료
            </button>
          </div>
        </div>
      </section>

      {/* 분야별 성적 */}
      {byTopic.length > 0 && (
        <section className="surface-card overflow-hidden">
          <h2 className="border-b border-hairline bg-surface px-5 py-3 text-label text-ink md:px-7">
            분야별 성적
          </h2>
          <ul className="divide-y divide-divider-soft">
            {byTopic.map(([topic, s]) => (
              <li
                key={topic}
                className="flex items-center justify-between gap-4 px-5 py-2.5 md:px-7"
              >
                <span className="text-[14px] text-ink">{topic}</span>
                <span
                  className={clsx(
                    "shrink-0 text-[13.5px] font-semibold tabular-nums",
                    s.ok === s.n ? "text-ok-fg" : s.ok === 0 ? "text-err-fg" : "text-ink-soft",
                  )}
                >
                  {s.ok} / {s.n}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 오답 복습 */}
      {wrongs.length > 0 && (
        <section className="surface-card overflow-hidden">
          <h2 className="border-b border-hairline bg-surface px-5 py-3 text-label text-ink md:px-7">
            오답 복습 · {wrongs.length}문제
          </h2>
          <ul className="divide-y divide-hairline">
            {wrongs.map(({ r, q }) => (
              <li key={r.qid} className="space-y-3 px-5 py-5 md:px-7">
                <div className="flex flex-wrap gap-2">
                  <span className="chip">{q.topic}</span>
                  <span className="chip border-err-line bg-err-bg text-err-fg">
                    선택 {CHOICE_LABEL[r.chosen]} → 정답 {CHOICE_LABEL[q.correct]}
                  </span>
                </div>
                <div className="text-[15px] leading-[1.7] text-ink">
                  <Markdown proseSize="sm">{q.question}</Markdown>
                </div>
                <div className="rounded-sm border border-ok-line bg-ok-bg px-4 py-2.5">
                  <p className="mb-1 text-eyebrow uppercase text-ok-fg">정답</p>
                  <div className="text-[14px] text-ink">
                    <Markdown proseSize="sm">{q.choices[q.correct]}</Markdown>
                  </div>
                </div>
                <div className="rounded-sm border border-note-line bg-note-bg px-4 py-3">
                  <p className="mb-1 text-eyebrow uppercase text-note-fg">해설</p>
                  <Markdown proseSize="sm">{q.explanation}</Markdown>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
