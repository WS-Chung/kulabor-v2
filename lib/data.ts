/** 빌드 시 정적 임포트되는 학습 데이터 로더. */
import examsRaw from "@/data/exams.json";
import wikiRaw from "@/data/wiki.json";
import quizRaw from "@/data/quiz.json";

import type { ExamsPayload, WikiPayload, QuizItem } from "./types";

export const examsData = examsRaw as unknown as ExamsPayload;
export const wikiData = wikiRaw as unknown as WikiPayload;
export const quizData = quizRaw as unknown as QuizItem[];

/** 학기 키를 URL slug로 변환(2025-1학기 → 2025-1). */
export function semesterToSlug(key: string): string {
  // 2025-1학기, 2011-2학기 형식 → 2025-1
  return key.replace(/학기$/, "");
}

/** slug → 학기 키 (역변환). */
export function slugToSemester(slug: string): string | null {
  const candidate = `${slug}학기`;
  if (examsData.items[candidate]) return candidate;
  return null;
}
