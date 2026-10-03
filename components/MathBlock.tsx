"use client";

import { useEffect, useRef } from "react";
import katex from "katex";
import { KATEX_OPTIONS } from "@/lib/katex";

/**
 * 단일 LaTeX 수식 블록(디스플레이) 렌더러.
 * data/*.json의 `math` 필드를 그대로 받아 KaTeX로 출력.
 * 기호 해설 `\htmlData` 를 쓰므로 KATEX_OPTIONS(trust 규칙)를 반드시 같이 쓴다.
 */
export function MathBlock({ tex }: { tex: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(tex, ref.current, { ...KATEX_OPTIONS, displayMode: true });
    } catch {
      // 무시 — 원문 표시 fallback
      if (ref.current) ref.current.textContent = tex;
    }
  }, [tex]);

  return <div ref={ref} className="my-3 overflow-x-auto" />;
}
