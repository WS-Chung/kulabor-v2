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
    <div className="space-y-7">
      <header className="space-y-2">
        <p className="text-[11px] tracking-[0.25em] uppercase text-ink-muted font-medium">
          Knowledge Wiki
        </p>
        <h1 className="text-[28px] md:text-[34px] font-semibold tracking-[-0.018em] leading-[1.15]">
          노동경제학 지식 위키
        </h1>
        <p className="text-ink-soft text-[15.5px] tracking-[-0.011em]">
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
              "rounded-pill px-4 py-1.5 text-[13.5px] tracking-[-0.011em] transition-all",
              cat === c
                ? "bg-action text-canvas ring-1 ring-action"
                : "bg-canvas text-ink-soft ring-1 ring-hairline hover:bg-parchment",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <article className="surface-card p-6 md:p-9 space-y-5">
        <h2 className="text-[21px] tracking-[-0.012em] font-semibold">{cat}</h2>
        <div className="h-px bg-divider-soft" />
        <div className="space-y-2.5">
          {list.map((item, i) => (
            <details
              key={i}
              className="rounded-lg bg-canvas ring-1 ring-divider-soft px-4 md:px-5 py-3 md:py-4 hover:ring-hairline transition-colors"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                <span className="text-[15.5px] md:text-[16px] font-semibold text-ink tracking-[-0.012em]">
                  📌 {item.title}
                </span>
                <span className="text-ink-faint text-[11.5px] select-none tracking-[-0.011em]">
                  펼치기 ▼
                </span>
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
