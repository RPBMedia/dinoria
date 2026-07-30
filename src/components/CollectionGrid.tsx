"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Dinosaur, Period } from "@/types/dinosaur";
import { DINOSAURS } from "@/lib/dinosaurs";
import { useCollection } from "@/hooks/useCollection";
import { DinoDetail } from "@/components/DinoDetail";
import { ButtonLink } from "@/components/ui";

const FILTERS: { id: "all" | Period; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Triassic", label: "Triassic" },
  { id: "Jurassic", label: "Jurassic" },
  { id: "Cretaceous", label: "Cretaceous" },
];

export function CollectionGrid() {
  const { discoveredIds, ready } = useCollection();
  const [filter, setFilter] = useState<"all" | Period>("all");
  const [selected, setSelected] = useState<Dinosaur | null>(null);

  const total = DINOSAURS.length;
  const found = useMemo(
    () => DINOSAURS.filter((d) => discoveredIds.has(d.id)).length,
    [discoveredIds],
  );
  const pct = Math.round((found / total) * 100);

  const shown = useMemo(
    () =>
      filter === "all"
        ? DINOSAURS
        : DINOSAURS.filter((d) => d.period === filter),
    [filter],
  );

  return (
    <div>
      {/* progress */}
      <div className="rounded-3xl bg-canopy-900/70 p-5 ring-1 ring-cream/10 shadow-chunky backdrop-blur-md">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-cream-faint">
              Dinosaurs discovered
            </div>
            <div className="font-[family-name:var(--font-fredoka)] text-3xl font-700 text-cream">
              <span className="text-sun-400 tabular-nums">{found}</span>
              <span className="text-cream-faint"> / {total}</span>
            </div>
          </div>
          <div className="font-[family-name:var(--font-fredoka)] text-2xl font-700 tabular-nums text-leaf-400">
            {pct}%
          </div>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-canopy-950/70 ring-1 ring-cream/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-sun-400"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
          />
        </div>
        {found === total && (
          <p className="mt-3 text-center text-sm font-600 text-sun-300">
            🏆 Master Palaeontologist — you&rsquo;ve discovered every dinosaur!
          </p>
        )}
      </div>

      {/* filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`btn-chunky rounded-full px-4 py-2 text-sm ring-1 ${
              filter === f.id
                ? "bg-canopy-700 text-cream ring-cream/20"
                : "bg-canopy-900/60 text-cream-faint ring-cream/10 hover:text-cream"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* grid */}
      {!ready ? (
        <p className="py-16 text-center text-cream-faint">
          Opening your collection…
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((dino) => {
            const found = discoveredIds.has(dino.id);
            return (
              <button
                key={dino.id}
                onClick={() => found && setSelected(dino)}
                disabled={!found}
                className={`btn-chunky group flex flex-col items-center rounded-2xl p-3 text-center ring-1 ${
                  found
                    ? "cursor-pointer bg-canopy-800/60 ring-cream/15 hover:bg-canopy-700/70"
                    : "cursor-default bg-canopy-950/40 ring-cream/5"
                }`}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={dino.image}
                    alt={found ? dino.displayName : "Undiscovered dinosaur"}
                    fill
                    sizes="(max-width: 640px) 45vw, 220px"
                    className={
                      found
                        ? "object-contain transition-transform duration-200 group-hover:scale-105"
                        : "object-contain opacity-25 brightness-0 dark:opacity-30"
                    }
                  />
                  {!found && (
                    <span className="absolute inset-0 grid place-items-center text-3xl text-cream/30">
                      ?
                    </span>
                  )}
                </div>
                <span
                  className={`mt-2 truncate text-sm font-600 ${
                    found ? "text-cream" : "text-cream-faint"
                  }`}
                >
                  {found ? dino.displayName : "???"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* detail modal */}
      <DetailModal dino={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function DetailModal({
  dino,
  onClose,
}: {
  dino: Dinosaur | null;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {dino && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-canopy-950/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative my-8 w-full max-w-lg rounded-3xl bg-canopy-900 p-5 ring-1 ring-cream/15 shadow-chunky sm:p-6"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="btn-chunky absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-canopy-950/70 text-cream ring-1 ring-cream/15 hover:bg-canopy-800"
            >
              ✕
            </button>
            <DinoDetail dino={dino} />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <ButtonLink variant="wood" href={`/dinosaurs/${dino.id}`}>
                Full page →
              </ButtonLink>
              <ButtonLink variant="leaf" href="/#play">
                ▶ Play quiz
              </ButtonLink>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Small link used on the landing page. */
export function CollectionSummaryLink() {
  const { discoveredIds } = useCollection();
  const total = DINOSAURS.length;
  const found = DINOSAURS.filter((d) => discoveredIds.has(d.id)).length;
  return (
    <Link
      href="/collection"
      className="rounded-full bg-canopy-950/50 px-3 py-1.5 ring-1 ring-cream/10 transition-colors hover:text-cream"
    >
      📖 Collection {found}/{total}
    </Link>
  );
}
