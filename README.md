# Plexus-Themed Web3 Crypto Dashboard

**Live demo:** https://plexus-themed-crypto-dashboard.vercel.app/  
**Repo:** https://github.com/amine-souissi0/plexus-themed-crypto-dashboard  
![CI](https://github.com/amine-souissi0/plexus-themed-crypto-dashboard/actions/workflows/ci.yml/badge.svg)

A small, production-flavored demo to showcase **DevOps + Full-stack** skills in a **Web3/crypto** context.  
Built with **Next.js**, containerized with **Docker**, and deployed on **Vercel** with **GitHub Actions** CI.

---

## Table of Contents
- [What This App Does](#what-this-app-does)
- [Why These Choices](#why-these-choices)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Docker (Production Image)](#docker-production-image)
- [Optional: Docker Compose for Dev](#optional-docker-compose-for-dev)
- [Continuous Integration (GitHub Actions)](#continuous-integration-github-actions)
- [Deploy to Vercel](#deploy-to-vercel)
- [Operations & Reliability Touches](#operations--reliability-touches)
- [Troubleshooting](#troubleshooting)
- [Roadmap / Nice Next Steps](#roadmap--nice-next-steps)
- [Talking Points for Recruiters](#talking-points-for-recruiters)

---

## What This App Does

- Renders a **Top 10 Crypto Dashboard** with live market data from **CoinGecko**.
- Uses a **Next.js serverless API route** (`/api/prices`) to fetch data (prevents CORS, allows caching and rate-limit handling).
- Polished UX: **search**, **dark mode toggle**, **auto-refresh (60s)**, **manual Refresh** button.
- Simple inline **7-day sparkline charts** (no extra chart library).
- Includes an **About** page with context for Web3 recruitment and quick links to **PlexusRS** and **Calendly**.
- Includes a **health endpoint** (`/api/health`) for readiness checks.
- Production touches: **Dockerfile** for reproducible builds, **CI** to build on push/PR, and **Vercel** hosting.

---

## Why These Choices

- **Next.js**: Pairs a React UI with serverless API routes. Easy to host on Vercel, and common for dApp front-ends.
- **Serverless API Route** (`/api/prices`): Calls CoinGecko from the server side → avoids CORS issues, lets us add caching headers and simple error handling.
- **Minimal dependencies**: Only `next`, `react`, `react-dom` to keep bundle small and installs fast.
- **Pure SVG sparklines**: Lightweight visualization without pulling in a charting dependency.
- **Docker**: Reproducible prod image, supports non-root runtime and smaller footprint with a multi-stage build.
- **Vercel**: Fast, reliable Next.js hosting with automatic deployments from GitHub.
- **CI (GitHub Actions)**: Ensures the app **builds** on every push/PR.

---

## Architecture

```
Browser (UI) ──> GET /               -> pages/index.js (React UI)
             └─> GET /api/prices     -> pages/api/prices.js (Serverless API -> CoinGecko)
             └─> GET /about          -> pages/about.js (Project context)
             └─> GET /api/health     -> pages/api/health.js (Readiness probe)

CoinGecko API  <── fetch (server-side from /api/prices)
```

**Flow:**  
1. The browser loads `/`.  
2. The page fetches **`/api/prices`**; the serverless function calls **CoinGecko** and returns JSON.  
3. The UI renders a table with **price**, **24h change**, **market cap**, and **7d sparkline**.  
4. Auto-refresh re-pulls `/api/prices` every 60s.  
5. `/api/health` returns `{ status: "ok" }` for operational checks.

---

## Features

- **Search** (by name or symbol)
- **Dark / Light mode** (persists via `localStorage`, respects OS preference on first run)
- **Auto-refresh** (60 seconds) + **manual Refresh** button
- **7-day sparkline** (inline SVG from CoinGecko `sparkline_in_7d`)
- **About** page with Plexus context and links
- **Health check** endpoint for readiness
- **Short cache headers** on `/api/prices` (s-maxage + stale-while-revalidate)
- **CI** on push/PR, **Dockerfile** for production images, **Vercel** deployment

---

## Project Structure

```
.
├─ pages/
│  ├─ index.js            # UI (React) - table, search, dark mode, auto-refresh, sparklines
│  ├─ about.js            # Why this is relevant for Web3 recruiting
│  ├─ _app.js             # Imports global CSS
│  └─ api/
│     ├─ prices.js        # Serverless API route -> fetches CoinGecko markets with sparkline
│     └─ health.js        # Simple readiness endpoint
│
├─ styles/
│  └─ globals.css         # Light/dark theme, basic utilities
│
├─ .github/workflows/
│  └─ ci.yml              # GitHub Actions pipeline (install + build)
│
├─ Dockerfile             # Multi-stage prod image (builder + non-root runner)
├─ next.config.js         # Minimal Next.js config (strict mode)
├─ package.json           # Scripts & deps
└─ README.md              # This file
```

---

## Local Development

**Requirements:** Node.js 18+

```bash
npm install
npm run dev
# open http://localhost:3000
```

**Common Windows notes**
- If you’re using **CMD**, don’t paste lines starting with `#` (those are bash comments).
- If npm behaves oddly on Windows/OneDrive, try clearing cache:
  ```cmd
  npm cache clean --force
  rmdir /s /q "%LocalAppData%\npm-cache"
  ```

---

## Docker (Production Image)

We use a **multi-stage** Dockerfile to produce a **small, non-root** runtime image.

Build:
```bash
docker build -t plexus-dashboard:latest .
```

Run (port 3000):
```bash
docker run --rm -p 3000:3000 plexus-dashboard:latest
# http://localhost:3000
```

If port 3000 is in use:
```bash
docker run --rm -p 3001:3000 plexus-dashboard:latest
# http://localhost:3001
```

**Useful commands**
```bash
docker ps           # list running containers
docker logs -f <id> # follow logs
docker stop <id>    # stop a detached container
docker image ls     # list images
docker image rm <id># remove image
```

> Optional enhancement: add a Docker **HEALTHCHECK** that hits `/api/health` to surface container health to orchestrators.

---

## Optional: Docker Compose for Dev

Hot-reload in a containerized dev environment:

```yaml
# docker-compose.yml
version: "3.9"
services:
  web:
    image: node:18-alpine
    working_dir: /app
    command: sh -c "npm install && npm run dev -p 3000"
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
```

Run:
```bash
docker compose up
```

---

## Continuous Integration (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

- Triggers on push/PR to `main` (and `master`).
- Steps:
  1. **Checkout** the code
  2. **Use Node 18**
  3. **Install deps** (`npm ci` fallback to `npm install`)
  4. **Build** (`npm run build`)

**Speed-up tip (cache)** – add to `setup-node` step:
```yaml
with:
  node-version: '18'
  cache: 'npm'
```
Check runs under your repo → **Actions** tab. **Green check** = success.

> Want container publishing? Add a second workflow using `docker/build-push-action` to push an image to Docker Hub or GHCR.

---

## Deploy to Vercel

**Via GitHub (recommended):**
1. Push the repo to GitHub.
2. Go to https://vercel.com → **Add New → Project** → import your repo.
3. Confirm framework = **Next.js** (defaults are fine).
4. Click **Deploy** → you’ll get a live URL.  
5. Every push to `main` triggers a new deploy automatically.

**Endpoints to test**
- `/` main dashboard
- `/about` context page
- `/api/health` returns `{ status: "ok" }`
- `/api/prices` returns JSON from CoinGecko (Top 10 markets with sparkline)

---

## Operations & Reliability Touches

- **Serverless API** fetch → easier CORS handling, centralized error handling, and caching headers.
- **Cache headers** on `/api/prices`: `s-maxage=60, stale-while-revalidate=120`
  (CDN can serve stale results while refreshing in background).
- **Health endpoint** (`/api/health`): trivial readiness probe, easy to wire into health checks.
- **Docker**: multi-stage → smaller image; **non-root** user in runtime stage.
- **CI**: ensures builds stay healthy; easy to extend with tests and linting.

**Security notes**
- No secrets are required for this demo; if added later, use **Vercel Environment Variables** (never commit secrets).
- Consider a **Content Security Policy** (via custom headers or middleware) for production hardening.
- Keep dependency updates regular; pin Node LTS in CI & Docker.

---

## Troubleshooting

- **Port in use**: Map another host port, e.g. `-p 3001:3000`.
- **CoinGecko rate limiting (HTTP 429)**: Refresh after a minute; our cache helps mask brief spikes.
- **Windows npm cache errors (ENOENT)**: Clear npm cache as shown above and avoid building inside OneDrive sync conflicts.
- **Alias import error (`@/styles/...`)**: Use relative import (`../styles/globals.css`) or add a `jsconfig.json` with a `paths` alias.
- **Vercel build fails**: Check the build log under Deployments; confirm Node 18 and that `pages/` exists in repo root.

---

## Roadmap / Nice Next Steps

- **Currency switcher** for USD/EUR/GBP (API already supports `vs_currency`).
- **Alerts** (e.g., price % threshold) with a simple notification banner.
- **Terraform** stub to provision a container app or VM (shows IaC skills).
- **Kubernetes** manifests + Helm chart for the containerized service.
- **Auth** (e.g., NextAuth) + role-based routes.
- **Unit/Integration tests** (Jest/React Testing Library & API route tests).
- **CSP / security headers** for tighter production posture.

---


