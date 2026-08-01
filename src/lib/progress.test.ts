import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  applyDaily,
  dailySeed,
  emptyProgress,
  levelForXp,
  levelView,
  newlyEarned,
  quizXp,
  xpForLevel,
  type AchievementContext,
} from "./progress";

describe("levels", () => {
  it("has a rising triangular XP curve", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(60);
    expect(xpForLevel(3)).toBe(180);
    expect(xpForLevel(5)).toBe(600);
  });

  it("maps xp back to the right level", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(59)).toBe(1);
    expect(levelForXp(60)).toBe(2);
    expect(levelForXp(179)).toBe(2);
    expect(levelForXp(600)).toBe(5);
  });

  it("reports progress into the current level", () => {
    const v = levelView(120); // level 2 (base 60, next 180, span 120)
    expect(v.level).toBe(2);
    expect(v.intoLevel).toBe(60);
    expect(v.levelSpan).toBe(120);
    expect(v.progress).toBeCloseTo(0.5);
  });
});

describe("xp awards", () => {
  it("rewards correct answers, perfect bonus and discoveries", () => {
    const base = {
      mode: "10" as const,
      difficulty: "normal" as const,
      score: 0,
      totalQuestions: 10,
      correctCount: 8,
      accuracy: 0.8,
      longestStreak: 4,
      fastestAnswerMs: 100,
      discoveredIds: [],
      finishedAt: 0,
    };
    expect(quizXp(base, 0)).toBe(64); // 8*8
    expect(quizXp({ ...base, correctCount: 10, accuracy: 1 }, 2)).toBe(
      10 * 8 + 40 + 2 * 12,
    );
  });
});

describe("achievements", () => {
  const ctx = (over: Partial<AchievementContext>): AchievementContext => ({
    progress: emptyProgress(),
    discoveredCount: 0,
    expeditionsCleared: 0,
    threeStarRegions: 0,
    ...over,
  });

  it("has unique ids", () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(
      ACHIEVEMENTS.length,
    );
  });

  it("unlocks welcome after one game and not before", () => {
    const p = emptyProgress();
    expect(newlyEarned(ctx({ progress: p }))).not.toContain("welcome");
    p.stats.gamesPlayed = 1;
    expect(newlyEarned(ctx({ progress: p }))).toContain("welcome");
  });

  it("does not re-award an already-earned achievement", () => {
    const p = emptyProgress();
    p.stats.gamesPlayed = 1;
    p.achievements = ["welcome"];
    expect(newlyEarned(ctx({ progress: p }))).not.toContain("welcome");
  });

  it("unlocks collection + level achievements from context", () => {
    expect(newlyEarned(ctx({ discoveredCount: 50 }))).toContain("collector-50");
    const p = emptyProgress();
    p.xp = 600;
    expect(newlyEarned(ctx({ progress: p }))).toContain("level-5");
  });
});

describe("daily streak", () => {
  it("starts a streak and increments on consecutive days", () => {
    let d = applyDaily(emptyProgress().daily, "2026-08-01");
    expect(d.streak).toBe(1);
    expect(d.lastCompletedDate).toBe("2026-08-01");
    d = applyDaily(d, "2026-08-02");
    expect(d.streak).toBe(2);
    expect(d.bestStreak).toBe(2);
  });

  it("resets when a day is missed, keeping best", () => {
    let d = applyDaily(emptyProgress().daily, "2026-08-01");
    d = applyDaily(d, "2026-08-02"); // streak 2
    d = applyDaily(d, "2026-08-05"); // missed 3rd/4th
    expect(d.streak).toBe(1);
    expect(d.bestStreak).toBe(2);
  });

  it("is idempotent within the same day", () => {
    const d1 = applyDaily(emptyProgress().daily, "2026-08-01");
    const d2 = applyDaily(d1, "2026-08-01");
    expect(d2).toEqual(d1);
  });

  it("produces a stable per-date seed", () => {
    expect(dailySeed("2026-08-01")).toBe(dailySeed("2026-08-01"));
    expect(dailySeed("2026-08-01")).not.toBe(dailySeed("2026-08-02"));
  });
});
