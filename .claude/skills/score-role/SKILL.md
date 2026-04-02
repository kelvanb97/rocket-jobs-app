---
name: score-role
description: >
  Score a role against the user's profile. Accepts an optional roleId argument
  to score a specific role, or scores all unscored roles in parallel when no
  argument is given. Use when user says "score role", "score roles", or
  "rate this job".
user-invocable: true
---

# Score Role

Score how well a job posting matches the candidate's profile on a 0-100 scale.

## Prerequisites

- The web app must be running (`pnpm dev`) at `http://localhost:3000`
- The user profile and scoring weights must be configured in Settings

## API Base URL

All API calls use `http://localhost:3000`.

## Mode Detection

- If the user provides a **roleId** argument: run **Single-Role Mode**
- If no argument is provided: run **Batch Mode**

---

## Single-Role Mode

### Step 1: Fetch the Scoring Prompt

The app builds a structured prompt with the candidate profile, role details, scoring weights, and rubric:

```bash
curl -s "http://localhost:3000/api/scores/prompt?roleId={roleId}"
```

**Response:** `{ "data": { "system": "...", "user": "..." } }`

If the role is not found, inform the user and stop.

### Step 2: Score the Role

Read the `system` field — it contains the scoring rubric, weights, and rules. Follow it exactly.
Read the `user` field — it contains the formatted candidate profile and job posting.

Evaluate the role against the candidate following the system instructions. Respond with the JSON format specified in the system prompt.

### Step 3: Submit the Score

```bash
curl -s -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{"roleId": {roleId}, "score": {score}, "positive": [...], "negative": [...]}'
```

Inform the user of the score and key reasons.

---

## Batch Mode

### Step 1: Fetch Unscored Roles

```bash
curl -s http://localhost:3000/api/roles/unscored
```

**Response:** `{ "data": [{ "id", "title" }, ...] }`

If no unscored roles exist, inform the user and stop.

### Step 2: Score in Parallel

Split the unscored roles into chunks of 50. For each chunk, dispatch a parallel Agent sub-process.

Each agent prompt MUST include these instructions:

```
Score these job roles. For EACH role ID in the list:

1. Fetch the scoring prompt:
   curl -s "http://localhost:3000/api/scores/prompt?roleId={id}"
   This returns { "data": { "system": "...", "user": "..." } }

2. The "system" field contains the scoring rubric, weights, and rules. Follow it exactly.
   The "user" field contains the formatted candidate profile and job posting.
   Evaluate the role and produce a JSON score.

3. Submit the score:
   curl -s -X POST http://localhost:3000/api/scores \
     -H "Content-Type: application/json" \
     -d '{"roleId": ID, "score": SCORE, "positive": [...], "negative": [...]}'

Role IDs to score: {list of IDs}

Process ALL roles. If a role returns an error, skip it. Keep positive/negative to 1-4 concise items each.
```

### Step 3: Report Summary

After all agents complete, report:
- Total roles scored
- Score distribution (how many 80+, 60-79, 40-59, below 40)
- Top 5 highest-scoring roles with their scores
