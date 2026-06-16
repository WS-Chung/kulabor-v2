"use client";

import { useMemo, useState } from "react";
import { Markdown } from "./Markdown";
import { MathBlock } from "./MathBlock";
import { clsx } from "clsx";
import type { ExamSet, SubPart } from "@/lib/types";

interface Props {
  semesters: string[];
  exams: Record<string, ExamSet>;
  initialKey?: string;
}

export function ExamView({ semesters, exams, initialKey }: Props) {
  const [semester, setSemester] = useState<string>(initialKey ?? semesters[0]);
  const exam = exams[semester];
  const [tab, setTab] = useState(0);

  const tabLabels = useMemo(
    () =>
      exam?.questions.map((q) => {
        // "문항 1. ..." → "문항 1"만 라벨로
        const head = q.title.split(".")[0]?.trim() ?? q.title;
        return head;
      }) ?? [],
    [exam],
  );

  // 학기 바뀔 때 첫 탭으로
  function switchSemester(key: string) {
    setSemester(key);
    setTab(0);
  }

  if (!exam) return <div>학기 데이터를 찾을 수 없습니다.</div>;

  const q = exam.questions[tab];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.25em] uppercase text-ink-muted">Past Exams</p>
        <h1 className="text-2xl md:text-3xl font-bold">📚 기출문제 풀이</h1>
        <p className="text-ink-soft">
          학기를 선택하고, 문항별 ‘직관 → 단계별 풀이 → 요약 답’ 순서로 학습하세요.
        </p>
      </header>

      {/* 학기 셀렉터 */}
      <div className="paper-card p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
          <label className="text-sm text-ink-muted">학기 선택</label>
          <select
            value={semester}
            onChange={(e) => switchSemester(e.target.value)}
            className="bg-paper-100 ring-1 ring-sepia-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-amber-warm"
          >
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="text-xs text-ink-faint md:ml-auto">
            전체 {semesters.length}개 학기 (2011~2025)
          </span>
        </div>
      </div>

      {/* 문항 탭 */}
      <div className="flex flex-wrap gap-2">
        {tabLabels.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setTab(i)}
            className={clsx(
              "rounded-lg px-3.5 py-1.5 text-sm transition-colors ring-1",
              i === tab
                ? "bg-amber-warm text-paper-50 ring-amber-warm"
                : "bg-paper-100 text-ink-soft ring-sepia-100 hover:bg-paper-200",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 본문 */}
      <article className="paper-card p-6 md:p-8 space-y-5">
        <h2 className="text-xl font-bold">{q.title}</h2>

        {exam.summary && tab === 0 && (
          <div className="rounded-lg bg-paper-200 px-4 py-3 text-sm text-ink-soft">
            {exam.summary}
          </div>
        )}

        {q.background && (
          <section className="rounded-lg bg-paper-200/60 ring-1 ring-sepia-100 px-5 py-4 space-y-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-ink-muted font-semibold">
              📜 제시문
            </div>
            <Markdown proseSize="base">{q.background}</Markdown>
          </section>
        )}

        <div className="deco-rule" />

        <div className="space-y-3">
          {q.subparts.map((sp, i) => (
            <SubPartCard
              key={i}
              sub={sp}
              defaultOpen={q.subparts.length === 1}
            />
          ))}
        </div>
      </article>
    </div>
  );
}

function SubPartCard({ sub, defaultOpen = false }: { sub: SubPart; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  // 라벨 표기 — "단일"이나 빈 라벨인 경우 부드러운 대체 텍스트 사용
  const rawLabel = (sub.label || "").trim();
  const isSingleton = rawLabel === "" || rawLabel === "단일" || rawLabel === "풀이";
  const badge = isSingleton ? "풀이" : rawLabel.replace(/[()]/g, "").slice(0, 2);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="paper-card-soft px-4 md:px-5 py-3 md:py-4 group"
    >
      <summary className="cursor-pointer list-none flex items-start gap-3">
        <span
          className={clsx(
            "mt-1 inline-flex h-6 items-center justify-center rounded-full bg-sepia-100 text-ink text-xs font-bold shrink-0",
            isSingleton ? "px-3" : "w-6",
          )}
        >
          {badge}
        </span>
        <span className="flex-1">
          <span className="text-sm md:text-[15.5px] text-ink-soft font-medium">
            {sub.question}
          </span>
        </span>
        <span className="text-ink-faint text-xs mt-1 select-none">
          {open ? "접기 ▲" : "펼치기 ▼"}
        </span>
      </summary>

      <div className="mt-4 space-y-3">
        {sub.intuition && (
          <div className="intuition-block">
            <div className="text-xs font-bold uppercase tracking-wide opacity-80 mb-1">
              🪄 직관(쉬운 비유)
            </div>
            <Markdown proseSize="sm">{sub.intuition}</Markdown>
          </div>
        )}

        {sub.steps && sub.steps.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">📐 단계별 풀이</div>
            <ol className="space-y-3">
              {sub.steps.map((step, i) => (
                <li key={i} className="step-block">
                  <div className="text-sm font-semibold mb-1">{step.heading}</div>
                  <Markdown proseSize="sm">{step.body}</Markdown>
                  {step.math && <MathBlock tex={step.math} />}
                </li>
              ))}
            </ol>
          </div>
        )}

        {sub.answer && (
          <div className="answer-block">
            <div className="text-xs font-bold uppercase tracking-wide opacity-80 mb-1">
              ✅ 요약 답
            </div>
            <Markdown proseSize="sm">{sub.answer}</Markdown>
          </div>
        )}
      </div>
    </details>
  );
}
