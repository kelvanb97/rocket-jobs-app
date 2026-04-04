---
name: auto-apply
description: >
  Automate job applications. Finds the top-scored unapplied role, generates
  or retrieves resume/cover letter, navigates to the application page via
  Playwright MCP, fills out the form, and pauses for user confirmation
  before submitting. Use when user says "auto-apply", "apply to jobs",
  or "submit application".
user-invocable: true
model: sonnet
---

# Auto-Apply Skill

Automate a single job application end-to-end. Follow these steps sequentially.

## Prerequisites

- The web app must be running (`pnpm dev`)
- Scored roles must exist in the database
- The Playwright MCP server must be available (configured in `.claude/settings.json`)
- For ATS platforms requiring login, the user should have pre-authenticated in the shared Chrome profile (`~/.chrome-profile`)

## API Base URL

All API calls use the web app at `http://localhost:3000`. Each step uses `curl` to call the appropriate endpoint.

## Step A: Fetch the Top Unapplied Role

```bash
curl -s http://localhost:3000/api/apply/top-role
```

**Response:** `{ "data": { "id", "title", "companyName", "score", "url", "description", "location", "locationType", "salaryMin", "salaryMax" } }` or `{ "data": null }` if no roles.

**After running:**
- If `data` is `null`: inform the user that all scored roles have been applied to or no roles have been scored yet. Stop.
- **URL legitimacy check (auto-skip):** Before showing the role to the user, verify the application page is legitimate.
  1. **Resolve the URL:** Use `url`. If it is null, skip the role with reason "No URL available" and loop back to fetch the next role.
  2. **Navigate:** Call `browser_navigate` with the resolved URL. If navigation fails (network error, timeout), skip the role with reason "Page failed to load" and loop.
  3. **Capture content:** Call `browser_snapshot` to read the page content.
  4. **Evaluate:** Determine whether the page contains or leads to a legitimate job application. The page is **legitimate** if it shows a job listing, a company career page, an ATS platform (Greenhouse, Lever, Workday, Ashby, BambooHR, etc.), or a job board page (LinkedIn, Indeed, etc.). The page is **illegitimate** if it matches any of these:
     - Parked domain, domain-for-sale, or default hosting placeholder
     - Primarily ads, spam, or SEO-farm content with no job listing
     - Requests payment or financial information to apply
     - Content entirely unrelated to employment (e-commerce, gaming, crypto, etc.)
     - Broken page — blank, error page (404, 500), or no meaningful content in the snapshot
     - Phishing indicators — mismatched branding, requests for SSN or bank details upfront
     - When in doubt, err on the side of **legitimate** — the user will review before submitting
  5. **If illegitimate**, skip the role automatically:
     ```bash
     curl -s -X POST -H 'Content-Type: application/json' \
       -d '{"roleId":"ROLE_ID","reason":"DESCRIPTIVE_REASON"}' \
       http://localhost:3000/api/apply/skip
     ```
     Use a specific reason (e.g., "Parked domain with no job content", "Page failed to load (404)"). Log: "Skipped: TITLE at COMPANY — REASON". Then loop back to the beginning of Step A to fetch the next role.
  6. **If legitimate**, continue to the next bullet (display role info to user).
- Otherwise: display the role title, company, score, URL, location, and salary to the user.
- Ask the user to confirm they want to proceed with this role.
- Save the parsed JSON output — you will need `id`, `companyId`, `companyName`, `title`, `url`, and `description` in later steps.

## Step B: Create Draft Application Record

Create an application record with status "draft" so the attempt is tracked even if the process fails midway:

```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"roleId":"ROLE_ID","notes":"Auto-apply attempt for ROLE_TITLE at COMPANY_NAME (score: SCORE)"}' \
  http://localhost:3000/api/apply/application
```

Replace `ROLE_ID`, `ROLE_TITLE`, `COMPANY_NAME`, and `SCORE` with values from Step A.

**Response:** `{ "data": { "applicationId", "resumePath", "coverLetterPath" } }`

Save the `applicationId` from the output. Also check `resumePath` and `coverLetterPath` — if both are non-null, documents already exist (skip to Step E).

## Step C: Check for Existing Documents

If `resumePath` and `coverLetterPath` from Step B were both null, check local storage for existing files:

```bash
curl -s 'http://localhost:3000/api/apply/documents?roleId=ROLE_ID'
```

Replace `ROLE_ID` with the role's ID.

**Response:** `{ "data": [{ "name": "..." }, ...] }`

- If the output contains files with `resume` and `cover-letter` in their names, note those file names and skip to Step E.
- If no documents exist, proceed to Step D.

## Step D: Generate Documents

Invoke the `generate-docs` skill with the role ID to generate a tailored resume and cover letter:

Use the Skill tool: `skill: "generate-docs", args: "ROLE_ID"`

The generate-docs skill will:
1. Fetch the role and profile data
2. Extract keywords from the job description
3. Generate a tailored resume
4. Generate a tailored cover letter
5. Build DOCX files and store them via `POST /api/apply/documents/build`

After the skill completes, the documents are stored locally and the application record is updated with file paths. Fetch the updated application to get the paths:

```bash
curl -s 'http://localhost:3000/api/apply/documents?roleId=ROLE_ID'
```

Save the `resumePath` and `coverLetterPath` from the output.

## Step E: Download Documents to Local Disk

Download the documents from local storage to a working directory so they can be uploaded via browser file input:

```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"resumePath":"RESUME_PATH","coverLetterPath":"COVER_LETTER_PATH","slug":"SLUG"}' \
  http://localhost:3000/api/apply/documents/download
```

Replace `SLUG` (lowercase company-title with hyphens, max 60 chars), `RESUME_PATH`, and `COVER_LETTER_PATH` with values from previous steps.

**Response:** `{ "data": { "resumeLocal": "/absolute/path/resume.docx", "coverLetterLocal": "/absolute/path/cover-letter.docx" } }`

Save the local file paths (absolute) — they will be used for browser file uploads.

## Step F: Navigate to the Application Page

Use the Playwright MCP browser tools.

1. **Determine the URL:** Use `url` from Step A. If null, ask the user for the URL.

2. **Navigate:** Call `browser_navigate` with the URL

3. **Find the application form:** The page may be a job listing rather than the application form itself. Use `browser_snapshot` to read the page and look for an "Apply" button/link. Click it to get to the actual application form.

4. **Handle login walls:** If the page shows a login/signup form instead of the application:
   - Inform the user: "This site requires authentication. Please log in manually in the browser window."
   - Wait for the user to confirm they have logged in
   - Then continue with the application

## Step G: Fill Out the Application Form

Use the Playwright MCP tools to interact with the form. Work through the form methodically.

### Reading the form

Use `browser_snapshot` to understand the current page structure. This returns an accessibility tree showing all interactive elements with their `ref` attributes.

### Personal information

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

### File uploads

Upload resume and cover letter using `browser_file_upload` with the **absolute** local file paths from Step E:
- Resume: `{absolutePath}/resume.docx`
- Cover letter: `{absolutePath}/cover-letter.docx`

Some forms only have one upload field. In that case, upload the resume only.

### EEO / Demographic questions

Read `packages/_config/user/src/eeo.ts` for the `EEO_CONFIG` constant. Fuzzy-match these values against the options the form presents:

| Question | Source |
|----------|--------|
| Gender | `EEO_CONFIG.gender` |
| Race / Ethnicity | `EEO_CONFIG.ethnicity` |
| Veteran status | `EEO_CONFIG.veteranStatus` |
| Disability status | `EEO_CONFIG.disabilityStatus` |

If a config value is `null`, select "Decline to self-identify" or the equivalent option.

### Work authorization

Read `packages/_config/user/src/eeo.ts` for work authorization fields:

| Question | Source |
|----------|--------|
| Are you authorized to work in the US? | `EEO_CONFIG.workAuthorization` (if non-null → Yes) |
| Will you require visa sponsorship? | `EEO_CONFIG.requiresVisaSponsorship` |
| Citizenship status | `EEO_CONFIG.workAuthorization` |

### Salary expectations

If the form asks for a salary range, use `USER_PROFILE.salaryMin` and `USER_PROFILE.salaryMax`. If it asks for a single desired/expected salary, use `USER_PROFILE.desiredSalary`. All from `packages/_config/user/src/experience.ts`.

### Free-text questions

For open-ended questions like "Why do you want to work here?" or "Tell us about a relevant project":
- Generate a concise 2-3 sentence response based on the role description, company info, and the user's experience from `USER_PROFILE`
- Tailor the response to highlight relevant skills and experience
- Keep it professional and specific to the role

### Questions not covered by config

If you encounter a form field that you cannot answer from the profile or EEO config, ask the user. Common examples:
- Start date availability — compute by adding `USER_PROFILE.startDateWeeksOut` weeks to today's date
- How did you hear about this role?
- Referral name
- Anything role-specific or unusual

### Multi-page forms

Some ATS platforms (especially Workday) spread applications across multiple pages:
1. Fill all fields on the current page
2. Take a `browser_snapshot` to confirm everything is filled
3. Click "Next", "Continue", or equivalent
4. Repeat until you reach the review/submit page

### Tips for interacting with form elements

- Use `browser_fill` for text inputs (pass the `ref` from the snapshot and the value)
- Use `browser_select_option` for dropdown/select elements
- Use `browser_click` for radio buttons and checkboxes
- Use `browser_file_upload` for file inputs (pass the `ref` and absolute local file path)
- If a field is not visible, try scrolling with `browser_scroll` or clicking a tab/section header first
- After filling fields, take periodic snapshots to verify they were filled correctly

## Step H: Pre-Submission Review

1. Take a screenshot: use `browser_screenshot` and save the result
2. Save the screenshot to `data/applications/{slug}/screenshot.png` using the Bash tool
3. Read the screenshot file to visually verify the form
4. Summarize what was filled in for the user
5. **Ask the user:** "The application form is filled out. Please review the browser window. Should I submit?"
6. **DO NOT click submit until the user explicitly confirms**

## Step I: Submit (After User Confirms)

Only proceed if the user explicitly says yes:

1. Click the submit button using `browser_click`
2. Wait a few seconds for the confirmation page to load
3. Take a screenshot of the confirmation page
4. Save to `data/applications/{slug}/confirmation.png`

## Step J: Update Records

After successful submission, update the application record and role status:

```bash
curl -s -X PATCH -H 'Content-Type: application/json' \
  -d '{"applicationId":"APPLICATION_ID","roleId":"ROLE_ID"}' \
  http://localhost:3000/api/apply/submit
```

Replace `APPLICATION_ID` and `ROLE_ID` with values from previous steps.

**Response:** `{ "ok": true }`

### If user declines to submit

- Mark the role as skipped so it won't appear again:
  ```bash
  curl -s -X POST -H 'Content-Type: application/json' \
    -d '{"roleId":"ROLE_ID","reason":"User declined to submit"}' \
    http://localhost:3000/api/apply/skip
  ```
- Leave the application as "draft"
- Inform the user they can re-run `/auto-apply` to try the next role

## Step K: Summary

Display a summary:

- Role: {title} at {companyName}
- Score: {score}
- Application ID: {applicationId}
- Status: submitted (or draft if declined)
- Resume: {resumePath}
- Cover letter: {coverLetterPath}
- Screenshot: data/applications/{slug}/screenshot.png

## Error Handling

| Failure | Action |
|---------|--------|
| No unapplied roles found | Inform user, stop |
| Document generation skill fails | Report the error. The draft application record exists for retry. |
| Document download fails | Report the error, ask user to check storage |
| Page navigation fails (404, dead link) | Inform user and ask for an alternative URL |
| Login wall detected | Tell user to log in manually in the browser window, wait for confirmation |
| CAPTCHA detected | Tell user to solve it manually, wait for confirmation |
| Form field not found or unclear | Take a snapshot, describe what is visible, ask user for guidance |
| Submit button not found | Take a snapshot, ask user to identify the submit element |
| Submission fails (error after clicking submit) | Take screenshot, do NOT update status, inform user |
| Page legitimacy check fails to load | Skip the role with reason "Page failed to load" and loop to next |
| API endpoint returns error | Display the error message from the response and stop or ask for guidance |
