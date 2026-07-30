import raw from "@/data/dinosaurs.json";
import type { Dinosaur } from "@/types/dinosaur";

/** The full, immutable database. Data-driven — the only source of dino data. */
export const DINOSAURS = raw as Dinosaur[];

export function getDinosaur(id: string): Dinosaur | undefined {
  return DINOSAURS.find((d) => d.id === id);
}

export const TOTAL_DINOSAURS = DINOSAURS.length;
