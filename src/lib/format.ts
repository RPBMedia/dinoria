import type { Diet } from "@/types/dinosaur";

/** Human-friendly mass: tonnes once we hit 1,000 kg, else kilograms. */
export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    const t = kg / 1000;
    return `${Number.isInteger(t) ? t : t.toFixed(1)} t`;
  }
  return `${kg} kg`;
}

export function formatLength(m: number): string {
  return `${Number.isInteger(m) ? m : m.toFixed(1)} m`;
}

export const DIET_EMOJI: Record<Diet, string> = {
  carnivore: "🥩",
  herbivore: "🌿",
  omnivore: "🍽️",
  piscivore: "🐟",
};

export const TIER_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Normal",
  3: "Hard",
  4: "Very Hard",
  5: "Legendary",
};
