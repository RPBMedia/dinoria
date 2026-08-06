import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { buildQuestions, starsFor } from "./quiz";
import { DINOSAURS } from "./dinosaurs";
import {
  getRegion,
  isRegionUnlocked,
  LANDS,
  nextRegionId,
  regionAnswerPool,
  REGION_SEQUENCE,
  totalStars,
} from "./expeditions";

describe("starsFor", () => {
  it("maps accuracy to 0–3 stars", () => {
    expect(starsFor(2, 6)).toBe(0); // 33% — not cleared
    expect(starsFor(3, 6)).toBe(1); // 50%
    expect(starsFor(5, 6)).toBe(2); // 83%
    expect(starsFor(6, 6)).toBe(3); // 100%
    expect(starsFor(0, 0)).toBe(0);
  });
});

describe("expedition regions", () => {
  it("has three lands with period-scoped, tier-capped, non-empty answer pools", () => {
    expect(LANDS.map((l) => l.id)).toEqual([
      "triassic",
      "jurassic",
      "cretaceous",
    ]);
    for (const r of REGION_SEQUENCE) {
      const pool = regionAnswerPool(r);
      expect(pool.length).toBeGreaterThan(0);
      for (const d of pool) {
        expect(d.period).toBe(r.period);
        expect(d.difficulty).toBeLessThanOrEqual(r.maxTier);
      }
    }
  });

  it("builds valid 4-option questions even for the tiny Triassic pool", () => {
    const tri = getRegion("tri-1")!;
    const answers = regionAnswerPool(tri);
    expect(answers.length).toBe(4);
    const qs = buildQuestions(
      answers,
      tri.questionCount,
      mulberry32(1),
      DINOSAURS,
    );
    expect(qs).toHaveLength(tri.questionCount);
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
      expect(q.options.some((o) => o.id === q.answer.id)).toBe(true);
      expect(q.answer.period).toBe("Triassic");
    }
  });
});

describe("region pools match their theme", () => {
  it("gives every region enough distinct answers to avoid repeats", () => {
    for (const r of REGION_SEQUENCE) {
      expect(regionAnswerPool(r).length).toBeGreaterThanOrEqual(r.questionCount);
    }
  });

  it("keeps Apex Ridge to the rarest tiers only (no common icons)", () => {
    const apex = regionAnswerPool(getRegion("jur-3")!);
    for (const d of apex) expect(d.difficulty).toBeGreaterThanOrEqual(4);
    expect(apex.some((d) => /stegosaurus/i.test(d.displayName))).toBe(false);
  });

  it("restricts Tyrant Territory to predators", () => {
    const preds = regionAnswerPool(getRegion("cre-3")!);
    for (const d of preds) {
      expect(["carnivore", "piscivore"]).toContain(d.diet);
    }
  });

  it("restricts family-themed regions to their families", () => {
    for (const id of ["jur-2", "cre-1", "cre-2"]) {
      const region = getRegion(id)!;
      const pool = regionAnswerPool(region);
      for (const d of pool) {
        expect(region.families).toContain(d.family);
      }
    }
  });
});

describe("unlock progression", () => {
  it("opens the first region and gates the rest behind clearing the previous", () => {
    const [first, second] = REGION_SEQUENCE;
    expect(isRegionUnlocked(first.id, {})).toBe(true);
    expect(isRegionUnlocked(second.id, {})).toBe(false);
    expect(isRegionUnlocked(second.id, { [first.id]: 1 })).toBe(true);
    expect(isRegionUnlocked(second.id, { [first.id]: 0 })).toBe(false);
  });

  it("sequences regions across land boundaries", () => {
    expect(nextRegionId("tri-1")).toBe("jur-1");
    expect(nextRegionId("jur-3")).toBe("cre-1");
    expect(nextRegionId(REGION_SEQUENCE.at(-1)!.id)).toBeNull();
  });

  it("sums stars across regions", () => {
    expect(totalStars({ "tri-1": 3, "jur-1": 2 })).toBe(5);
  });
});
