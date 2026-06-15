"use client";

import { useState } from "react";
import { Markdown } from "./Markdown";
import { MathBlock } from "./MathBlock";
import { clsx } from "clsx";
import type { WikiItem } from "@/lib/types";

interface Props {
  categories: string[];
  items: Record<string, WikiItem[]>;
}

export function WikiView({ categories, items }: Props) {
  const [cat, setCat] = useState(categories[0]);

  const list = items[cat] ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.25em] uppercase text-ink-muted">Knowledge Wiki</p>
        <h1 className="text-2xl md:text-3xl font-bold">📖 노동경제학 지식 위키</h1>
        <p className="text-ink-soft">
          경제학을 처음 보는 분도 부담 없이 따라갈 수 있게, 일상 비유 → 정의 → 수식 순서로 정리했습니다.
        </p>
      </header>

      {/* 카테고리 셀렉터 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm transition-colors ring-1",
              cat === c
                ? "bg-amber-warm text-paper-50 ring-amber-warm"
                : "bg-paper-100 text-ink-soft ring-sepia-100 hover:bg-paper-200",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <article className="paper-card p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-bold">{cat}</h2>
        <div className="deco-rule" />
        <div className="space-y-3">
          {list.map((item, i) => (
            <details
              key={i}
              className="paper-card-soft px-4 md:px-5 py-3 md:py-4 group"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                <span className="text-base md:text-lg font-semibold text-ink">
                  📌 {item.title}
                </span>
                <span className="text-ink-faint text-xs select-none">펼치기 ▼</span>
              </summary>
              <div className="mt-3 space-y-2">
                <Markdown proseSize="base">{item.body}</Markdown>
                {item.math && <MathBlock tex={item.math} />}
              </div>
            </details>
          ))}
        </div>
      </article>
    </div>
  );
}
