---
name: batch-apply
description: >
  Autonomous batch job application agent. Asks for a minimum score threshold,
  then loops through all unapplied roles above that threshold — generating
  documents, filling forms, and submitting applications without pausing for
  confirmation. Blockers (CAPTCHA, login walls, unanswerable fields) are
  deferred and reported at the end. Use when user says "batch apply",
  "batch-apply", "apply to all jobs", or "auto apply all".
user-invocable: true
model: sonnet
---

# Batch Auto-Apply Skill

Autonomously apply to all unapplied roles above a score threshold. No user confirmation per submission — blockers are deferred and reconciled at the end.

## Prerequisites

- The web app must be running (`pnpm dev`)
- Scored roles must exist in the database
- The Playwright MCP server must be available (configured in `.claude/settings.json`)
- For ATS platforms requiring login, the user should have pre-authenticated in the shared Chrome profile (`~/.chrome-profile`)

## API Base URL

All API calls use the web app at `http://localhost:3000`. Each step uses `curl` to call the appropriate endpoint.

## Initialization

1. **Ask for score threshold:** Prompt the user for the minimum score to apply to. Default is 70 if not specified.
2. **Initialize tracking state:** Maintain these lists throughout the session:
   - `submitted`: roles successfully submitted `[{ title, company, score, applicationId }]`
   - `deferred`: roles that hit blockers `[{ title, company, score, reason, roleId }]`
   - `skipped`: roles permanently skipped (bad URL, illegitimate page) `[{ title, company, score, reason }]`
3. **Log start:** "Starting batch apply with minimum score threshold: {threshold}"

## Main Loop

Repeat the following until the loop exits:

### Step 1: Fetch the Next Role

```bash
curl -s http://localhost:3000/api/apply/top-role
```

**Response:** `{ "data": { "id", "title", "companyId", "companyName", "score", "url", "description", "location", "locationType", "salaryMin", "salaryMax" } }` or `{ "data": null }`

This only returns roles with `status = "pending"`. Deferred roles (`status = "deferred"`) are automatically excluded from future fetches.

**Exit conditions:**
- If `data` is `null` → all roles processed. Exit loop, go to Summary.
- If `data.score < threshold` → no more roles above threshold. Exit loop, go to Summary.

**Log:** "Processing: {title} at {companyName} (score: {score})"

### Step 2: URL Legitimacy Check

1. If `url` is null → skip with reason "No URL available", add to `skipped`, continue loop.
2. Call `browser_navigate` with the URL. If navigation fails → skip with reason "Page failed to load", add to `skipped`, continue loop.
3. Call `browser_snapshot` to read the page.
4. Evaluate legitimacy. The page is **legitimate** if it shows a job listing, a company career page, or an ATS platform (Greenhouse, Lever, Workday, Ashby, BambooHR, etc.). The page is **illegitimate** if it is:
   - Parked domain, domain-for-sale, or hosting placeholder
   - Primarily ads, spam, or SEO-farm content
   - Requests payment to apply
   - Content unrelated to employment
   - Broken page (blank, 404, 500)
   - Phishing indicators
   - When in doubt, err on the side of **legitimate**
5. If illegitimate → skip with reason, add to `skipped`, continue loop.

**To skip a role:**
```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"roleId":"ROLE_ID","reason":"REASON"}' \
  http://localhost:3000/api/apply/skip
```
Log: "Skipped: {title} at {company} — {reason}"

### Step 3: Create Draft Application

```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"roleId":"ROLE_ID","notes":"Batch auto-apply for ROLE_TITLE at COMPANY_NAME (score: SCORE)"}' \
  http://localhost:3000/api/apply/application
```

**Response:** `{ "data": { "applicationId", "resumePath", "coverLetterPath" } }`

Save `applicationId`. If both `resumePath` and `coverLetterPath` are non-null, skip to Step 6.

### Step 4: Check for / Generate Documents

If documents don't exist yet, check storage:

```bash
curl -s 'http://localhost:3000/api/apply/documents?roleId=ROLE_ID'
```

If no resume or cover-letter files found, generate them by invoking the `generate-docs` skill:

Use the Skill tool: `skill: "generate-docs", args: "ROLE_ID"`

The generate-docs skill will extract keywords, generate a tailored resume and cover letter, build DOCX files, and store them via the app's API.

**If the skill fails:** Defer the role with reason "Document generation failed: {error}" (call `/api/apply/defer`), add to `deferred`, log, and continue loop.

### Step 5: Download Documents to Local Disk

```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"resumePath":"RESUME_PATH","coverLetterPath":"COVER_LETTER_PATH","slug":"SLUG"}' \
  http://localhost:3000/api/apply/documents/download
```

Replace `SLUG` with lowercase company-title with hyphens, max 60 chars.

Save the absolute local file paths for browser uploads.

### Step 6: Navigate to Application Form

1. Call `browser_navigate` with the role URL (already navigated in Step 2 — if the page is still loaded, skip re-navigation).
2. Use `browser_snapshot` to find the application form. If the page shows a job listing with an "Apply" button, click it.
3. **Blocker detection:** If the page shows any of these, **defer the role**:
   - Login/signup wall → defer with reason "Login wall — {platform}"
   - CAPTCHA challenge → defer with reason "CAPTCHA — {platform}"
   - Page requires account creation → defer with reason "Account required — {platform}"

**To defer a role:** Mark it as `deferred` so it's excluded from future fetches but visible in the UI for manual retry:
```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"roleId":"ROLE_ID","reason":"REASON"}' \
  http://localhost:3000/api/apply/defer
```
Add to `deferred` list. Log: "Deferred: {title} at {company} — {reason}". Continue loop.

The `deferred` status keeps the role visible in the UI (filterable) and retryable — unlike `wont_do` which is permanent. To retry, change the status back to `pending` in the UI.

### Step 7: Fill Out the Application Form

Use the Playwright MCP tools to fill the form. Work through it methodically.

#### Reading the form

Use `browser_snapshot` to get the accessibility tree with `ref` attributes for all interactive elements.

#### Personal information

Read `packages/_config/user/src/experience.ts` for the `USER_PROFILE` constant. Use its fields to fill:

| Form field | Source |
|-----------|--------|
| First name | First word of `USER_PROFILE.name` |
| Last name | Last word of `USER_PROFILE.name` |
| Full name | `USER_PROFILE.name` |
| Email | `USER_PROFILE.email` |
| Phone | `USER_PROFILE.phone` |
| LinkedIn | `USER_PROFILE.linkedIn` |
| GitHub | `USER_PROFILE.github` |
| Website / Portfolio | `USER_PROFILE.personalWebsite` |
| Location | `USER_PROFILE.location` |
| Current title | `USER_PROFILE.jobTitle` |

| Address / Mailing address | `PRIVATE_CONFIG.address` from `packages/_config/user/src/private.ts` |

For fields like current company that aren't in `USER_PROFILE`, derive from work experience (most recent company in `USER_PROFILE.workExperience`) or defer if unknown.

#### File uploads

Upload using `browser_file_upload` with **absolute** local file paths from Step 5:
- Resume: `{absolutePath}/resume.docx`
- Cover letter: `{absolutePath}/cover-letter.docx`

If only one upload field, upload the resume only.

#### EEO / Demographic questions

Read `packages/_config/user/src/eeo.ts` for the `EEO_CONFIG` constant. Fuzzy-match against form options:

| Question | Source |
|----------|--------|
| Gender | `EEO_CONFIG.gender` |
| Race / Ethnicity | `EEO_CONFIG.ethnicity` |
| Veteran status | `EEO_CONFIG.veteranStatus` |
| Disability status | `EEO_CONFIG.disabilityStatus` |

If a config value is `null`, select "Decline to self-identify" or the equivalent option.

#### Work authorization

Read `packages/_config/user/src/eeo.ts` for work authorization fields:

| Question | Source |
|----------|--------|
| Authorized to work in the US? | `EEO_CONFIG.workAuthorization` (if non-null → Yes) |
| Require visa sponsorship? | `EEO_CONFIG.requiresVisaSponsorship` |
| Citizenship status | `EEO_CONFIG.workAuthorization` |

#### Salary expectations

If the form asks for a salary range, use `USER_PROFILE.salaryMin` and `USER_PROFILE.salaryMax`. If it asks for a single desired/expected salary, use `USER_PROFILE.desiredSalary`. All from `packages/_config/user/src/experience.ts`.

#### Common text fields

Read `FORM_DEFAULTS` from `packages/_config/user/src/experience.ts` for these values:

| Question | Source |
|----------|--------|
| Date available for work | Compute by adding `USER_PROFILE.startDateWeeksOut` weeks to today's date |
| Employment type | `FORM_DEFAULTS.employmentType` |
| How did you hear about this role? | `FORM_DEFAULTS.howDidYouHear` |
| Referral / referred by employee? | `FORM_DEFAULTS.referredByEmployee` |
| Non-compete agreement? | `FORM_DEFAULTS.nonCompeteAgreement` |
| Previously employed by company? | `FORM_DEFAULTS.previouslyEmployed` |
| Professional references | `FORM_DEFAULTS.professionalReferences` |
| Education level | Derive from `USER_PROFILE.education[0].degree` |
| Education | Derive from `USER_PROFILE.education` (degree, field, institution) |

#### Free-text questions

For open-ended questions ("Why do you want to work here?", "Tell us about a relevant project", debugging stories, etc.):
- Generate a concise 2-3 sentence response based on the role description, company info, and `USER_PROFILE` experience
- Tailor to highlight relevant skills from `USER_PROFILE.skills` and `USER_PROFILE.workExperience`
- Keep it professional and specific

#### Unanswerable fields

If you encounter a required form field that cannot be confidently answered from the profile or config:
- **Do NOT ask the user** — this is autonomous mode
- **Defer the role** with reason "Unknown required field: {field name}" (call `/api/apply/defer`)
- Continue to next role

#### Multi-page forms

1. Fill all fields on the current page
2. Take `browser_snapshot` to confirm
3. Click "Next" / "Continue"
4. Repeat until review/submit page

### Step 8: Submit

1. Click the submit button using `browser_click`. **Do NOT wait for user confirmation.**
2. Wait 2-3 seconds for the confirmation page.
3. Take a screenshot with `browser_screenshot` and save locally to `data/applications/{slug}/screenshot.png`.
4. Upload screenshot:
   ```bash
   curl -s -X POST -H 'Content-Type: application/json' \
     -d '{"roleId":"ROLE_ID","applicationId":"APPLICATION_ID","localPath":"LOCAL_SCREENSHOT_PATH"}' \
     http://localhost:3000/api/apply/screenshot
   ```
5. If submission appears successful (confirmation page, "thank you" message, URL changed to `/thanks` or similar):
   ```bash
   curl -s -X PATCH -H 'Content-Type: application/json' \
     -d '{"applicationId":"APPLICATION_ID","roleId":"ROLE_ID"}' \
     http://localhost:3000/api/apply/submit
   ```
   Add to `submitted` list. Log: "Submitted: {title} at {company} (score: {score})"
6. If submission fails (error message, form still showing validation errors):
   - Defer the role with reason "Submission failed: {error description}" (call `/api/apply/defer`)
   - Add to `deferred` list, continue loop

### Step 9: Continue Loop

Go back to Step 1 to fetch the next role.

## Summary

After the loop exits, display a final report:

```
## Batch Apply Complete

**Threshold:** {threshold}
**Submitted:** {submitted.length}
**Deferred:** {deferred.length}
**Skipped:** {skipped.length}

### Submitted
| # | Role | Company | Score |
|---|------|---------|-------|
| 1 | {title} | {company} | {score} |
| ... | ... | ... | ... |

### Deferred (need manual attention)
| # | Role | Company | Score | Reason |
|---|------|---------|-------|--------|
| 1 | {title} | {company} | {score} | {reason} |
| ... | ... | ... | ... | ... |

### Skipped (auto-skipped)
| # | Role | Company | Score | Reason |
|---|------|---------|-------|--------|
| 1 | {title} | {company} | {score} | {reason} |
| ... | ... | ... | ... | ... |
```

If there are deferred roles, add: "Run `/auto-apply` to manually handle deferred roles, or revisit them in the UI."

## Error Handling

All errors during the loop are **non-fatal** — the agent logs the error, defers or skips the role, and continues to the next one. The loop only exits when:
- No more pending roles exist (`data` is null)
- The next role's score is below the threshold
- An API endpoint is completely unreachable (network down, server crashed)

| Failure | Action |
|---------|--------|
| No unapplied roles | Exit loop, show summary |
| Score below threshold | Exit loop, show summary |
| No URL | Skip, log reason, continue |
| Page navigation fails | Skip, log reason, continue |
| Illegitimate page | Skip, log reason, continue |
| Document generation fails | Defer, log reason, continue |
| Login wall / CAPTCHA | Defer, log reason, continue |
| Unanswerable required field | Defer, log reason, continue |
| Submission error | Defer, log reason, continue |
| API error (non-fatal) | Defer, log reason, continue |
| Server unreachable | Exit loop, show partial summary |
