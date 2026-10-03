/** 학습 콘텐츠 공통 타입 정의. data/*.json 의 스키마와 1:1 대응. */

export interface Step {
  heading: string;
  body: string;
  math?: string;
  /** 같은 단계를 구체적인 숫자로 다시 보여 주는 예시 (마크다운). */
  example?: string;
}

export interface SubPart {
  label: string;
  question: string;
  intuition?: string;
  steps?: Step[];
  answer?: string;
  /** 요약 답의 숫자 예시 (마크다운). */
  answerExample?: string;
}

export interface Question {
  id: string;
  title: string;
  background?: string;
  subparts: SubPart[];
  /**
   * 이 문항의 수식에 등장하는 기호 해설 id (등장 순).
   * 수식 안에서는 `\htmlData{g=<id>}{…}` 로 감싸져 있고, 설명은 glossary.json 에 있다.
   */
  glossary?: string[];
}

// ───── 기호 해설 ─────

export interface GlossaryTerm {
  /** 툴팁 머리에 표시할 기호 (LaTeX) */
  tex: string;
  name: string;
  /** 고등학생 눈높이 설명 (인라인 마크다운·수식) */
  desc: string;
  /** 구체적인 수치 예 (인라인 마크다운·수식) */
  example: string;
}

export type GlossaryPayload = Record<string, GlossaryTerm>;

export interface ExamSet {
  title: string;
  summary?: string;
  questions: Question[];
}

export interface ExamsPayload {
  order: string[];
  items: Record<string, ExamSet>;
}

// ───── 위키 ─────

export interface WikiItem {
  title: string;
  body: string;
  math?: string;
}

export interface WikiPayload {
  order: string[];
  items: Record<string, WikiItem[]>;
}

// ───── 자가진단 ─────

export interface QuizItem {
  id: number;
  topic: string;
  question: string;
  choices: string[];
  correct: number;
  explanation: string;
}
