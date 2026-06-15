import { QuizView } from "@/components/QuizView";
import { quizData } from "@/lib/data";

export const metadata = { title: "자가진단 테스트" };

// 매 요청마다 새 페이지(랜덤성은 클라이언트에서 처리)
export const dynamic = "force-static";

export default function QuizPage() {
  return <QuizView pool={quizData} />;
}
