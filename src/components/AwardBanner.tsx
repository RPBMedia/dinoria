"use client";

import { motion } from "framer-motion";
import type { RecordOutcome } from "@/hooks/useProgress";
import { getAchievement } from "@/lib/progress";
import { Card } from "@/components/ui";

/** Shows the rewards from a finished game: XP gained, any level-up, and newly
 * unlocked achievements. Renders nothing when there's nothing to celebrate. */
export function AwardBanner({ outcome }: { outcome: RecordOutcome | null }) {
  if (!outcome) return null;
  const { xpGain, newAchievements, leveledTo } = outcome;
  if (xpGain <= 0 && newAchievements.length === 0 && leveledTo == null)
    return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="mt-6 p-4">
        {xpGain > 0 && (
          <div className="text-center">
            <span className="font-[family-name:var(--font-fredoka)] text-lg font-700 text-sun-300">
              +{xpGain} XP
            </span>
          </div>
        )}
        {leveledTo != null && (
          <div className="mt-1 text-center font-700 text-leaf-300">
            ⬆️ Level up! You reached level {leveledTo}
          </div>
        )}
        {newAchievements.length > 0 && (
          <div className="mt-3">
            <div className="text-center text-xs uppercase tracking-wider text-cream-faint">
              New achievement{newAchievements.length > 1 ? "s" : ""}
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {newAchievements.map((id) => {
                const a = getAchievement(id);
                if (!a) return null;
                return (
                  <motion.span
                    key={id}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 16 }}
                    className="flex items-center gap-1.5 rounded-full bg-canopy-950/50 px-3 py-1.5 ring-1 ring-sun-400/30"
                  >
                    <span aria-hidden>{a.emoji}</span>
                    <span className="text-sm font-600 text-cream">{a.name}</span>
                  </motion.span>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
