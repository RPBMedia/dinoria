/** Leaderboards.
 *
 * Local ("This device") always works — top scores in localStorage. The global
 * board uses Firestore and appears only when Firebase is configured; guests'
 * scores stay local (accounts unlock the global board, per PRD).
 */
import { firebaseApp, firebaseConfigured } from "@/config/firebase";
import type { GameResult, LeaderboardEntry } from "@/types/game";
import type { Player } from "./auth";

const LOCAL_KEY = "dinoria.scores";
const LOCAL_LIMIT = 20;
const GLOBAL_LIMIT = 25;

// ---- local ------------------------------------------------------------------

export function readLocalScores(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalScore(player: Player, result: GameResult): void {
  const entry: LeaderboardEntry = {
    name: player.name,
    score: result.score,
    mode: result.mode,
    difficulty: result.difficulty,
    accuracy: result.accuracy,
    finishedAt: result.finishedAt,
  };
  try {
    const all = [...readLocalScores(), entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, LOCAL_LIMIT);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* private mode — session only */
  }
}

// ---- global (Firestore) -----------------------------------------------------

export const globalLeaderboardAvailable = firebaseConfigured;

export async function submitGlobalScore(
  player: Player,
  result: GameResult,
): Promise<void> {
  const app = firebaseApp();
  if (!app || player.isGuest) return; // guests stay local
  const { getFirestore, collection, addDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );
  await addDoc(collection(getFirestore(app), "scores"), {
    uid: player.uid,
    name: player.name,
    score: result.score,
    mode: result.mode,
    difficulty: result.difficulty,
    accuracy: result.accuracy,
    finishedAt: serverTimestamp(),
  });
}

export async function fetchGlobalScores(): Promise<LeaderboardEntry[]> {
  const app = firebaseApp();
  if (!app) return [];
  const { getFirestore, collection, query, orderBy, limit, getDocs } =
    await import("firebase/firestore");
  const snap = await getDocs(
    query(
      collection(getFirestore(app), "scores"),
      orderBy("score", "desc"),
      limit(GLOBAL_LIMIT),
    ),
  );
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      name: (d.name as string) ?? "Explorer",
      score: (d.score as number) ?? 0,
      mode: d.mode,
      difficulty: d.difficulty,
      accuracy: (d.accuracy as number) ?? 0,
      finishedAt: d.finishedAt?.toMillis?.() ?? 0,
      uid: d.uid as string,
    } as LeaderboardEntry;
  });
}
