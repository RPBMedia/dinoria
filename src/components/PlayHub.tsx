"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { GameDifficulty, GameMode } from "@/types/game";
import { DIFFICULTY_CONFIG, poolFor } from "@/lib/quiz";
import { DINOSAURS } from "@/lib/dinosaurs";
import { trackQuizStarted } from "@/lib/analytics";
import { Button, Card } from "@/components/ui";
import { QuizGame } from "@/components/QuizGame";

const poolSize = (id: GameDifficulty) => poolFor(DINOSAURS, id).length;

const DIFFICULTIES: {
  id: GameDifficulty;
  label: string;
  blurb: string;
  emoji: string;
}[] = [
  { id: "easy", label: "Easy", blurb: `The ${poolSize("easy")} most famous`, emoji: "🥚" },
  { id: "normal", label: "Normal", blurb: `${poolSize("normal")} classic dinosaurs`, emoji: "🦕" },
  { id: "hard", label: "Hard", blurb: `${poolSize("hard")} species to master`, emoji: "🦖" },
  { id: "very-hard", label: "Very Hard", blurb: `${poolSize("very-hard")} incl. rare finds`, emoji: "🌋" },
  { id: "legendary", label: "Legendary", blurb: `All ${poolSize("legendary")} dinosaurs`, emoji: "👑" },
];

const MODES: { id: GameMode; label: string }[] = [
  { id: "10", label: "10 Questions" },
  { id: "25", label: "25 Questions" },
  { id: "50", label: "50 Questions" },
  { id: "endless", label: "Endless" },
];

export function PlayHub() {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy");
  const [mode, setMode] = useState<GameMode>("10");
  const [playing, setPlaying] = useState(false);

  // Deep link: /#play jumps straight into a quick round (shareable "play now").
  useEffect(() => {
    if (window.location.hash === "#play") setPlaying(true);
  }, []);

  if (playing) {
    // Portal to <body> so the fullscreen game escapes the landing's stacking
    // context (otherwise the site header bleeds through).
    return createPortal(
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-canopy-950">
        <QuizGame
          mode={mode}
          difficulty={difficulty}
          onExit={() => setPlaying(false)}
        />
      </div>,
      document.body,
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-2xl"
      >
        <Card className="p-5 sm:p-6">
          <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-700 text-cream">
            Choose your adventure
          </h2>

          <p className="mt-4 text-sm uppercase tracking-wider text-cream-faint">
            Difficulty
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DIFFICULTIES.map((d) => {
              const locked = !DIFFICULTY_CONFIG[d.id].available;
              const active = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  disabled={locked}
                  onClick={() => setDifficulty(d.id)}
                  className={`btn-chunky rounded-2xl p-3 text-left ring-1 ${
                    active
                      ? "bg-sun-500/90 text-canopy-950 ring-sun-300"
                      : locked
                        ? "cursor-not-allowed bg-canopy-950/40 text-cream-faint ring-cream/5"
                        : "bg-canopy-800/70 text-cream ring-cream/15 hover:bg-canopy-700/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden>{d.emoji}</span>
                    <span className="font-600">{d.label}</span>
                    {locked && <span className="ml-auto text-xs">🔒</span>}
                  </div>
                  <div className="mt-0.5 text-xs opacity-80">{d.blurb}</div>
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm uppercase tracking-wider text-cream-faint">
            Length
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`btn-chunky rounded-2xl px-3 py-3 text-sm ring-1 ${
                  mode === m.id
                    ? "bg-leaf-500 text-canopy-950 ring-leaf-300 font-700"
                    : "bg-canopy-800/70 text-cream ring-cream/15 hover:bg-canopy-700/80"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() => {
              trackQuizStarted(mode, difficulty);
              setPlaying(true);
            }}
          >
            ▶ Start quiz
          </Button>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
