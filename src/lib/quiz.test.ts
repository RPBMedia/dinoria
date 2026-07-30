import { describe, expect, it } from "vitest";
import dinosaursJson from "@/data/dinosaurs.json";
import type { Dinosaur } from "@/types/dinosaur";
import { mulberry32 } from "./rng";
import {
  buildQuestions,
  pickDistractors,
  poolFor,
  scoreAnswer,
  QUESTION_TIME_MS,
  DIFFICULTY_CONFIG,
} from "./quiz";

const dinosaurs = dinosaursJson as Dinosaur[];

describe("dinosaur database", () => {
  it("has 24 complete records with unique ids and local images", () => {
    expect(dinosaurs).toHaveLength(24);
    const ids = new Set(dinosaurs.map((d) => d.id));
    expect(ids.size).toBe(24);
    for (const d of dinosaurs) {
      expect(d.image).toMatch(/^\/dinos\/.+\.png$/);
      expect(d.imageAttribution).toContain("Wikimedia Commons");
      expect(d.interestingFacts.length).toBeGreaterThanOrEqual(3);
      expect(d.description.length).toBeGreaterThan(80);
      expect([1, 2]).toContain(d.difficulty); // M1 ships tiers 1–2
    }
  });

  it("easy pool has the 12 icons; normal pool has all 24", () => {
    expect(poolFor(dinosaurs, "easy")).toHaveLength(12);
    expect(poolFor(dinosaurs, "normal")).toHaveLength(24);
  });
});

describe("buildQuestions", () => {
  const pool = poolFor(dinosaurs, "normal");

  it("builds the requested number of questions with 4 unique options each", () => {
    const qs = buildQuestions(pool, 25, mulberry32(1));
    expect(qs).toHaveLength(25);
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
      expect(q.options.some((o) => o.id === q.answer.id)).toBe(true);
    }
  });

  it("never repeats an answer until the pool is exhausted", () => {
    const qs = buildQuestions(pool, 24, mulberry32(2));
    const answerIds = qs.map((q) => q.answer.id);
    expect(new Set(answerIds).size).toBe(24);
  });

  it("is deterministic under a fixed seed", () => {
    const a = buildQuestions(pool, 10, mulberry32(42)).map((q) => q.answer.id);
    const b = buildQuestions(pool, 10, mulberry32(42)).map((q) => q.answer.id);
    expect(a).toEqual(b);
  });

  it("throws when the pool is too small for 4 options", () => {
    expect(() => buildQuestions(pool.slice(0, 3), 5, mulberry32(3))).toThrow();
  });
});

describe("pickDistractors", () => {
  const pool = poolFor(dinosaurs, "normal");

  it("prefers related dinosaurs (family beats random)", () => {
    const rex = dinosaurs.find((d) => d.id === "tyrannosaurus")!;
    // Run many draws: carnivores/same-period species should dominate.
    let relatedHits = 0;
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const ds = pickDistractors(rex, pool, rng);
      for (const d of ds) {
        if (d.diet === rex.diet || d.period === rex.period) relatedHits++;
      }
    }
    expect(relatedHits / 150).toBeGreaterThan(0.6);
  });

  it("never includes the answer itself", () => {
    const rng = mulberry32(9);
    for (const answer of pool) {
      const ds = pickDistractors(answer, pool, rng);
      expect(ds.map((d) => d.id)).not.toContain(answer.id);
      expect(ds).toHaveLength(3);
    }
  });
});

describe("scoreAnswer", () => {
  it("wrong answers score 0", () => {
    expect(
      scoreAnswer({ correct: false, elapsedMs: 10, difficulty: "easy", streak: 5 }),
    ).toBe(0);
  });

  it("faster answers score more", () => {
    const fast = scoreAnswer({ correct: true, elapsedMs: 1000, difficulty: "easy", streak: 0 });
    const slow = scoreAnswer({ correct: true, elapsedMs: 15_000, difficulty: "easy", streak: 0 });
    expect(fast).toBeGreaterThan(slow);
  });

  it("an instant answer earns base + full speed bonus", () => {
    expect(
      scoreAnswer({ correct: true, elapsedMs: 0, difficulty: "easy", streak: 0 }),
    ).toBe(200); // 100 base + 100 speed
  });

  it("higher difficulties multiply the base", () => {
    const easy = scoreAnswer({ correct: true, elapsedMs: QUESTION_TIME_MS, difficulty: "easy", streak: 0 });
    const normal = scoreAnswer({ correct: true, elapsedMs: QUESTION_TIME_MS, difficulty: "normal", streak: 0 });
    expect(easy).toBe(100);
    expect(normal).toBe(125);
  });

  it("streaks multiply up to a 2x cap", () => {
    const base = scoreAnswer({ correct: true, elapsedMs: QUESTION_TIME_MS, difficulty: "easy", streak: 0 });
    const s5 = scoreAnswer({ correct: true, elapsedMs: QUESTION_TIME_MS, difficulty: "easy", streak: 5 });
    const s10 = scoreAnswer({ correct: true, elapsedMs: QUESTION_TIME_MS, difficulty: "easy", streak: 10 });
    const s50 = scoreAnswer({ correct: true, elapsedMs: QUESTION_TIME_MS, difficulty: "easy", streak: 50 });
    expect(s5).toBe(Math.round(base * 1.5));
    expect(s10).toBe(base * 2);
    expect(s50).toBe(s10); // capped
  });

  it("M1 exposes easy+normal as available, higher tiers locked", () => {
    expect(DIFFICULTY_CONFIG.easy.available).toBe(true);
    expect(DIFFICULTY_CONFIG.normal.available).toBe(true);
    expect(DIFFICULTY_CONFIG.hard.available).toBe(false);
    expect(DIFFICULTY_CONFIG.legendary.available).toBe(false);
  });
});
