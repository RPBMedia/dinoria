"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { GameResult } from "@/types/game";
import { DINOSAURS } from "@/lib/dinosaurs";
import { starsFor } from "@/lib/quiz";
import {
  LANDS,
  MAX_STARS,
  nextRegionId,
  regionAnswerPool,
  getRegion,
  isRegionUnlocked,
  type ExpeditionLand,
  type ExpeditionRegion,
} from "@/lib/expeditions";
import { useExpeditions } from "@/hooks/useExpeditions";
import { useCollection } from "@/hooks/useCollection";
import {
  trackExpeditionFinished,
  trackExpeditionStarted,
} from "@/lib/analytics";
import { QuizGame } from "@/components/QuizGame";
import { Button } from "@/components/ui";

const THEME: Record<
  ExpeditionLand["theme"],
  { ring: string; badge: string; glow: string; accent: string }
> = {
  triassic: {
    ring: "ring-lava-400/30",
    badge: "bg-lava-500/15 text-lava-300 ring-lava-400/30",
    glow: "from-lava-900/40 to-canopy-950/60",
    accent: "text-lava-300",
  },
  jurassic: {
    ring: "ring-leaf-400/30",
    badge: "bg-leaf-500/15 text-leaf-300 ring-leaf-400/30",
    glow: "from-leaf-900/40 to-canopy-950/60",
    accent: "text-leaf-300",
  },
  cretaceous: {
    ring: "ring-sun-400/30",
    badge: "bg-sun-500/15 text-sun-300 ring-sun-400/30",
    glow: "from-canopy-800/50 to-canopy-950/70",
    accent: "text-sun-300",
  },
};

function Stars({ earned, className = "" }: { earned: number; className?: string }) {
  return (
    <span className={`tracking-tight ${className}`} aria-label={`${earned} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= earned ? "text-sun-400" : "text-cream/20"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ExpeditionsMap() {
  const exp = useExpeditions();
  const { discover } = useCollection();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);

  const active = activeId ? getRegion(activeId) : null;

  function play(region: ExpeditionRegion) {
    trackExpeditionStarted(region.id);
    setActiveId(region.id);
    setRunKey((k) => k + 1);
  }

  return (
    <div>
      {/* progress header */}
      <div className="rounded-3xl bg-canopy-900/70 p-5 ring-1 ring-cream/10 shadow-chunky backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-cream-faint">
              Expedition stars
            </div>
            <div className="font-[family-name:var(--font-fredoka)] text-3xl font-700 text-cream">
              <span className="text-sun-400 tabular-nums">{exp.totalStars}</span>
              <span className="text-cream-faint"> / {MAX_STARS}</span>
              <span className="ml-1 text-sun-400">★</span>
            </div>
          </div>
          <p className="max-w-[14rem] text-right text-sm text-cream-dim">
            Journey through three ages of dinosaurs. Clear a region to unlock the
            next.
          </p>
        </div>
      </div>

      {/* lands */}
      {!exp.ready ? (
        <p className="py-16 text-center text-cream-faint">Charting the map…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {LANDS.map((land) => {
            const t = THEME[land.theme];
            const landUnlocked = isRegionUnlocked(land.regions[0].id, exp.starMap);
            return (
              <section
                key={land.id}
                className={`overflow-hidden rounded-3xl bg-gradient-to-b ${t.glow} p-5 ring-1 ${t.ring}`}
              >
                <div className="flex items-center gap-3">
                  <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-700 text-cream">
                    {land.name}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-600 uppercase tracking-wider ring-1 ${t.badge}`}
                  >
                    {land.period}
                  </span>
                  {!landUnlocked && (
                    <span className="ml-auto text-sm text-cream-faint">🔒 Locked</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-cream-dim">{land.subtitle}</p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {land.regions.map((region, i) => {
                    const unlocked = isRegionUnlocked(region.id, exp.starMap);
                    const stars = exp.stars(region.id);
                    const cleared = stars >= 1;
                    return (
                      <button
                        key={region.id}
                        disabled={!unlocked}
                        onClick={() => play(region)}
                        className={`btn-chunky flex flex-col rounded-2xl p-4 text-left ring-1 ${
                          unlocked
                            ? "bg-canopy-800/70 ring-cream/15 hover:bg-canopy-700/80"
                            : "cursor-not-allowed bg-canopy-950/40 ring-cream/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-mono text-xs ${unlocked ? t.accent : "text-cream-faint"}`}
                          >
                            Region {i + 1}
                          </span>
                          {unlocked ? (
                            <Stars earned={stars} />
                          ) : (
                            <span className="text-sm">🔒</span>
                          )}
                        </div>
                        <span
                          className={`mt-1 font-[family-name:var(--font-fredoka)] font-700 ${
                            unlocked ? "text-cream" : "text-cream-faint"
                          }`}
                        >
                          {region.name}
                        </span>
                        <span className="mt-0.5 text-xs text-cream-dim">
                          {unlocked ? region.blurb : "Clear the previous region to unlock."}
                        </span>
                        {unlocked && (
                          <span className="mt-3 text-xs font-600 text-cream-faint">
                            {region.questionCount} questions ·{" "}
                            {cleared ? "Replay ▶" : "Start ▶"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* expedition run (fullscreen portal) */}
      {active &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-canopy-950">
            <div className="mx-auto w-full max-w-3xl px-4 pt-4">
              <p className="text-center text-sm uppercase tracking-widest text-cream-faint">
                Expedition · {active.name}
              </p>
            </div>
            <QuizGame
              key={runKey}
              mode="10"
              difficulty={active.difficulty}
              onExit={() => setActiveId(null)}
              gameOptions={{
                answerPool: regionAnswerPool(active),
                distractorPool: DINOSAURS,
                questionCount: active.questionCount,
              }}
              renderResult={(result) => (
                <ExpeditionResult
                  region={active}
                  result={result}
                  onRecord={exp.recordResult}
                  onDiscover={discover}
                  onRetry={() => setRunKey((k) => k + 1)}
                  onNext={(nextId) => {
                    setActiveId(nextId);
                    setRunKey((k) => k + 1);
                  }}
                  onMap={() => setActiveId(null)}
                  isUnlockedAfter={(id, thisStars) =>
                    isRegionUnlocked(id, {
                      ...exp.starMap,
                      [active.id]: Math.max(exp.stars(active.id), thisStars),
                    })
                  }
                />
              )}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

function ExpeditionResult({
  region,
  result,
  onRecord,
  onDiscover,
  onRetry,
  onNext,
  onMap,
  isUnlockedAfter,
}: {
  region: ExpeditionRegion;
  result: GameResult;
  onRecord: (regionId: string, stars: number, score: number) => void;
  onDiscover: (ids: string[]) => void;
  onRetry: () => void;
  onNext: (nextId: string) => void;
  onMap: () => void;
  isUnlockedAfter: (regionId: string, stars: number) => boolean;
}) {
  const stars = starsFor(result.correctCount, result.totalQuestions);
  const cleared = stars >= 1;

  // Persist stars + discoveries exactly once, after render (StrictMode guard).
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    onRecord(region.id, stars, result.score);
    onDiscover(result.discoveredIds);
    trackExpeditionFinished({
      region: region.id,
      stars,
      correct: result.correctCount,
      total: result.totalQuestions,
    });
  }, [region.id, stars, result, onRecord, onDiscover]);

  const nextId = nextRegionId(region.id);
  const nextUnlocked = nextId ? isUnlockedAfter(nextId, stars) : false;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <div className="text-5xl">{cleared ? "🧭" : "🌋"}</div>
        <h1 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-700 text-cream">
          {cleared ? "Region cleared!" : "Not quite!"}
        </h1>
        <p className="mt-1 text-cream-dim">{region.name}</p>
      </motion.div>

      {/* stars */}
      <div className="mt-5 flex justify-center gap-2 text-5xl">
        {[1, 2, 3].map((n) => (
          <motion.span
            key={n}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15 + n * 0.15, type: "spring", stiffness: 260, damping: 14 }}
            className={n <= stars ? "text-sun-400" : "text-cream/15"}
          >
            ★
          </motion.span>
        ))}
      </div>

      <p className="mt-4 text-cream-dim">
        You identified{" "}
        <span className="font-700 text-cream">
          {result.correctCount}/{result.totalQuestions}
        </span>{" "}
        dinosaurs · {result.score.toLocaleString()} pts
      </p>
      {!cleared && (
        <p className="mt-1 text-sm text-cream-faint">
          Score at least 50% to clear this region.
        </p>
      )}

      <div className="mt-7 grid grid-cols-2 gap-3">
        {nextId && nextUnlocked ? (
          <Button variant="leaf" size="lg" onClick={() => onNext(nextId)}>
            Next region →
          </Button>
        ) : (
          <Button variant="leaf" size="lg" onClick={onRetry}>
            {cleared ? "Play again" : "Try again"}
          </Button>
        )}
        <Button variant="wood" size="lg" onClick={onMap}>
          🗺️ Map
        </Button>
        {nextId && nextUnlocked && (
          <Button variant="wood" onClick={onRetry} className="col-span-2">
            Replay this region
          </Button>
        )}
      </div>
    </div>
  );
}
