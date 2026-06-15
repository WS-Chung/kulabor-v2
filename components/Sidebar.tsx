"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";

const NAV = [
  { href: "/exams", label: "기출문제 풀이", icon: "📚", desc: "연도별 단계별 풀이" },
  { href: "/wiki", label: "지식 위키", icon: "📖", desc: "비전공자용 개념 정리" },
  { href: "/quiz", label: "자가진단 테스트", icon: "📝", desc: "랜덤 10문제 + 해설" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const matches = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* 모바일 토글 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden fixed top-3 left-3 z-30 btn-ghost shadow-sm"
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      {/* 사이드바 본체 */}
      <aside
        className={clsx(
          "fixed md:sticky md:top-0 md:h-screen z-20",
          "w-72 max-w-[80vw] shrink-0",
          "bg-paper-100 border-r border-sepia-100",
          "transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-screen">
          <div className="px-5 pt-7 pb-3">
            <Link href="/" className="block group" onClick={() => setOpen(false)}>
              <div className="text-xs tracking-[0.2em] text-ink-muted uppercase">Labor Economics</div>
              <div className="mt-1 text-xl font-bold text-ink leading-snug">
                노동경제학<br />기출 학습
              </div>
              <div className="mt-2 text-[13px] text-ink-muted leading-relaxed">
                비전공자도 따라갈 수 있게.<br />단계별로, 종이책처럼.
              </div>
            </Link>
          </div>

          <div className="deco-rule mx-5" />

          <nav className="px-3 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={clsx("nav-item", matches(item.href) && "nav-item-active")}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-[11.5px] text-ink-muted">{item.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-5 py-4 text-[11.5px] text-ink-faint border-t border-sepia-100">
            <p>
              본 자료는 학습용 정리본입니다. 정답이 하나로 고정되지 않은 논술형 문항은
              답안 가이드 형태로 제공됩니다.
            </p>
          </div>
        </div>
      </aside>

      {/* 모바일 백드롭 */}
      {open && (
        <button
          type="button"
          aria-label="닫기"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/30 z-10"
        />
      )}
    </>
  );
}
