# Scoring Prompt Autoresearch

## Goal
Minimize composite error between Claude's job-match scores/binary labels and human-labeled ground truth.

## Artifact
Location: autoresearch/artifact/current.ts
Description: System prompt string (default export) passed to Claude for job scoring.

## Eval Set
Location: autoresearch/evals/eval_set.json
Schema: { roleId, title, userMessage, humanScore, isTitleFit, isSeniorityAppropriate, doSkillsAlign, isLocationAcceptable, isSalaryAcceptable, labeledAt }

## Metric
Script: pnpm eval-ar
Output: Composite metric — lower is better
Formula: scoreMAE + (1 - binaryAccuracy) * 20
- scoreMAE: mean absolute error on 0–100 scores (0–100 range)
- binaryAccuracy: fraction of correctly predicted binary fields across all examples × 5 fields (0–1)
- binary penalty: 0–20 range
Baseline: [fill in after first run]
Current best: [updated as loop runs]

## Improvement Criteria
Keep a change if: composite metric decreases by at least 0.5 points

## What to try
- Improve calibration of the 50-69 "moderate match" band
- Clearer weighting instructions for salary range overlap
- Better guidance for missing salary data
- Stronger guidance on seniority mismatch as a dealbreaker
- Few-shot score examples in each band
- Improve binary field accuracy by adding clearer definitions

## What not to change
- Do not modify the eval set
- Do not modify baseline artifact
- Do not change the JSON output format (score/isTitleFit/isSeniorityAppropriate/doSkillsAlign/isLocationAcceptable/isSalaryAcceptable/positive/negative structure)
- Do not remove the scoring scale bands (0-29, 30-49, etc.)

## Deployment
When autoresearch finds a winning system prompt, copy the body of `current.ts` into the system string inside `scoring-prompt.ts`. Run `pnpm check-types`. Commit both files together.
