import { Plus } from "lucide-react";
import { paragraphs } from "@/lib/utils";

export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={i} className="group rounded-2xl border border-black/[0.06] bg-white px-5 transition-colors open:bg-paper md:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
            <span className="text-[1rem] font-semibold tracking-tight text-ink md:text-[1.05rem]">{f.question}</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper transition-colors duration-300 group-open:bg-ink group-open:text-white">
              <Plus className="h-4 w-4 transition-transform duration-300 group-open:rotate-45" strokeWidth={1.8} />
            </span>
          </summary>
          <div className="max-w-3xl pb-6 pr-10 text-[0.95rem] text-muted">
            {paragraphs(f.answer).map((p, j) => (
              <p key={j} className="mb-3 leading-relaxed last:mb-0">
                {p}
              </p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
