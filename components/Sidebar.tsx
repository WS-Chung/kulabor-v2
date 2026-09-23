"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/exams", no: "01", label: "기출문제 풀이" },
  { href: "/wiki", no: "02", label: "배경지식 사전" },
  { href: "/quiz", no: "03", label: "자가진단 테스트" },
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
          {/* 브랜드 — 높이는 .brand-band 가 본문 헤더(.page-head-inner)와 공유한다 */}
          <div className="brand-band">
            <Link href="/" className="block">
              <p className="text-eyebrow uppercase text-crimson">Korea University</p>
              <p className="mt-2 text-[22px] font-bold leading-[1.3] tracking-[-0.015em] text-ink">
                노동대학원
                <br />
                졸업시험 대비
              </p>
              <span aria-hidden className="mt-3 block h-[2px] w-9 bg-crimson" />
            </Link>
          </div>

          {/* 내비게이션 */}
          <nav aria-label="주요 메뉴" className="flex-1 px-3 py-5">
            <ul className="space-y-1.5">
              {NAV.map((item) => {
                const active = matches(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={clsx("nav-item", active && "nav-item-active")}
                    >
                      <span
                        aria-hidden
                        className={clsx(
                          "shrink-0 text-[13px] font-bold tabular-nums",
                          active ? "text-crimson/70" : "text-ink-faint",
                        )}
                      >
                        {item.no}
                      </span>
                      <span className="text-[17px] font-semibold leading-[1.4]">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
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
