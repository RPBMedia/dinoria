/** Thin, typed wrapper over Vercel Analytics custom events. Safe to call
 * anywhere on the client — it's a no-op when analytics isn't enabled. */
import { track } from "@vercel/analytics";
import type { GameDifficulty, GameMode } from "@/types/game";

export function trackQuizStarted(mode: GameMode, difficulty: GameDifficulty) {
  track("quiz_started", { mode, difficulty });
}

export function trackQuizFinished(p: {
  mode: GameMode;
  difficulty: GameDifficulty;
  score: number;
  accuracyPct: number;
  correct: number;
  total: number;
}) {
  track("quiz_finished", p);
}

export function trackExpeditionStarted(regionId: string) {
  track("expedition_started", { region: regionId });
}

export function trackExpeditionFinished(p: {
  region: string;
  stars: number;
  correct: number;
  total: number;
}) {
  track("expedition_finished", p);
}

export function trackSignIn(method: "google" | "email" | "email_signup") {
  track("sign_in", { method });
}
