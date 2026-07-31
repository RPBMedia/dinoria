"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExpeditionProgress } from "@/types/game";
import { useAuth } from "@/services/auth";
import {
  applyResult,
  fetchCloudProgress,
  mergeProgress,
  readLocalProgress,
  saveCloudProgress,
  writeLocalProgress,
} from "@/services/expeditions";
import {
  isRegionUnlocked,
  totalStars,
  type StarMap,
} from "@/lib/expeditions";

/** Reactive expedition progression: which regions are unlocked, stars earned,
 * and best scores. Local-first with a cloud merge for signed-in players. */
export function useExpeditions() {
  const { player } = useAuth();
  const [progress, setProgress] = useState<ExpeditionProgress>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(readLocalProgress());
    setReady(true);
  }, []);

  useEffect(() => {
    if (player.isGuest) return;
    let cancelled = false;
    void fetchCloudProgress(player)
      .then((cloud) => {
        if (cancelled || Object.keys(cloud).length === 0) return;
        setProgress((prev) => {
          const merged = mergeProgress(prev, cloud);
          writeLocalProgress(merged);
          void saveCloudProgress(player, merged).catch(() => {});
          return merged;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [player]);

  const starMap: StarMap = useMemo(() => {
    const m: StarMap = {};
    for (const [id, rec] of Object.entries(progress)) m[id] = rec.stars;
    return m;
  }, [progress]);

  /** Record a region result; keeps it only if it beats the stored best. */
  const recordResult = useCallback(
    (regionId: string, stars: number, score: number) => {
      setProgress((prev) => {
        const merged = applyResult(prev, regionId, { stars, bestScore: score });
        writeLocalProgress(merged);
        void saveCloudProgress(player, merged).catch(() => {});
        return merged;
      });
    },
    [player],
  );

  const isUnlocked = useCallback(
    (regionId: string) => isRegionUnlocked(regionId, starMap),
    [starMap],
  );

  return {
    progress,
    starMap,
    ready,
    recordResult,
    isUnlocked,
    stars: (id: string) => progress[id]?.stars ?? 0,
    totalStars: totalStars(starMap),
  };
}
