import type { Metadata } from "next";
import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { CollectionGrid } from "@/components/CollectionGrid";
import { TOTAL_DINOSAURS } from "@/lib/dinosaurs";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dinosaur Collection",
  description: `Discover and collect all ${TOTAL_DINOSAURS} dinosaurs in Dinoria. Identify them in the quiz to reveal their full profiles, facts and artwork.`,
  alternates: { canonical: `${SITE_URL}/collection` },
};

export default function CollectionPage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <JungleScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 pb-16">
        <header className="mt-4 text-center">
          <h1 className="font-[family-name:var(--font-fredoka)] text-4xl font-700 text-cream">
            📖 Your Collection
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-cream-dim">
            Every dinosaur you correctly name in the quiz is added here. Tap a
            discovered dinosaur to study its full profile.
          </p>
        </header>

        <div className="mt-6">
          <CollectionGrid />
        </div>
      </main>
    </div>
  );
}
