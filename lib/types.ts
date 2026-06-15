/** 학습 콘텐츠 공통 타입 정의. data/*.json 의 스키마와 1:1 대응. */

export interface Step {
  heading: string;
  body: string;
  math?: string;
}

export interface SubPart {
  label: string;
  question: string;
  intuition?: string;
  steps?: Step[];
  answer?: string;
}

export interface Question {
  id: string;
  title: string;
  background?: string;
  subparts: SubPart[];
}

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
