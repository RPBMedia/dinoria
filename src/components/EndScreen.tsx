"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { GameResult } from "@/types/game";
import type { Dinosaur } from "@/types/dinosaur";
import { useAuth } from "@/services/auth";
import { saveLocalScore, submitGlobalScore } from "@/services/leaderboard";
import { readLocalCollection } from "@/services/collection";
import { useCollection } from "@/hooks/useCollection";
import { getDinosaur } from "@/lib/dinosaurs";
import { trackQuizFinished } from "@/lib/analytics";
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
  const { discover } = useCollection();
  const [shared, setShared] = useState(false);
  const [newFinds, setNewFinds] = useState<Dinosaur[]>([]);
  const savedRef = useRef(false);

  // Persist the score + record discoveries exactly once (StrictMode guard).
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    // Which of this run's correct IDs were not already in the collection?
    const known = new Set(readLocalCollection());
    setNewFinds(
      result.discoveredIds
        .filter((id) => !known.has(id))
        .map((id) => getDinosaur(id))
        .filter((d): d is Dinosaur => Boolean(d)),
    );
    discover(result.discoveredIds);
    saveLocalScore(player, result);
    void submitGlobalScore(player, result).catch(() => {});
    trackQuizFinished({
      mode: result.mode,
      difficulty: result.difficulty,
      score: result.score,
      accuracyPct: Math.round(result.accuracy * 100),
      correct: result.correctCount,
      total: result.totalQuestions,
    });
  }, [player, result, discover]);

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

      {newFinds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="mt-6 p-5">
            <div className="text-center text-sm font-700 text-sun-300">
              ✨ New for your collection ({newFinds.length})
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {newFinds.slice(0, 8).map((d) => (
                <div key={d.id} className="w-20 text-center">
                  <div className="relative aspect-square w-20 rounded-2xl bg-canopy-950/50 ring-1 ring-cream/10">
                    <Image
                      src={d.image}
                      alt={d.displayName}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="mt-1 truncate text-xs text-cream-dim">
                    {d.displayName}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="leaf" size="lg" onClick={() => window.location.reload()}>
          Play again
        </Button>
        <Button variant="wood" size="lg" onClick={onHome}>
          Home
        </Button>
        <ButtonLink variant="wood" href="/collection">
          📖 Collection
        </ButtonLink>
        <ButtonLink variant="wood" href="/leaderboard">
          🏆 Leaderboard
        </ButtonLink>
        <Button variant="wood" onClick={share} className="col-span-2">
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
