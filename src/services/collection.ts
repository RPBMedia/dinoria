/** The Collection — every dinosaur a player has correctly identified.
 *
 * Discoveries always persist locally (works for guests, offline, private mode).
 * When Firebase is configured and the player is signed in, the collection also
 * syncs to Firestore (doc `collections/{uid}`) so it follows them across
 * devices — mirroring how the leaderboard treats local vs. global.
 */
import { firebaseApp, firebaseConfigured } from "@/config/firebase";
import type { Player } from "./auth";

const LOCAL_KEY = "dinoria.collection";

// ---- local ------------------------------------------------------------------

export function readLocalCollection(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalCollection(ids: string[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* private mode — session only */
  }
}

// ---- cloud (Firestore) ------------------------------------------------------

export const cloudCollectionAvailable = firebaseConfigured;

export async function fetchCloudCollection(player: Player): Promise<string[]> {
  const app = firebaseApp();
  if (!app || player.isGuest) return [];
  const { getFirestore, doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(getFirestore(app), "collections", player.uid));
  return (snap.data()?.discovered as string[] | undefined) ?? [];
}

export async function saveCloudCollection(
  player: Player,
  ids: string[],
): Promise<void> {
  const app = firebaseApp();
  if (!app || player.isGuest) return; // guests stay local
  const { getFirestore, doc, setDoc, serverTimestamp } = await import(
    "firebase/firestore"
  );
  await setDoc(
    doc(getFirestore(app), "collections", player.uid),
    { discovered: [...new Set(ids)], updatedAt: serverTimestamp() },
    { merge: true },
  );
}
