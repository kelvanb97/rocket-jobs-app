---
name: autoresearch
description: Run an autonomous improvement loop on an artifact (prompt, script, config, algorithm) against a measurable eval metric. Use when the user wants to iteratively improve something with a scoring/eval script. Inspired by Andrej Karpathy's autoresearch framework.
---

<autoresearch>

# Autoresearch Skill

You are running an autonomous improvement loop. Your job is to improve an artifact by proposing and testing one change at a time, keeping changes that improve the metric and reverting ones that don't.

## Before Starting

Check whether a `program.md` exists in the project's `autoresearch/` directory. If it does, read it — it contains the goal, artifact location, eval command, metric, hypotheses, and constraints. Follow it exactly.

If no `program.md` exists, ask the user to fill in the template below before running the loop.

## Required Ingredients (verify all three exist)

1. **Artifact** — the file being improved (single file, fits in context window)
2. **Eval set** — fixed labeled dataset (never modified during the loop)
3. **Metric** — a single number output by the eval script (deterministic, fast)

If any of these are missing, stop and tell the user what's needed before proceeding.

## The Loop (repeat until told to stop or plateau reached)

For each iteration:

1. **Read `autoresearch/evals/results.jsonl`** — understand what has already been tried. Never propose something that was already tried and failed.
2. **Read the current artifact** (`autoresearch/artifact/current.*`)
3. **State your hypothesis** — write out WHY this specific change should improve the metric before touching anything
4. **Apply exactly one change** — never make multiple changes in one iteration
5. **Run the eval script** — record the metric output exactly
6. **Compare to previous best**:
   - If improved: append to `results.jsonl` with `"kept": true`, continue to next iteration
   - If not improved: revert the artifact to its prior state, append to `results.jsonl` with `"kept": false`, try a different approach
7. **Report the iteration result** to the user: iteration number, metric before/after, change description, kept/reverted

## results.jsonl — append one line per iteration

```json
{
  "timestamp": "<ISO 8601>",
  "iteration": <number>,
  "metric": <number>,
  "delta": <new - previous>,
  "change_description": "<one sentence>",
  "kept": <true|false>,
  "artifact_snapshot": "<optional: key changed lines>"
}
```

Never delete or modify existing entries. Append-only.

## Stop and Flag to Human When

- Metric has plateaued for 10+ consecutive iterations with no improvement
- Metric is consistently degrading
- All hypotheses in `program.md` have been exhausted
- The eval set appears to have errors or is too small (< 20 examples)
- You are unsure whether a change is valid given the constraints

## Hard Rules

- **One change at a time** — always
- **Never modify the eval set** (`autoresearch/evals/eval_set.json`)
- **Never modify the baseline artifact** (`autoresearch/artifact/baseline.*`)
- **Always read `results.jsonl` before proposing** — avoid repeating failed attempts
- **Always revert on no improvement** — never leave a degraded artifact in place

---

## Setup Template (if starting fresh)

If the user says `/autoresearch setup` or no `program.md` exists, scaffold the directory structure and output a filled `program.md` template for the user to complete:

```
autoresearch/
  artifact/
    current.{ext}      ← copy of the artifact to improve
    baseline.{ext}     ← identical copy, never touch this
  evals/
    eval_set.json      ← labeled dataset
    results.jsonl      ← start empty: []
  scripts/
    eval.ts            ← runs artifact, outputs metric
  program.md           ← filled in by user
  log.md               ← human-readable notes
```

Output this `program.md` template for the user to fill in:

```markdown
# [Project Name] Autoresearch

## Goal
[One sentence: what are we trying to improve?]

## Artifact
Location: autoresearch/artifact/current.[ext]
Description: [What the artifact is and what it does]

## Eval Set
Location: autoresearch/evals/eval_set.json
Size: [N examples]
Schema: [describe the fields]

## Metric
Script: [command to run eval]
Output: [metric name] — [higher/lower] is better
Baseline: [score from first run]
Current best: [updated as loop runs]

## Improvement Criteria
Keep a change if: metric improves by at least [threshold]
Revert a change if: metric does not improve or degrades

## What to try
- [hypothesis 1]
- [hypothesis 2]
- [hypothesis 3]
- [hypothesis 4]
- [hypothesis 5]

## What not to change
- Do not modify the eval set
- Do not modify baseline artifact
- [domain-specific constraints]
```

</autoresearch>
