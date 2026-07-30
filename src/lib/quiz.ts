/** Pure quiz engine — question generation and scoring. No React, no I/O,
 * fully deterministic under a seeded RNG (see quiz.test.ts). */

import type { Dinosaur } from "@/types/dinosaur";
import type { GameDifficulty, GameMode, Question } from "@/types/game";
import { mulberry32, shuffle, type Rng } from "./rng";

// ---- configuration ----------------------------------------------------------

export const QUESTION_TIME_MS = 20_000;

/** Endless mode ends after this many wrong answers (kid-friendly 3 lives). */
export const ENDLESS_LIVES = 3;

export const MODE_QUESTION_COUNT: Record<Exclude<GameMode, "endless">, number> =
  {
    "10": 10,
    "25": 25,
    "50": 50,
  };

/** Which dinosaur tiers each game difficulty draws from, and its score
 * multiplier. M1 ships tiers 1–2 (see PRD milestones). */
export const DIFFICULTY_CONFIG: Record<
  GameDifficulty,
  { maxTier: number; multiplier: number; available: boolean }
> = {
  easy: { maxTier: 1, multiplier: 1, available: true },
  normal: { maxTier: 2, multiplier: 1.25, available: true },
  hard: { maxTier: 3, multiplier: 1.5, available: false },
  "very-hard": { maxTier: 4, multiplier: 1.75, available: false },
  legendary: { maxTier: 5, multiplier: 2, available: false },
};

const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 100;
const STREAK_STEP = 0.1;
const STREAK_CAP = 10;

// ---- pools ------------------------------------------------------------------

export function poolFor(
  dinosaurs: readonly Dinosaur[],
  difficulty: GameDifficulty,
): Dinosaur[] {
  const { maxTier } = DIFFICULTY_CONFIG[difficulty];
  return dinosaurs.filter((d) => d.difficulty <= maxTier);
}

// ---- distractors ------------------------------------------------------------

/** Relatedness score: same family is the strongest signal, then diet, then
 * period — so a T. rex question offers other large theropods, not sauropods. */
function relatedness(a: Dinosaur, b: Dinosaur): number {
  let score = 0;
  if (a.family === b.family) score += 4;
  if (a.diet === b.diet) score += 2;
  if (a.period === b.period) score += 1;
  return score;
}

export function pickDistractors(
  answer: Dinosaur,
  pool: readonly Dinosaur[],
  rng: Rng,
  count = 3,
): Dinosaur[] {
  const candidates = pool.filter((d) => d.id !== answer.id);
  // Sort by relatedness (desc) with random jitter so repeated questions about
  // the same dinosaur don't always show identical distractors.
  const ranked = candidates
    .map((d) => ({ d, key: relatedness(answer, d) + rng() * 2 }))
    .sort((x, y) => y.key - x.key)
    .map((x) => x.d);
  return ranked.slice(0, count);
}

// ---- question generation ----------------------------------------------------

/**
 * Build the question list for a game. Answers never repeat until the pool is
 * exhausted (then it reshuffles — relevant for endless mode with small pools).
 */
export function buildQuestions(
  pool: readonly Dinosaur[],
  count: number,
  rng: Rng = mulberry32(Date.now()),
): Question[] {
  if (pool.length < 4) {
    throw new Error("Need at least 4 dinosaurs to build a quiz.");
  }
  const questions: Question[] = [];
  let order = shuffle(pool, rng);
  for (let i = 0; i < count; i++) {
    if (order.length === 0) order = shuffle(pool, rng);
    const answer = order.pop()!;
    const options = shuffle([answer, ...pickDistractors(answer, pool, rng)], rng);
    questions.push({ answer, options });
  }
  return questions;
}

// ---- scoring ----------------------------------------------------------------

export interface ScoreInput {
  correct: boolean;
  /** Time taken to answer, ms. */
  elapsedMs: number;
  difficulty: GameDifficulty;
  /** Consecutive correct answers BEFORE this one. */
  streak: number;
}

/**
 * Points for one answer:
 *   base 100 × difficulty multiplier
 * + speed bonus: up to 100, linear in remaining time
 * × streak multiplier: 1 + 0.1×streak (capped at ×2)
 * Wrong answers score 0 and reset the streak.
 */
export function scoreAnswer(input: ScoreInput): number {
  if (!input.correct) return 0;
  const { multiplier } = DIFFICULTY_CONFIG[input.difficulty];
  const remaining = Math.max(0, QUESTION_TIME_MS - input.elapsedMs);
  const speedBonus = Math.round((remaining / QUESTION_TIME_MS) * MAX_SPEED_BONUS);
  const streakMultiplier =
    1 + Math.min(input.streak, STREAK_CAP) * STREAK_STEP;
  return Math.round((BASE_POINTS * multiplier + speedBonus) * streakMultiplier);
}
