import type { Config } from "tailwindcss";

/**
 * 고려대학교 톤 디자인 시스템 (../DESIGN-ku.md).
 *
 * 색상값 출처: korea.ac.kr 의 w_layout.css / site_contents_Desktop.css 실측.
 *
 * 성격:
 * - 각진 기관형. 모서리 2~4px, 그림자 없음, 1px 실선 경계만
 * - 크림슨(#7c0019)은 액센트. 활성 탭·1차 버튼·강조선에만 좁게 사용
 * - 웜 베이지(#f2eee7)가 유일한 유채색 배경
 * - 본문 16px / 행간 1.7 — 긴 풀이를 읽는 화면이라 넉넉하게
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
        serif: ["Nanum Myeongjo", "Batang", "serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },

      colors: {
        // ── 고려대 크림슨 ─────
        crimson: {
          DEFAULT: "#7c0019",
          deep: "#5b1017",
          bright: "#8b0029",
          warm: "#7c121b",
        },
        // 이전 코드 호환용 별칭 (action = crimson)
        action: {
          DEFAULT: "#7c0019",
          focus: "#8b0029",
          deep: "#5b1017",
        },

        // ── 표면 ─────
        canvas: "#ffffff",
        parchment: "#f2eee7",
        surface: "#f7f7f7",
        pearl: "#fafafa",

        // ── 잉크 ─────
        ink: {
          DEFAULT: "#272727",
          soft: "#4f4f4f",
          muted: "#787878",
          faint: "#b2b2b2",
        },

        // ── 선 ─────
        hairline: "#e5e5e5",
        rule: "#d3d3d3",
        "divider-soft": "#eeeeee",
        tan: "#c9bb9f",

        // ── 상태 ─────
        ok: {
          bg: "#eef4ec",
          fg: "#2c5c33",
          line: "#c3d8bd",
        },
        err: {
          bg: "#fbecee",
          fg: "#7c0019",
          line: "#e8c3c9",
        },
        note: {
          bg: "#f2eee7",
          fg: "#6b5a3e",
          line: "#d9cdb4",
        },
      },

      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
        pill: "9999px",
      },

      fontSize: {
        eyebrow: ["11px", { lineHeight: "1.3", letterSpacing: "0.18em", fontWeight: "700" }],
        meta: ["12px", { lineHeight: "1.4", letterSpacing: "0.04em", fontWeight: "500" }],
        label: ["13px", { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.7", letterSpacing: "-0.003em" }],
        "body-lg": ["17px", { lineHeight: "1.75", letterSpacing: "-0.003em" }],
        title: ["19px", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        display: ["26px", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "700" }],
        hero: ["36px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
      },

      maxWidth: {
        prose: "72ch",
        narrow: "60rem",
        page: "80rem",
      },

      typography: ({ theme }: { theme: (path: string) => string }) => ({
        ink: {
          css: {
            "--tw-prose-body": theme("colors.ink.DEFAULT"),
            "--tw-prose-headings": theme("colors.ink.DEFAULT"),
            "--tw-prose-lead": theme("colors.ink.soft"),
            "--tw-prose-links": theme("colors.crimson.DEFAULT"),
            "--tw-prose-bold": theme("colors.ink.DEFAULT"),
            "--tw-prose-counters": theme("colors.ink.muted"),
            "--tw-prose-bullets": theme("colors.rule"),
            "--tw-prose-hr": theme("colors.hairline"),
            "--tw-prose-quotes": theme("colors.ink.soft"),
            "--tw-prose-quote-borders": theme("colors.crimson.DEFAULT"),
            "--tw-prose-captions": theme("colors.ink.muted"),
            "--tw-prose-code": theme("colors.ink.DEFAULT"),
            "--tw-prose-pre-code": theme("colors.ink.DEFAULT"),
            "--tw-prose-pre-bg": theme("colors.surface"),
            "--tw-prose-th-borders": theme("colors.rule"),
            "--tw-prose-td-borders": theme("colors.hairline"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
