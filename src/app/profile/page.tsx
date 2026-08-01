import type { Metadata } from "next";
import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { ProfilePanel } from "@/components/ProfilePanel";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your Profile — Level & Achievements",
  description:
    "Track your Dinoria level, XP, stats and achievements as you play the dinosaur quiz.",
  alternates: { canonical: `${SITE_URL}/profile` },
  robots: { index: false }, // personal, per-device page — no SEO value
};

export default function ProfilePage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <JungleScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 pb-16">
        <header className="mt-4 text-center">
          <h1 className="font-[family-name:var(--font-fredoka)] text-4xl font-700 text-cream">
            🎖️ Your Profile
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-cream-dim">
            Level up, track your stats and collect achievements as you play.
          </p>
        </header>
        <div className="mt-6">
          <ProfilePanel />
        </div>
      </main>
    </div>
  );
}
