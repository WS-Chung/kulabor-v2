import Link from "next/link";
import { examsData, wikiData, quizData, yearRange } from "@/lib/data";

export default function HomePage() {
  const totalSubparts = Object.values(examsData.items).reduce(
    (acc, e) => acc + e.questions.reduce((s, q) => s + (q.subparts?.length ?? 0), 0),
    0,
  );
  const totalQuestions = Object.values(examsData.items).reduce(
    (acc, e) => acc + e.questions.length,
    0,
  );
  const totalSemesters = examsData.order.length;
  const totalWiki = Object.values(wikiData.items).reduce((acc, v) => acc + v.length, 0);
  const range = yearRange(examsData.order);

  return (
    <div>
      {/* ───────── 헤더 ───────── */}
      <header className="page-head">
        <div className="page-head-inner">
          <p className="eyebrow">Labor Economics</p>
          <h1 className="page-title mt-2">
            노동경제학 기출문제,
            <br />
            차근차근.
          </h1>
          <p className="page-lede max-w-2xl">
            경제학을 전공하지 않았고 노동경제학이 생소한 직장인 대학원생을 위해 만들었습니다.
            기출문제는 <strong className="text-ink">문제와 풀이를 분리</strong>해 보여 주고,
            풀이는 직관 → 단계별 전개 → 요약 답 순서로 이어집니다.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-page space-y-12 px-6 py-10 md:px-10 md:py-12">
        {/* ───────── 수록 규모 ───────── */}
        <section aria-label="수록 규모">
          <h2 className="tan-rule text-title text-ink">수록 규모</h2>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-hairline bg-hairline md:grid-cols-4">
            <Stat label="학기" value={totalSemesters} unit="개" note={
              range ? `${range.min}–${range.max}학년도` : undefined
            } />
            <Stat label="문항" value={totalQuestions} unit="개" note="시험지 기준" />
            <Stat label="하위문항 풀이" value={totalSubparts} unit="개" note="가·나·다 단위" />
            <Stat label="배경지식 항목" value={totalWiki} unit="개" note={`${wikiData.order.length}개 분야`} />
          </dl>
        </section>

        {/* ───────── 세 가지 기능 ───────── */}
        <section aria-label="학습 메뉴">
          <h2 className="tan-rule text-title text-ink">어디서부터 볼까요</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <FeatureCard
              href="/exams"
              step="01"
              title="기출문제 풀이"
              stat={`${totalSemesters}개 학기 · ${totalSubparts}개 풀이`}
              desc="연도와 학기를 골라 문항별로 봅니다. 문제 영역과 풀이 영역이 시각적으로 분리되어 있어, 먼저 스스로 풀어 본 뒤 펼쳐 볼 수 있습니다."
            />
            <FeatureCard
              href="/wiki"
              step="02"
              title="지식 위키"
              stat={`${wikiData.order.length}개 분야 · ${totalWiki}개 항목`}
              desc="기출을 풀다 막히면 여기로. 일상 비유 → 정의 → 수식 순서로 정리했고, 각 항목이 어느 학기 어느 문항에 쓰이는지 표시했습니다."
            />
            <FeatureCard
              href="/quiz"
              step="03"
              title="자가진단 테스트"
              stat={`${quizData.length}문제 풀 · 랜덤 20문제`}
              desc="기출을 풀기 전 배경지식이 갖춰졌는지 점검합니다. 보기를 클릭하면 즉시 정·오와 해설이 표시됩니다."
            />
          </div>
        </section>

        {/* ───────── 읽는 방법 ───────── */}
        <section aria-label="읽는 방법" className="surface-card overflow-hidden">
          <h2 className="border-b border-hairline bg-surface px-5 py-3 text-label text-ink md:px-7">
            읽는 방법
          </h2>
          <ul className="divide-y divide-divider-soft">
            <Note title="문제를 먼저 읽습니다">
              웜 베이지 바탕에 좌측 크림슨 선이 있는 영역이 <strong className="text-ink">문제</strong>입니다.
              시험지를 그대로 옮긴 것이므로 여기까지만 읽고 스스로 답을 구성해 보세요.
            </Note>
            <Note title="풀이는 접혀 있습니다">
              흰 바탕 영역이 <strong className="text-ink">풀이</strong>입니다. 하위문항을 클릭하면
              직관(쉬운 비유) → 단계별 전개 → 요약 답 세 블록이 펼쳐집니다.
              요약 답은 답안지에 그대로 옮길 수 있는 분량으로 맞췄습니다.
            </Note>
            <Note title="논술형은 답안 개요입니다">
              여성 경활·노조·고령화처럼 정답이 하나로 고정되지 않는 문항은 개요(outline) 형태로
              제시했습니다. 실제 답안 작성 시 해당 학기 강의안과 교차 확인하시기 바랍니다.
            </Note>
            <Note title="수식은 가로 스크롤됩니다">
              화면이 좁으면 수식 블록이 가로로 스크롤됩니다. 표도 마찬가지입니다.
            </Note>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: number;
  unit: string;
  note?: string;
}) {
  return (
    <div className="bg-canvas px-5 py-5">
      <dt className="text-meta uppercase text-ink-muted">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-1">
        <span className="text-[26px] font-bold tabular-nums leading-none text-crimson">
          {value}
        </span>
        <span className="text-[13px] text-ink-soft">{unit}</span>
      </dd>
      {note && <p className="mt-1 text-[11.5px] text-ink-faint">{note}</p>}
    </div>
  );
}

function FeatureCard({
  href,
  step,
  title,
  stat,
  desc,
}: {
  href: string;
  step: string;
  title: string;
  stat: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-md border border-hairline bg-canvas p-6
                 transition-colors hover:border-crimson/40 hover:bg-parchment"
    >
      <span className="text-eyebrow uppercase text-crimson">{step}</span>
      <h3 className="mt-2 text-title text-ink group-hover:text-crimson">{title}</h3>
      <p className="mt-3 flex-1 text-[14.5px] leading-[1.7] text-ink-soft">{desc}</p>
      <span className="chip chip-crimson mt-4 self-start">{stat}</span>
    </Link>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="px-5 py-4 md:px-7">
      <p className="text-[14.5px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[14px] leading-[1.7] text-ink-soft">{children}</p>
    </li>
  );
}
