"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/services/auth";
import { Button } from "@/components/ui";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const {
    player,
    accountsAvailable,
    setGuestName,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const [tab, setTab] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(player.isGuest ? player.name : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const err =
      tab === "in"
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);
    setBusy(false);
    if (err) setError(err);
    else onClose();
  }

  async function google() {
    setError(null);
    setBusy(true);
    const err = await signInWithGoogle();
    setBusy(false);
    if (err) setError(err);
    else onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-canopy-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-canopy-900 p-6 ring-1 ring-cream/15 shadow-chunky"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-700">
            {accountsAvailable ? "Your explorer profile" : "Explorer name"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-2 text-cream-faint hover:text-cream"
          >
            ✕
          </button>
        </div>

        {/* guest name (always available) */}
        <label className="mt-4 block text-sm text-cream-dim">
          Name shown on leaderboards
          <div className="mt-1 flex gap-2">
            <input
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              className="min-w-0 flex-1 rounded-xl bg-canopy-950/60 px-3 py-2 text-cream ring-1 ring-cream/15 outline-none focus:ring-sun-400"
              placeholder="Brave Explorer"
            />
            <Button
              type="button"
              variant="leaf"
              onClick={() => {
                setGuestName(name);
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </label>

        {accountsAvailable ? (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-cream-faint">
              <span className="h-px flex-1 bg-cream/10" />
              or sign in to sync
              <span className="h-px flex-1 bg-cream/10" />
            </div>

            <div className="mb-3 flex gap-2 text-sm">
              <button
                onClick={() => setTab("in")}
                className={`flex-1 rounded-lg py-1.5 ${tab === "in" ? "bg-canopy-700 text-cream" : "text-cream-faint"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => setTab("up")}
                className={`flex-1 rounded-lg py-1.5 ${tab === "up" ? "bg-canopy-700 text-cream" : "text-cream-faint"}`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="rounded-xl bg-canopy-950/60 px-3 py-2 ring-1 ring-cream/15 outline-none focus:ring-sun-400"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={tab === "in" ? "current-password" : "new-password"}
                className="rounded-xl bg-canopy-950/60 px-3 py-2 ring-1 ring-cream/15 outline-none focus:ring-sun-400"
              />
              <Button type="submit" disabled={busy} className="mt-1 w-full">
                {busy ? "…" : tab === "in" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <Button
              type="button"
              variant="wood"
              disabled={busy}
              onClick={google}
              className="mt-2 w-full"
            >
              Continue with Google
            </Button>
          </>
        ) : (
          <p className="mt-4 text-sm text-cream-faint">
            Accounts and the global leaderboard turn on once the game is
            connected to its database. For now, your name and scores are saved
            on this device.
          </p>
        )}

        {error && <p className="mt-3 text-sm text-lava-400">{error}</p>}
      </motion.div>
    </div>
  );
}
