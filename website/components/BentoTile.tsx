import type { LucideIcon } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import { cn } from "@/lib/cn";

type BentoTileProps = {
  title: string;
  body: string;
  icon: LucideIcon;
  gradient: string;
  className?: string;
  delay?: number;
  children?: React.ReactNode;
};

export default function BentoTile({
  title,
  body,
  icon: Icon,
  gradient,
  className,
  delay = 0,
  children,
}: BentoTileProps) {
  return (
    <SectionReveal
      delay={delay}
      className={cn(
        "group relative overflow-hidden rounded-card border border-white/10 bg-surface",
        className
      )}
    >
      <div className={cn("absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100", gradient)} aria-hidden />
      <div className="relative flex h-full min-h-[200px] flex-col justify-end p-6 md:min-h-0 md:p-8">
        {children}
        <Icon className="mb-3 text-lumo-teal" size={22} aria-hidden />
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">{body}</p>
      </div>
    </SectionReveal>
  );
}
