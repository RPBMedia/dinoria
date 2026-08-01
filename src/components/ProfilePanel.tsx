"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { useCollection } from "@/hooks/useCollection";
import { useExpeditions } from "@/hooks/useExpeditions";
import { ACHIEVEMENTS } from "@/lib/progress";
import { TOTAL_DINOSAURS } from "@/lib/dinosaurs";
import { MAX_STARS } from "@/lib/expeditions";
import { Card, Stat } from "@/components/ui";

export function ProfilePanel() {
  const { progress, level, ready, syncAchievements } = useProgress();
  const { discoveredIds } = useCollection();
  const exp = useExpeditions();

  const discovered = discoveredIds.size;

  // Catch achievements that became true from other stores (collection,
  // expeditions) even if not earned during a game just now.
  useEffect(() => {
    if (!ready) return;
    syncAchievements({
      discoveredCount: discovered,
      expeditionsCleared: exp.clearedCount,
      threeStarRegions: exp.threeStarCount,
    });
  }, [ready, discovered, exp.clearedCount, exp.threeStarCount, syncAchievements]);

  const earned = new Set(progress.achievements);
  const earnedCount = ACHIEVEMENTS.filter((a) => earned.has(a.id)).length;

  return (
    <div>
      {/* level */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-sun-400 to-sun-600 font-[family-name:var(--font-fredoka)] text-2xl font-700 text-canopy-950 shadow-chunky">
            {level.level}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-widest text-cream-faint">
              Level {level.level}
            </div>
            <div className="font-[family-name:var(--font-fredoka)] text-xl font-700 text-cream">
              {level.title}
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-canopy-950/70 ring-1 ring-cream/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-sun-400"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(level.progress * 100)}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 18 }}
              />
            </div>
            <div className="mt-1 text-xs text-cream-faint tabular-nums">
              {level.intoLevel} / {level.levelSpan} XP to level {level.level + 1}{" "}
              · {progress.xp.toLocaleString()} total
            </div>
          </div>
        </div>
      </Card>

      {/* stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Games played" value={progress.stats.gamesPlayed} accent="cream" />
        <Stat label="Correct answers" value={progress.stats.correctTotal} accent="leaf" />
        <Stat label="Best streak" value={progress.stats.bestStreak} accent="sun" />
        <Stat label="Discovered" value={`${discovered}/${TOTAL_DINOSAURS}`} accent="cream" />
        <Stat label="Expedition ★" value={`${exp.totalStars}/${MAX_STARS}`} accent="sun" />
        <Stat label="Daily streak" value={progress.daily.streak} accent="lava" />
      </div>

      {/* achievements */}
      <div className="mt-8">
        <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-700 text-cream">
          Achievements{" "}
          <span className="text-base font-400 text-cream-faint">
            · {earnedCount}/{ACHIEVEMENTS.length}
          </span>
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const got = earned.has(a.id);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-2xl p-3 ring-1 ${
                  got
                    ? "bg-canopy-800/60 ring-sun-400/30"
                    : "bg-canopy-950/40 ring-cream/5"
                }`}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl ${
                    got ? "bg-canopy-950/50" : "bg-canopy-950/50 grayscale"
                  }`}
                  aria-hidden
                >
                  {got ? a.emoji : "🔒"}
                </span>
                <div className="min-w-0">
                  <div
                    className={`font-600 ${got ? "text-cream" : "text-cream-faint"}`}
                  >
                    {a.name}
                  </div>
                  <div className="text-xs text-cream-dim">{a.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
