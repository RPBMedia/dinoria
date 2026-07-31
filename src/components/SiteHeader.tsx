"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/services/auth";
import { Logo } from "@/components/ui";
import { AuthModal } from "@/components/AuthModal";

export function SiteHeader() {
  const { player, accountsAvailable, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
      <Link href="/" aria-label="Dinoria home" className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          🦕
        </span>
        <Logo className="text-2xl" />
      </Link>

      <nav className="flex items-center gap-1 text-sm sm:gap-2">
        <Link
          href="/expeditions"
          className="rounded-full px-3 py-2 text-cream-dim transition-colors hover:text-cream"
        >
          Expeditions
        </Link>
        <Link
          href="/collection"
          className="rounded-full px-3 py-2 text-cream-dim transition-colors hover:text-cream"
        >
          Collection
        </Link>
        <Link
          href="/leaderboard"
          className="rounded-full px-3 py-2 text-cream-dim transition-colors hover:text-cream"
        >
          Leaderboard
        </Link>
        <button
          onClick={() => setAuthOpen(true)}
          className="flex items-center gap-2 rounded-full bg-canopy-800/70 px-3 py-2 ring-1 ring-cream/15 hover:bg-canopy-700/80"
        >
          <span className="text-base" aria-hidden>
            {player.isGuest ? "🌿" : "⭐"}
          </span>
          <span className="max-w-28 truncate text-cream">{player.name}</span>
        </button>
        {accountsAvailable && !player.isGuest && (
          <button
            onClick={() => void signOut()}
            className="rounded-full px-3 py-2 text-cream-faint hover:text-cream"
          >
            Sign out
          </button>
        )}
      </nav>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </header>
  );
}
