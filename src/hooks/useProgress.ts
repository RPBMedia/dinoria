"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameResult } from "@/types/game";
import { useAuth } from "@/services/auth";
import {
  fetchCloudProgress,
  mergeProgress,
  readLocalProgress,
  saveCloudProgress,
  writeLocalProgress,
} from "@/services/progress";
import {
  applyDaily,
  dailyXp,
  emptyProgress,
  expeditionXp,
  levelForXp,
  levelView,
  newlyEarned,
  quizXp,
  todayKey,
  type PlayerProgress,
} from "@/lib/progress";

/** External counts (from the collection & expedition stores) needed to
 * evaluate collection/expedition achievements. */
export interface ProgressContext {
  discoveredCount: number;
  expeditionsCleared: number;
  threeStarRegions: number;
}

export interface RecordOutcome {
  xpGain: number;
  newAchievements: string[];
  leveledTo: number | null;
}

const ZERO_CTX: ProgressContext = {
  discoveredCount: 0,
  expeditionsCleared: 0,
  threeStarRegions: 0,
};

export function useProgress() {
  const { player } = useAuth();
  const [progress, setProgress] = useState<PlayerProgress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const ref = useRef<PlayerProgress>(progress);

  const commit = useCallback(
    (next: PlayerProgress) => {
      ref.current = next;
      setProgress(next);
      writeLocalProgress(next);
      void saveCloudProgress(player, next).catch(() => {});
    },
    [player],
  );

  useEffect(() => {
    const local = readLocalProgress();
    ref.current = local;
    setProgress(local);
    setReady(true);
  }, []);

  useEffect(() => {
    if (player.isGuest) return;
    let cancelled = false;
    void fetchCloudProgress(player)
      .then((cloud) => {
        if (cancelled || !cloud) return;
        const merged = mergeProgress(ref.current, cloud);
        ref.current = merged;
        setProgress(merged);
        writeLocalProgress(merged);
        void saveCloudProgress(player, merged).catch(() => {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [player]);

  /** Apply an XP + stats delta, unlock any newly-earned achievements, persist,
   * and report what happened (for toasts). */
  const applyAward = useCallback(
    (
      mutate: (p: PlayerProgress) => PlayerProgress,
      ctx: ProgressContext,
    ): RecordOutcome => {
      const before = ref.current;
      const mutated = mutate(before);
      const fresh = newlyEarned({ progress: mutated, ...ctx });
      const next: PlayerProgress = {
        ...mutated,
        achievements: [...mutated.achievements, ...fresh],
      };
      const leveledTo =
        levelForXp(next.xp) > levelForXp(before.xp) ? levelForXp(next.xp) : null;
      commit(next);
      return { xpGain: next.xp - before.xp, newAchievements: fresh, leveledTo };
    },
    [commit],
  );

  const recordQuiz = useCallback(
    (result: GameResult, newDiscoveries: number, ctx: ProgressContext) =>
      applyAward(
        (p) => ({
          ...p,
          xp: p.xp + quizXp(result, newDiscoveries),
          stats: {
            gamesPlayed: p.stats.gamesPlayed + 1,
            correctTotal: p.stats.correctTotal + result.correctCount,
            perfectGames:
              p.stats.perfectGames +
              (result.totalQuestions > 0 && result.accuracy >= 1 ? 1 : 0),
            bestStreak: Math.max(p.stats.bestStreak, result.longestStreak),
          },
        }),
        ctx,
      ),
    [applyAward],
  );

  const recordExpedition = useCallback(
    (
      stars: number,
      result: GameResult,
      newDiscoveries: number,
      ctx: ProgressContext,
    ) =>
      applyAward(
        (p) => ({
          ...p,
          xp: p.xp + expeditionXp(stars, result.correctCount, newDiscoveries),
          stats: {
            ...p.stats,
            bestStreak: Math.max(p.stats.bestStreak, result.longestStreak),
          },
        }),
        ctx,
      ),
    [applyAward],
  );

  const recordDaily = useCallback(
    (result: GameResult, newDiscoveries: number, ctx: ProgressContext) =>
      applyAward((p) => {
        const daily = applyDaily(p.daily, todayKey());
        // Only award daily XP the first completion of the day.
        const firstToday = p.daily.lastCompletedDate !== todayKey();
        const gain = firstToday
          ? dailyXp(result.correctCount, daily.streak)
          : 0;
        return {
          ...p,
          xp: p.xp + gain + newDiscoveries * 12,
          daily,
          stats: {
            ...p.stats,
            correctTotal: p.stats.correctTotal + result.correctCount,
            bestStreak: Math.max(p.stats.bestStreak, result.longestStreak),
          },
        };
      }, ctx),
    [applyAward],
  );

  /** Re-check achievements from external stores loading in (e.g. collection
   * count arrives after mount) without changing XP. */
  const syncAchievements = useCallback(
    (ctx: ProgressContext) => {
      const fresh = newlyEarned({ progress: ref.current, ...ctx });
      if (fresh.length === 0) return [];
      commit({
        ...ref.current,
        achievements: [...ref.current.achievements, ...fresh],
      });
      return fresh;
    },
    [commit],
  );

  const level = useMemo(() => levelView(progress.xp), [progress.xp]);

  return {
    progress,
    level,
    ready,
    recordQuiz,
    recordExpedition,
    recordDaily,
    syncAchievements,
    ZERO_CTX,
  };
}
