import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: {
    default: "노동대학원 졸업시험 대비",
    template: "%s · 노동대학원 졸업시험 대비",
  },
  description:
    "노동경제학과 기출문제 31개 학기를 비전공자도 따라갈 수 있게 단계별로 풀이하고, "
    + "배경지식 위키와 자가진단 테스트를 제공합니다.",
  applicationName: "노동대학원 졸업시험 대비",
  keywords: [
    "노동경제학",
    "기출문제",
    "EITC",
    "최저임금",
    "이중차분법",
    "인적자본",
    "노동조합",
    "중심극한정리",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c0019",
};

/**
 * 공통 레이아웃.
 *
 * 컨테이너를 여기서 씌우지 않는다. 각 페이지가 `.page-head`(풀블리드 웜 베이지)와
 * 그 아래 `max-w-page` 컨테이너를 직접 구성하기 때문이다.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-canvas">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50
                     focus:rounded-sm focus:border focus:border-crimson focus:bg-canvas
                     focus:px-3 focus:py-2 focus:text-label focus:text-crimson"
        >
          본문으로 건너뛰기
        </a>
        <div className="md:grid md:grid-cols-[18rem_1fr]">
          <Sidebar />
          <main id="main" className="min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
