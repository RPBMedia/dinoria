/** Player progression persistence (XP, stats, achievements, daily).
 * Local-first, with an optional Firestore sync (`progress/{uid}`) for
 * signed-in players — the same pattern as collection & expeditions. Merging
 * always keeps the better value so nothing is lost across devices. */
import { firebaseApp, firebaseConfigured } from "@/config/firebase";
import { emptyProgress, type PlayerProgress } from "@/lib/progress";
import type { Player } from "./auth";

const LOCAL_KEY = "dinoria.progress";

export function mergeProgress(
  a: PlayerProgress,
  b: PlayerProgress,
): PlayerProgress {
  const later =
    (b.daily.lastCompletedDate ?? "") > (a.daily.lastCompletedDate ?? "")
      ? b.daily
      : a.daily;
  return {
    xp: Math.max(a.xp, b.xp),
    stats: {
      gamesPlayed: Math.max(a.stats.gamesPlayed, b.stats.gamesPlayed),
      correctTotal: Math.max(a.stats.correctTotal, b.stats.correctTotal),
      perfectGames: Math.max(a.stats.perfectGames, b.stats.perfectGames),
      bestStreak: Math.max(a.stats.bestStreak, b.stats.bestStreak),
    },
    achievements: [...new Set([...a.achievements, ...b.achievements])],
    daily: {
      lastCompletedDate: later.lastCompletedDate,
      streak: later.streak,
      bestStreak: Math.max(a.daily.bestStreak, b.daily.bestStreak),
    },
  };
}

// ---- local ------------------------------------------------------------------

export function readLocalProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...(JSON.parse(raw) as PlayerProgress) };
  } catch {
    return emptyProgress();
  }
}

export function writeLocalProgress(p: PlayerProgress): void {
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
): Promise<PlayerProgress | null> {
  const app = firebaseApp();
  if (!app || player.isGuest) return null;
  const { getFirestore, doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(getFirestore(app), "progress", player.uid));
  const data = snap.data()?.progress as PlayerProgress | undefined;
  return data ? { ...emptyProgress(), ...data } : null;
}

export async function saveCloudProgress(
  player: Player,
  p: PlayerProgress,
): Promise<void> {
  const app = firebaseApp();
  if (!app || player.isGuest) return;
  const { getFirestore, doc, setDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );
  await setDoc(
    doc(getFirestore(app), "progress", player.uid),
    { progress: p, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
