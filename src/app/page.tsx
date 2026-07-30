import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { PlayHub } from "@/components/PlayHub";
import { TOTAL_DINOSAURS } from "@/lib/dinosaurs";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
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
            <span className="rounded-full bg-canopy-950/50 px-3 py-1.5 ring-1 ring-cream/10">
              🔥 Streak bonuses
            </span>
            <span className="rounded-full bg-canopy-950/50 px-3 py-1.5 ring-1 ring-cream/10">
              🏆 Leaderboards
            </span>
          </div>
        </section>

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
        Dinoria &mdash; a prehistoric learning world. Dinosaur artwork &copy;
        their creators via Wikimedia Commons.
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
