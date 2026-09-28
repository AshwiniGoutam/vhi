import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, accent, intro, align = "left", className, light }: { eyebrow?: string; title: string; accent?: string; intro?: string; align?: "left" | "center"; className?: string; light?: boolean }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto flex flex-col items-center text-center", className)}>
      {eyebrow ? <p className={cn("eyebrow mb-4", light && "!text-sand")}>{eyebrow}</p> : null}
      <h2 className={cn("display text-[2rem] sm:text-4xl lg:text-[2.9rem]", light ? "text-white" : "text-ink")}>
        {title} {accent ? <span className={cn("accent", light && "!text-sand")}>{accent}</span> : null}
      </h2>
      {intro ? <p className={cn("mt-5 max-w-xl text-base leading-relaxed md:text-[1.05rem]", light ? "text-white/70" : "text-muted")}>{intro}</p> : null}
    </div>
  );
}
