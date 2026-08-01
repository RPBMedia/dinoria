import type { Metadata } from "next";
import Link from "next/link";
import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { PlayHub } from "@/components/PlayHub";
import { DailyChallenge } from "@/components/DailyChallenge";
import { TOTAL_DINOSAURS } from "@/lib/dinosaurs";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: { url: SITE_URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Dinoria",
      description:
        "A free prehistoric dinosaur quiz adventure for kids and dinosaur fans.",
    },
    {
      "@type": "VideoGame",
      name: "Dinoria — The Dinosaur Quiz Adventure",
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/og.jpg`,
      description: `Name that dinosaur! Identify ${TOTAL_DINOSAURS} dinosaurs from original artwork, beat the clock, build streaks, collect them all and explore the expedition map.`,
      genre: ["Educational", "Trivia", "Quiz"],
      applicationCategory: "GameApplication",
      operatingSystem: "Web browser",
      inLanguage: "en",
      gamePlatform: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JungleScene />
      <SiteHeader />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-16">
        <section className="pt-6 pb-10 text-center sm:pt-12">
          <p className="font-[family-name:var(--font-fredoka)] text-sm uppercase tracking-[0.3em] text-sun-300">
            Welcome to Dinoria
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-fredoka)] text-5xl font-700 leading-[1.05] text-cream drop-shadow-[0_3px_0_rgba(0,0,0,0.35)] sm:text-7xl">
            Name that
            <br />
            <span className="text-sun-400">dinosaur.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cream-dim">
            A beautiful prehistoric quiz adventure. Study the artwork, beat the
            clock, build fiery streaks and discover all {TOTAL_DINOSAURS}{" "}
            dinosaurs. Free to play &mdash; no download needed.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-cream-faint">
            <span className="rounded-full bg-canopy-950/50 px-3 py-1.5 ring-1 ring-cream/10">
              ⏱️ Beat the clock
            </span>
            <Link
              href="/expeditions"
              className="rounded-full bg-canopy-950/50 px-3 py-1.5 ring-1 ring-cream/10 transition-colors hover:text-cream"
            >
              🧭 Expeditions
            </Link>
            <Link
              href="/collection"
              className="rounded-full bg-canopy-950/50 px-3 py-1.5 ring-1 ring-cream/10 transition-colors hover:text-cream"
            >
              📖 Collect all {TOTAL_DINOSAURS}
            </Link>
          </div>
        </section>

        <div className="mx-auto mb-4 w-full max-w-2xl">
          <DailyChallenge />
        </div>
        <PlayHub />

        <section className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 text-center sm:grid-cols-3">
          <Feature emoji="🎨" title="Stunning artwork">
            Every dinosaur is shown in beautiful, scientifically-inspired art.
          </Feature>
          <Feature emoji="🧠" title="Learn as you play">
            Clever wrong answers teach you to tell relatives apart.
          </Feature>
          <Feature emoji="👨‍👩‍👧" title="Made for families">
            Big buttons, readable text and instant guest play for all ages.
          </Feature>
        </section>
      </main>

      <footer className="relative z-10 border-t border-cream/10 py-6 text-center text-sm text-cream-faint">
        <p>
          Dinoria &mdash; a prehistoric learning world. Dinosaur artwork &copy;
          their creators via Wikimedia Commons.
        </p>
        <p className="mt-1.5">
          Designed &amp; built by{" "}
          <a
            href="https://www.ruibaiao.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-600 text-cream-dim underline decoration-cream/30 underline-offset-2 transition-colors hover:text-cream"
          >
            Rui Bai&atilde;o
          </a>{" "}
          &middot; available for freelance projects
        </p>
      </footer>
    </div>
  );
}

function Feature({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-canopy-900/50 p-5 ring-1 ring-cream/10">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-2 font-[family-name:var(--font-fredoka)] font-700 text-cream">
        {title}
      </h3>
      <p className="mt-1 text-sm text-cream-dim">{children}</p>
    </div>
  );
}
