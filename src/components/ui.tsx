import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "sun" | "leaf" | "wood" | "ghost";

const VARIANTS: Record<Variant, string> = {
  sun: "bg-gradient-to-b from-sun-400 to-sun-600 text-canopy-950 shadow-chunky",
  leaf: "bg-gradient-to-b from-leaf-400 to-leaf-600 text-canopy-950 shadow-chunky",
  wood: "bg-canopy-700/80 text-cream ring-1 ring-cream/15 shadow-pop backdrop-blur",
  ghost: "bg-transparent text-cream ring-1 ring-cream/20",
};

const SIZES = {
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
} as const;

interface ButtonBase {
  variant?: Variant;
  size?: keyof typeof SIZES;
  children: ReactNode;
}

export function Button({
  variant = "sun",
  size = "md",
  className = "",
  ...props
}: ButtonBase & ComponentProps<"button">) {
  return (
    <button
      className={`btn-chunky inline-flex items-center justify-center gap-2 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "sun",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonBase & ComponentProps<typeof Link>) {
  return (
    <Link
      className={`btn-chunky inline-flex items-center justify-center gap-2 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

/** Wordmark: friendly display type with an amber "IA" spark, matching the
 * MelodIQ-style two-tone but in Dinoria's jungle palette. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-[family-name:var(--font-fredoka)] font-700 tracking-tight ${className}`}
    >
      <span className="text-cream">Dino</span>
      <span className="text-sun-400">ria</span>
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl bg-canopy-900/70 ring-1 ring-cream/10 shadow-chunky backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  accent = "cream",
}: {
  label: string;
  value: ReactNode;
  accent?: "cream" | "sun" | "leaf" | "lava";
}) {
  const color = {
    cream: "text-cream",
    sun: "text-sun-400",
    leaf: "text-leaf-400",
    lava: "text-lava-400",
  }[accent];
  return (
    <div className="rounded-2xl bg-canopy-950/50 px-4 py-3 text-center ring-1 ring-cream/10">
      <div className={`font-[family-name:var(--font-fredoka)] text-2xl font-700 tabular-nums ${color}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs uppercase tracking-wider text-cream-faint">
        {label}
      </div>
    </div>
  );
}
