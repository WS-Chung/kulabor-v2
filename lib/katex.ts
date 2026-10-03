import type { KatexOptions } from "katex";

/**
 * KaTeX 공통 옵션. Markdown · MathBlock · 기호 해설 툴팁이 모두 이 값을 쓴다.
 *
 * trust: 기호 해설용 `\htmlData{g=<id>}{…}` 만 허용한다. `data-g` 속성을 가진 span 이 되어
 * GlossaryTooltip 이 hover 대상을 찾는 표식이 된다. `\href`, `\includegraphics` 같은
 * 다른 trust 명령은 계속 막는다.
 *
 * scripts/check-katex.mjs 도 같은 규칙으로 데이터를 검사한다. 바꿀 때는 함께 바꾼다.
 */
export const KATEX_OPTIONS: KatexOptions = {
  strict: "ignore",
  throwOnError: false,
  trust: (ctx) => ctx.command === "\\htmlData",
};
