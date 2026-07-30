# Dinoria Product Requirements Document (PRD)

> **Version:** 1.0\
> **Project:** Dinoria\
> **Repository:** `dinoria`\
> **Production Domain:** `dinoria.com`

------------------------------------------------------------------------

# Mission

Build **Dinoria**, a commercial-quality prehistoric learning platform
whose first product is a polished dinosaur quiz game for children and
enthusiasts. Design every system so it can grow into a long-term
entertainment and education brand.

------------------------------------------------------------------------

# Product Vision

Dinoria is not "a dinosaur quiz."

Dinoria is an entire prehistoric world.

The first release is a quiz, but the architecture must support future
products including:

-   Dinoria Quiz
-   Dinoria Explorer
-   Dinoria Collection
-   Dinoria Expeditions
-   Dinoria Encyclopedia
-   Fossil excavation
-   Multiplayer
-   Mobile apps

------------------------------------------------------------------------

# Product Principles

Priority order:

1.  Production stability
2.  Correctness
3.  User experience
4.  Maintainability
5.  Performance
6.  Accessibility
7.  Visual polish
8.  Feature completeness

Never sacrifice a higher priority for a lower one.

------------------------------------------------------------------------

# Audience

Primary: - Children 3--10 (with parental assistance for younger users)

Secondary: - Dinosaur enthusiasts - Parents - Teachers

------------------------------------------------------------------------

# Brand Identity

Premium, adventurous, educational and magical.

Inspirations:

-   Nintendo
-   Pokémon
-   Duolingo
-   Jurassic Park
-   Jurassic World Evolution

------------------------------------------------------------------------

# Landing Experience

Animated prehistoric jungle.

Include:

-   mist
-   sunlight
-   birds
-   volcano smoke
-   ambient sounds
-   animated logo reveal

------------------------------------------------------------------------

# Authentication

Support:

-   Guest
-   Email/password
-   Google Sign-In

Guests can immediately play.

Accounts unlock:

-   cloud save
-   achievements
-   collections
-   leaderboards
-   XP
-   levels

------------------------------------------------------------------------

# Home Screen

Sections:

-   Play
-   Expeditions
-   Dinosaur Collection
-   Leaderboards
-   Profile
-   Settings

Animated prehistoric background.

------------------------------------------------------------------------

# Gameplay

Question:

"What dinosaur is this?"

Show:

-   large artwork
-   four answers
-   countdown timer

Distractors should be related dinosaurs.

------------------------------------------------------------------------

# Difficulties

Easy (\~20 dinosaurs)

Normal (\~50)

Hard (\~100)

Very Hard (\~150)

Legendary (200+)

------------------------------------------------------------------------

# Modes

-   10 Questions
-   25 Questions
-   50 Questions
-   Endless

------------------------------------------------------------------------

# Scoring

Based on:

-   correctness
-   speed
-   difficulty
-   streak

Reward streaks.

------------------------------------------------------------------------

# End Screen

Display:

-   Score
-   Accuracy
-   Longest streak
-   Fastest answer
-   XP
-   Discoveries

Buttons:

-   Play Again
-   Home
-   Collection
-   Share

------------------------------------------------------------------------

# Dinosaur Collection

Unlock every correctly identified dinosaur.

Hidden dinosaurs remain silhouettes.

Each dinosaur page includes:

-   Image
-   Scientific name
-   Common name
-   Pronunciation
-   Meaning
-   Period
-   Diet
-   Family
-   Height
-   Length
-   Weight
-   Discovery country
-   Discovery year
-   Discoverer
-   Description
-   Interesting facts

------------------------------------------------------------------------

# Dinosaur Database

Data-driven only.

No hardcoded dinosaur data.

Fields:

-   id
-   scientificName
-   displayName
-   pronunciation
-   meaning
-   image
-   difficulty
-   family
-   period
-   diet
-   height
-   length
-   weight
-   country
-   discoveryYear
-   discoverer
-   description
-   interestingFacts

------------------------------------------------------------------------

# Expeditions

Future feature.

Maps:

-   Triassic
-   Jurassic
-   Cretaceous

Regions unlock through gameplay.

------------------------------------------------------------------------

# Progression

XP

Levels

Achievements

Badges

Profile cosmetics

Daily challenge

------------------------------------------------------------------------

# Leaderboards

Today

Week

Month

All Time

Difficulty filters.

------------------------------------------------------------------------

# Audio

Optional.

Ambient jungle sounds.

Independent music/effects controls.

------------------------------------------------------------------------

# Accessibility

Responsive.

Keyboard navigation.

Large touch targets.

Readable typography.

Colorblind-friendly palette.

------------------------------------------------------------------------

# Art Direction

Semi-realistic.

Scientifically inspired.

Colorful.

Consistent illustration style.

------------------------------------------------------------------------

# UI

Use:

-   React
-   Next.js
-   TypeScript
-   Tailwind CSS
-   Framer Motion

Premium Nintendo-quality interface.

------------------------------------------------------------------------

# Technical Stack

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Firebase Authentication
-   Firestore
-   React Query
-   ESLint
-   Prettier

Architecture:

-   components
-   pages/app
-   services
-   hooks
-   utils
-   types
-   data
-   config

Keep business logic separated from UI.

------------------------------------------------------------------------

# SEO

Design for search visibility from day one.

Include:

-   semantic HTML
-   metadata
-   sitemap
-   robots.txt
-   structured data
-   canonical URLs
-   Open Graph
-   optimized images
-   lazy loading

Every dinosaur should eventually have an SEO page:

/dinosaurs/tyrannosaurus-rex

------------------------------------------------------------------------

# Future Expansion

-   multiplayer
-   fossil excavation
-   encyclopedia
-   AI facts
-   mobile apps
-   seasonal events
-   trading cards
-   offline mode

------------------------------------------------------------------------

# Git

Repository:

dinoria

Default branch:

main

Small logical commits.

Meaningful commit messages.

Main branch must always be deployable.

------------------------------------------------------------------------

# Deployment

Deploy using Vercel.

Production domain:

dinoria.com

Configure:

-   HTTPS
-   automatic deployments
-   Preview deployments
-   caching
-   compression
-   image optimization

Choose one canonical URL.

------------------------------------------------------------------------

# Development Strategy

Build incrementally.

Never build everything at once.

## Milestone 1

Deliver a polished MVP including:

-   Landing page
-   Authentication
-   Guest mode
-   Google login
-   Quiz
-   Timer
-   Scoring
-   End screen
-   Small dinosaur database
-   Leaderboards
-   Responsive UI
-   Firebase
-   Production deployment

Test thoroughly.

Fix bugs.

Commit.

Push.

Deploy.

Verify production.

Only continue after Milestone 1 is stable.

## Milestone 2

-   Collection
-   Larger dinosaur database
-   UI improvements
-   Better animations

## Milestone 3

-   Expeditions
-   World map
-   Progression

## Milestone 4

-   XP
-   Levels
-   Achievements
-   Daily Challenge

## Milestone 5

Advanced systems:

-   Multiplayer
-   Seasonal events
-   Fossil digging
-   AI facts
-   Additional modes

------------------------------------------------------------------------

# Workflow For Every Milestone

1.  Produce an implementation plan.
2.  Implement.
3.  Run tests.
4.  Fix issues.
5.  Build production.
6.  Commit.
7.  Push to GitHub (`dinoria`).
8.  Deploy to Vercel.
9.  Verify `dinoria.com`.
10. Continue only if production is healthy.

------------------------------------------------------------------------

# Definition of Done

Every feature must:

-   work correctly
-   be responsive
-   pass lint
-   build successfully
-   be accessible
-   be documented
-   be committed
-   be deployed
-   leave main deployable

------------------------------------------------------------------------

# Final Objective

Build a commercial-quality product that can grow for years.

Every decision should strengthen the Dinoria brand, delight children and
families, and create a maintainable codebase suitable for long-term
development.
