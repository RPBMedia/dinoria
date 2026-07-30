"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/services/auth";
import {
  fetchCloudCollection,
  readLocalCollection,
  saveCloudCollection,
  writeLocalCollection,
} from "@/services/collection";

/**
 * Reactive view of the player's dinosaur collection.
 *
 * Loads instantly from localStorage, then — for signed-in players — merges the
 * cloud copy (union of both, pushed back so nothing is ever lost when playing
 * across devices). `discover()` records new finds to local + cloud.
 */
export function useCollection() {
  const { player } = useAuth();
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [ready, setReady] = useState(false);

  // Local first — always available, even for guests.
  useEffect(() => {
    setDiscoveredIds(new Set(readLocalCollection()));
    setReady(true);
  }, []);

  // Merge the cloud collection once a signed-in player is known.
  useEffect(() => {
    if (player.isGuest) return;
    let cancelled = false;
    void fetchCloudCollection(player)
      .then((cloud) => {
        if (cancelled || cloud.length === 0) return;
        setDiscoveredIds((prev) => {
          const merged = new Set(prev);
          cloud.forEach((id) => merged.add(id));
          const arr = [...merged];
          writeLocalCollection(arr);
          // If the device had finds the cloud didn't, push the union up.
          if (arr.length !== cloud.length) void saveCloudCollection(player, arr);
          return merged;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [player]);

  const discover = useCallback(
    (ids: string[]) => {
      setDiscoveredIds((prev) => {
        const merged = new Set(prev);
        let changed = false;
        for (const id of ids)
          if (!merged.has(id)) {
            merged.add(id);
            changed = true;
          }
        if (changed) {
          const arr = [...merged];
          writeLocalCollection(arr);
          void saveCloudCollection(player, arr).catch(() => {});
        }
        return merged;
      });
    },
    [player],
  );

  return { discoveredIds, discover, ready };
}
