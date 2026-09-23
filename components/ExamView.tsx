"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Markdown } from "./Markdown";
import { MathBlock } from "./MathBlock";
import { groupByYear, parseSemester, yearRange } from "@/lib/data";
import type { ExamSet, SubPart } from "@/lib/types";

interface Props {
  semesters: string[];
  exams: Record<string, ExamSet>;
  initialKey?: string;
}

/**
 * 기출문제 풀이 화면.
 *
 * 설계 의도 (../../DESIGN-ku.md 참조)
 * 1. 드롭다운을 쓰지 않는다. 연도 행 → 학기 버튼 → 문항 탭의 **3단 내비게이션**으로
 *    전체 구조가 한눈에 보이게 한다.
 * 2. [문제]와 [풀이]는 서로 다른 시각 언어를 쓴다.
 *    문제 = 웜 베이지 + 좌측 크림슨 굵은 선(.exam-question)
 *    풀이 = 흰 바탕 + 회색 경계(.exam-solution)
 *    두 영역 사이에 굵은 구분선(.divider-strong)과 넉넉한 여백을 둔다.
 */
export function ExamView({ semesters, exams, initialKey }: Props) {
  const first = initialKey ?? semesters[0];
  const [semester, setSemester] = useState<string>(first);
  const [tab, setTab] = useState(0);
  /** 하위문항 아코디언의 열림 상태. 인덱스 집합. */
  const [open, setOpen] = useState<Set<number>>(new Set());

  const years = useMemo(() => groupByYear(semesters), [semesters]);
  const range = useMemo(() => yearRange(semesters), [semesters]);
  const current = parseSemester(semester);

  /** 현재 선택된 연도의 학기 목록. 연도 버튼을 누르면 이 줄만 바뀐다. */
  const termsOfYear = useMemo(
    () => years.find((g) => g.year === current?.year)?.semesters ?? [],
    [years, current?.year],
  );

  const exam = exams[semester];
  const questions = exam?.questions ?? [];
  const q = questions[tab];

  const tabLabels = useMemo(
    () =>
      questions.map((item, i) => {
        // "문항 1. 여성의 경제활동참여" → "문항 1" / "1문항. …" → "1문항"
        const head = item.title.split(".")[0]?.trim();
        return head && head.length <= 8 ? head : `문항 ${i + 1}`;
      }),
    [questions],
  );

  function switchSemester(key: string) {
    setSemester(key);
    setTab(0);
    setOpen(new Set());
  }

  /**
   * 연도 버튼. 같은 학기 번호가 그 연도에 있으면 유지하고, 없으면 첫 학기로 간다.
   * (2026학년도는 1학기만 있으므로 2학기에서 넘어올 때 1학기로 떨어진다.)
   */
  function switchYear(year: number) {
    const group = years.find((g) => g.year === year);
    if (!group || group.semesters.length === 0) return;
    const sameTerm = group.semesters.find((k) => parseSemester(k)?.term === current?.term);
    switchSemester(sameTerm ?? group.semesters[0]);
  }

  function switchTab(i: number) {
    setTab(i);
    setOpen(new Set());
  }

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const allOpen = q ? open.size === q.subparts.length && q.subparts.length > 0 : false;

  function toggleAll() {
    if (!q) return;
    setOpen(allOpen ? new Set() : new Set(q.subparts.map((_, i) => i)));
  }

  return (
    <div>
      {/* ───────── 페이지 헤더 ───────── */}
      <header className="page-head">
        <div className="page-head-inner">
          <p className="eyebrow">Past Exams</p>
          <h1 className="page-title mt-2">기출문제 풀이</h1>
          <p className="page-lede">
            연도와 학기를 고르고, 문항별로 <strong className="text-ink">문제</strong>를 먼저 읽은 뒤{" "}
            <strong className="text-ink">풀이</strong>를 펼쳐 보세요.
            {range && (
              <>
                {" "}
                전체 {semesters.length}개 학기({range.min}–{range.max}학년도)를 수록했습니다.
              </>
            )}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-6 md:px-10 py-8 md:py-10 space-y-8">
        {/* ───────── 연도 / 학기 내비게이션 ───────── */}
        <nav aria-label="학기 선택" className="surface-card overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-hairline bg-surface px-4 py-2.5 md:px-5">
            <h2 className="text-label text-ink">학기 선택</h2>
            <p className="text-meta text-ink-muted">
              {current ? `${current.year}학년도 ${current.term}학기` : semester}
            </p>
          </div>

          {/* 1단: 학년도 */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 px-4 py-3 md:px-5">
            <span className="w-11 shrink-0 text-meta uppercase text-ink-muted">학년도</span>
            <span className="flex flex-wrap gap-1.5">
              {years.map(({ year }) => {
                const active = current?.year === year;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => switchYear(year)}
                    aria-current={active ? "true" : undefined}
                    className={clsx(
                      "rounded-sm border px-2.5 py-1.5 text-[13.5px] tabular-nums transition-colors",
                      active
                        ? "border-crimson bg-crimson font-bold text-white"
                        : "border-hairline bg-surface text-ink-soft hover:bg-pearl hover:text-ink",
                    )}
                  >
                    {year}
                  </button>
                );
              })}
            </span>
          </div>

          {/* 2단: 선택 연도의 학기 */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-divider-soft bg-parchment px-4 py-3 md:px-5">
            <span className="w-11 shrink-0 text-meta uppercase text-ink-muted">학기</span>
            <span className="flex flex-wrap gap-2">
              {termsOfYear.map((key) => {
                const p = parseSemester(key);
                const active = key === semester;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchSemester(key)}
                    aria-current={active ? "true" : undefined}
                    className={clsx("tab min-w-[5.5rem]", active && "tab-active")}
                  >
                    {p ? `${p.term}학기` : key}
                  </button>
                );
              })}
              {termsOfYear.length === 1 && (
                <span className="self-center text-[12.5px] text-ink-muted">
                  이 학년도는 1학기만 수록되어 있습니다.
                </span>
              )}
            </span>
          </div>
        </nav>

        {!exam ? (
          <p className="surface-card px-5 py-6 text-ink-soft">학기 데이터를 찾을 수 없습니다.</p>
        ) : (
          <>
            {/* ───────── 시험지 제목 + 안내 ───────── */}
            <section>
              <h2 className="text-[22px] md:text-display font-bold text-ink tan-rule">
                {exam.title}
              </h2>
              {exam.summary && (
                <p className="mt-4 surface-card-soft px-4 py-3 text-[14.5px] leading-[1.7] text-note-fg">
                  {exam.summary}
                </p>
              )}
            </section>

            {/* ───────── 문항 탭 ───────── */}
            {questions.length > 1 && (
              <div
                role="tablist"
                aria-label="문항 선택"
                className="flex flex-wrap gap-2 border-b border-hairline pb-3"
              >
                {tabLabels.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === tab}
                    onClick={() => switchTab(i)}
                    className={clsx("tab", i === tab && "tab-active")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {q && (
              <article className="space-y-8">
                {/* ═══════ 문제 영역 ═══════ */}
                <section aria-label="문제">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="band band-question">문제</span>
                    <h3 className="text-[16px] md:text-title text-ink">{q.title}</h3>
                  </div>

                  <div className="exam-question">
                    {q.background ? (
                      <>
                        <p className="text-eyebrow uppercase text-crimson mb-2.5">제시문</p>
                        <div className="text-[16px] md:text-body-lg text-ink">
                          <Markdown proseSize="lg">{q.background}</Markdown>
                        </div>
                        {q.subparts.length > 0 && (
                          <>
                            <div className="my-5 h-px bg-note-line" />
                            <p className="text-eyebrow uppercase text-crimson mb-2.5">
                              문제 {q.subparts.length}개
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      q.subparts.length > 0 && (
                        <p className="text-eyebrow uppercase text-crimson mb-2.5">
                          문제 {q.subparts.length}개
                        </p>
                      )
                    )}

                    {q.subparts.length > 0 && (
                      <ol className="space-y-2.5">
                        {q.subparts.map((sp, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <SubLabel label={sp.label} />
                            <div className="flex-1 text-[15.5px] md:text-[16px] leading-[1.7] text-ink">
                              <Markdown proseSize="sm">{sp.question}</Markdown>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </section>

                {/* ═══════ 구분선 ═══════ */}
                <div className="divider-strong" role="presentation" />

                {/* ═══════ 풀이 영역 ═══════ */}
                <section aria-label="풀이">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="band band-solution">풀이</span>
                      <p className="text-[13.5px] text-ink-muted">
                        직관 → 단계별 전개 → 요약 답
                      </p>
                    </div>
                    {q.subparts.length > 1 && (
                      <button type="button" onClick={toggleAll} className="btn-ghost">
                        {allOpen ? "모두 접기" : "모두 펼치기"}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {q.subparts.map((sp, i) => (
                      <SolutionCard
                        key={i}
                        sub={sp}
                        open={open.has(i)}
                        onToggle={() => toggle(i)}
                      />
                    ))}
                  </div>
                </section>
              </article>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** 하위문항 라벨 배지. `가`·`1`·`단일` 등을 짧게 표시한다. */
function SubLabel({ label }: { label: string }) {
  const raw = (label || "").trim();
  const single = raw === "" || raw === "단일" || raw === "풀이";
  const text = single ? "풀이" : raw.replace(/[()]/g, "").slice(0, 4);
  return (
    <span
      className={clsx(
        "mt-[3px] inline-flex h-6 shrink-0 items-center justify-center rounded-sm",
        "border border-crimson/30 bg-canvas text-meta font-bold text-crimson",
        single ? "px-2" : "w-6",
      )}
    >
      {text}
    </span>
  );
}

/** 하위문항 하나의 풀이. 접힘/펼침 상태를 부모가 관리한다. */
function SolutionCard({
  sub,
  open,
  onToggle,
}: {
  sub: SubPart;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="exam-solution">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 text-left"
      >
        <SubLabel label={sub.label} />
        <span className="flex-1 text-[14.5px] md:text-[15px] leading-[1.6] text-ink-soft">
          <Markdown inline>{sub.question}</Markdown>
        </span>
        <span className="mt-[3px] shrink-0 text-meta text-crimson">
          {open ? "접기 ▲" : "풀이 보기 ▼"}
        </span>
      </button>

      {open && (
        <div className="quiz-fade-up mt-4 space-y-3 border-t border-divider-soft pt-4">
          {sub.intuition && (
            <div className="intuition-block">
              <p className="mb-1 text-eyebrow uppercase opacity-80">직관 · 쉬운 비유</p>
              <Markdown proseSize="sm">{sub.intuition}</Markdown>
            </div>
          )}

          {sub.steps && sub.steps.length > 0 && (
            <div>
              <p className="mb-2 text-label text-ink">단계별 풀이</p>
              <ol className="space-y-2.5">
                {sub.steps.map((st, i) => (
                  <li key={i} className="step-block">
                    <p className="mb-1 text-[13.5px] font-bold text-ink">
                      <Markdown inline>{st.heading}</Markdown>
                    </p>
                    <Markdown proseSize="sm">{st.body}</Markdown>
                    {st.math && <MathBlock tex={st.math} />}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {sub.answer && (
            <div className="answer-block">
              <p className="mb-1 text-eyebrow uppercase opacity-80">요약 답</p>
              <Markdown proseSize="sm">{sub.answer}</Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
