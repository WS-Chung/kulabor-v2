import Link from "next/link";
import { examsData, wikiData, quizData } from "@/lib/data";

export default function HomePage() {
  const totalSubparts = Object.values(examsData.items).reduce(
    (acc, e) => acc + e.questions.reduce((s, q) => s + (q.subparts?.length ?? 0), 0),
    0,
  );
  const totalSemesters = examsData.order.length;
  const totalWiki = Object.values(wikiData.items).reduce((acc, v) => acc + v.length, 0);

  return (
    <div className="space-y-14">
      {/* Hero */}
      <header className="space-y-4 max-w-2xl pt-2 md:pt-4">
        <p className="text-[11px] tracking-[0.25em] uppercase text-ink-muted font-medium">
          Reading Room
        </p>
        <h1 className="text-[32px] md:text-[44px] leading-[1.08] tracking-[-0.018em] font-semibold">
          노동경제학 기출문제,<br />
          <span className="text-action">차근차근.</span>
        </h1>
        <p className="text-ink-soft text-[17px] leading-[1.5] tracking-[-0.011em]">
          예능계·인문학과 출신 등 경제학 배경이 없는 학습자도 따라갈 수 있도록
          단계별 풀이·개념 위키·자가진단을 한 곳에 모았습니다.
        </p>
      </header>

      {/* Feature tiles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard
          href="/exams"
          icon="📚"
          title="기출문제 풀이"
          subtitle="연도별 단계별 풀이"
          stat={`${totalSemesters} 학기 · ${totalSubparts} 문제`}
          desc="2011~2025 학기를 모두 수록. 직관 → 단계별 풀이 → 요약 답 3블록 구조."
        />
        <FeatureCard
          href="/wiki"
          icon="📖"
          title="지식 위키"
          subtitle="배경지식 0에서 출발"
          stat={`${wikiData.order.length} 카테고리 · ${totalWiki} 항목`}
          desc="일상 비유 → 정의 → 수식 순서로 핵심 개념을 정리. 시험에서 자주 묻는 포인트 포함."
        />
        <FeatureCard
          href="/quiz"
          icon="📝"
          title="자가진단"
          subtitle="랜덤 20문제 + 즉시 피드백"
          stat={`${quizData.length} 문제 풀`}
          desc="4지선다, 답 클릭 즉시 정·오 표시와 풀이 해설을 보여드립니다."
        />
      </section>

      {/* Reading notes */}
      <section className="surface-card p-7 md:p-9 max-w-3xl">
        <h2 className="text-[21px] tracking-[-0.012em] mb-3 font-semibold">읽기 노트</h2>
        <ul className="space-y-2 text-ink-soft text-[15.5px] tracking-[-0.011em] leading-[1.55]">
          <li>모든 본문은 Pretendard 가변폰트와 Apple Action Blue 액센트로 표현됩니다.</li>
          <li>수식은 KaTeX로 그려지며, 표시 영역이 좁으면 가로 스크롤됩니다.</li>
          <li>자가진단은 매번 다른 20문제가 출제되며, 답을 클릭하면 즉시 정·오 표시와 해설이 보여집니다.</li>
          <li>논술형 문항은 정답이 고정되지 않은 경우가 많아 답안 outline 형태로 제공됩니다.</li>
        </ul>
      </section>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  subtitle,
  stat,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  stat: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group block surface-card p-6 md:p-7 transition-colors hover:bg-parchment"
    >
      <div className="flex items-start gap-3">
        <div className="text-[28px] leading-none">{icon}</div>
        <div>
          <div className="text-[12px] text-ink-muted tracking-[-0.12px]">{subtitle}</div>
          <h3 className="text-[19px] font-semibold mt-0.5 tracking-[-0.012em] group-hover:text-action transition-colors">
            {title}
          </h3>
        </div>
      </div>
      <p className="mt-4 text-[14.5px] text-ink-soft tracking-[-0.011em] leading-[1.5]">
        {desc}
      </p>
      <div className="mt-4">
        <span className="chip">{stat}</span>
      </div>
    </Link>
  );
}
