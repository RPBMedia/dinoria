# 🦕 Dinoria

**A beautiful prehistoric quiz adventure.** Study the artwork, name the
dinosaur, beat the clock, build streaks and climb the leaderboard. Built to grow
from a quiz into a whole prehistoric learning world (see `DINORIA_PRD.md`).

> **Milestone 1 (this iteration):** polished MVP — animated jungle landing,
> guest play, the "Name that dinosaur" quiz with a timer, speed/streak/difficulty
> scoring, an end screen, a 24-dinosaur database, leaderboards, optional accounts
> (Firebase, graceful fallback), SEO, and a production build. Fully playable with
> **no backend required**.

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **Framer Motion** (subtle motion)
- **Firebase** Auth + Firestore — *optional* (guest play + local scores work
  without it)
- **React Query** · **Vitest** · **ESLint** · **Prettier**

## Architecture

```
src/
  app/        routes, layout, SEO (robots/sitemap/manifest)
  components/ UI (JungleScene, QuizGame, EndScreen, PlayHub, header, modals)
  hooks/      useGame — the quiz state machine
  lib/        quiz engine (pure, tested), rng, dinosaur accessors, site config
  services/   auth + leaderboard (Firebase-optional)
  data/       dinosaurs.json — the single, data-driven source of dino content
  types/      domain models
public/dinos/ self-hosted, licensed dinosaur artwork
```

Business logic (question generation, distractors, scoring) lives in
`src/lib/quiz.ts` — pure and unit-tested, with no React or I/O.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # engine unit tests
npm run lint
npm run build      # production build
```

The game runs immediately as a **guest** — no configuration needed. To enable
accounts and the global leaderboard, add Firebase keys (see
[`FIREBASE-SETUP.md`](./FIREBASE-SETUP.md)).

## Data & attribution

All dinosaur content is data-driven from `src/data/dinosaurs.json`. Artwork is by
**TotalDino** via **Wikimedia Commons** (CC0 / CC BY / CC BY-SA 4.0), credited
per-record in `imageAttribution` and self-hosted under `public/dinos/`.

## Deployment

Deploys to **Vercel** as a standard Next.js app (automatic + preview
deployments, image optimization, compression). Production domain target:
`dinoria.com`. Set `NEXT_PUBLIC_SITE_URL` to the canonical URL for correct
sitemap/robots/OG.

## Roadmap (from the PRD)

- **M2** — dinosaur collection, larger database, richer animations
- **M3** — expeditions, world map, progression
- **M4** — XP, levels, achievements, daily challenge
- **M5** — multiplayer, fossil digging, seasonal events, AI facts
