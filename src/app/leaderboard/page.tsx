"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "@/types/game";
import {
  readLocalScores,
  fetchGlobalScores,
  globalLeaderboardAvailable,
} from "@/services/leaderboard";
import { JungleScene } from "@/components/JungleScene";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui";

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"local" | "global">("local");
  const [local, setLocal] = useState<LeaderboardEntry[]>([]);

  useEffect(() => setLocal(readLocalScores()), []);

  const global = useQuery({
    queryKey: ["global-scores"],
    queryFn: fetchGlobalScores,
    enabled: tab === "global" && globalLeaderboardAvailable,
  });

  const rows = tab === "local" ? local : (global.data ?? []);

  return (
    <div className="relative flex flex-1 flex-col">
      <JungleScene />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-4 pb-16">
        <h1 className="mt-4 text-center font-[family-name:var(--font-fredoka)] text-4xl font-700 text-cream">
          🏆 Leaderboard
        </h1>

        <div className="mx-auto mt-5 flex max-w-xs gap-2">
          <Tab active={tab === "local"} onClick={() => setTab("local")}>
            This device
          </Tab>
          <Tab active={tab === "global"} onClick={() => setTab("global")}>
            Global
          </Tab>
        </div>

        <Card className="mt-5 overflow-hidden">
          {tab === "global" && !globalLeaderboardAvailable ? (
            <Empty>
              The global leaderboard turns on once the game is connected to its
              database. Your best scores are saved on this device meanwhile.
            </Empty>
          ) : tab === "global" && global.isLoading ? (
            <Empty>Loading explorers…</Empty>
          ) : rows.length === 0 ? (
            <Empty>No scores yet — play a round to claim the top spot! 🦕</Empty>
          ) : (
            <ol>
              {rows.map((r, i) => (
                <li
                  key={`${r.name}-${r.finishedAt}-${i}`}
                  className="flex items-center gap-3 border-b border-cream/5 px-4 py-3 last:border-0"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-700 tabular-nums ${
                      i === 0
                        ? "bg-sun-400 text-canopy-950"
                        : i === 1
                          ? "bg-cream-dim text-canopy-950"
                          : i === 2
                            ? "bg-lava-400 text-canopy-950"
                            : "bg-canopy-950/50 text-cream-faint"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-600 text-cream">
                    {r.name}
                  </span>
                  <span className="text-xs text-cream-faint">
                    {r.difficulty} · {r.mode}
                  </span>
                  <span className="w-20 text-right font-[family-name:var(--font-fredoka)] font-700 tabular-nums text-sun-400">
                    {r.score.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </main>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn-chunky flex-1 rounded-xl py-2 text-sm ring-1 ${
        active
          ? "bg-canopy-700 text-cream ring-cream/20"
          : "bg-canopy-900/60 text-cream-faint ring-cream/10"
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-10 text-center text-cream-dim">{children}</p>;
}
