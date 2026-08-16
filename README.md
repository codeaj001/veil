# VEIL — Predict openly. Position privately.

A modern, mobile-responsive UI for **VEIL**, a privacy-preserving prediction/forecasting
network built on **Midnight**. This repo contains the **frontend only** (React + Vite),
using mock data — there is no backend or blockchain integration wired up. It is meant
to demonstrate the full product surface and interaction design described in the product spec.

> 📄 See **`FULL_SOURCE.md`** in this folder for a single-file reference containing
> the *entire* implementation (every component/page/config, concatenated with headers)
> so the whole codebase can be understood or replicated by reading one file.

## Stack

- **React 19 + Vite** — build tooling / dev server
- **React Router v6** — client-side routing (18+ routes)
- **Tailwind CSS v3** — utility-first styling, custom design tokens
- **Recharts** — probability / portfolio / P&L charts
- **lucide-react** — icon set

## Brand

| Token | Value | Use |
|---|---|---|
| `volt` | `#0047FF` | Primary accent, CTAs, links, "private" markers |
| `cream` | `#FFF8E7` | Primary text on near-black surfaces |
| `ink-950` | `#07070A` | App background |
| `yes` | `#2FD489` | YES / positive P&L |
| `no` | `#FF5C6C` | NO / negative P&L |

Typography: **Sora** (display/headings), **Manrope** (body/UI), **JetBrains Mono**
(numbers, addresses, stats) — a Bloomberg-terminal-meets-premium-fintech feel per the
product spec, avoiding generic Web3 gradients.

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

## Project structure

```
src/
  App.jsx                 route table
  main.jsx                entry point
  index.css               design system (Tailwind layers + custom utility classes)
  data/mock.js             all mock/demo data (markets, portfolio, leaderboard, etc.)
  lib/utils.js              formatting helpers (currency, status labels)
  components/
    AppShell.jsx           sidebar + topbar + mobile bottom-nav layout shell
    Logo.jsx
    MarketCard.jsx          market grid card (probability, volume, status)
    ProbabilityBar.jsx      YES/NO probability bar
    StatusDot.jsx           live / ending / closed / new indicator
    StatCard.jsx
    PageHeader.jsx
    Locked.jsx              "PRIVATE" pill badge
    ProofModal.jsx           the private-transaction + ZK proof-generation modal
  pages/
    Landing.jsx              marketing/landing page (unauthenticated)
    Login.jsx / Onboarding.jsx
    Dashboard.jsx             private portfolio overview ("Your VEIL")
    Markets.jsx / MarketDetail.jsx / MarketResolve.jsx
    Portfolio.jsx / Positions.jsx
    Activity.jsx              public network activity feed
    Leaderboard.jsx / ForecasterProfile.jsx
    Reputation.jsx            private VEIL score
    AIForecast.jsx / AIvsHuman.jsx
    CreateMarket.jsx
    Wallet.jsx
    PrivacyCenter.jsx         public-vs-private data matrix
    ProofExplorer.jsx          blockchain-style event explorer + proof detail
    Settings.jsx
    Africa.jsx                regional discover category
    Search.jsx / Notifications.jsx / NotFound.jsx
```

## Routes

```
/                         Landing (public)
/login                    Sign in
/onboarding               Create account -> wallet creation flow

/app                      Dashboard (private overview)
/markets                  All markets (search/filter/sort)
/markets/:id              Market detail + trading panel + proof modal
/markets/:id/resolve      Resolution page
/discover/africa          Africa category
/discover/ai-forecasts    AI Forecast (VEIL Intelligence)
/discover/ai-vs-human     Human vs AI comparison
/activity                 Public network activity
/leaderboard              Top forecasters
/forecaster/:username     Public forecaster profile
/portfolio                Private portfolio (charts, positions, category perf.)
/portfolio/positions      Positions table
/reputation               Private VEIL score
/wallet                   Wallet (public chain info vs private balance)
/privacy                  Privacy Center (public/private data matrix)
/proofs                   Proof Explorer
/create-market            Create market form
/settings                 Account / Privacy / Notifications / etc.
/search?q=                Global search results
/notifications            Notification center
```

## Design notes

- **Public vs. private is a first-class visual language**: a blue `Locked` pill,
  a lock icon, and blurred/redacted numbers are used consistently anywhere private
  data is referenced (dashboard, positions, wallet, proof explorer).
- **The Proof Modal** (`ProofModal.jsx`) is the core "hackathon moment": confirm →
  animated ZK proof generation with a progress bar and checklist → success state.
- Mobile: sidebar collapses into a slide-in drawer + a persistent bottom tab bar
  (Home / Markets / Activity / Portfolio / Profile); all grids collapse to 1–2
  columns; the market detail trading panel stacks below the chart.
- All data in `data/mock.js` is illustrative — swap in real API calls / a Midnight
  indexer without changing component structure.
