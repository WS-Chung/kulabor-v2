import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* ───────── 헤더 ───────── */}
      <header className="page-head">
        <div className="page-head-inner">
          <p className="eyebrow">Labor Economics</p>
          <h1 className="page-title mt-2">웹페이지 활용 방법</h1>
        </div>
      </header>

      <div className="mx-auto max-w-page space-y-12 px-6 py-10 md:px-10 md:py-12">
        {/* ───────── 자료 보는 순서 ───────── */}
        <section aria-label="자료 보는 순서">
          <h2 className="tan-rule text-title text-ink">자료 보는 순서</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <FeatureCard
              href="/exams"
              step="01"
              title="기출문제 풀이"
              desc="문제와 풀이를 분리 제시. 풀이는 직관 → 단계별 전개 → 요약 답."
            />
            <FeatureCard
              href="/wiki"
              step="02"
              title="배경지식 사전"
              desc="분야별 개념 정리. 일상 비유 → 정의 → 수식 순 구성."
            />
            <FeatureCard
              href="/quiz"
              step="03"
              title="자가진단 테스트"
              desc="기출 전 배경지식 점검. 보기 선택 시 즉시 채점과 해설."
            />
          </div>
        </section>

        {/* ───────── 읽는 방법 ───────── */}
        <section aria-label="읽는 방법" className="surface-card overflow-hidden">
          <h2 className="border-b border-hairline bg-surface px-5 py-3 text-label text-ink md:px-7">
            읽는 방법
          </h2>
          <ul className="divide-y divide-divider-soft">
            <Note step="1">연도 선택 → 학기 선택 → 문항 선택</Note>
            <Note step="2">풀이는 기본 접힘 상태. 클릭해서 펼쳐 확인</Note>
          </ul>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  step,
  title,
  desc,
}: {
  href: string;
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-md border border-hairline bg-canvas p-6
                 transition-colors hover:border-crimson/40 hover:bg-parchment"
    >
      <span className="text-eyebrow uppercase text-crimson">{step}</span>
      <h3 className="mt-2 text-[20px] font-bold text-ink group-hover:text-crimson">{title}</h3>
      <p className="mt-3 flex-1 text-[15px] leading-[1.7] text-ink-soft">{desc}</p>
    </Link>
  );
}

function Note({ step, children }: { step: string; children: React.ReactNode }) {
  return (
    <li className="flex items-baseline gap-3 px-5 py-4 md:px-7">
      <span
        className="mt-[1px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm
                   border border-crimson/30 bg-parchment text-meta font-bold text-crimson"
      >
        {step}
      </span>
      <p className="text-[15.5px] leading-[1.7] text-ink">{children}</p>
    </li>
  );
}
