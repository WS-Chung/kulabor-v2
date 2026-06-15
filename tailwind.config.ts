import type { Config } from "tailwindcss";

/**
 * 종이책 느낌의 따뜻한 가독 테마.
 * - paper: 본문 배경 (크림색 종이)
 * - ink: 본문 텍스트 (다크 브라운, 검정보다 따뜻)
 * - sepia: 강조/박스 배경
 * - amber: 액센트
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
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
        serif: [
          "Pretendard Variable",
          "Pretendard",
          "Source Serif Pro",
          "Iowan Old Style",
          "Apple Garamond",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        paper: {
          DEFAULT: "#FAF7F0",
          50: "#FFFEFB",
          100: "#FCFAF4",
          200: "#F7F1E4",
          300: "#EFE6D2",
          400: "#E6D8B8",
        },
        ink: {
          DEFAULT: "#2B241B",
          soft: "#3B342A",
          muted: "#6B6052",
          faint: "#9A8E7E",
        },
        sepia: {
          50: "#FBF3E4",
          100: "#F4E6CB",
          200: "#E8D2A6",
          300: "#D8B97C",
          400: "#C39E55",
          500: "#A07F37",
          600: "#7A5F26",
        },
        amber: {
          warm: "#B35C00",
        },
        success: {
          paper: "#E9F1E4",
          ink: "#2D5A1F",
          line: "#A6C58D",
        },
        warning: {
          paper: "#FBEFD6",
          ink: "#7A4A0E",
          line: "#D9B66B",
        },
        error: {
          paper: "#F7E1DD",
          ink: "#7A2A1B",
          line: "#D49283",
        },
      },
      maxWidth: {
        prose: "70ch",
        page: "78rem",
      },
      typography: ({ theme }: any) => ({
        ink: {
          css: {
            "--tw-prose-body": theme("colors.ink.DEFAULT"),
            "--tw-prose-headings": theme("colors.ink.DEFAULT"),
            "--tw-prose-lead": theme("colors.ink.soft"),
            "--tw-prose-links": theme("colors.amber.warm"),
            "--tw-prose-bold": theme("colors.ink.DEFAULT"),
            "--tw-prose-counters": theme("colors.ink.muted"),
            "--tw-prose-bullets": theme("colors.sepia.300"),
            "--tw-prose-hr": theme("colors.sepia.200"),
            "--tw-prose-quotes": theme("colors.ink.soft"),
            "--tw-prose-quote-borders": theme("colors.sepia.300"),
            "--tw-prose-captions": theme("colors.ink.muted"),
            "--tw-prose-code": theme("colors.ink.DEFAULT"),
            "--tw-prose-pre-code": theme("colors.ink.DEFAULT"),
            "--tw-prose-pre-bg": theme("colors.paper.200"),
            "--tw-prose-th-borders": theme("colors.sepia.200"),
            "--tw-prose-td-borders": theme("colors.sepia.100"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
