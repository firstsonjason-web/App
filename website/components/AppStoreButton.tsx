import Link from "next/link";
import { Smartphone } from "lucide-react";
import { APP_STORE_URL } from "@/lib/site";
import { cn } from "@/lib/cn";

type AppStoreButtonProps = {
  className?: string;
  variant?: "solid" | "glass";
};

export default function AppStoreButton({
  className,
  variant = "solid",
}: AppStoreButtonProps) {
  return (
    <Link
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl px-6 py-3.5 font-semibold transition-all active:scale-[0.98]",
        variant === "solid"
          ? "bg-lumo-gold text-lumo-ink shadow-glow-gold hover:brightness-110"
          : "border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/15",
        className
      )}
    >
      <Smartphone size={22} aria-hidden />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium uppercase tracking-wide opacity-80">
          Download on the
        </span>
        <span className="block text-base">App Store</span>
      </span>
    </Link>
  );
}
