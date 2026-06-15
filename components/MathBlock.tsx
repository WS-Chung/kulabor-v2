"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

/**
 * 단일 LaTeX 수식 블록(디스플레이) 렌더러.
 * data/*.json의 `math` 필드를 그대로 받아 KaTeX로 출력.
 */
export function MathBlock({ tex }: { tex: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(tex, ref.current, {
        displayMode: true,
        throwOnError: false,
        strict: "ignore",
      });
    } catch {
      // 무시 — 원문 표시 fallback
      if (ref.current) ref.current.textContent = tex;
    }
  }, [tex]);

  return <div ref={ref} className="my-3 overflow-x-auto" />;
}
