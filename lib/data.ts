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
  return key.replace(/학기$/, "");
}

/** slug → 학기 키 (역변환). */
export function slugToSemester(slug: string): string | null {
  const candidate = `${slug}학기`;
  if (examsData.items[candidate]) return candidate;
  return null;
}

// ───── 학기 키 파싱 ─────

/** `2026-1학기` → `{ year: 2026, term: 1 }`. 형식이 다르면 null. */
export function parseSemester(key: string): { year: number; term: number } | null {
  const m = /^(\d{4})-([12])학기$/.exec(key);
  if (!m) return null;
  return { year: Number(m[1]), term: Number(m[2]) };
}

export interface YearGroup {
  year: number;
  /** 해당 연도의 학기 키. 학기 번호 오름차순(1학기 → 2학기). */
  semesters: string[];
}

/**
 * 학기 키 목록을 연도별로 묶는다. 연도는 최신순, 연도 내 학기는 오름차순.
 *
 * 드롭다운 대신 `연도 행 → 학기 버튼` 2단 내비게이션을 만들기 위한 것.
 */
export function groupByYear(keys: string[]): YearGroup[] {
  const map = new Map<number, string[]>();
  for (const k of keys) {
    const p = parseSemester(k);
    if (!p) continue;
    const arr = map.get(p.year) ?? [];
    arr.push(k);
    map.set(p.year, arr);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, semesters]) => ({
      year,
      semesters: semesters.sort(
        (a, b) => (parseSemester(a)?.term ?? 0) - (parseSemester(b)?.term ?? 0),
      ),
    }));
}

/** 수록된 학기의 연도 범위. 헤더 안내 문구에 쓴다(하드코딩 방지). */
export function yearRange(keys: string[]): { min: number; max: number } | null {
  const years = keys.map((k) => parseSemester(k)?.year).filter((y): y is number => !!y);
  if (years.length === 0) return null;
  return { min: Math.min(...years), max: Math.max(...years) };
}

/** `2026-1학기` → `2026학년도 1학기`. 짧은 라벨이 필요할 때는 `term` 만 쓴다. */
export function semesterLabel(key: string): string {
  const p = parseSemester(key);
  return p ? `${p.year}학년도 ${p.term}학기` : key;
}
