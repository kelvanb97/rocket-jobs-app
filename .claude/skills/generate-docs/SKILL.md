---
name: generate-docs
description: >
  Generate a tailored resume and cover letter for a specific role. Accepts a
  required roleId argument. Orchestrates keyword extraction, resume generation,
  and cover letter generation as sub-skills, then submits documents to the app
  for DOCX building and storage. Use when user says "generate docs",
  "create resume", "write cover letter", or "prepare application documents".
user-invocable: true
---

# Generate Documents

Generate a tailored resume and cover letter for a job application. This skill orchestrates three sub-skills and submits the results to the app for DOCX file creation.

## Prerequisites

- The web app must be running (`pnpm dev`) at `http://localhost:3000`
- The user profile must be configured in Settings
- A roleId argument is **required**

## API Base URL

All API calls use `http://localhost:3000`.

## Step 1: Fetch Role Data

```bash
curl -s http://localhost:3000/api/roles/{roleId}
```

**Response:** `{ "data": { "id", "title", "description", "location", "locationType", "salaryMin", "salaryMax", "source", "url", "company": { "name", "industry", "size", "website" } } }`

If the role is not found, inform the user and stop.

## Step 2: Fetch User Profile

```bash
curl -s http://localhost:3000/api/settings/profile
```

**Response:** `{ "data": { "profile": { ... }, "scoringWeights": { ... } } }`

## Step 3: Extract Keywords

Invoke the `extract-keywords` skill. Provide it with:
- The role title
- The company name and industry (if available)
- The job description (first 4000 characters)

The skill will produce a JSON object with extracted keywords. Store this result for the next step.

## Step 4: Generate Resume

Invoke the `generate-resume` skill. Provide it with:
- The full user profile (name, title, seniority, years of experience, summary, skills, preferred skills, domain expertise, work experience with highlights, education)
- The role details (title, company, industry, location type, location, description)
- The extracted keywords from Step 3

The skill will produce a resume JSON object. Store this result.

## Step 5: Generate Cover Letter

Invoke the `generate-cover-letter` skill. Provide it with:
- The candidate's name, title, years of experience, summary, preferred skills
- Work experience (company, title, date range, summary, top 3 highlights per role)
- Education
- The role details (title, company, industry, size, website, location type, description)

The skill will produce a cover letter JSON object. Store this result.

## Step 6: Submit Documents for DOCX Building

Send both generated documents to the app, which will build DOCX files and store them:

```bash
curl -s -X POST http://localhost:3000/api/apply/documents/build \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": {roleId},
    "resume": {resume JSON from Step 4},
    "coverLetter": {cover letter JSON from Step 5}
  }'
```

**Response:** `{ "data": { "applicationId", "resumePath", "coverLetterPath" } }`

## Step 7: Report Results

Inform the user:
- Documents were generated successfully
- The resume and cover letter file paths
- A brief summary of what was tailored (e.g., "Emphasized your React and TypeScript experience for the Senior Frontend Engineer role at Acme Corp")

## Error Handling

- If any API call fails, report the error and stop
- If a sub-skill produces invalid JSON, retry once. If it fails again, report the error
- If the /api/apply/documents/build call returns a validation error, check the JSON schemas and fix the output
