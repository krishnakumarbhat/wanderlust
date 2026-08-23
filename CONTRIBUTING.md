# Contributing to wanderlust 🌍

Thanks for your interest in contributing! This guide gets you from clone to merged PR.

## Getting started

```bash
# Backend
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env   # set WANDERLUST_SECRET_KEY
python backend/app.py

# Frontend (second terminal)
npm install
npm run dev
```

Verify everything passes before pushing:

```bash
pytest tests/ -q          # backend pipeline tests (run inside backend/ or with tests/ on path)
npx tsc --noEmit          # frontend typecheck
npm run build             # frontend build
```

## How to contribute

1. **Find or create an issue** — browse the [roadmap](README.md#️-roadmap) and open issues. Comment "I'd like to work on this" to claim it.
2. **Fork & branch** — `git checkout -b feat/trip-sharing` (prefixes: `feat/`, `fix/`, `docs/`, `chore/`)
3. **Make your change** — keep PRs small and focused; one feature per PR.
4. **Test it** — new backend logic needs a pytest case; UI changes should be manually verified at common screen sizes.
5. **Open a PR** — describe what and why; link the issue (`Closes #12`). CI must pass.

## Good first issues

New to open source? These are scoped to be approachable:

- Trip sharing links (public read-only `/trip/:id`)
- Dark mode toggle (Tailwind `class` strategy)
- Export bucket list as JSON/GPX
- Empty-state illustrations for sidebar

Look for the `good first issue` label on the tracker.

## Project conventions

| Area | Convention |
| ---- | ---------- |
| Frontend | TypeScript strict, React function components, Tailwind utility classes |
| Backend | Python 3.10+, stdlib-first, Flask blueprints not required yet |
| Tests | pytest under `tests/`; name them `test_<behavior>` |
| Commits | Conventional-ish: `feat:`, `fix:`, `docs:`, `chore:` |
| Secrets | Never commit keys/tokens — use `.env` (see `backend/.env.example`) |

## Reporting bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml). Include reproduction steps and environment info.

## Code of conduct

Be excellent to each other. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
