import { ExamView } from "@/components/ExamView";
import { examsData } from "@/lib/data";

export const metadata = { title: "기출문제 풀이" };

export default function ExamsPage() {
  return (
    <ExamView
      semesters={examsData.order}
      exams={examsData.items}
      initialKey={examsData.order[0]}
    />
  );
}
