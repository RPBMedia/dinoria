/** Core dinosaur record — the data-driven heart of Dinoria (see PRD).
 * All content lives in src/data/dinosaurs.json; nothing is hardcoded in UI. */

export type Diet = "carnivore" | "herbivore" | "omnivore" | "piscivore";

export type Period = "Triassic" | "Jurassic" | "Cretaceous";

/** 1 = iconic/easy … 5 = legendary. M1 ships tiers 1–2; 3–5 arrive with the
 * larger database in Milestone 2. */
export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

export interface Dinosaur {
  id: string;
  scientificName: string;
  displayName: string;
  pronunciation: string;
  meaning: string;
  /** Path under /public (self-hosted, licensed artwork). */
  image: string;
  /** Artwork credit — required by the CC licenses we use. */
  imageAttribution: string;
  difficulty: DifficultyTier;
  family: string;
  period: Period;
  periodDetail: string;
  diet: Diet;
  heightMeters: number;
  lengthMeters: number;
  weightKg: number;
  country: string;
  discoveryYear: number;
  discoverer: string;
  description: string;
  interestingFacts: string[];
}
