import type { Config } from "tailwindcss";

/**
 * Apple 디자인 시스템 적용 (DESIGN-apple.md).
 *
 * 핵심:
 * - 단일 Action Blue (#0066CC) 액센트, 그 외엔 모노크롬
 * - 그림자 없음 (hairline 테두리만), 편집 영역 카드는 18px 라운드
 * - SF Pro 대체로 Pretendard Variable 사용 (한글 최적화 + Apple 톤 호환)
 * - 본문 17px, letter-spacing -0.374px (Apple 식 ‘tight’ 헤드라인 톤)
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
          "SF Pro Text",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
        display: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "system-ui",
          "sans-serif",
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
        // ── Apple Action Blue (단일 인터랙션 컬러) ─────
        action: {
          DEFAULT: "#0066CC",
          focus: "#0071E3",
          dark: "#2997FF", // 어두운 표면 위에서의 링크
        },

        // ── 표면 ─────
        canvas: "#FFFFFF",
        parchment: "#F5F5F7",
        pearl: "#FAFAFC",
        tile: {
          1: "#272729",
          2: "#2A2A2C",
          3: "#252527",
        },

        // ── 잉크(텍스트) ─────
        ink: {
          DEFAULT: "#1D1D1F",
          soft: "#333333",
          muted: "#7A7A7A",
          faint: "#B8B8B8",
        },

        // ── Hairlines ─────
        hairline: "#E0E0E0",
        "divider-soft": "#F0F0F0",
        chip: "#D2D2D7",

        // ── 상태(서브) ─────
        ok: {
          bg: "#EEF6EC",
          fg: "#1F5C2E",
          line: "#BFDBB1",
        },
        warn: {
          bg: "#FFF6E5",
          fg: "#7C5300",
          line: "#EFD392",
        },
        err: {
          bg: "#FBEDE9",
          fg: "#8B2A1B",
          line: "#E6B0A2",
        },

        // ── 호환성(이전 키 유지) ─────
        // 점진 이행을 위해 기존 paper/sepia/amber 키도 매핑한다
        paper: {
          DEFAULT: "#FFFFFF",
          50: "#FFFFFF",
          100: "#FAFAFC",
          200: "#F5F5F7",
          300: "#EBEBED",
          400: "#D2D2D7",
        },
        sepia: {
          50: "#F5F5F7",
          100: "#E0E0E0",
          200: "#E0E0E0",
          300: "#D2D2D7",
          400: "#7A7A7A",
        },
        amber: {
          warm: "#0066CC",
        },
        success: {
          paper: "#EEF6EC",
          ink: "#1F5C2E",
          line: "#BFDBB1",
        },
        warning: {
          paper: "#FFF6E5",
          ink: "#7C5300",
          line: "#EFD392",
        },
        error: {
          paper: "#FBEDE9",
          ink: "#8B2A1B",
          line: "#E6B0A2",
        },
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "11px",
        md: "11px",
        lg: "18px",
        pill: "9999px",
      },
      fontSize: {
        body: ["17px", { lineHeight: "1.47", letterSpacing: "-0.374px" }],
        "body-strong": ["17px", { lineHeight: "1.24", letterSpacing: "-0.374px" }],
        tagline: ["21px", { lineHeight: "1.19", letterSpacing: "0.231px" }],
        "display-md": ["34px", { lineHeight: "1.18", letterSpacing: "-0.374px" }],
        "display-lg": ["40px", { lineHeight: "1.10", letterSpacing: "-0.005em" }],
        hero: ["56px", { lineHeight: "1.07", letterSpacing: "-0.018em" }],
        caption: ["14px", { lineHeight: "1.43", letterSpacing: "-0.224px" }],
        "caption-strong": ["14px", { lineHeight: "1.29", letterSpacing: "-0.224px" }],
        fine: ["12px", { lineHeight: "1.4", letterSpacing: "-0.12px" }],
      },
      maxWidth: {
        prose: "70ch",
        narrow: "60rem",
        page: "78rem",
      },
      typography: ({ theme }: any) => ({
        ink: {
          css: {
            "--tw-prose-body": theme("colors.ink.DEFAULT"),
            "--tw-prose-headings": theme("colors.ink.DEFAULT"),
            "--tw-prose-lead": theme("colors.ink.soft"),
            "--tw-prose-links": theme("colors.action.DEFAULT"),
            "--tw-prose-bold": theme("colors.ink.DEFAULT"),
            "--tw-prose-counters": theme("colors.ink.muted"),
            "--tw-prose-bullets": theme("colors.hairline"),
            "--tw-prose-hr": theme("colors.divider-soft"),
            "--tw-prose-quotes": theme("colors.ink.soft"),
            "--tw-prose-quote-borders": theme("colors.action.DEFAULT"),
            "--tw-prose-captions": theme("colors.ink.muted"),
            "--tw-prose-code": theme("colors.ink.DEFAULT"),
            "--tw-prose-pre-code": theme("colors.ink.DEFAULT"),
            "--tw-prose-pre-bg": theme("colors.parchment"),
            "--tw-prose-th-borders": theme("colors.hairline"),
            "--tw-prose-td-borders": theme("colors.divider-soft"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
