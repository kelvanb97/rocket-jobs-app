---
name: rj-auto-apply
description: >
    Use when the user says "/rj-auto-apply", "auto-apply", "apply to jobs",
    or "submit application" and wants the rocket-jobs-app to find the
    top-scored unapplied role, generate or retrieve a resume/cover letter,
    navigate to the application page via Playwright MCP, fill out the form,
    and pause for confirmation before submitting.
user-invocable: true
---

# rj-auto-apply Skill

Automate a single job application end-to-end. Follow these steps sequentially.

## Prerequisites

- The web app must be running (`pnpm dev`)
- Scored roles must exist in the database
- The Playwright MCP server must be available (Codex project config lives in `.codex/config.toml`; Claude compatibility config remains in `.mcp.json` and `.claude/settings.json`)
- For ATS platforms requiring login, the user should have pre-authenticated in the shared Chrome profile (`data/chrome-profile`, gitignored, at the repo root)

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

Generate a tailored resume and cover letter, upload to local storage, and update the application record. This step is long-running (30-120 seconds):

```bash
curl -s --max-time 180 -X POST -H 'Content-Type: application/json' \
  -d '{"roleId":"ROLE_ID","applicationId":"APPLICATION_ID"}' \
  http://localhost:3000/api/apply/documents/generate
```

Replace `ROLE_ID` and `APPLICATION_ID` with values from previous steps.

**Response:** `{ "data": { "resumePath", "coverLetterPath" } }`

Save the `resumePath` and `coverLetterPath` from the output.

## Step E: Resolve Document File Paths

Resolve absolute filesystem paths for the documents in storage so they can be uploaded via the browser file input. No download is necessary — the files already live on disk.

```bash
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"resumePath":"RESUME_PATH","coverLetterPath":"COVER_LETTER_PATH"}' \
  http://localhost:3000/api/apply/documents/download
```

Replace `RESUME_PATH` and `COVER_LETTER_PATH` with values from previous steps.

**Response:** `{ "data": { "resumeLocal": "/absolute/path/resume.docx", "coverLetterLocal": "/absolute/path/cover-letter.docx" } }`

Save the local file paths (absolute) — they will be used for browser file uploads.

## Step F: Navigate to the Application Page

Use the Playwright MCP browser tools.

1. **Determine the URL:** Use `url` from Step A. If null, ask the user for the URL.
2. **Navigate:** Call `browser_navigate` with the URL.
3. **Find the application form:** The page may be a job listing rather than the application form itself. Use `browser_snapshot` to read the page and look for an "Apply" button/link. Click it to get to the actual application form.
4. **Handle login walls:** If the page shows a login/signup form instead of the application:
    - Inform the user: "This site requires authentication. Please log in manually in the browser window."
    - Wait for the user to confirm they have logged in.
    - Then continue with the application.

## Step G: Fill Out the Application Form

Use the Playwright MCP tools to interact with the form. Work through the form methodically.

### Reading the form

Use `browser_snapshot` to understand the current page structure. This returns an accessibility tree showing all interactive elements with their `ref` attributes.

### Load saved application data from SQLite

Read the saved values directly from the local SQLite database before filling the form. Use `-json` so the output is structured and can be reused without extra lookup work.

**Database path:** `apps/web/data/rja.db`

**1. Load the active user profile**

```bash
sqlite3 -json apps/web/data/rja.db 'SELECT * FROM user_profile ORDER BY id ASC LIMIT 1;'
```

Save the first row as `profile`. Use these `user_profile` columns when matching form fields:

- `name`, `email`, `phone`
- `links` (JSON array of URL strings — LinkedIn, GitHub, portfolio, etc.)
- `location`, `address`
- `job_title`, `summary`
- `salary_min`, `salary_max`, `desired_salary`
- `start_date_weeks_out`
- `skills`, `preferred_location_types`, `preferred_locations`
- `industries`, `dealbreakers`, `domain_expertise`

If the query returns an empty array, stop and tell the user no profile is configured.

**2. Load saved work experience**

```bash
sqlite3 -json apps/web/data/rja.db '
WITH active_profile AS (
  SELECT id FROM user_profile ORDER BY id ASC LIMIT 1
)
SELECT * FROM work_experience
WHERE user_profile_id = (SELECT id FROM active_profile)
ORDER BY sort_order ASC, id ASC;
'
```

Save the rows as `workExperience`. Use `company`, `title`, `start_date`, `end_date`, `type`, `summary`, and `highlights` when filling employment-history sections or answering experience questions.

**3. Load saved education**

```bash
sqlite3 -json apps/web/data/rja.db '
WITH active_profile AS (
  SELECT id FROM user_profile ORDER BY id ASC LIMIT 1
)
SELECT * FROM education
WHERE user_profile_id = (SELECT id FROM active_profile)
ORDER BY sort_order ASC, id ASC;
'
```

Save the rows as `education`. Use `degree`, `field`, and `institution` for school and degree fields.

**4. Load saved certifications**

```bash
sqlite3 -json apps/web/data/rja.db '
WITH active_profile AS (
  SELECT id FROM user_profile ORDER BY id ASC LIMIT 1
)
SELECT * FROM certification
WHERE user_profile_id = (SELECT id FROM active_profile)
ORDER BY sort_order ASC, id ASC;
'
```

Save the rows as `certifications`. Use `name`, `issuer`, `issue_date`, `expiration_date`, and `url` only if the form asks about certifications or licenses.

**5. Load saved EEO answers**

```bash
sqlite3 -json apps/web/data/rja.db '
WITH active_profile AS (
  SELECT id FROM user_profile ORDER BY id ASC LIMIT 1
)
SELECT * FROM eeo_config
WHERE user_profile_id = (SELECT id FROM active_profile)
LIMIT 1;
'
```

Save the first row as `eeo` if present. Use these `eeo_config` columns:

- `gender`
- `ethnicity`
- `veteran_status`
- `disability_status`
- `work_authorization`
- `requires_visa_sponsorship`

If the query returns an empty array, treat `eeo` as missing and ask the user for anything the form requires.

**Important JSON note:** some SQLite columns are stored as JSON arrays and will be returned as JSON values or JSON-encoded strings depending on the CLI output. For `skills`, `preferred_location_types`, `preferred_locations`, `industries`, `dealbreakers`, `domain_expertise`, and `highlights`, treat them as arrays of strings. If the CLI returns them as strings, parse the JSON string before using the values.

### Personal information

Use `profile` from the SQLite query above. Common mappings:

- Full name: `profile.name`
- Email: `profile.email`
- Phone: `profile.phone`
- Links (LinkedIn, GitHub, portfolio, etc.): `profile.links` (JSON array — parse it and use each URL where applicable)
- City/state or general location: `profile.location`
- Street address: `profile.address`
- Current or target title: `profile.job_title`
- Professional summary or profile blurb: `profile.summary`

### File uploads

Upload resume and cover letter using `browser_file_upload` with the **absolute** local file paths from Step E:

- Resume: `{absolutePath}/resume.docx`
- Cover letter: `{absolutePath}/cover-letter.docx`

Some forms only have one upload field. In that case, upload the resume only.

### EEO / Demographic questions

Use `eeo` from the SQLite query above:

- Gender: `eeo.gender`
- Ethnicity/race: `eeo.ethnicity`
- Veteran status: `eeo.veteran_status`
- Disability status: `eeo.disability_status`

If one of those values is `null` or `eeo` is missing, select "Decline to self-identify" or the closest equivalent option.

### Work authorization

Use `eeo.work_authorization` and `eeo.requires_visa_sponsorship` from the SQLite query above.

- If `work_authorization` is present, use it directly.
- If `requires_visa_sponsorship` is `1` or `true`, answer that sponsorship is required.
- If `requires_visa_sponsorship` is `0` or `false`, answer that sponsorship is not required.
- If `work_authorization` is `null` or `eeo` is missing, ask the user instead of guessing.

### Salary expectations

If the form asks for a salary range, use `profile.salary_min` and `profile.salary_max`. If it asks for a single desired/expected salary, use `profile.desired_salary`.

### Free-text questions

For open-ended questions like "Why do you want to work here?" or "Tell us about a relevant project":

- Generate a concise 2-3 sentence response based on the role description, company info, and the SQLite data you loaded from `user_profile`, `work_experience`, `education`, and `certification`.
- Tailor the response to highlight relevant skills and experience.
- Keep it professional and specific to the role.

### Questions not covered by config

If you encounter a form field that you cannot answer from the profile or EEO config, use these hardcoded defaults for common questions. Ask the user only for anything genuinely unusual or role-specific.

- Start date availability — compute by adding `profile.start_date_weeks_out` weeks to today's date.
- How did you hear about this role? — infer from `role.source` (e.g. "LinkedIn", "Company website"). If unknown, use "Online job board".
- Referred by employee? — "No"
- Non-compete agreement — "No"
- Previously employed at this company? — "No"
- Professional references — "Available upon request"
- Employment type — infer from `role.type` if available, otherwise "Full-Time".
- Anything role-specific or unusual — ask the user.

### Multi-page forms

Some ATS platforms (especially Workday) spread applications across multiple pages:

1. Fill all fields on the current page.
2. Take a `browser_snapshot` to confirm everything is filled.
3. Click "Next", "Continue", or equivalent.
4. Repeat until you reach the review/submit page.

### Tips for interacting with form elements

- Use `browser_type` or `browser_fill_form` for text inputs.
- Use `browser_select_option` for dropdown/select elements.
- Use `browser_click` for radio buttons and checkboxes.
- Use `browser_file_upload` for file inputs.
- If a field is not visible, click a tab or section header first, press `PageDown`, or use `browser_run_code` to scroll it into view.
- After filling fields, take periodic snapshots to verify they were filled correctly.

## Step H: Pre-Submission Review

1. Take a screenshot of the filled-out form using `browser_take_screenshot`. Do not pass a `filename` — let the Playwright MCP write it to its default output directory. The tool's response includes the absolute path of the saved PNG.
2. Upload the screenshot to storage and record it on the application row by calling the screenshot endpoint:

    ```bash
    curl -s -X POST -H 'Content-Type: application/json' \
      -d '{"roleId":"ROLE_ID","applicationId":"APPLICATION_ID","localPath":"SCREENSHOT_PATH"}' \
      http://localhost:3000/api/apply/screenshot
    ```

    Replace `ROLE_ID` and `APPLICATION_ID` with values from earlier steps. `SCREENSHOT_PATH` is the absolute path returned by `browser_take_screenshot`.

    **Response:** `{ "data": { "screenshotUrl": "..." } }`

3. Open the saved screenshot file with the available image/view/read tool and visually verify the form.
4. Summarize what was filled in for the user.
5. **Ask the user:** "The application form is filled out. Please review the browser window. Should I submit?"
6. **DO NOT click submit until the user explicitly confirms.**

## Step I: Submit (After User Confirms)

Only proceed if the user explicitly says yes:

1. Click the submit button using `browser_click`.
2. Wait a few seconds for the confirmation page to load.

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
- Leave the application as "draft".
- Inform the user they can re-run `/auto-apply` to try the next role.

## Step K: Summary

Display a summary:

- Role: {title} at {companyName}
- Score: {score}
- Application ID: {applicationId}
- Status: submitted (or draft if declined)
- Resume: {resumePath}
- Cover letter: {coverLetterPath}
- Screenshot: recorded on application {applicationId} (visible in the role's application tab)

## Error Handling

| Failure | Action |
| --- | --- |
| No unapplied roles found | Inform user, stop |
| Document generation fails (Anthropic API error) | Report the error. The draft application record exists for retry. |
| Document download fails | Report the error, ask user to check storage |
| Page navigation fails (404, dead link) | Inform user and ask for an alternative URL |
| Login wall detected | Tell user to log in manually in the browser window, wait for confirmation |
| CAPTCHA detected | Tell user to solve it manually, wait for confirmation |
| Form field not found or unclear | Take a snapshot, describe what is visible, ask user for guidance |
| Submit button not found | Take a snapshot, ask user to identify the submit element |
| Submission fails (error after clicking submit) | Do NOT update status, inform user |
| Page legitimacy check fails to load | Skip the role with reason "Page failed to load" and loop to next |
| API endpoint returns error | Display the error message from the response and stop or ask for guidance |
