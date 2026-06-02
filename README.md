# HackLab 🔓→🔒

Hands-on, **localhost-only** labs that teach frontend and backend developers how
common web vulnerabilities work — by exploiting them, then watching the fix
defuse the same attack.

> ## ⚠️ Safety
> This app is **intentionally vulnerable**. It is hard-gated to run only on
> `localhost` and refuses to start in production. **Never deploy it publicly,
> expose it to a network, or point it at real systems or data.**

## Getting started

```bash
pnpm install
pnpm seed     # create + seed the local SQLite database (hacklab.db)
pnpm dev      # http://localhost:3000
```

Run the tests (they prove each lab's *Fixed* mode genuinely blocks the attack):

```bash
pnpm test
```

## How a lab works

Every lab page has a **Vulnerable ⇄ Fixed** toggle:

1. Read what the vulnerability is.
2. Run the attack in **Vulnerable** mode and watch it succeed.
3. Flip to **Fixed** mode and run the *same attack* — it now fails.
4. Compare the vulnerable vs. secure code side-by-side.
5. Read "why it works" + "how to detect it in your own code" + a checklist.

## Labs

| Category | Lab |
|----------|-----|
| Frontend | Stored XSS, CSRF |
| Backend | SQL Injection, IDOR (broken access control) |
| Auth & session | JWT tampering (alg=none), Brute force (no rate limiting) |
| Secrets & misconfig | Exposed secrets endpoint, Missing security headers (clickjacking) |

## Code Recon (grep / find / ripgrep)

The **Code Recon** page (`/recon`) teaches you to hunt secrets and dangerous
code from the command line. It has a cheatsheet (grep, find, ripgrep, regex,
security one-liners) and graded practice challenges you run in your **real
terminal** against `practice-target/` — a small sample codebase deliberately
seeded with hardcoded secrets, `eval`, XSS sinks, SQL concatenation, and leaked
tokens.

```bash
# example: hunt hardcoded secrets in the practice target
grep -rniE "(api[_-]?key|secret|password|token)" practice-target
```

## Adding a new lab

Labs are self-contained and auto-discovered:

1. Create `src/labs/<slug>/meta.ts` exporting a `LabMeta` (title, category,
   difficulty, summary, vulnerable/secure code snippets, why, detect, checklist).
2. Create `src/labs/<slug>/Lab.tsx` — the interactive client component with a
   `ModeToggle`.
3. Add the API route(s) under `src/app/api/labs/<slug>/...`, branching on a
   `mode` (`vulnerable` | `secure`) search param. Keep the testable logic in a
   `route-logic.ts` next to the lab.
4. Register it in `src/labs/registry.ts`.
5. Add a `tests/<slug>.test.ts` proving the secure path blocks the attack.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · better-sqlite3 ·
jsonwebtoken · Shiki · Vitest.
