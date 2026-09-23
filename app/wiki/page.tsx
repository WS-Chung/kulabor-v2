import { WikiView } from "@/components/WikiView";
import { wikiData } from "@/lib/data";

export const metadata = { title: "배경지식 사전" };

export default function WikiPage() {
  return <WikiView categories={wikiData.order} items={wikiData.items} />;
}
