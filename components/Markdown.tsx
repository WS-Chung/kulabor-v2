"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { clsx } from "clsx";

interface MarkdownProps {
  children: string;
  className?: string;
  proseSize?: "sm" | "base" | "lg";
  /**
   * 버튼·라벨처럼 phrasing content만 허용되는 자리에서 쓸 때 true.
   * 블록 태그를 span/fragment로 낮춰 `<button>` 안에서도 유효한 HTML이 되게 한다.
   * (아코디언 헤더에 `$수식$`이 들어간 문제 지문을 넣기 위해 필요하다.)
   */
  inline?: boolean;
}

/**
 * remarkBreaks: 데이터의 단일 개행을 `<br>`로 살린다.
 * 풀이 본문은 `· 항목` 줄을 개행으로 나열하는 형태가 많아서, 이 플러그인이 없으면
 * 여러 줄이 한 문단으로 뭉쳐 읽히지 않는다. (exams.json 708곳, wiki.json 46곳)
 */
const REMARK = [remarkGfm, remarkMath, remarkBreaks];
const REHYPE = [[rehypeKatex, { strict: "ignore", throwOnError: false }]] as const;

/** 인라인 모드용 태그 치환. p는 없애고, 블록 수식 래퍼 div는 span으로 낮춘다. */
const INLINE_COMPONENTS: Components = {
  p: ({ children }) => <>{children}</>,
  div: ({ children }) => <span className="inline">{children}</span>,
};

/**
 * 인라인 모드에서 줄머리 블록 문법을 문자 그대로 살린다.
 *
 * 단계 제목이 "1. 정의를 쓴다" 처럼 시작하면 마크다운이 이를 **순서 목록**으로 읽어
 * 번호를 리스트 마커로 빨아들인다(그래서 화면에서 "1."이 사라진다).
 * 인라인 모드는 애초에 블록을 만들 자리가 아니므로 목록·인용·제목 표시를 이스케이프한다.
 */
function escapeBlockStarts(src: string): string {
  return src
    .replace(/^([ \t]*)(\d+)([.)])(\s)/gm, "$1$2\\$3$4")
    .replace(/^([ \t]*)([-*+>#])(\s)/gm, "$1\\$2$3");
}

/**
 * 본문 + LaTeX 수식을 렌더링하는 표준 컴포넌트.
 * - `$inline$`, `$$block$$` 수식 KaTeX 지원
 * - GitHub 스타일 표·체크박스·자동링크 지원
 * - Tailwind typography(prose) 톤 = ink (종이책)
 */
export function Markdown({ children, className, proseSize = "base", inline }: MarkdownProps) {
  if (inline) {
    return (
      <span className={clsx("md-inline", className)}>
        <ReactMarkdown
          remarkPlugins={REMARK}
          rehypePlugins={REHYPE as never}
          components={INLINE_COMPONENTS}
        >
          {escapeBlockStarts(children)}
        </ReactMarkdown>
      </span>
    );
  }

  const proseClass =
    proseSize === "sm" ? "prose prose-sm" :
    proseSize === "lg" ? "prose prose-lg" : "prose";

  return (
    <div className={clsx(proseClass, "prose-ink max-w-none", className)}>
      <ReactMarkdown remarkPlugins={REMARK} rehypePlugins={REHYPE as never}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
