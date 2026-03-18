# Scorer

Scores unscored job roles against a hardcoded candidate profile using Claude, writing results back to Supabase. Runs as a standalone Node script — no server, no build step.

---

## Setup

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Default |
|---|---|---|
| `SUPABASE_URL` | Supabase instance URL | `http://127.0.0.1:54321` (local) |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | — |
| `SUPABASE_SECRET_KEY` | Supabase service role key | — |
| `ANTHROPIC_API_KEY` | Anthropic API key | — |
| `SCORER_MODEL` | Claude model ID to use | Haiku |
| `SCORER_RATE_LIMIT_MS` | Delay between API calls (ms) | `500` |

---

## Scripts

| Script | Command | Purpose |
|---|---|---|
| Score | `pnpm score` | Fetch all unscored roles from DB and score them |
| Label | `pnpm label` | Interactive CLI to manually score roles (0–100). Entering `0` skips binary questions (all default to false). |
| Backfill eval | `pnpm backfill-eval` | Sync `data/labeled-roles.json` → `autoresearch/evals/eval_set.json` |
| Evaluate | `pnpm eval-ar` | Run eval loop against current prompt, output MAE |

---

## End-to-end workflow

1. **Label** (`pnpm label`) — Interactively score roles 0–100 with reasoning. Saves to `data/labeled-roles.json`.
2. **Backfill** (`pnpm backfill-eval`) — Converts labeled roles into structured eval examples at `autoresearch/evals/eval_set.json`. Re-run whenever new labels are added.
3. **Eval** (`pnpm eval-ar`) — Scores every example using the current system prompt, prints per-example diffs, outputs final MAE. Lower is better.
4. **Improve** — Edit `autoresearch/artifact/current.ts` (the system prompt). Only keep a change if MAE drops by ≥ 0.5.
5. **Score** (`pnpm score`) — Once the prompt is tuned, run against all unscored roles in the DB.

---

## Autoresearch loop

The eval loop measures prompt quality as a **composite metric** — lower is better:

```
composite = scoreMAE + (1 - binaryAccuracy) * 20
```

- `scoreMAE`: mean absolute error on 0–100 scores
- `binaryAccuracy`: fraction of correctly predicted binary fields (`isTitleFit`, `isSeniorityAppropriate`, `doSkillsAlign`, `isLocationAcceptable`, `isSalaryAcceptable`) across all examples
- Binary penalty ranges 0–20; score MAE ranges 0–100

**Two-prompt architecture:** `autoresearch/artifact/current.ts` is the experimental artifact — edit this during autoresearch. `packages/_api/score/src/prompt/scoring-prompt.ts` is the production prompt used by the scorer and labeler. Promotion is manual: when `current.ts` produces a lower composite metric, copy its body into `scoring-prompt.ts` and commit both files together.

**What to edit:** `autoresearch/artifact/current.ts` — the system prompt.

**Improvement bar:** Only keep a change if composite metric decreases by ≥ 0.5.

**What to tune:**
- Score band calibration (what makes a 40 vs a 70)
- Salary weighting
- Seniority guidance
- Few-shot examples

**What not to touch:**
- `autoresearch/evals/eval_set.json` — ground truth, edit via `pnpm backfill-eval` only
- JSON output format — the eval parser depends on it (`score`, `isTitleFit`, `isSeniorityAppropriate`, `doSkillsAlign`, `isLocationAcceptable`, `isSalaryAcceptable`, `positive`, `negative`)
- 0–100 scale

See `autoresearch/program.md` for full guidance.

---

## Key files

| Path | Purpose |
|---|---|
| `src/scorer.ts` | Main scoring loop |
| `src/eval/labeler.ts` | `runLabeler()` + `runBackfill()` |
| `src/eval/dataset.ts` | File I/O for both datasets |
| `autoresearch/artifact/current.ts` | Active system prompt |
| `autoresearch/scripts/eval.ts` | Eval runner (outputs MAE) |
| `autoresearch/evals/eval_set.json` | Eval dataset (generated, do not edit manually) |
| `data/labeled-roles.json` | Human labels (source of truth) |

`labeled-roles.json` is the source of truth for human labels. Schema: `{ roleId, humanScore, isTitleFit, isSeniorityAppropriate, doSkillsAlign, isLocationAcceptable, isSalaryAcceptable, labeledAt }`. `eval_set.json` is a derived snapshot of pre-built prompts — what the eval runner actually sends to Claude. Run `pnpm backfill-eval` to regenerate it if `buildScoringPrompt()` changes.
