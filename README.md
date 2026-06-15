# 노동경제학 기출 학습 (Next.js + Vercel)

직장인 대학원 노동경제학 수강생(특히 비전공자)을 위한 학습 도우미.
2011~2025 노동경제학과 기출문제를 비전공자도 따라갈 수 있게 단계별로 풀이하고, 핵심 개념 위키와 자가진단 테스트를 함께 제공합니다.

## 화면 구성

| 섹션 | 설명 |
|---|---|
| 📚 **기출문제 풀이** | 학기 selectbox + 문항 탭 + ‘직관 → 단계별 풀이 → 요약 답’ |
| 📖 **지식 위키** | 11개 카테고리, 43개 항목. 일상 비유 → 정의 → 수식 |
| 📝 **자가진단 테스트** | 30문제 풀에서 무작위 10문제. 즉시 정답/해설 피드백 |

- **폰트**: Pretendard 가변
- **테마**: 종이책(paper/ink/sepia) 톤
- **수식**: KaTeX (`$inline$`, `$$block$$`) — 마크다운 파이프라인에 통합

## 기술 스택

- Next.js 15 (App Router) + React 19
- TypeScript 5
- Tailwind CSS 3 + `@tailwindcss/typography`
- KaTeX + react-markdown + remark-math + rehype-katex

## 디렉터리 구조

```
.
├── app/
│   ├── layout.tsx           # 사이드바 공통 레이아웃
│   ├── page.tsx             # 홈 (소개 + 카드)
│   ├── globals.css          # 종이책 톤 + Pretendard + KaTeX
│   ├── exams/page.tsx       # 기출문제 풀이
│   ├── wiki/page.tsx        # 지식 위키
│   └── quiz/page.tsx        # 자가진단 테스트
├── components/
│   ├── Sidebar.tsx
│   ├── Markdown.tsx         # 마크다운 + 수식 렌더러
│   ├── MathBlock.tsx        # 디스플레이 수식 단일 블록
│   ├── ExamView.tsx
│   ├── WikiView.tsx
│   └── QuizView.tsx
├── data/                    # 정적 학습 데이터(JSON)
│   ├── exams.json
│   ├── wiki.json
│   └── quiz.json
├── lib/
│   ├── data.ts              # JSON 로더
│   └── types.ts             # 공통 타입
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

## 로컬 실행

```bash
npm install
npm run dev          # http://localhost:3000
```

빌드 검증:

```bash
npm run typecheck
npm run build
npm run start
```

## Vercel 배포

1. GitHub에 푸시.
2. <https://vercel.com/new> 에서 본 저장소 import.
3. Framework는 자동으로 `Next.js` 감지. Build/Output 설정 변경 불필요.
4. 환경변수 없음(전부 정적 데이터).

## 콘텐츠 보강·수정

학습 데이터는 `data/exams.json`, `data/wiki.json`, `data/quiz.json` 셋이 단일 출처입니다.

- **새 학기 추가**: `data/exams.json`의 `order`에 학기 키 추가, `items`에 동일 키로 풀이 객체 추가.
- **위키 항목 추가**: `data/wiki.json`의 `items`의 카테고리 배열에 `{ title, body, math? }` 추가.
- **퀴즈 추가**: `data/quiz.json`에 `{ id, topic, question, choices(4), correct, explanation }` 추가. `id`는 유일.

스키마는 `lib/types.ts`에 TypeScript 타입으로 명시되어 있어 IDE가 자동 검증합니다.

## 출처/주의

- 2025-1학기 Q3의 Card-Krueger 회귀식과 2025-2학기 Q1의 EITC 그래프는 PDF에 이미지로 박혀 있어 OCR·시각 분석으로 좌표를 복원했습니다.
- 논술형 문항(여성경활·노조·고령화 등)은 모범답안 ‘outline’ 형태로 제시했으며, 실제 답안 작성 시에는 해당 학기 강의안과 교차 확인이 권장됩니다.
