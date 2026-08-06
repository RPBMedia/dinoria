/** Expeditions — the Milestone 3 adventure map.
 *
 * Three period "lands", each a path of regions. A region is a short themed quiz
 * whose ANSWERS are dinosaurs from that period (optionally capped to a tier so
 * early regions use the more famous species); DISTRACTORS come from the full
 * database (see buildQuestions). Clearing a region (≥1★) unlocks the next in
 * sequence; finishing a land opens the next. Data-driven and pure — no I/O. */

import type { Diet, Dinosaur, Period } from "@/types/dinosaur";
import type { GameDifficulty } from "@/types/game";
import { DINOSAURS } from "@/lib/dinosaurs";

export interface ExpeditionRegion {
  id: string;
  name: string;
  blurb: string;
  period: Period;
  /** Answer pool lower tier bound (inclusive). Defaults to 1. Set above 1 for
   * "rarest" regions so common/famous species don't leak in. */
  minTier?: number;
  /** Answer pool upper tier bound (inclusive). */
  maxTier: number;
  /** Optional theme filter: if set, an answer's diet must be one of these. */
  diets?: Diet[];
  /** Optional theme filter: if set, an answer's family must be one of these
   * (exact match). Lets a region match a morphological theme (e.g. "long necks
   * and plated backs") rather than just a tier range. */
  families?: string[];
  questionCount: number;
  /** Score multiplier tier for this region. */
  difficulty: GameDifficulty;
}

export interface ExpeditionLand {
  id: string;
  name: string;
  subtitle: string;
  period: Period;
  /** Palette key consumed by the map UI. */
  theme: "triassic" | "jurassic" | "cretaceous";
  /** Paleogeographic map of the world during this period (under /public). */
  worldMap: string;
  /** One-line description of how the world looked then. */
  worldCaption: string;
  regions: ExpeditionRegion[];
}

/** Credit for the paleogeography maps (CC licences require attribution). */
export const WORLD_MAP_CREDIT =
  "Paleogeography maps by Merikanto, Wikimedia Commons (CC BY-SA 4.0 / CC0)";

/** Family groups used to theme certain regions. Names match the `family`
 * values in the dinosaur data exactly. */
const LONG_NECKS_AND_PLATES = [
  // long necks (sauropods)
  "Diplodocidae",
  "Brachiosauridae",
  "Camarasauridae",
  "Mamenchisauridae",
  // plated backs / early armour (thyreophorans)
  "Stegosauridae",
  "Huayangosauridae",
  "Scelidosauridae",
  "Thyreophora",
];
const DUCKBILLS_AND_RAPTORS = ["Hadrosauridae", "Dromaeosauridae"];
const FRILLS_HORNS_AND_ARMOUR = [
  // frills & horns (ceratopsians)
  "Ceratopsidae",
  "Protoceratopsidae",
  "Psittacosauridae",
  // armour (ankylosaurs)
  "Ankylosauridae",
  "Nodosauridae",
];

export const LANDS: ExpeditionLand[] = [
  {
    id: "triassic",
    name: "Triassic Dawn",
    subtitle: "Where the dinosaurs began",
    period: "Triassic",
    theme: "triassic",
    worldMap: "/periods/triassic.jpg",
    worldCaption:
      "~250 million years ago: all land was joined into one giant supercontinent, Pangaea — you could walk from pole to pole.",
    regions: [
      {
        id: "tri-1",
        name: "First Footsteps",
        blurb: "Meet the earliest dinosaurs of all.",
        period: "Triassic",
        // The whole Triassic cast — the dinosaurs' earliest days (only a handful
        // of genera existed), so the count matches the pool to avoid repeats.
        maxTier: 5,
        questionCount: 4,
        difficulty: "hard",
      },
    ],
  },
  {
    id: "jurassic",
    name: "Jurassic Wilds",
    subtitle: "Giants and hunters of the fern forests",
    period: "Jurassic",
    theme: "jurassic",
    worldMap: "/periods/jurassic.jpg",
    worldCaption:
      "~150 million years ago: Pangaea was tearing apart and a young Atlantic Ocean opened, splitting the land into two great masses.",
    regions: [
      {
        id: "jur-1",
        name: "Fern Prairies",
        blurb: "The famous faces of the Jurassic.",
        period: "Jurassic",
        maxTier: 2,
        questionCount: 6,
        difficulty: "normal",
      },
      {
        id: "jur-2",
        name: "Giant's Valley",
        blurb: "Long necks and plated backs.",
        period: "Jurassic",
        // Sauropods and thyreophorans only — true to "long necks and plated backs".
        maxTier: 5,
        families: LONG_NECKS_AND_PLATES,
        questionCount: 8,
        difficulty: "hard",
      },
      {
        id: "jur-3",
        name: "Apex Ridge",
        blurb: "The rarest Jurassic beasts.",
        period: "Jurassic",
        // Rarest only — tiers 4–5. Keeps common icons (Stegosaurus, etc.) out.
        minTier: 4,
        maxTier: 5,
        questionCount: 10,
        difficulty: "legendary",
      },
    ],
  },
  {
    id: "cretaceous",
    name: "Cretaceous Frontier",
    subtitle: "The last and greatest age of dinosaurs",
    period: "Cretaceous",
    theme: "cretaceous",
    worldMap: "/periods/cretaceous.jpg",
    worldCaption:
      "~66 million years ago: the continents had drifted close to their modern places, with warm shallow seas flooding across the land.",
    regions: [
      {
        id: "cre-1",
        name: "Coastal Marshes",
        blurb: "Duckbills, raptors and icons.",
        period: "Cretaceous",
        // Hadrosaurs (duckbills) and dromaeosaurs (raptors) — the icons of the
        // Cretaceous coasts.
        maxTier: 5,
        families: DUCKBILLS_AND_RAPTORS,
        questionCount: 8,
        difficulty: "normal",
      },
      {
        id: "cre-2",
        name: "Horned Plains",
        blurb: "Frills, horns and armour.",
        period: "Cretaceous",
        // Ceratopsians (frills & horns) and ankylosaurs/nodosaurs (armour).
        maxTier: 5,
        families: FRILLS_HORNS_AND_ARMOUR,
        questionCount: 10,
        difficulty: "hard",
      },
      {
        id: "cre-3",
        name: "Tyrant Territory",
        blurb: "The great predators close in.",
        period: "Cretaceous",
        // Predators only — carnivores and the piscivorous spinosaurs.
        maxTier: 5,
        diets: ["carnivore", "piscivore"],
        questionCount: 10,
        difficulty: "very-hard",
      },
      {
        id: "cre-4",
        name: "Last Kingdom",
        blurb: "Every Cretaceous species — the ultimate test.",
        period: "Cretaceous",
        maxTier: 5,
        questionCount: 12,
        difficulty: "legendary",
      },
    ],
  },
];

/** All regions in unlock order (land by land). */
export const REGION_SEQUENCE: ExpeditionRegion[] = LANDS.flatMap(
  (l) => l.regions,
);

export const TOTAL_REGIONS = REGION_SEQUENCE.length;
export const MAX_STARS = TOTAL_REGIONS * 3;

export function getRegion(id: string): ExpeditionRegion | undefined {
  return REGION_SEQUENCE.find((r) => r.id === id);
}

export function landForRegion(id: string): ExpeditionLand | undefined {
  return LANDS.find((l) => l.regions.some((r) => r.id === id));
}

/** The region unlocked right after this one (null if it's the last). */
export function nextRegionId(id: string): string | null {
  const i = REGION_SEQUENCE.findIndex((r) => r.id === id);
  return i >= 0 && i + 1 < REGION_SEQUENCE.length
    ? REGION_SEQUENCE[i + 1].id
    : null;
}

/** Answers for a region: period dinosaurs within its tier band, further
 * narrowed to the region's theme (diet / family) when set. This keeps each
 * region's answers true to its purpose — e.g. "Apex Ridge" (minTier 4) never
 * surfaces a common Stegosaurus, and "Tyrant Territory" only asks predators. */
export function regionAnswerPool(
  region: ExpeditionRegion,
  dinos: readonly Dinosaur[] = DINOSAURS,
): Dinosaur[] {
  const minTier = region.minTier ?? 1;
  return dinos.filter(
    (d) =>
      d.period === region.period &&
      d.difficulty >= minTier &&
      d.difficulty <= region.maxTier &&
      (!region.diets || region.diets.includes(d.diet)) &&
      (!region.families || region.families.includes(d.family)),
  );
}

/** Star map: regionId → stars earned (0 = not cleared). */
export type StarMap = Record<string, number>;

/** A region is unlocked when it's the first, or the previous region in the
 * sequence has been cleared (≥1★). */
export function isRegionUnlocked(id: string, stars: StarMap): boolean {
  const i = REGION_SEQUENCE.findIndex((r) => r.id === id);
  if (i <= 0) return i === 0; // first region always open; unknown id => false
  const prev = REGION_SEQUENCE[i - 1];
  return (stars[prev.id] ?? 0) >= 1;
}

export function totalStars(stars: StarMap): number {
  return REGION_SEQUENCE.reduce((sum, r) => sum + (stars[r.id] ?? 0), 0);
}
