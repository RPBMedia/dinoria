"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { GameDifficulty, GameMode } from "@/types/game";
import type { Dinosaur } from "@/types/dinosaur";
import { useGame } from "@/hooks/useGame";
import { Button } from "@/components/ui";
import { EndScreen } from "@/components/EndScreen";

export function QuizGame({
  mode,
  difficulty,
  onExit,
}: {
  mode: GameMode;
  difficulty: GameDifficulty;
  onExit: () => void;
}) {
  const game = useGame(mode, difficulty);

  if (game.phase === "finished" && game.result) {
    return <EndScreen result={game.result} onHome={onExit} />;
  }

  const q = game.question;
  if (!q) return null;

  const timePct = Math.max(0, game.timeFraction) * 100;
  const timeColor =
    game.timeFraction > 0.5
      ? "bg-leaf-500"
      : game.timeFraction > 0.2
        ? "bg-sun-500"
        : "bg-lava-500";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-5">
      {/* HUD */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onExit}
          className="btn-chunky rounded-full bg-canopy-800/70 px-4 py-2 text-sm text-cream ring-1 ring-cream/15"
        >
          ← Quit
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-canopy-950/60 px-3 py-1.5 tabular-nums ring-1 ring-cream/10">
            {game.totalQuestions
              ? `${game.questionNumber} / ${game.totalQuestions}`
              : `#${game.questionNumber}`}
          </span>
          {game.lives != null && (
            <span className="rounded-full bg-canopy-950/60 px-3 py-1.5 ring-1 ring-cream/10">
              {"❤️".repeat(Math.max(0, game.lives))}
              {"🖤".repeat(Math.max(0, 3 - game.lives))}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {game.streak >= 2 && (
            <motion.span
              key={game.streak}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="rounded-full bg-sun-500/25 px-3 py-1.5 font-700 text-sun-300 ring-1 ring-sun-400/40"
            >
              🔥 {game.streak}
            </motion.span>
          )}
          <span className="rounded-full bg-canopy-950/60 px-3 py-1.5 font-700 tabular-nums text-sun-400 ring-1 ring-cream/10">
            {game.score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* timer */}
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-canopy-950/70 ring-1 ring-cream/10">
        <div
          className={`h-full ${timeColor} transition-[width] duration-75 ease-linear`}
          style={{ width: `${timePct}%` }}
        />
      </div>

      {/* question */}
      <h1 className="mt-5 text-center font-[family-name:var(--font-fredoka)] text-2xl font-700 text-cream sm:text-3xl">
        What dinosaur is this?
      </h1>

      {/* artwork */}
      <div className="relative mx-auto mt-4 aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-b from-canopy-800/60 to-canopy-950/80 ring-1 ring-cream/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.answer.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={q.answer.image}
              alt="Mystery dinosaur"
              fill
              priority
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-contain p-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* answers */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((opt) => (
          <AnswerButton
            key={opt.id}
            option={opt}
            phase={game.phase}
            isAnswer={opt.id === q.answer.id}
            isSelected={opt.id === game.selectedId}
            onClick={() => game.answer(opt.id)}
          />
        ))}
      </div>

      {/* reveal footer */}
      <div className="mt-4 min-h-16">
        <AnimatePresence>
          {game.phase === "revealed" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
            >
              <p className="text-center sm:text-left">
                {game.lastCorrect ? (
                  <span className="font-700 text-leaf-400">
                    Correct! +{game.lastPoints}
                  </span>
                ) : (
                  <span className="font-700 text-lava-400">
                    It was {q.answer.displayName}
                  </span>
                )}
                <span className="ml-2 text-sm text-cream-faint">
                  {q.answer.pronunciation}
                </span>
              </p>
              <Button variant="leaf" onClick={game.next} autoFocus>
                {game.totalQuestions &&
                game.questionNumber >= game.totalQuestions
                  ? "See results →"
                  : "Next →"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnswerButton({
  option,
  phase,
  isAnswer,
  isSelected,
  onClick,
}: {
  option: Dinosaur;
  phase: string;
  isAnswer: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const revealed = phase === "revealed";
  let style =
    "bg-canopy-800/70 text-cream ring-cream/15 hover:bg-canopy-700/80";
  if (revealed && isAnswer)
    style = "bg-leaf-600 text-canopy-950 ring-leaf-300 font-700";
  else if (revealed && isSelected)
    style = "bg-lava-600 text-cream ring-lava-300";
  else if (revealed) style = "bg-canopy-800/40 text-cream-faint ring-cream/10";

  return (
    <button
      disabled={revealed}
      onClick={onClick}
      className={`btn-chunky flex items-center gap-3 rounded-2xl px-5 py-4 text-left text-lg ring-1 ${style}`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-canopy-950/40 text-sm">
        {revealed && isAnswer ? "✓" : revealed && isSelected ? "✕" : "?"}
      </span>
      <span className="font-[family-name:var(--font-fredoka)] font-600">
        {option.displayName}
      </span>
    </button>
  );
}
