"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { GameResult } from "@/types/game";
import { useAuth } from "@/services/auth";
import { saveLocalScore, submitGlobalScore } from "@/services/leaderboard";
import { Button, ButtonLink, Card, Stat } from "@/components/ui";

function fmtTime(ms: number | null): string {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(1)}s`;
}

export function EndScreen({
  result,
  onHome,
}: {
  result: GameResult;
  onHome: () => void;
}) {
  const { player } = useAuth();
  const [shared, setShared] = useState(false);
  const savedRef = useRef(false);

  // Persist the score exactly once (StrictMode double-mount guard).
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    saveLocalScore(player, result);
    void submitGlobalScore(player, result).catch(() => {});
  }, [player, result]);

  const accuracyPct = Math.round(result.accuracy * 100);
  const greatRun = accuracyPct >= 80;

  async function share() {
    const text = `I scored ${result.score.toLocaleString()} points (${accuracyPct}% accuracy) on the Dinoria dinosaur quiz! 🦕`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Dinoria", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="text-center"
      >
        <div className="text-6xl">{greatRun ? "🏆" : "🦖"}</div>
        <h1 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-700 text-cream">
          {greatRun ? "Amazing run!" : "Run complete!"}
        </h1>
        <p className="mt-1 text-cream-faint">
          You discovered {result.discoveredIds.length} dinosaur
          {result.discoveredIds.length === 1 ? "" : "s"}.
        </p>
      </motion.div>

      <Card className="mt-6 p-5">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-cream-faint">
            Score
          </div>
          <div className="font-[family-name:var(--font-fredoka)] text-5xl font-700 tabular-nums text-sun-400">
            {result.score.toLocaleString()}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Accuracy" value={`${accuracyPct}%`} accent="leaf" />
          <Stat label="Best streak" value={result.longestStreak} accent="sun" />
          <Stat
            label="Fastest"
            value={fmtTime(result.fastestAnswerMs)}
            accent="cream"
          />
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="leaf" size="lg" onClick={() => window.location.reload()}>
          Play again
        </Button>
        <Button variant="wood" size="lg" onClick={onHome}>
          Home
        </Button>
        <ButtonLink variant="wood" href="/leaderboard">
          Leaderboard
        </ButtonLink>
        <Button variant="wood" onClick={share}>
          {shared ? "Copied!" : "Share"}
        </Button>
      </div>

      {player.isGuest && (
        <p className="mt-5 text-center text-sm text-cream-faint">
          Playing as a guest. Sign in to save progress and join the global
          leaderboard.
        </p>
      )}
    </div>
  );
}
