import type { Diet, DinoGroup } from "@/types/dinosaur";

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

/** Ecosystem-group badge label + emoji. Pterosaurs and marine reptiles are
 * flagged as their own thing (they are NOT dinosaurs). */
export const GROUP_LABEL: Record<DinoGroup, string> = {
  dinosaur: "Dinosaur",
  bird: "Bird",
  pterosaur: "Pterosaur",
  "marine reptile": "Marine reptile",
};

export const GROUP_EMOJI: Record<DinoGroup, string> = {
  dinosaur: "🦕",
  bird: "🐦",
  pterosaur: "🪽",
  "marine reptile": "🌊",
};

export const TIER_LABEL: Record<number, string> = {
  1: "Easy",
  2: "Normal",
  3: "Hard",
  4: "Very Hard",
  5: "Legendary",
};
