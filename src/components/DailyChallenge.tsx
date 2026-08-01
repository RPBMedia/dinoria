"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import type { GameResult } from "@/types/game";
import { DINOSAURS } from "@/lib/dinosaurs";
import {
  dailyDoneToday,
  dailySeed,
  todayKey,
  type PlayerProgress,
} from "@/lib/progress";
import { useProgress, type RecordOutcome } from "@/hooks/useProgress";
import { useCollection } from "@/hooks/useCollection";
import { useExpeditions } from "@/hooks/useExpeditions";
import { readLocalCollection } from "@/services/collection";
import { QuizGame } from "@/components/QuizGame";
import { AwardBanner } from "@/components/AwardBanner";
import { Button, ButtonLink, Card } from "@/components/ui";

const DAILY_COUNT = 10;

export function DailyChallenge() {
  const { progress, ready, recordDaily } = useProgress();
  const { discover, discoveredIds } = useCollection();
  const exp = useExpeditions();
  const [playing, setPlaying] = useState(false);

  const doneToday = dailyDoneToday(progress.daily);
  const seed = dailySeed(todayKey());

  function award(result: GameResult, newDiscoveries: number): RecordOutcome {
    return recordDaily(result, newDiscoveries, {
      discoveredCount: discoveredIds.size + newDiscoveries,
      expeditionsCleared: exp.clearedCount,
      threeStarRegions: exp.threeStarCount,
    });
  }

  if (playing) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-canopy-950">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <p className="text-center text-sm uppercase tracking-widest text-cream-faint">
            🗓️ Daily Challenge
          </p>
        </div>
        <QuizGame
          mode="10"
          difficulty="normal"
          onExit={() => setPlaying(false)}
          gameOptions={{
            answerPool: DINOSAURS,
            distractorPool: DINOSAURS,
            questionCount: DAILY_COUNT,
            seed,
          }}
          renderResult={(result) => (
            <DailyResult
              result={result}
              onAward={award}
              onDiscover={discover}
              onExit={() => setPlaying(false)}
            />
          )}
        />
      </div>,
      document.body,
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-700 text-cream">
            🗓️ Today&rsquo;s Challenge
          </h2>
          <p className="mt-1 text-sm text-cream-dim">
            {DAILY_COUNT} dinosaurs, same for everyone today. Keep your streak
            going!
          </p>
        </div>
        <StreakBadge daily={progress.daily} />
      </div>

      <div className="mt-5">
        {!ready ? (
          <p className="text-center text-sm text-cream-faint">Loading…</p>
        ) : doneToday ? (
          <div className="text-center">
            <p className="font-600 text-leaf-300">
              ✅ Done for today — come back tomorrow!
            </p>
            <button
              onClick={() => setPlaying(true)}
              className="mt-2 text-sm text-cream-faint underline hover:text-cream"
            >
              Play again for fun (streak already counted)
            </button>
          </div>
        ) : (
          <Button size="lg" className="w-full" onClick={() => setPlaying(true)}>
            ▶ Play today&rsquo;s challenge
          </Button>
        )}
      </div>
    </Card>
  );
}

function StreakBadge({ daily }: { daily: PlayerProgress["daily"] }) {
  return (
    <div className="shrink-0 rounded-2xl bg-canopy-950/50 px-4 py-2 text-center ring-1 ring-cream/10">
      <div className="font-[family-name:var(--font-fredoka)] text-2xl font-700 tabular-nums text-sun-400">
        {daily.streak}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-cream-faint">
        🔥 day streak
      </div>
    </div>
  );
}

function DailyResult({
  result,
  onAward,
  onDiscover,
  onExit,
}: {
  result: GameResult;
  onAward: (result: GameResult, newDiscoveries: number) => RecordOutcome;
  onDiscover: (ids: string[]) => void;
  onExit: () => void;
}) {
  const [outcome, setOutcome] = useState<RecordOutcome | null>(null);
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const known = new Set(readLocalCollection());
    const newCount = result.discoveredIds.filter((id) => !known.has(id)).length;
    onDiscover(result.discoveredIds);
    setOutcome(onAward(result, newCount));
  }, [result, onAward, onDiscover]);

  const pct = Math.round(result.accuracy * 100);
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <div className="text-5xl">🗓️</div>
        <h1 className="mt-2 font-[family-name:var(--font-fredoka)] text-3xl font-700 text-cream">
          Daily complete!
        </h1>
        <p className="mt-1 text-cream-dim">
          {result.correctCount}/{result.totalQuestions} correct · {pct}%
        </p>
      </motion.div>

      <div className="mx-auto w-full max-w-sm text-left">
        <AwardBanner outcome={outcome} />
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <ButtonLink variant="leaf" size="lg" href="/profile">
          🎖️ Profile
        </ButtonLink>
        <Button variant="wood" size="lg" onClick={onExit}>
          Done
        </Button>
      </div>
    </div>
  );
}
