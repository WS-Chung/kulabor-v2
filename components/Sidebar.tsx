"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";

const NAV = [
  { href: "/exams", label: "기출문제 풀이", icon: "📚", desc: "연도별 단계별 풀이" },
  { href: "/wiki", label: "지식 위키", icon: "📖", desc: "비전공자용 개념 정리" },
  { href: "/quiz", label: "자가진단 테스트", icon: "📝", desc: "랜덤 20문제 + 해설" },
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
          "bg-parchment border-r border-hairline",
          "transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-screen">
          <div className="px-6 pt-9 pb-4">
            <Link href="/" className="block group" onClick={() => setOpen(false)}>
              <div className="text-[11px] tracking-[0.2em] text-ink-muted uppercase font-medium">
                Labor Economics
              </div>
              <div className="mt-1.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.018em] text-ink">
                노동경제학<br />기출 학습
              </div>
              <div className="mt-2 text-[13px] text-ink-muted leading-[1.45] tracking-[-0.224px]">
                비전공자도 따라갈 수 있게.
              </div>
            </Link>
          </div>

          <div className="h-px bg-hairline mx-6" />

          <nav className="px-3 pt-4 flex-1 overflow-y-auto">
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
                      <span className="text-[14px] font-semibold tracking-[-0.224px]">{item.label}</span>
                      <span className="text-[11.5px] text-ink-muted tracking-[-0.12px]">{item.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="px-6 py-4 text-[11.5px] text-ink-faint border-t border-hairline tracking-[-0.12px]">
            본 자료는 학습용 정리본입니다. 정답이 하나로 고정되지 않은 논술형 문항은 답안 가이드 형태로 제공됩니다.
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
