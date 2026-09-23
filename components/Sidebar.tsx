"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/exams", label: "기출문제 풀이", desc: "31개 학기 · 문제와 풀이 분리" },
  { href: "/wiki", label: "지식 위키", desc: "14개 분야 배경지식 사전" },
  { href: "/quiz", label: "자가진단 테스트", desc: "50문제 풀에서 랜덤 20문제" },
];

/**
 * 좌측 내비게이션.
 *
 * 고려대 사이트 톤: 흰 바탕 + 1px 경계선, 활성 항목에만 크림슨 좌측 바.
 * 아이콘 이모지를 쓰지 않고 텍스트 위계로만 구분한다(기관형).
 */
export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 경로가 바뀌면 모바일 서랍을 닫는다
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const matches = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* 모바일 토글 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        className="fixed left-3 top-3 z-40 rounded-sm border border-rule bg-canvas px-3 py-2
                   text-label text-ink shadow-sm md:hidden"
      >
        {open ? "✕ 닫기" : "☰ 메뉴"}
      </button>

      {/* 사이드바 본체 */}
      <aside
        className={clsx(
          "fixed z-30 h-screen w-72 max-w-[82vw] shrink-0 overflow-y-auto",
          "border-r border-hairline bg-canvas",
          "transition-transform duration-200",
          "md:sticky md:top-0 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-h-screen flex-col">
          {/* 브랜드 */}
          <div className="border-b border-hairline bg-parchment px-6 pb-6 pt-14 md:pt-8">
            <Link href="/" className="block">
              <p className="text-eyebrow uppercase text-crimson">Korea University</p>
              <p className="mt-2 text-[20px] font-bold leading-[1.3] tracking-[-0.015em] text-ink">
                노동경제학
                <br />
                기출 학습
              </p>
              <span
                aria-hidden
                className="mt-3 block h-[2px] w-9 bg-crimson"
              />
              <p className="mt-3 text-[12.5px] leading-[1.55] text-ink-muted">
                경제학을 전공하지 않아도
                <br />
                따라갈 수 있게.
              </p>
            </Link>
          </div>

          {/* 내비게이션 */}
          <nav aria-label="주요 메뉴" className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {NAV.map((item) => {
                const active = matches(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={clsx("nav-item", active && "nav-item-active")}
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[14.5px] font-semibold">{item.label}</span>
                        <span
                          className={clsx(
                            "text-[11.5px]",
                            active ? "text-crimson/70" : "text-ink-muted",
                          )}
                        >
                          {item.desc}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 각주 */}
          <div className="mt-auto border-t border-hairline px-6 py-5">
            <p className="text-[11.5px] leading-[1.6] text-ink-faint">
              학습용 정리본입니다. 논술형 문항은 답안 개요 형태로 제공하므로 실제 답안 작성 시
              강의안과 교차 확인하세요.
            </p>
          </div>
        </div>
      </aside>

      {/* 모바일 백드롭 */}
      {open && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-ink/30 md:hidden"
        />
      )}
    </>
  );
}
