import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: {
    default: "노동경제학 기출 학습",
    template: "%s · 노동경제학 기출 학습",
  },
  description:
    "노동경제학과 기출문제를 비전공자도 따라갈 수 있게 단계별로 풀이하고, 핵심 개념 위키와 자가진단 테스트를 제공합니다.",
  applicationName: "노동경제학 기출 학습",
  authors: [{ name: "Labor Econ Study" }],
  keywords: ["노동경제학", "기출문제", "EITC", "최저임금", "DiD", "인적자본", "노조"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF7F0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <div className="md:grid md:grid-cols-[18rem_1fr]">
          <Sidebar />
          <main className="relative z-10 min-h-screen">
            <div className="mx-auto max-w-page px-5 md:px-10 py-8 md:py-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
