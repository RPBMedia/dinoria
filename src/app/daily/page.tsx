import type { Metadata } from "next";
import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { DailyChallenge } from "@/components/DailyChallenge";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Daily Dinosaur Challenge",
  description:
    "A new 10-dinosaur challenge every day — the same for everyone. Build your daily streak in Dinoria.",
  alternates: { canonical: `${SITE_URL}/daily` },
};

export default function DailyPage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <JungleScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-4 pb-16">
        <header className="mt-4 text-center">
          <h1 className="font-[family-name:var(--font-fredoka)] text-4xl font-700 text-cream">
            🗓️ Daily Challenge
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-cream-dim">
            Ten dinosaurs, the same for everyone, refreshed each day. Play daily
            to grow your streak.
          </p>
        </header>
        <div className="mt-6">
          <DailyChallenge />
        </div>
      </main>
    </div>
  );
}
