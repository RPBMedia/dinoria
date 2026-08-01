/** Progression core (Milestone 4) — pure, testable logic for XP/levels,
 * achievements, and the daily challenge. No React, no I/O. */

import type { GameResult } from "@/types/game";
import { TOTAL_DINOSAURS } from "@/lib/dinosaurs";

// ---- XP & levels ------------------------------------------------------------

/** Cumulative XP required to *reach* a level. Triangular curve: gentle early,
 * steeper later. L1=0, L2=60, L3=180, L4=360, L5=600, L6=900 … */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 30 * (l - 1) * l;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

const LEVEL_TITLES = [
  "Fossil Pup", // 1
  "Trail Scout", // 2
  "Junior Ranger", // 3
  "Field Explorer", // 4
  "Bone Hunter", // 5
  "Dino Tracker", // 6
  "Expedition Lead", // 7
  "Museum Curator", // 8
  "Palaeontologist", // 9
  "Legendary Explorer", // 10+
];

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1];
}

export interface LevelView {
  level: number;
  title: string;
  /** XP into the current level. */
  intoLevel: number;
  /** XP span of the current level. */
  levelSpan: number;
  /** 0..1 progress to next level. */
  progress: number;
}

export function levelView(xp: number): LevelView {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = next - base;
  const into = xp - base;
  return {
    level,
    title: levelTitle(level),
    intoLevel: into,
    levelSpan: span,
    progress: span > 0 ? into / span : 1,
  };
}

// ---- XP awards --------------------------------------------------------------

export function quizXp(result: GameResult, newDiscoveries: number): number {
  const perfect = result.totalQuestions > 0 && result.accuracy >= 1 ? 40 : 0;
  return result.correctCount * 8 + perfect + newDiscoveries * 12;
}

export function expeditionXp(
  stars: number,
  correct: number,
  newDiscoveries: number,
): number {
  return stars * 30 + correct * 4 + newDiscoveries * 12;
}

export function dailyXp(correct: number, streak: number): number {
  return 30 + correct * 10 + Math.min(streak, 10) * 5;
}

// ---- progress shape ---------------------------------------------------------

export interface PlayerStats {
  gamesPlayed: number;
  correctTotal: number;
  perfectGames: number;
  bestStreak: number;
}

export interface DailyState {
  /** YYYY-MM-DD of the last completed daily, or null. */
  lastCompletedDate: string | null;
  streak: number;
  bestStreak: number;
}

export interface PlayerProgress {
  xp: number;
  stats: PlayerStats;
  achievements: string[];
  daily: DailyState;
}

export function emptyProgress(): PlayerProgress {
  return {
    xp: 0,
    stats: { gamesPlayed: 0, correctTotal: 0, perfectGames: 0, bestStreak: 0 },
    achievements: [],
    daily: { lastCompletedDate: null, streak: 0, bestStreak: 0 },
  };
}

// ---- achievements -----------------------------------------------------------

/** External counts (from the collection & expedition stores) the evaluator
 * needs on top of the progress object. */
export interface AchievementContext {
  progress: PlayerProgress;
  discoveredCount: number;
  expeditionsCleared: number;
  threeStarRegions: number;
}

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: (c: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "welcome", emoji: "🥚", name: "First Steps", description: "Play your first game.", earned: (c) => c.progress.stats.gamesPlayed >= 1 },
  { id: "sharp-eye", emoji: "🔍", name: "Sharp Eye", description: "Get 50 correct answers.", earned: (c) => c.progress.stats.correctTotal >= 50 },
  { id: "eagle-eye", emoji: "🦅", name: "Eagle Eye", description: "Get 250 correct answers.", earned: (c) => c.progress.stats.correctTotal >= 250 },
  { id: "flawless", emoji: "💯", name: "Flawless", description: "Finish a round with 100% accuracy.", earned: (c) => c.progress.stats.perfectGames >= 1 },
  { id: "on-fire", emoji: "🔥", name: "On Fire", description: "Reach a streak of 5.", earned: (c) => c.progress.stats.bestStreak >= 5 },
  { id: "inferno", emoji: "☄️", name: "Inferno", description: "Reach a streak of 10.", earned: (c) => c.progress.stats.bestStreak >= 10 },
  { id: "collector-10", emoji: "📗", name: "Budding Collector", description: "Discover 10 dinosaurs.", earned: (c) => c.discoveredCount >= 10 },
  { id: "collector-50", emoji: "📘", name: "Seasoned Collector", description: "Discover 50 dinosaurs.", earned: (c) => c.discoveredCount >= 50 },
  { id: "collector-all", emoji: "🏆", name: "Master Collector", description: "Discover every dinosaur.", earned: (c) => c.discoveredCount >= TOTAL_DINOSAURS },
  { id: "pathfinder", emoji: "🧭", name: "Pathfinder", description: "Clear your first expedition region.", earned: (c) => c.expeditionsCleared >= 1 },
  { id: "trailblazer", emoji: "⭐", name: "Trailblazer", description: "Clear 5 expedition regions.", earned: (c) => c.expeditionsCleared >= 5 },
  { id: "star-explorer", emoji: "🌟", name: "Star Explorer", description: "Earn 3 stars in a region.", earned: (c) => c.threeStarRegions >= 1 },
  { id: "daily-3", emoji: "📅", name: "Regular", description: "Reach a 3-day daily streak.", earned: (c) => c.progress.daily.bestStreak >= 3 },
  { id: "daily-7", emoji: "🗓️", name: "Dedicated", description: "Reach a 7-day daily streak.", earned: (c) => c.progress.daily.bestStreak >= 7 },
  { id: "level-5", emoji: "🎖️", name: "Rising Star", description: "Reach level 5.", earned: (c) => levelForXp(c.progress.xp) >= 5 },
  { id: "level-10", emoji: "👑", name: "Legend", description: "Reach level 10.", earned: (c) => levelForXp(c.progress.xp) >= 10 },
];

/** Ids newly earned given the context (satisfied but not already recorded). */
export function newlyEarned(c: AchievementContext): string[] {
  const have = new Set(c.progress.achievements);
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.earned(c)).map(
    (a) => a.id,
  );
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// ---- daily challenge --------------------------------------------------------

/** Local calendar date as YYYY-MM-DD. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Deterministic uint32 seed from a date key — everyone gets the same daily. */
export function dailySeed(dateKey: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isYesterday(prev: string, today: string): boolean {
  const p = new Date(prev + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  return Math.round((t.getTime() - p.getTime()) / 86400000) === 1;
}

/** Fold a completed daily into the streak. Same day again = no change. */
export function applyDaily(daily: DailyState, today: string): DailyState {
  if (daily.lastCompletedDate === today) return daily; // already done today
  const streak =
    daily.lastCompletedDate && isYesterday(daily.lastCompletedDate, today)
      ? daily.streak + 1
      : 1;
  return {
    lastCompletedDate: today,
    streak,
    bestStreak: Math.max(daily.bestStreak, streak),
  };
}

export function dailyDoneToday(daily: DailyState, today = todayKey()): boolean {
  return daily.lastCompletedDate === today;
}
