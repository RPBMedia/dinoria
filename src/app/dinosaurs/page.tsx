import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { Period } from "@/types/dinosaur";
import { DINOSAURS, TOTAL_DINOSAURS } from "@/lib/dinosaurs";
import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `All ${TOTAL_DINOSAURS} Dinosaurs — A Visual Encyclopedia`,
  description: `Browse every dinosaur in Dinoria: ${TOTAL_DINOSAURS} species from the Triassic, Jurassic and Cretaceous with pictures, sizes, diets and fun facts for kids.`,
  alternates: { canonical: `${SITE_URL}/dinosaurs` },
  openGraph: {
    title: `All ${TOTAL_DINOSAURS} Dinosaurs — Dinoria Encyclopedia`,
    description: `Pictures, sizes and facts for ${TOTAL_DINOSAURS} dinosaurs from every prehistoric age.`,
    url: `${SITE_URL}/dinosaurs`,
  },
};

const PERIOD_ORDER: Period[] = ["Triassic", "Jurassic", "Cretaceous"];

export default function DinosaurIndexPage() {
  const byPeriod = PERIOD_ORDER.map((period) => ({
    period,
    dinos: DINOSAURS.filter((d) => d.period === period).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    ),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `All ${TOTAL_DINOSAURS} Dinosaurs`,
    url: `${SITE_URL}/dinosaurs`,
    hasPart: DINOSAURS.map((d) => ({
      "@type": "Article",
      name: d.displayName,
      url: `${SITE_URL}/dinosaurs/${d.id}`,
    })),
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <JungleScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="mt-4 text-center">
          <h1 className="font-[family-name:var(--font-fredoka)] text-4xl font-700 text-cream">
            Dinosaur Encyclopedia
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-cream-dim">
            Every one of the {TOTAL_DINOSAURS} dinosaurs in Dinoria — with
            pictures, sizes, diets and fun facts. Tap any dinosaur to read its
            full profile.
          </p>
        </header>

        {byPeriod.map(({ period, dinos }) => (
          <section key={period} className="mt-10">
            <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-700 text-sun-300">
              {period}{" "}
              <span className="text-base font-400 text-cream-faint">
                · {dinos.length} dinosaurs
              </span>
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {dinos.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/dinosaurs/${d.id}`}
                    className="btn-chunky flex items-center gap-3 rounded-2xl bg-canopy-800/60 p-3 ring-1 ring-cream/10 hover:bg-canopy-700/70"
                  >
                    <span className="relative h-12 w-12 shrink-0">
                      <Image
                        src={d.image}
                        alt={d.displayName}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-600 text-cream">
                        {d.displayName}
                      </span>
                      <span className="block truncate text-xs italic text-cream-faint">
                        {d.scientificName}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
