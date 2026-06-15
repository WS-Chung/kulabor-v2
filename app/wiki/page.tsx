import { WikiView } from "@/components/WikiView";
import { wikiData } from "@/lib/data";

export const metadata = { title: "지식 위키" };

export default function WikiPage() {
  return <WikiView categories={wikiData.order} items={wikiData.items} />;
}
