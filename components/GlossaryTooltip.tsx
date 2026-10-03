"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { Markdown } from "./Markdown";
import { KATEX_OPTIONS } from "@/lib/katex";
import type { GlossaryPayload } from "@/lib/types";

/** 커서와 툴팁 사이 간격 / 화면 가장자리 여백 (px) */
const OFFSET_X = 14;
const OFFSET_Y = 18;
const EDGE = 8;

const texCache = new Map<string, string>();

/** 기호 하나를 KaTeX 로 렌더한 HTML. 같은 기호는 한 번만 렌더한다. */
function texHtml(tex: string): string {
  let html = texCache.get(tex);
  if (html === undefined) {
    html = katex.renderToString(tex, { ...KATEX_OPTIONS, displayMode: false });
    texCache.set(tex, html);
  }
  return html;
}

/** 인라인 기호 렌더러. 툴팁 머리와 기호 해설 목록에서 쓴다. */
export function TexInline({ tex, className }: { tex: string; className?: string }) {
  const html = useMemo(() => texHtml(tex), [tex]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function termOf(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>("[data-g]") : null;
}

/**
 * 수식 기호 해설 툴팁 — 커서를 따라다닌다.
 *
 * 동작
 * - 마우스: 수식 속 `[data-g]` 위에 올리면 표시, 움직이면 따라오고, 벗어나면 사라진다.
 *   휠 스크롤 중에는 커서 아래로 들어온 기호를 다시 찾아 갈아 끼운다.
 * - 터치: 기호를 탭하면 표시, 같은 기호를 다시 탭하거나 다른 곳을 탭·스크롤하면 사라진다.
 *   이때 탭은 소비한다 — 기호가 아코디언 버튼 안에 있어도 버튼이 열리고 닫히지 않게.
 * - Esc 로 닫는다.
 *
 * 한 페이지에 하나만 둔다. document 에 위임 리스너를 걸어 수천 개 기호를 한 번에 처리한다.
 * 위치는 state 가 아니라 ref + transform 으로 갱신해, 마우스를 움직일 때 리렌더하지 않는다.
 */
export function GlossaryTooltip({ terms }: { terms: GlossaryPayload }) {
  const [id, setId] = useState<string | null>(null);
  const box = useRef<HTMLDivElement | null>(null);
  const point = useRef({ x: 0, y: 0 });
  const active = useRef<HTMLElement | null>(null);
  const pointerType = useRef<string>("mouse");
  const frame = useRef(0);

  /** 커서 오른쪽 아래에 두되, 화면 밖으로 나가면 반대편으로 뒤집는다. */
  const place = useCallback(() => {
    frame.current = 0;
    const el = box.current;
    if (!el) return;
    const { x, y } = point.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = x + OFFSET_X;
    if (left + w + EDGE > window.innerWidth) left = Math.max(EDGE, x - OFFSET_X - w);
    let top = y + OFFSET_Y;
    if (top + h + EDGE > window.innerHeight) top = Math.max(EDGE, y - OFFSET_Y - h);
    el.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
  }, []);

  // 내용이 바뀌면 크기도 바뀌므로 그린 직후 위치를 다시 잡는다
  useLayoutEffect(() => {
    if (id) place();
  }, [id, place]);

  useEffect(() => {
    const activate = (el: HTMLElement | null) => {
      if (active.current === el) return;
      active.current?.classList.remove("g-active");
      el?.classList.add("g-active");
      active.current = el;
      setId(el?.dataset.g ?? null);
    };
    const known = (el: HTMLElement | null) => (el && el.dataset.g && terms[el.dataset.g] ? el : null);

    const onPointerMove = (e: PointerEvent) => {
      pointerType.current = e.pointerType;
      if (e.pointerType !== "mouse") return;
      const el = known(termOf(e.target));
      point.current = { x: e.clientX, y: e.clientY };
      activate(el);
      if (el && !frame.current) frame.current = requestAnimationFrame(place);
    };
    const onPointerDown = (e: PointerEvent) => {
      pointerType.current = e.pointerType;
    };
    // 캡처 단계: React 의 onClick 보다 먼저 받아, 터치로 기호를 탭했을 때 버튼 동작을 막는다
    const onClickCapture = (e: MouseEvent) => {
      if (pointerType.current === "mouse") return;
      const el = known(termOf(e.target));
      if (el) {
        e.preventDefault();
        e.stopPropagation();
        point.current = { x: e.clientX, y: e.clientY };
        activate(active.current === el ? null : el);
      } else {
        activate(null);
      }
    };
    const hide = () => activate(null);
    // 마우스: 휠 스크롤로 내용이 커서 밑에서 움직이면, 커서 아래에 새로 온 기호로 갈아 끼운다.
    // 터치: 손가락 스크롤이므로 닫는다.
    let scrollFrame = 0;
    const onScroll = () => {
      if (pointerType.current !== "mouse") return hide();
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const { x, y } = point.current;
        const el = known(termOf(document.elementFromPoint(x, y)));
        activate(el);
        if (el) place();
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("click", onClickCapture, true);
    document.documentElement.addEventListener("pointerleave", hide);
    // 가로 스크롤되는 수식 블록 안의 스크롤도 잡도록 캡처로 건다
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("click", onClickCapture, true);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("keydown", onKey);
      if (frame.current) cancelAnimationFrame(frame.current);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      active.current?.classList.remove("g-active");
      active.current = null;
    };
  }, [terms, place]);

  const term = id ? terms[id] : null;
  if (!term) return null;

  return (
    <div ref={box} role="tooltip" className="glossary-tip">
      <div className="glossary-tip-head">
        <TexInline tex={term.tex} className="glossary-tip-sym" />
        <span className="glossary-tip-name">{term.name}</span>
      </div>
      <div className="glossary-tip-desc">
        <Markdown inline>{term.desc}</Markdown>
      </div>
      <div className="glossary-tip-ex">
        <span className="glossary-tip-ex-label">예</span>
        <Markdown inline>{term.example}</Markdown>
      </div>
    </div>
  );
}
