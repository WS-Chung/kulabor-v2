"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { clsx } from "clsx";

interface MarkdownProps {
  children: string;
  className?: string;
  proseSize?: "sm" | "base" | "lg";
}

/**
 * 본문 + LaTeX 수식을 렌더링하는 표준 컴포넌트.
 * - `$inline$`, `$$block$$` 수식 KaTeX 지원
 * - GitHub 스타일 표·체크박스·자동링크 지원
 * - Tailwind typography(prose) 톤 = ink (종이책)
 */
export function Markdown({ children, className, proseSize = "base" }: MarkdownProps) {
  const proseClass =
    proseSize === "sm" ? "prose prose-sm" :
    proseSize === "lg" ? "prose prose-lg" : "prose";

  return (
    <div className={clsx(proseClass, "prose-ink max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: "ignore", throwOnError: false }]]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
