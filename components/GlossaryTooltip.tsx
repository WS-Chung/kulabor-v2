"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { Markdown } from "./Markdown";
import { KATEX_OPTIONS } from "@/lib/katex";
import type { GlossaryPayload } from "@/lib/types";

/** 커서와 툴팁 사이 간격 / 화면 가장자리 여백 / 강조 상자 여백 (px) */
const OFFSET_X = 14;
const OFFSET_Y = 18;
const EDGE = 8;
const HL_PAD = 3;

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

/** 인라인 기호 렌더러. 툴팁 머리와 해설 목록에서 쓴다. */
export function TexInline({ tex, className }: { tex: string; className?: string }) {
  const html = useMemo(() => texHtml(tex), [tex]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

type Kind = "g" | "m";
interface Tip {
  kind: Kind;
  id: string;
}

const ACTIVE_CLASS: Record<Kind, string> = { g: "g-active", m: "m-active" };

function closestOf(target: EventTarget | null, kind: Kind): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(kind === "g" ? "[data-g]" : "[data-m]");
}

/** 요소와 그 안의 모든 자손을 덮는 사각형. 분수·합 기호처럼 줄 높이를 넘는 수식도 다 덮는다. */
function coverRect(el: HTMLElement): DOMRect {
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  range.detach?.();
  return r.width && r.height ? r : el.getBoundingClientRect();
}

/**
 * 수식 해설 툴팁.
 *
 * 두 가지 해설을 한 컴포넌트가 맡는다. 서로 겹치지 않도록 동작을 나눴다.
 * - **수식 덩어리**(`[data-m]`) — 마우스를 올리면 뜨고 커서를 따라다닌다. 덩어리가 포개져 있으면
 *   커서 아래 가장 안쪽 덩어리를 가리킨다.
 * - **기호**(`[data-g]`) — 클릭하면 그 자리에 고정되어 뜬다. 고정된 동안에는 수식 해설이 뜨지 않는다.
 *   같은 기호를 다시 클릭하거나, 다른 곳을 클릭하거나, Esc 를 누르면 닫힌다.
 * - **터치** — 기호를 탭하면 기호 해설, 기호가 아닌 수식 부분을 탭하면 수식 해설(둘 다 고정).
 *   탭은 소비하므로 수식이 버튼 안에 있어도 버튼이 눌리지 않는다.
 *
 * 가리키는 대상은 화면 위에 따로 그린 강조 상자로 보여 준다(수식 레이아웃을 건드리지 않기 위해).
 * 한 페이지에 하나만 둔다. document 에 위임 리스너를 건다.
 * 위치는 state 가 아니라 ref + transform 으로 갱신해, 마우스를 움직일 때 리렌더하지 않는다.
 */
export function GlossaryTooltip({ glossary }: { glossary: GlossaryPayload }) {
  const [tip, setTip] = useState<Tip | null>(null);
  const [pinnedView, setPinnedView] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  const hl = useRef<HTMLDivElement | null>(null);
  const point = useRef({ x: 0, y: 0 });
  const active = useRef<HTMLElement | null>(null);
  const activeKind = useRef<Kind>("m");
  /** 고정된 해설: 기준 요소와, 클릭 지점의 요소 내 상대 위치 */
  const pinned = useRef<{ el: HTMLElement; dx: number; dy: number } | null>(null);
  const pointerType = useRef<string>("mouse");
  const frame = useRef(0);

  /** 툴팁은 커서(또는 클릭 지점) 오른쪽 아래, 화면 밖으로 나가면 반대편으로 뒤집는다. 강조 상자도 함께. */
  const place = useCallback(() => {
    frame.current = 0;
    const el = active.current;
    if (el && hl.current) {
      const r = coverRect(el);
      const s = hl.current.style;
      s.transform = `translate3d(${Math.round(r.left - HL_PAD)}px, ${Math.round(r.top - HL_PAD)}px, 0)`;
      s.width = `${Math.round(r.width + HL_PAD * 2)}px`;
      s.height = `${Math.round(r.height + HL_PAD * 2)}px`;
    }
    const b = box.current;
    if (!b) return;
    const { x, y } = point.current;
    const w = b.offsetWidth;
    const h = b.offsetHeight;
    let left = x + OFFSET_X;
    if (left + w + EDGE > window.innerWidth) left = Math.max(EDGE, x - OFFSET_X - w);
    let top = y + OFFSET_Y;
    if (top + h + EDGE > window.innerHeight) top = Math.max(EDGE, y - OFFSET_Y - h);
    b.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
  }, []);

  // 내용이 바뀌면 크기도 바뀌므로 그린 직후 위치를 다시 잡는다
  useLayoutEffect(() => {
    if (tip) place();
  }, [tip, place]);

  useEffect(() => {
    const pool = (kind: Kind) => (kind === "g" ? glossary.symbols : glossary.formulas);
    const find = (target: EventTarget | null, kind: Kind) => {
      const el = closestOf(target, kind);
      const id = el?.dataset[kind];
      return el && id && pool(kind)[id] ? el : null;
    };

    const show = (el: HTMLElement | null, kind: Kind) => {
      if (active.current === el && activeKind.current === kind) return;
      active.current?.classList.remove(ACTIVE_CLASS[activeKind.current]);
      el?.classList.add(ACTIVE_CLASS[kind]);
      active.current = el;
      activeKind.current = kind;
      setTip(el ? { kind, id: el.dataset[kind]! } : null);
    };
    const unpin = () => {
      pinned.current = null;
      setPinnedView(false);
    };
    const hide = () => {
      unpin();
      show(null, "m");
    };
    const pin = (el: HTMLElement, kind: Kind, x: number, y: number) => {
      const r = el.getBoundingClientRect();
      pinned.current = { el, dx: x - r.left, dy: y - r.top };
      setPinnedView(true);
      point.current = { x, y };
      show(el, kind);
      if (!frame.current) frame.current = requestAnimationFrame(place);
    };
    /** 커서 아래 수식 덩어리를 찾아 보여 준다 (마우스, 고정 아님) */
    const hoverAt = (target: EventTarget | null, x: number, y: number) => {
      const el = find(target, "m");
      point.current = { x, y };
      show(el, "m");
      if (el && !frame.current) frame.current = requestAnimationFrame(place);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerType.current = e.pointerType;
      if (e.pointerType !== "mouse" || pinned.current) return;
      hoverAt(e.target, e.clientX, e.clientY);
    };
    const onPointerDown = (e: PointerEvent) => {
      pointerType.current = e.pointerType;
    };
    // 캡처 단계: React 의 onClick 보다 먼저 받아, 기호를 누른 클릭이 버튼 동작으로 이어지지 않게 한다
    const onClickCapture = (e: MouseEvent) => {
      const sym = find(e.target, "g");
      if (sym) {
        e.preventDefault();
        e.stopPropagation();
        if (pinned.current?.el === sym) {
          hide();
          if (pointerType.current === "mouse") hoverAt(e.target, e.clientX, e.clientY);
        } else {
          pin(sym, "g", e.clientX, e.clientY);
        }
        return;
      }
      if (pointerType.current !== "mouse") {
        const mod = find(e.target, "m");
        if (mod) {
          e.preventDefault();
          e.stopPropagation();
          if (pinned.current?.el === mod) hide();
          else pin(mod, "m", e.clientX, e.clientY);
          return;
        }
        hide();
        return;
      }
      // 마우스로 기호 밖을 누르면 고정을 풀고, 그 자리의 수식 해설로 돌아간다
      if (pinned.current) {
        hide();
        hoverAt(e.target, e.clientX, e.clientY);
      }
    };
    const onLeave = () => {
      if (!pinned.current) show(null, "m");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };

    // 스크롤: 고정된 해설은 기준 요소를 따라가고(화면 밖으로 나가면 닫음),
    // 마우스 hover 는 커서 아래로 새로 들어온 덩어리로 갈아 끼운다. 터치 스크롤은 닫는다.
    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const p = pinned.current;
        if (p) {
          const r = p.el.getBoundingClientRect();
          if (!p.el.isConnected || r.bottom < 0 || r.top > window.innerHeight) return hide();
          point.current = { x: r.left + p.dx, y: r.top + p.dy };
          place();
          return;
        }
        if (pointerType.current !== "mouse") return hide();
        const { x, y } = point.current;
        hoverAt(document.elementFromPoint(x, y), x, y);
      });
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("click", onClickCapture, true);
    document.documentElement.addEventListener("pointerleave", onLeave);
    // 가로 스크롤되는 수식 블록 안의 스크롤도 잡도록 캡처로 건다
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("click", onClickCapture, true);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
      if (frame.current) cancelAnimationFrame(frame.current);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      active.current?.classList.remove(ACTIVE_CLASS[activeKind.current]);
      active.current = null;
      pinned.current = null;
    };
  }, [glossary, place]);

  if (!tip) return null;

  if (tip.kind === "g") {
    const t = glossary.symbols[tip.id];
    if (!t) return null;
    return (
      <>
        <div ref={hl} aria-hidden className="tip-hl tip-hl-g" />
        <div ref={box} role="tooltip" className="glossary-tip">
          <div className="glossary-tip-head">
            <span className="glossary-tip-badge glossary-tip-badge-g">기호</span>
            <TexInline tex={t.tex} className="glossary-tip-sym" />
            <span className="glossary-tip-name">{t.name}</span>
          </div>
          <div className="glossary-tip-desc">
            <Markdown inline>{t.desc}</Markdown>
          </div>
          <div className="glossary-tip-ex">
            <span className="glossary-tip-ex-label">예</span>
            <Markdown inline>{t.example}</Markdown>
          </div>
          {pinnedView && <p className="glossary-tip-hint">다른 곳을 누르면 닫힘</p>}
        </div>
      </>
    );
  }

  const f = glossary.formulas[tip.id];
  if (!f) return null;
  return (
    <>
      <div ref={hl} aria-hidden className="tip-hl tip-hl-m" />
      <div ref={box} role="tooltip" className="glossary-tip formula-tip">
        <div className="glossary-tip-head">
          <span className="glossary-tip-badge">수식</span>
          <span className="glossary-tip-name">{f.name}</span>
        </div>
        <div className="glossary-tip-desc">
          <Markdown inline>{f.desc}</Markdown>
        </div>
        {f.parts.length > 0 && (
          <ol className="formula-tip-parts">
            {f.parts.map((p, i) => (
              <li key={i}>
                <Markdown inline>{p}</Markdown>
              </li>
            ))}
          </ol>
        )}
        <div className="glossary-tip-ex">
          <span className="glossary-tip-ex-label">예</span>
          <Markdown inline>{f.example}</Markdown>
        </div>
        <p className="glossary-tip-hint">
          {pinnedView ? "다른 곳을 누르면 닫힘" : "기호를 클릭하면 기호 해설"}
        </p>
      </div>
    </>
  );
}
