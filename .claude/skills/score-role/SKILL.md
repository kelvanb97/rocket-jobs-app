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

### Step 1: Fetch Role Data

```bash
curl -s http://localhost:3000/api/roles/{roleId}
```

**Response:** `{ "data": { "id", "title", "description", "location", "locationType", "salaryMin", "salaryMax", "source", "url", "company": { "name", "industry", "size", "website" } } }`

If the role is not found, inform the user and stop.

### Step 2: Fetch User Profile

```bash
curl -s http://localhost:3000/api/settings/profile
```

**Response:** `{ "data": { "profile": { ... }, "scoringWeights": { "titleAndSeniority", "skills", "salary", "location", "industry" } } }`

### Step 3: Score the Role

Evaluate the role against the candidate profile using the scoring rubric below. Think carefully about each dimension.

### Step 4: Submit the Score

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

### Step 2: Fetch User Profile

```bash
curl -s http://localhost:3000/api/settings/profile
```

### Step 3: Score in Parallel

Split the unscored roles into chunks of 5. For each chunk, dispatch a parallel Agent sub-process that:

1. Fetches each role's full data via `GET /api/roles/{id}`
2. Scores it using the rubric below
3. Submits the score via `POST /api/scores`

Use the Agent tool with a prompt like: "Score these roles against the candidate profile: [role IDs]. For each role, GET /api/roles/{id}, score it using the rubric, then POST /api/scores. Profile data: [include the profile data]."

### Step 4: Report Summary

After all agents complete, report:
- Total roles scored
- Score distribution (how many 80+, 60-79, 40-59, below 40)
- Top 5 highest-scoring roles with their scores

---

## Scoring Rubric

### Scoring Brackets

| Range | Meaning |
|-------|---------|
| 80-100 | **Strong match** — the candidate should apply. Title, skills, seniority, and preferences align well. |
| 60-79 | **Moderate match** — worth considering. Most criteria fit with minor gaps the candidate could bridge. |
| 40-59 | **Weak match** — likely not worth applying. Notable misalignment on title, skills, seniority, or preferences. |
| 20-39 | **Poor match** — do not apply. Major gaps or misalignment across multiple criteria. |
| 0-19 | **Dealbreaker present** or fundamental mismatch. |

### Scoring Dimensions

Weight each dimension according to the scoring weights from the API (values like "low", "medium", "high"):

1. **Title and seniority alignment** — Does the role title and level match the candidate's current title and seniority?
2. **Skills overlap** — How well do the required skills match the candidate's skills and demonstrated experience?
3. **Salary range compatibility** — Do the salary ranges overlap?
4. **Location/remote compatibility** — Does the location type match the candidate's preferences?
5. **Industry fit** — Is the company's industry in the candidate's preferred industries?

### Important Scoring Rules

- **Evaluate skills by depth, not keywords.** The candidate's work history shows what they've actually built — weigh demonstrated experience over listed buzzwords.
- **Missing salary is neutral.** Do NOT reduce the score for a missing salary. Do NOT list it as a negative.
- **Salary ranges only need to overlap.** Any overlap is acceptable. Only flag salary as negative when ranges have zero overlap.
- **Overqualification is positive.** If the candidate exceeds the role's requirements, treat it as a strength, not a weakness.
- **Dealbreaker match forces score below 20.** If the role matches any of the candidate's dealbreakers, the score must be below 20.
- **Skills entirely outside the candidate's stack: score below 40.** Regardless of title fit.
- **Adjacent tech is penalized less than unrelated tech.** E.g., Vue instead of React is a minor gap; Java instead of TypeScript is a major gap.

### Output JSON Schema

Submit this exact JSON structure to `POST /api/scores`:

```json
{
  "roleId": <number>,
  "score": <number 0-100>,
  "positive": ["<1-4 concise reasons this is a good match>"],
  "negative": ["<1-4 concise reasons this is a poor match or concerns>"]
}
```
