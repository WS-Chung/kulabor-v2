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

  function switchSemester(key: string) {
    setSemester(key);
    setTab(0);
  }

  if (!exam) return <div>학기 데이터를 찾을 수 없습니다.</div>;

  const q = exam.questions[tab];

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <p className="text-[11px] tracking-[0.25em] uppercase text-ink-muted font-medium">
          Past Exams
        </p>
        <h1 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.018em] leading-[1.15]">
          기출문제 풀이
        </h1>
        <p className="text-ink-soft text-[15.5px] tracking-[-0.011em]">
          학기를 선택하고, 문항별 ‘직관 → 단계별 풀이 → 요약 답’ 순서로 학습하세요.
        </p>
      </header>

      {/* 학기 셀렉터 */}
      <div className="surface-card p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
          <label className="text-[13px] text-ink-muted tracking-[-0.011em]">학기 선택</label>
          <select
            value={semester}
            onChange={(e) => switchSemester(e.target.value)}
            className="bg-canvas ring-1 ring-hairline rounded-md px-3 py-2 text-[14px] tracking-[-0.011em] focus:outline-none focus:ring-2 focus:ring-action-focus"
          >
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="text-[12px] text-ink-faint md:ml-auto tracking-[-0.011em]">
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
              "rounded-pill px-4 py-1.5 text-[13.5px] tracking-[-0.011em] transition-all",
              i === tab
                ? "bg-action text-canvas ring-1 ring-action"
                : "bg-canvas text-ink-soft ring-1 ring-hairline hover:bg-parchment",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 본문 — 요약 타이틀 제거. 제시문이 주(主). */}
      <article className="surface-card p-6 md:p-9 space-y-6">
        {/* 학기 안내(있을 때만) */}
        {exam.summary && tab === 0 && (
          <div className="rounded-md bg-parchment ring-1 ring-divider-soft px-4 py-3 text-[13.5px] text-ink-soft tracking-[-0.011em]">
            {exam.summary}
          </div>
        )}

        {/* 제시문 — 시각적 주역. 본문보다 또렷하게. */}
        {q.background && (
          <section className="rounded-lg bg-parchment ring-1 ring-hairline pl-6 pr-5 py-5 md:pl-8 md:pr-7 md:py-6 border-l-[3px] border-action">
            <div className="text-[11px] uppercase tracking-[0.22em] text-action font-semibold mb-3">
              제시문 / Question
            </div>
            <div className="text-[17px] md:text-[18px] leading-[1.55] tracking-[-0.011em] text-ink">
              <Markdown proseSize="lg">{q.background}</Markdown>
            </div>
          </section>
        )}

        {/* 하위 문제(가/나/다) — 제시문보다 시각적 비중을 줄임 */}
        {q.subparts.length > 0 && (
          <div className="space-y-2.5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted font-semibold">
              풀이 / Solution
            </div>
            {q.subparts.map((sp, i) => (
              <SubPartCard key={i} sub={sp} defaultOpen={q.subparts.length === 1} />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

function SubPartCard({ sub, defaultOpen = false }: { sub: SubPart; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  const rawLabel = (sub.label || "").trim();
  const isSingleton = rawLabel === "" || rawLabel === "단일" || rawLabel === "풀이";
  const badge = isSingleton ? "풀이" : rawLabel.replace(/[()]/g, "").slice(0, 2);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-lg bg-canvas ring-1 ring-divider-soft px-4 md:px-5 py-3 md:py-4 hover:ring-hairline transition-colors"
    >
      <summary className="cursor-pointer list-none flex items-start gap-3">
        <span
          className={clsx(
            "mt-[3px] inline-flex h-6 items-center justify-center rounded-pill bg-parchment text-ink text-[11.5px] font-semibold shrink-0 ring-1 ring-divider-soft tracking-[-0.011em]",
            isSingleton ? "px-3" : "w-6",
          )}
        >
          {badge}
        </span>
        <span className="flex-1">
          <span className="text-[14.5px] md:text-[15px] text-ink-soft tracking-[-0.011em] leading-[1.5]">
            {sub.question}
          </span>
        </span>
        <span className="text-ink-faint text-[11.5px] mt-[5px] select-none tracking-[-0.011em]">
          {open ? "접기 ▲" : "펼치기 ▼"}
        </span>
      </summary>

      <div className="mt-4 space-y-3">
        {sub.intuition && (
          <div className="intuition-block">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] opacity-80 mb-1">
              🪄 직관(쉬운 비유)
            </div>
            <Markdown proseSize="sm">{sub.intuition}</Markdown>
          </div>
        )}

        {sub.steps && sub.steps.length > 0 && (
          <div>
            <div className="text-[12.5px] font-semibold mb-2 tracking-[-0.011em]">📐 단계별 풀이</div>
            <ol className="space-y-3">
              {sub.steps.map((step, i) => (
                <li key={i} className="step-block">
                  <div className="text-[13px] font-semibold mb-1 tracking-[-0.011em]">{step.heading}</div>
                  <Markdown proseSize="sm">{step.body}</Markdown>
                  {step.math && <MathBlock tex={step.math} />}
                </li>
              ))}
            </ol>
          </div>
        )}

        {sub.answer && (
          <div className="answer-block">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] opacity-80 mb-1">
              ✅ 요약 답
            </div>
            <Markdown proseSize="sm">{sub.answer}</Markdown>
          </div>
        )}
      </div>
    </details>
  );
}
