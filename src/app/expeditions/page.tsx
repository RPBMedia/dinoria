import type { Metadata } from "next";
import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { ExpeditionsMap } from "@/components/ExpeditionsMap";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Expeditions — Dinosaur Adventure Map",
  description:
    "Journey through the Triassic, Jurassic and Cretaceous on the Dinoria expedition map. Clear themed regions, earn stars, and unlock the next age of dinosaurs.",
  alternates: { canonical: `${SITE_URL}/expeditions` },
};

export default function ExpeditionsPage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <JungleScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 pb-16">
        <header className="mt-4 text-center">
          <h1 className="font-[family-name:var(--font-fredoka)] text-4xl font-700 text-cream">
            🧭 Expeditions
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-cream-dim">
            Travel across three ages of dinosaurs. Each region is a themed
            challenge — earn stars and open the path forward.
          </p>
        </header>
        <div className="mt-6">
          <ExpeditionsMap />
        </div>
      </main>
    </div>
  );
}
