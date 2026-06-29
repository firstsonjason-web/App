"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { LUMO_MASCOT } from "@/lib/site";

type LumoVisualProps = {
  size?: "md" | "lg" | "xl";
  caption?: string;
  className?: string;
  priority?: boolean;
};

const sizes = {
  md: "max-w-[280px]",
  lg: "max-w-[360px]",
  xl: "max-w-[440px]",
};

export default function LumoVisual({
  size = "lg",
  caption,
  className,
  priority = false,
}: LumoVisualProps) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("relative mx-auto w-full", sizes[size], className)}>
      <div
        className="absolute inset-0 rounded-[2rem] bg-lumo-teal/25 blur-3xl"
        aria-hidden
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-lumo-deep/80 to-lumo-ink shadow-card ring-1 ring-white/10"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgb(245_158_11/0.22),transparent_55%)]"
          aria-hidden
        />
        <Image
          src={LUMO_MASCOT}
          alt="Lumo, the LumoLife focus companion"
          width={1024}
          height={1024}
          priority={priority}
          className="relative aspect-square w-full object-cover"
        />
        {caption ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-lumo-ink via-lumo-ink/90 to-transparent p-5">
            <p className="text-sm font-medium text-white">{caption}</p>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
