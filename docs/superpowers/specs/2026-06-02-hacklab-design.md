# HackLab — Interactive Security Learning for Developers

**Date:** 2026-06-02
**Status:** Approved (design)
**Project location:** `/Users/pavankumarmistry/Developer/hacklab`

## Purpose

A localhost-only, hands-on web app that teaches frontend and backend developers
how common security vulnerabilities work — so they can find and fix the same bugs
in their own code. Each topic is an interactive lab: a genuinely exploitable app
surface, an attack the learner performs themselves, and the fix shown to defuse it.

This is **defensive security education**. The vulnerable code exists only to be
understood and patched, and the app is hard-gated to run only on localhost.

## Target audience

Frontend and backend web developers (intermediate JS/TS). No prior security
background assumed; "basic + intermediate" depth.

## Core UX concept: Vulnerable ⇄ Fixed toggle

Every lab has a mode toggle. The learner:

1. Reads what the vulnerability is.
2. Performs an attack against the live lab surface in **Vulnerable** mode and sees it succeed.
3. Flips to **Fixed** mode and runs the **same attack** — it now fails.
4. Reviews vulnerable vs. secure code side-by-side.
5. Reads "why it works" and "how to detect this in your own code" + a checklist.

The same-attack-fails-after-fix moment is the central teaching device and must be
real (the secure code path genuinely blocks the attack, not a cosmetic message).

## Tech stack

- **Next.js 16 (App Router) + React 19 + TypeScript (strict).**
- **Tailwind CSS** — dark "lab" aesthetic; no component-library theme baggage.
- **better-sqlite3** — seeded local SQLite DB (users, invoices, comments) shared across backend labs.
- **Shiki** — syntax highlighting for the code panels.
- **Vitest** — unit tests for each lab's secure-path logic.

## Architecture

### Lab registry (extensibility)

Each lab is a self-contained folder:

```
labs/<slug>/
  meta.ts        # title, category, difficulty, summary, code snippets (strings), takeaways, checklist
  Lab.tsx        # interactive exploit panel (client component) with Vulnerable/Fixed UI
  route logic    # referenced API handler(s) for this lab
```

A central registry (`labs/registry.ts`) imports each lab's `meta` and exposes the
ordered list used by the home grid and nav. **Adding a lab = drop in a folder +
one registry line.** No other wiring.

Categories:

- `frontend` — client-side
- `backend` — server-side
- `auth` — auth & session
- `misconfig` — secrets / configuration

### API routes

`app/api/labs/<slug>/<action>/route.ts` handlers accept a `mode` value
(`vulnerable` | `secure`) and execute the corresponding code path against the
local SQLite DB. Backend bugs are genuinely exploitable in vulnerable mode.

The vulnerable and secure implementations live next to each other in the route so
the contrast is auditable and testable.

### Safety guard (hard gate)

- **Middleware** rejects any request whose host is not `localhost`/`127.0.0.1`,
  and refuses to run when `NODE_ENV=production`.
- A persistent on-screen banner states the app is intentionally vulnerable and
  must never be deployed publicly.
- README carries the same warning prominently.

### Database

`better-sqlite3` with a seed script creating:

- `users` (id, username, password_hash, role, email) — includes an `admin` and regular users.
- `invoices` (id, user_id, amount, detail) — used by the IDOR lab.
- `comments` (id, author, body) — used by the Stored XSS lab.

Seed runs idempotently on first server start (or via `pnpm seed`). DB file lives
under a gitignored local path.

## Site structure

- `/` — intro + safety warning + four category sections, each with lab cards.
  Cards show difficulty and a localStorage-backed "completed" mark.
- `/labs/[slug]` — standard lab layout:
  1. Title, category, difficulty, summary.
  2. **Interactive exploit panel** with the Vulnerable/Fixed toggle.
  3. Side-by-side vulnerable vs. secure code (Shiki).
  4. "Why it works" + "How to detect in your own code" + checklist.
  5. Prev/next lab navigation.

Progress tracking is client-only (localStorage); no auth, no accounts.

## The 8 labs (this build)

| # | Category | Slug | Vulnerability | Lab surface & attack |
|---|----------|------|---------------|----------------------|
| 1 | frontend | `stored-xss` | Stored XSS | Comment board; submit `<script>`/img-onerror payload that executes for every viewer. Fix: output encoding / sanitization. |
| 2 | frontend | `csrf` | CSRF | A "change email" action accepted without a token from a cross-site form. Fix: anti-CSRF token + SameSite. |
| 3 | backend | `sql-injection` | SQL Injection | Login/search using string-concatenated SQL; `' OR '1'='1` bypass / data exfil. Fix: parameterized queries. |
| 4 | backend | `idor` | IDOR / broken access control | View invoice by id; change the id to read another user's invoice. Fix: ownership check. |
| 5 | auth | `jwt-tampering` | JWT flaws | Forge an admin token via `alg=none` / weak secret. Fix: enforce alg + strong secret verification. |
| 6 | auth | `brute-force` | Missing rate limiting | Hammer the login endpoint with no throttle. Fix: rate limiter / lockout. |
| 7 | misconfig | `exposed-secrets` | Secret exposure | A debug/config endpoint leaks env secrets. Fix: remove endpoint / never expose server env. |
| 8 | misconfig | `security-headers` | Missing headers | No CSP / X-Frame-Options → clickjacking + inline-script demo. Fix: CSP + frame-ancestors. |

All labs share the SQLite users/invoices/comments data so the set feels like one app.

## Testing & quality

- **Vitest** unit tests per lab's secure path, proving "Fixed" mode genuinely blocks the attack:
  - parameterized query rejects `' OR '1'='1`
  - IDOR ownership check denies cross-user access
  - JWT verify rejects `alg=none` and wrong-secret tokens
  - rate limiter trips after N attempts
  - sanitizer strips/encodes script payloads
  - secure headers present; config endpoint absent in secure mode
- TypeScript strict; ESLint + Prettier.
- README documents setup, the localhost-only guarantee, and how to add a new lab.

## Non-goals (YAGNI)

- No user accounts, server-side progress, or database persistence of learner state.
- No deployment / hosting setup (localhost-only by design).
- No content beyond the 8 labs in this build; the registry pattern makes the
  remaining ~20 topics additive later.
- No CTF scoring, leaderboards, or gamification beyond a local "completed" mark.

## Out-of-scope safety boundary

All vulnerabilities are demonstrated against the app's own seeded local data on
localhost. The app provides no tooling for targeting external systems.
