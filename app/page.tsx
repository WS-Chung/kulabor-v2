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
    <div className="space-y-10">
      <header className="space-y-3 max-w-2xl">
        <p className="text-xs tracking-[0.25em] uppercase text-ink-muted">Reading Room</p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          노동경제학 기출문제,<br />
          <span className="text-amber-warm">종이책처럼 차근차근.</span>
        </h1>
        <p className="text-ink-soft">
          예능계·인문학과 출신 등 경제학 배경이 없는 학습자도 따라갈 수 있도록
          단계별 풀이·개념 위키·자가진단을 한곳에 모았습니다.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
          subtitle="랜덤 10문제 + 즉시 피드백"
          stat={`${quizData.length} 문제 풀`}
          desc="4지선다, 답 제출 즉시 정·오 표시와 풀이 해설을 보여드립니다."
        />
      </section>

      <section className="paper-card p-6 md:p-8">
        <h2 className="text-xl font-bold mb-3">읽기 노트</h2>
        <ul className="list-disc pl-5 space-y-2 text-ink-soft">
          <li>모든 본문은 Pretendard 가변폰트 + 종이질감 톤으로 렌더링됩니다.</li>
          <li>수식은 KaTeX로 그려지며, 표시 영역이 좁으면 가로 스크롤됩니다.</li>
          <li>자가진단은 매번 다른 10문제가 출제되며, 제출하지 않은 문제는 해설이 보이지 않습니다.</li>
          <li>논술형 문항은 정답이 고정되지 않은 경우가 많아 답안 ‘outline’ 형태로 제공됩니다.</li>
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
    <Link href={href} className="paper-card p-6 hover:shadow-lg transition-shadow group">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-xs text-ink-muted">{subtitle}</div>
          <h3 className="text-lg font-bold mt-0.5 group-hover:text-amber-warm transition-colors">
            {title}
          </h3>
        </div>
      </div>
      <div className="mt-4 text-sm text-ink-soft">{desc}</div>
      <div className="mt-4">
        <span className="chip">{stat}</span>
      </div>
    </Link>
  );
}
