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
    <header className="relative z-20 mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-y-3 px-4 py-4">
      <Link href="/" aria-label="Dinoria home" className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          🦕
        </span>
        <Logo className="text-2xl" />
      </Link>

      {/* On mobile this wraps to its own full-width row below the logo/account
          so the header never overflows narrow screens. */}
      <nav className="order-last flex w-full items-center justify-center gap-1 text-sm sm:order-none sm:w-auto sm:justify-start sm:gap-2">
        <Link
          href="/expeditions"
          className="rounded-full px-2.5 py-2 text-cream-dim transition-colors hover:text-cream sm:px-3"
        >
          Expeditions
        </Link>
        <Link
          href="/collection"
          className="rounded-full px-2.5 py-2 text-cream-dim transition-colors hover:text-cream sm:px-3"
        >
          Collection
        </Link>
        <Link
          href="/leaderboard"
          className="rounded-full px-2.5 py-2 text-cream-dim transition-colors hover:text-cream sm:px-3"
        >
          Leaderboard
        </Link>
      </nav>

      <div className="flex items-center gap-1 text-sm">
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
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </header>
  );
}
