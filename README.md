# 노동대학원 졸업시험 대비

고려대학교 노동경제학 수강생(특히 학부에서 경제학을 전공하지 않은 직장인 학생)을 위한 학습 도우미.
2011~2026학년도 **31개 학기** 기출문제를 비전공자도 따라갈 수 있게 단계별로 풀이하고,
배경지식 사전과 자가진단 테스트를 함께 제공합니다.

> 이 디렉터리(`deploy/`)가 배포 루트입니다. 학습 데이터를 만드는 Python 파이프라인은
> 한 단계 위 `../src_authoring/` 에 있으며 배포에 포함되지 않습니다.
> **`data/*.json` 을 직접 고치지 마세요.** → [콘텐츠 수정](#콘텐츠-수정) 참조

## 화면 구성

| 섹션 | 경로 | 내용 |
|---|---|---|
| 기출문제 풀이 | `/exams` | 31개 학기 · 69문항 · 227개 하위문항. 학년도/학기 2단 내비 → 문항 탭 |
| 배경지식 사전 | `/wiki` | 14개 분야 · 53개 항목. 일상 비유 → 정의 → 수식 |
| 자가진단 테스트 | `/quiz` | 50문제 은행에서 무작위 20문제. 즉시 채점 + 분야별 성적 + 오답 복습 |

### 기출 화면의 설계 원칙

1. **드롭다운을 쓰지 않는다.** 학년도 버튼 한 줄 → 선택한 학년도의 학기 한 줄 → 문항 탭.
   전체 구조가 한눈에 보이고 클릭 두 번으로 어느 학기든 갈 수 있습니다.
2. **[문제]와 [풀이]는 시각 언어를 달리한다.**
   문제는 웜 베이지 바탕 + 좌측 크림슨 굵은 선(`.exam-question`),
   풀이는 흰 바탕 + 회색 경계(`.exam-solution`). 두 영역 사이에 굵은 구분선을 둡니다.
   풀이는 `직관 → 단계별 전개 → 요약 풀이` 3블록으로 고정됩니다.
3. **단계별 풀이와 요약 풀이는 따로 펼친다.** 하위문항마다 '단계별 풀이 펼치기'(직관 + 단계)와
   '요약 풀이 펼치기' 버튼이 따로 있고, 문항 단위로 '단계별 풀이 모두 펼치기'·'요약 풀이 모두
   펼치기'도 있습니다. 요약 풀이만 훑어보며 복습할 수 있게 하기 위해서입니다.

## 디자인

- **색상**: korea.ac.kr 의 실제 CSS 에서 추출한 크림슨 계열.
  `#7c0019`(primary) `#5b1017`(deep) `#8b0029`(bright) `#272727`(ink) `#f2eee7`(웜 베이지).
  토큰 정의와 근거는 `../DESIGN-ku.md` 에 정리되어 있습니다.
- **폰트**: Pretendard 가변 (CDN)
- **수식**: KaTeX. `$inline$`, `$$block$$` 을 마크다운 파이프라인에 통합.
- **크림 음영 띠 높이**: `--band-h` (globals.css). 사이드바 브랜드 블록 `.brand-band` 와
  본문 페이지 헤더 `.page-head-inner` 가 이 값을 공유해 두 띠의 아래 경계선이 한 줄로 이어집니다.
  헤더에 줄을 더 넣어 내용이 이 높이를 넘기면 정렬이 깨지므로, 그때는 `--band-h` 를 키우세요.

## 기술 스택

- Next.js 16 (App Router) + React 19 — 라우트 4개 전부 정적 프리렌더
- TypeScript 5.7
- Tailwind CSS 3.4 + `@tailwindcss/typography`
- react-markdown 9 + remark-gfm / remark-math / **remark-breaks** + rehype-katex + KaTeX

서버 라우트·API·데이터베이스·환경변수가 없습니다. 데이터는 빌드 시점에 JSON 에서 읽습니다.

### 마크다운 렌더링에서 주의할 점

`components/Markdown.tsx` 가 유일한 렌더 경로입니다. 두 가지 장치가 들어 있습니다.

- **`remark-breaks`**: 데이터의 단일 개행을 `<br>` 로 살립니다. 풀이 본문은 `· 항목` 을
  개행으로 나열하는 형태가 많아, 이게 없으면 여러 줄이 한 문단으로 뭉칩니다.
- **`inline` 모드**: `<button>` 안(아코디언 헤더, 퀴즈 보기)처럼 블록 태그를 넣을 수 없는
  자리에 씁니다. `<p>`·`<div>` 를 phrasing content 로 낮추고, `1. `·`- ` 같은 줄머리
  블록 문법을 이스케이프해 문자 그대로 보이게 합니다.

### 수식 해설·기호 해설 팝업과 숫자 예시 (강화 문항)

현재 강화된 문항: **2023-1 ~ 2026-1 일곱 학기의 전 문항(19개)**. 아키타입별 세트는
9종(EITC · STATS · DID · CAUSAL · MARKET · LABOR · FEMALE · HUMANCAP · AGING)이다.
기호 151종, 수식 모듈 171종이 들어 있다.

강화는 **문항 단위로 공개**한다. 템플릿은 여러 학기가 공유하므로, 숫자 예시를 써 둔 템플릿을
2022학년도 이전 문항이 쓰더라도 그 문항에 `terms=` 가 없으면 빌드가 예시를 걷어 낸다
(`schema.q()`). 그래서 반쯤 강화된 문항이 화면에 나오지 않는다.

팝업은 두 층이고, 조작을 나눠 서로 부딪히지 않게 했습니다.

| 층 | 단위 | 마크업 | 데스크톱 | 터치 |
|---|---|---|---|---|
| 수식 해설 | `E[(\bar X-E[\bar X])^2]` 같은 의미 덩어리 | `\htmlData{m=<id>}{…}` → `data-m` | 마우스 오버 (커서 추적) | 기호가 아닌 부분 탭 |
| 기호 해설 | `\bar X`, `\sigma^2` 같은 개별 기호 | `\htmlData{g=<id>}{…}` → `data-g` | 클릭 (그 자리에 고정) | 기호 탭 |

- **수식 해설**: 이름 · 전체 의미 · 구성 요소(①②③) · 숫자 예시. 모듈은 중첩될 수 있고
  커서 아래 가장 안쪽 모듈이 뜹니다. 강조는 고정 오버레이(`.tip-hl`)라 분수·합 기호처럼
  키가 큰 수식도 전부 덮습니다.
- **기호 해설**: 클릭하면 고정되고, 고정된 동안에는 수식 해설이 뜨지 않습니다. 같은 기호 재클릭 ·
  다른 곳 클릭 · Esc 로 닫힙니다. 스크롤하면 기호를 따라 움직입니다.
- 두 내용 모두 문제 영역 아래 접힌 '수식 해설 N개' · '기호 해설 M개' 목록에도 있어
  키보드·화면낭독기로도 읽을 수 있습니다. KaTeX `trust` 는 `\htmlData` 하나만 허용합니다(`lib/katex.ts`).
- **숫자 예시**: 각 풀이 단계의 `example`, 요약 풀이의 `answerExample`. 변수로 쓴 풀이 아래에
  '숫자 예시' 상자로 덧붙습니다. 예시 수치는 문항마다 하나로 통일했습니다
  (EITC 시급 \$10·4,000시간 / 통계 공정한 주사위 μ=3.5, σ²=35/12 / DiD Card·Krueger 식당당 평균 고용).

`data/glossary.json` 은 `{ "symbols": {id: …}, "formulas": {id: {tex, name, desc, parts, example}} }`
형태이고, 문항에는 쓰인 id 목록 `glossary` · `formulas` 가 붙습니다.

수식 모듈은 `../src_authoring/data_formulas.py` 에 LaTeX 리터럴로 정의합니다. `glossary.lit()` 이
간격 명령(`\,` `\;` `\quad` …)과 공백을 무시하고 `=`/`{=}`, `|`/`\mid` 를 같게 보는 정규식으로
바꾸며, 앞뒤에 문자·숫자가 붙거나 뒤에 `_ ^ '` 가 오면 맞추지 않습니다. 일부만 겹치는 모듈은
버리고, 같은 범위면 세트에서 먼저 정의한 모듈이 이깁니다. 특수한 앞뒤 조건은 `R(src, ahead_not=, behind_not=)`.

다른 문항으로 넓히는 절차:

1. 템플릿 함수의 각 `step(...)` 에 `example=`, 반환 dict 에 `answer_example=` 추가
2. `data_glossary.py` 에 기호 세트, `data_formulas.py` 에 수식 모듈 세트 추가 (id 접두사로 문항 간 의미 구분)
3. `data_*.py` 의 `q(...)` 에 `terms=G.<세트>, formulas=F.<세트>` 지정
4. `python -m src_authoring.build` — 강화 문항에서 다음 중 하나라도 있으면 **빌드가 실패**하며 위치를 알려 줍니다
   - 설명 없는 기호가 남음
   - 숫자 예시가 빠짐
   - 기호가 들어 있는 블록 수식(`$$…$$`)에 수식 모듈이 하나도 없음
   - 정의한 수식 모듈이 어디에도 맞지 않음 (패턴 오타)
5. `npm run check:math` — 모든 수식과 팝업 내용을 앱과 같은 KaTeX 옵션으로 렌더해 파스 오류를 찾습니다

**통화 기호는 반드시 `\$` 로 이스케이프하고 수식 밖에 씁니다.**
`$...$` 안쪽에서는 `\$` 가 이스케이프로 동작하지 않아 수식이 조기 종료되고 KaTeX 파스
오류가 납니다. `python -m src_authoring.lint_math` 가 이 실수를 잡습니다.

```
OK    근로소득 \$9,000($10 \times 900 = 9{,}000$)에 \$4,000을 더한다
금지  근로소득 $10 \times 900 = \$9{,}000$
```

## 디렉터리 구조

```
deploy/
├── app/
│   ├── layout.tsx           # 사이드바 공통 레이아웃 + skip link
│   ├── page.tsx             # 홈
│   ├── globals.css          # 고려대 톤 토큰 + 컴포넌트 클래스 + KaTeX
│   ├── exams/page.tsx
│   ├── wiki/page.tsx
│   └── quiz/page.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── Markdown.tsx         # 마크다운 + 수식 렌더러 (inline 모드 포함)
│   ├── MathBlock.tsx        # 디스플레이 수식 단일 블록
│   ├── ExamView.tsx         # 학년도/학기 내비 + 문제·풀이 분리 + 숫자 예시·수식/기호 해설 목록
│   ├── GlossaryTooltip.tsx  # 수식 해설(오버) · 기호 해설(클릭) 팝업
│   ├── WikiView.tsx         # 좌측 목차 열 + 우측 본문
│   └── QuizView.tsx
├── data/                    # ⚠ 생성물. 직접 편집 금지
│   ├── exams.json
│   ├── glossary.json        # { symbols: 기호 해설, formulas: 수식 모듈 해설 }
│   ├── wiki.json
│   └── quiz.json
├── scripts/check-katex.mjs  # npm run check:math
├── lib/
│   ├── data.ts              # JSON 로더 + 학기 파싱/연도 그룹화 유틸
│   ├── types.ts             # 공통 타입 (JSON 스키마의 근거)
│   ├── katex.ts             # KaTeX 공통 옵션 (trust: \htmlData 만 허용)
│   └── audio.ts             # 퀴즈 정답·오답 효과음 (WebAudio)
└── public/eitc_graph.png    # PDF 페이지에서 재추출한 EITC 예산선 그래프
```

## 로컬 실행

```bash
npm install
npm run dev          # http://localhost:3000
```

검증:

```bash
npm run typecheck
npm run build
npm run start
```

## 배포

`vercel.json` 이 없고 `next.config.ts` 에도 배포 설정이 없습니다. Vercel 의 자동 감지에
의존하므로 **프로젝트 설정에서 Root Directory 를 `deploy` 로 지정**해야 합니다.
저장소 루트에는 `package.json` 이 없어서 그대로 import 하면 빌드가 실패합니다.

1. GitHub 에 푸시
2. <https://vercel.com/new> 에서 저장소 import
3. **Root Directory → `deploy`**
4. Framework 는 Next.js 로 자동 감지. Build/Output 설정은 기본값
5. 환경변수 없음

## 콘텐츠 수정

`data/*.json` 은 **생성물**입니다. 단일 출처는 `../src_authoring/` 의 Python 코드이고,
JSON 을 직접 고치면 다음 빌드에서 덮어써집니다.

```bash
cd ..
python -m src_authoring.build       # exams·glossary·wiki·quiz.json 생성
python -m src_authoring.verify      # 스키마·필수필드·기호 해설 일관성·이미지 참조 검증
python -m src_authoring.lint_math   # 수식 구획 무결성
cd deploy && npm run check:math     # 모든 수식 KaTeX 렌더 검사
```

| 하고 싶은 일 | 고칠 파일 |
|---|---|
| 새 학기 추가 | `data_a/b/c.py` 에 `exam(...)` 추가 + `build.py` 의 `ORDER` 에 키 추가 |
| 풀이 문구 수정 | 해당 아키타입의 `templates_micro/causal/essay.py` 함수 |
| 배경지식 항목 추가 | `data_wiki.py` |
| 퀴즈 추가 | `data_quiz.py` — **정답은 항상 첫 보기로 쓰고**, 해설에서 보기 번호(①②③④)를 쓰지 않습니다. 빌드가 보기 순서를 회전시켜 정답 위치를 흩어 놓습니다 |

원본 PDF 가 교체되었을 때만:

```bash
python -m src_authoring.extract_pdf    # PDF → extracted/
python -m src_authoring.crop_eitc      # EITC 그래프 → deploy/public/eitc_graph.png
python -m src_authoring.decode_2023b   # 2023-2학기 깨진 폰트 구간 복호화
```

스키마의 근거는 `lib/types.ts` 이고, `verify.py` 가 JSON 을 그 형태로 검사합니다.

## 출처/주의

- 원본은 `../노동경제학과_기출문제.pdf` (25쪽). 학기별 구성과 문항 해부 노트는
  `../extracted/questions_dissected.md` 에 있습니다.
- **2023-2학기**는 PDF 에 임베드된 서브셋 폰트의 cmap 이 유실되어 텍스트 추출·OCR 이
  모두 불가능했습니다. CID 수열을 다른 학기의 동일 문장과 정렬해 205종 글리프를 확정하고
  1,353자를 전량 복원했습니다. 치환표와 근거는 `cid_table.py` 에 남겨 두었습니다.
- 2025-1학기 문항3의 Card–Krueger 회귀식, 2025-2·2026-1학기 문항1의 EITC 그래프는
  PDF 에 이미지로 박혀 있어 페이지를 6배로 렌더링해 좌표를 판독했습니다.
- 2026-1학기 문항2는 기존에 없던 **통계 기초**(표본평균의 기댓값·분산, 대수의 법칙,
  중심극한정리, 신뢰구간) 유형입니다. 원문의 `√n·X̄ ~ N(μ, σ²)` 표기는 중심화가 빠진
  약식이라, 풀이에서 정확한 진술 `√n(X̄−μ) → N(0, σ²)` 과 함께 그 차이를 짚었습니다.
- 논술형 문항(여성 경활·노조·고령화·코로나 등)은 답안 **개요** 형태로 제시했습니다.
  실제 답안 작성 시에는 해당 학기 강의안과 교차 확인하세요.
