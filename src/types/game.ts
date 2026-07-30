import type { Dinosaur } from "./dinosaur";

export type GameMode = "10" | "25" | "50" | "endless";

export type GameDifficulty =
  | "easy"
  | "normal"
  | "hard"
  | "very-hard"
  | "legendary";

export interface Question {
  /** The dinosaur being shown. */
  answer: Dinosaur;
  /** Four options (answer + 3 related distractors), pre-shuffled. */
  options: Dinosaur[];
}

export interface AnswerRecord {
  dinosaurId: string;
  correct: boolean;
  /** Milliseconds the player took to answer (capped at the time limit). */
  elapsedMs: number;
  /** Points awarded for this answer. */
  points: number;
  /** Streak value AFTER this answer. */
  streak: number;
}

export interface GameResult {
  mode: GameMode;
  difficulty: GameDifficulty;
  score: number;
  totalQuestions: number;
  correctCount: number;
  /** 0..1 */
  accuracy: number;
  longestStreak: number;
  /** Fastest correct answer in ms; null when no correct answers. */
  fastestAnswerMs: number | null;
  /** Dinosaur ids answered correctly this game (feeds the collection). */
  discoveredIds: string[];
  finishedAt: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  mode: GameMode;
  difficulty: GameDifficulty;
  accuracy: number;
  finishedAt: number;
  /** Present for cloud entries. */
  uid?: string;
}
