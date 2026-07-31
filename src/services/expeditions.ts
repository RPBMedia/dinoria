/** Expedition progress persistence.
 *
 * Local-first (works for guests/offline); syncs to Firestore
 * (`expeditions/{uid}`) for signed-in players — the same pattern as the
 * Collection. Merging always keeps the BEST result per region so progress is
 * never lost across devices. */
import { firebaseApp, firebaseConfigured } from "@/config/firebase";
import type { ExpeditionProgress, RegionRecord } from "@/types/game";
import type { Player } from "./auth";

const LOCAL_KEY = "dinoria.expeditions";

/** Combine two progress maps, keeping the better record per region. */
export function mergeProgress(
  a: ExpeditionProgress,
  b: ExpeditionProgress,
): ExpeditionProgress {
  const out: ExpeditionProgress = { ...a };
  for (const [id, rec] of Object.entries(b)) {
    const cur = out[id];
    out[id] = cur
      ? {
          stars: Math.max(cur.stars, rec.stars),
          bestScore: Math.max(cur.bestScore, rec.bestScore),
        }
      : rec;
  }
  return out;
}

/** Apply one region result, keeping it only if it beats the stored best. */
export function applyResult(
  progress: ExpeditionProgress,
  regionId: string,
  result: RegionRecord,
): ExpeditionProgress {
  return mergeProgress(progress, { [regionId]: result });
}

// ---- local ------------------------------------------------------------------

export function readLocalProgress(): ExpeditionProgress {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as ExpeditionProgress) : {};
  } catch {
    return {};
  }
}

export function writeLocalProgress(p: ExpeditionProgress): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(p));
  } catch {
    /* private mode — session only */
  }
}

// ---- cloud (Firestore) ------------------------------------------------------

export const cloudProgressAvailable = firebaseConfigured;

export async function fetchCloudProgress(
  player: Player,
): Promise<ExpeditionProgress> {
  const app = firebaseApp();
  if (!app || player.isGuest) return {};
  const { getFirestore, doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(getFirestore(app), "expeditions", player.uid));
  return (snap.data()?.regions as ExpeditionProgress | undefined) ?? {};
}

export async function saveCloudProgress(
  player: Player,
  p: ExpeditionProgress,
): Promise<void> {
  const app = firebaseApp();
  if (!app || player.isGuest) return; // guests stay local
  const { getFirestore, doc, setDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );
  await setDoc(
    doc(getFirestore(app), "expeditions", player.uid),
    { regions: p, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
