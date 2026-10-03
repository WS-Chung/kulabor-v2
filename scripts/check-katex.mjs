// data/*.json 의 모든 수식을 앱과 같은 KaTeX 옵션으로 렌더해 파스 오류를 찾는다.
//
//   npm run check:math
//
// - 마크다운 문자열은 remark-math 와 같은 규칙으로 `$...$` / `$$...$$` 구획을 뜬다
//   (구획 밖의 `\$` 는 통화 기호, 구획 안에서는 이스케이프를 보지 않는다).
// - step.math · wiki item.math 는 문자열 전체가 디스플레이 수식이다.
// - glossary.json 의 tex 는 툴팁 머리의 기호, desc/example 은 마크다운이다.
// - 기호 해설용 `\htmlData` 는 lib/katex.ts 와 같은 trust 규칙으로만 허용한다.
// - throwOnError 를 켜서 렌더한다. 앱은 throwOnError:false 라서, 예컨대 `\text{a·b}` 처럼
//   KaTeX 가 빨간 글자로 '조용히' 깨뜨리는 경우(.katex-error 가 안 생김)도 여기서는 잡힌다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import katex from "katex";

const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, "..", "data");
const load = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8"));

const OPTIONS = {
  throwOnError: true,
  strict: "ignore",
  trust: (ctx) => ctx.command === "\\htmlData",
};

/** remark-math 규칙으로 수식 구획을 뽑는다. */
function* mathSpans(text) {
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\" && i + 1 < text.length) {
      i += 2;
      continue;
    }
    if (c === "$") {
      const k = text.startsWith("$$", i) ? 2 : 1;
      const j = text.indexOf("$".repeat(k), i + k);
      if (j < 0) {
        yield { error: "닫히지 않은 $", body: text.slice(i, i + 60) };
        return;
      }
      yield { body: text.slice(i + k, j), display: k === 2 };
      i = j + k;
      continue;
    }
    i += 1;
  }
}

let checked = 0;
const failures = [];

function render(where, tex, display) {
  checked += 1;
  try {
    katex.renderToString(tex, { ...OPTIONS, displayMode: display });
  } catch (e) {
    failures.push({ where, tex: tex.slice(0, 120), msg: String(e.message).split("\n")[0].slice(0, 160) });
  }
}

function markdown(where, text) {
  if (typeof text !== "string" || !text.includes("$")) return;
  for (const s of mathSpans(text)) {
    if (s.error) failures.push({ where, tex: s.body, msg: s.error });
    else render(where, s.body, s.display);
  }
}

// ── exams.json ──
const exams = load("exams.json");
let wrappedIds = new Set();
for (const key of exams.order) {
  for (const q of exams.items[key].questions) {
    const at = (p) => `${q.id}${p}`;
    markdown(at(".background"), q.background);
    q.subparts.forEach((sp, i) => {
      for (const f of ["question", "intuition", "answer", "answerExample"]) markdown(at(`[${i}].${f}`), sp[f]);
      (sp.steps ?? []).forEach((st, j) => {
        for (const f of ["heading", "body", "example"]) markdown(at(`[${i}].steps[${j}].${f}`), st[f]);
        if (st.math) render(at(`[${i}].steps[${j}].math`), st.math, true);
      });
    });
    for (const m of JSON.stringify(q).matchAll(/\\\\htmlData\{g=([^}]+)\}/g)) wrappedIds.add(m[1]);
  }
}

// ── wiki.json / quiz.json ──
const wiki = load("wiki.json");
for (const cat of wiki.order) {
  wiki.items[cat].forEach((it, i) => {
    markdown(`wiki/${cat}[${i}].body`, it.body);
    if (it.math) render(`wiki/${cat}[${i}].math`, it.math, true);
  });
}
for (const it of load("quiz.json")) {
  markdown(`quiz#${it.id}.question`, it.question);
  it.choices.forEach((c, i) => markdown(`quiz#${it.id}.choices[${i}]`, c));
  markdown(`quiz#${it.id}.explanation`, it.explanation);
}

// ── glossary.json ──
const glossary = load("glossary.json");
for (const [id, t] of Object.entries(glossary)) {
  render(`glossary/${id}.tex`, t.tex, false);
  markdown(`glossary/${id}.desc`, t.desc);
  markdown(`glossary/${id}.example`, t.example);
}
const dangling = [...wrappedIds].filter((id) => !glossary[id]);
for (const id of dangling) failures.push({ where: "exams.json", tex: id, msg: "glossary.json 에 없는 기호 id" });

console.log(`수식 ${checked}개 렌더, 기호 id ${wrappedIds.size}종 참조`);
for (const f of failures.slice(0, 40)) {
  console.log(`  [FAIL] ${f.where}\n         ${f.msg}\n         ${f.tex}`);
}
console.log(failures.length ? `RESULT: FAIL (${failures.length}건)` : "RESULT: OK");
process.exit(failures.length ? 1 : 0);
