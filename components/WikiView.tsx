"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Markdown } from "./Markdown";
import { MathBlock } from "./MathBlock";
import type { WikiItem } from "@/lib/types";

interface Props {
  categories: string[];
  items: Record<string, WikiItem[]>;
}

/**
 * 배경지식 사전.
 *
 * 카테고리가 14개로 늘어나 알약형 버튼을 나열하면 줄바꿈이 지저분해진다.
 * 그래서 좌측에 목차 열을, 우측에 본문을 두는 2열 구성으로 바꿨다.
 * 좁은 화면에서는 목차가 위로 접히며 각진 탭 형태가 된다.
 */
export function WikiView({ categories, items }: Props) {
  const [cat, setCat] = useState(categories[0]);
  const [open, setOpen] = useState<Set<number>>(new Set());

  const list = items[cat] ?? [];

  function switchCat(c: string) {
    setCat(c);
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

  const allOpen = list.length > 0 && open.size === list.length;

  return (
    <div>
      {/* ───────── 헤더 ───────── */}
      <header className="page-head">
        <div className="page-head-inner">
          <p className="eyebrow">Knowledge Base</p>
          <h1 className="page-title mt-2">배경지식 사전</h1>
          <p className="page-lede max-w-2xl">
            분야별 개념 정리. 일상 비유 → 정의 → 수식 순 구성.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page px-6 py-8 md:px-10 md:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[17rem_1fr]">
          {/* ───────── 목차 ───────── */}
          <nav aria-label="분야 선택" className="lg:sticky lg:top-6 lg:self-start">
            <h2 className="mb-3 text-label text-ink-muted">분야</h2>

            {/* 넓은 화면: 세로 목록 */}
            <ul className="hidden overflow-hidden rounded-md border border-hairline lg:block">
              {categories.map((c) => {
                const active = c === cat;
                const n = items[c]?.length ?? 0;
                return (
                  <li key={c} className="border-b border-divider-soft last:border-b-0">
                    <button
                      type="button"
                      onClick={() => switchCat(c)}
                      aria-current={active ? "true" : undefined}
                      className={clsx(
                        "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors",
                        active
                          ? "bg-parchment font-semibold text-crimson"
                          : "bg-canvas text-ink-soft hover:bg-pearl hover:text-ink",
                      )}
                      style={active ? { boxShadow: "inset 3px 0 0 #7c0019" } : undefined}
                    >
                      <span className="text-[14px] leading-[1.45]">{c}</span>
                      <span className="shrink-0 text-meta tabular-nums text-ink-faint">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* 좁은 화면: 각진 탭 */}
            <div className="flex flex-wrap gap-2 lg:hidden">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => switchCat(c)}
                  aria-current={c === cat ? "true" : undefined}
                  className={clsx("tab", c === cat && "tab-active")}
                >
                  {c}
                </button>
              ))}
            </div>
          </nav>

          {/* ───────── 본문 ───────── */}
          <section aria-label={cat}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="tan-rule text-[20px] md:text-display text-ink">{cat}</h2>
              {list.length > 1 && (
                <button type="button" onClick={() => setOpen(allOpen ? new Set() : new Set(list.map((_, i) => i)))} className="btn-ghost">
                  {allOpen ? "모두 접기" : "모두 펼치기"}
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {list.map((item, i) => {
                const isOpen = open.has(i);
                return (
                  <div key={i} className="surface-card px-4 py-3.5 md:px-6 md:py-4">
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between gap-4 text-left"
                    >
                      <span className="text-[15.5px] md:text-[16.5px] font-semibold leading-[1.5] text-ink">
                        {item.title}
                      </span>
                      <span className="mt-[3px] shrink-0 text-meta text-crimson">
                        {isOpen ? "접기 ▲" : "펼치기 ▼"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="quiz-fade-up mt-3.5 border-t border-divider-soft pt-3.5">
                        <Markdown proseSize="base">{item.body}</Markdown>
                        {item.math && <MathBlock tex={item.math} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
