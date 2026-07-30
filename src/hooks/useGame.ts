"use client";

/** The quiz game state machine — timer, answering, scoring, streaks.
 * Uses the pure engine in lib/quiz; keeps all UI-agnostic logic here. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dinosaur } from "@/types/dinosaur";
import type {
  AnswerRecord,
  GameDifficulty,
  GameMode,
  GameResult,
  Question,
} from "@/types/game";
import { DINOSAURS } from "@/lib/dinosaurs";
import {
  buildQuestions,
  poolFor,
  scoreAnswer,
  ENDLESS_LIVES,
  MODE_QUESTION_COUNT,
  QUESTION_TIME_MS,
} from "@/lib/quiz";
import { mulberry32 } from "@/lib/rng";

const TICK_MS = 50;
/** Endless is generated in chunks so the pool reshuffles seamlessly. */
const ENDLESS_CHUNK = 30;

export type Phase = "answering" | "revealed" | "finished";

export interface GameView {
  phase: Phase;
  question: Question | null;
  questionNumber: number;
  totalQuestions: number | null; // null = endless
  score: number;
  streak: number;
  lives: number | null; // endless only
  /** 0..1 remaining time. */
  timeFraction: number;
  /** Set once an answer is chosen or time runs out. */
  selectedId: string | null;
  lastCorrect: boolean | null;
  lastPoints: number;
  result: GameResult | null;
  answer: (dinosaurId: string | null) => void;
  next: () => void;
}

export function useGame(mode: GameMode, difficulty: GameDifficulty): GameView {
  const seed = useMemo(() => Date.now() >>> 0, []);
  const pool = useMemo(() => poolFor(DINOSAURS, difficulty), [difficulty]);
  const rngRef = useRef(mulberry32(seed));

  const initialCount =
    mode === "endless" ? ENDLESS_CHUNK : MODE_QUESTION_COUNT[mode];

  const [questions, setQuestions] = useState<Question[]>(() =>
    buildQuestions(pool, initialCount, rngRef.current),
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(ENDLESS_LIVES);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [remaining, setRemaining] = useState(QUESTION_TIME_MS);

  const startRef = useRef<number>(Date.now());
  const question = questions[index] ?? null;

  // ---- timer ----
  useEffect(() => {
    if (phase !== "answering") return;
    startRef.current = Date.now();
    setRemaining(QUESTION_TIME_MS);
    const id = window.setInterval(() => {
      const left = QUESTION_TIME_MS - (Date.now() - startRef.current);
      if (left <= 0) {
        window.clearInterval(id);
        setRemaining(0);
        resolveAnswer(null); // time out
      } else {
        setRemaining(left);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  const resolveAnswer = useCallback(
    (dinosaurId: string | null) => {
      setPhase((cur) => {
        if (cur !== "answering") return cur;
        const q = questions[index];
        const elapsed = Math.min(
          QUESTION_TIME_MS,
          Date.now() - startRef.current,
        );
        const correct = dinosaurId != null && dinosaurId === q.answer.id;
        const points = scoreAnswer({
          correct,
          elapsedMs: elapsed,
          difficulty,
          streak,
        });
        const nextStreak = correct ? streak + 1 : 0;

        setSelectedId(dinosaurId);
        setLastPoints(points);
        setScore((s) => s + points);
        setStreak(nextStreak);
        setRecords((r) => [
          ...r,
          {
            dinosaurId: q.answer.id,
            correct,
            elapsedMs: elapsed,
            points,
            streak: nextStreak,
          },
        ]);
        if (mode === "endless" && !correct) setLives((l) => l - 1);
        return "revealed";
      });
    },
    [questions, index, difficulty, streak, mode],
  );

  const answer = useCallback(
    (dinosaurId: string | null) => resolveAnswer(dinosaurId),
    [resolveAnswer],
  );

  const buildResult = useCallback(
    (allRecords: AnswerRecord[]): GameResult => {
      const correct = allRecords.filter((r) => r.correct);
      const fastest = correct.length
        ? Math.min(...correct.map((r) => r.elapsedMs))
        : null;
      return {
        mode,
        difficulty,
        score,
        totalQuestions: allRecords.length,
        correctCount: correct.length,
        accuracy: allRecords.length ? correct.length / allRecords.length : 0,
        longestStreak: allRecords.reduce((m, r) => Math.max(m, r.streak), 0),
        fastestAnswerMs: fastest,
        discoveredIds: [...new Set(correct.map((r) => r.dinosaurId))],
        finishedAt: Date.now(),
      };
    },
    [mode, difficulty, score],
  );

  const [result, setResult] = useState<GameResult | null>(null);

  const next = useCallback(() => {
    const answered = records.length;
    const outOfLives = mode === "endless" && lives <= 0;
    const doneFixed = mode !== "endless" && answered >= questions.length;

    if (outOfLives || doneFixed) {
      setResult(buildResult(records));
      setPhase("finished");
      return;
    }

    // endless: extend the question list as we approach the end
    if (mode === "endless" && index + 2 >= questions.length) {
      setQuestions((qs) => [
        ...qs,
        ...buildQuestions(pool, ENDLESS_CHUNK, rngRef.current),
      ]);
    }
    setSelectedId(null);
    setLastPoints(0);
    setIndex((i) => i + 1);
    setPhase("answering");
  }, [records, mode, lives, questions.length, index, pool, buildResult]);

  const lastRecord = records[records.length - 1];

  return {
    phase,
    question,
    questionNumber: index + 1,
    totalQuestions: mode === "endless" ? null : questions.length,
    score,
    streak,
    lives: mode === "endless" ? lives : null,
    timeFraction: remaining / QUESTION_TIME_MS,
    selectedId,
    lastCorrect: phase === "revealed" ? (lastRecord?.correct ?? null) : null,
    lastPoints,
    result,
    answer,
    next,
  };
}

/** Options a question presents (answer + distractors), typed for the UI. */
export type { Dinosaur };
