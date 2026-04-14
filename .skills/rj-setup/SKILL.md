---
name: rj-setup
description: >
    Use when the user says "/rj-setup", "configure rocket jobs", "first time
    setup", or wants help filling in /settings for the first time. Walks through
    each settings tab via Playwright MCP, mixing chat-driven prompts (for
    conceptual fields like LLM keys, EEO, scoring weights) with tour-driven
    prompts (for plain text fields). Suggests resume upload as a shortcut.
user-invocable: true
---

# rj-setup Skill

Walk the user through `/settings` end-to-end so a fresh database has everything it needs to start scraping, scoring, and applying. Use a "smart" mix:

- **Chat-driven** for fields that need explanation or context (API keys, EEO, scoring weights, scraper sources).
- **Tour-driven** for plain text fields (just open the tab, point at it, ask the user to type, verify, move on).
- **Resume upload as a shortcut** for Profile / Experience / Education — offer it before walking those tabs by hand.

Use **Playwright MCP** (`mcp__playwright__*`) for browser interaction.

## Step 0: Pre-flight — is the dev server running?

Probe first:

```bash
curl -sf http://localhost:3000 > /dev/null && echo OK || echo DOWN
```

- **OK** → continue to Step 1.
- **DOWN** → try to start it automatically (below). Don't ask the user first; just do it.

### Auto-start the dev server

1. Start `pnpm dev` in the background (Bash tool with `run_in_background: true`). Capture the background process so you can read its output on failure:

    ```bash
    pnpm dev
    ```

2. Poll readiness for up to 60 seconds:

    ```bash
    for i in $(seq 1 60); do
      curl -sf http://localhost:3000 > /dev/null && echo "OK" && break
      sleep 1
    done
    ```

3. **If `OK` is seen:** tell the user:

    > "Dev server wasn't running — started `pnpm dev` in the background. It will stay running after this skill exits so you can keep using the app. Continuing setup."

    Then continue to Step 1. **Do not kill the background process** — the rest of this skill (and the user's subsequent work) depends on it.

4. **If no `OK` after 60 seconds:** read the background process output with the `Read` tool (or `BashOutput` equivalent in your harness), surface the last ~30 lines of stdout/stderr to the user, then stop with:

    > "I tried to start the dev server but it didn't come up on <http://localhost:3000>. If you haven't installed yet, run `/rj-install` first. Otherwise check the output above — likely a missing dep, broken migration, or port conflict — then re-run `/rj-setup` once `pnpm dev` boots cleanly."

## Step 1: Open /llm-config in the browser

LLM config lives on its own page now. Do it first so that when we get to `/settings`, the resume-upload shortcut is already enabled.

```
mcp__playwright__browser_navigate → http://localhost:3000/llm-config
mcp__playwright__browser_snapshot
```

## Step 2: LLM Provider (chat-driven, FIRST)

After snapshotting, check whether the Anthropic and/or OpenAI API key fields already have values.

**If at least one key is already populated:**
Present a multiple-choice selection:

> "LLM keys already configured. What would you like to do?"
>
> 1. Move on to Settings
> 2. Update API keys
> 3. Change model selections

If the user picks 1, skip straight to Step 3. For 2 or 3, walk through the relevant fields, save, then continue to Step 3.

**If no keys are populated:**

1. Explain to the user in chat:
    > "The app uses Claude (Anthropic) and/or GPT (OpenAI) for scoring jobs, generating resumes, generating cover letters, and extracting data from your uploaded resume. You need at least one API key."
    >
    > - Get an Anthropic key at <https://console.anthropic.com/settings/keys> (paid; ~$5–$20/month for personal use)
    > - Get an OpenAI key at <https://platform.openai.com/api-keys> (paid)
2. Ask the user which provider(s) they want to use. **Do NOT ask the user to paste API keys into chat.** Secrets belong in the page, not the transcript.
3. Tell the user the Anthropic / OpenAI key field is visible in the browser and ask them to type their key(s) directly into the form themselves. Wait for them to confirm in chat that the key is entered.
4. Once the user confirms, use `browser_select_option` for the provider dropdowns (scoring / keyword / resume / cover letter providers) based on which provider(s) they chose. Do not touch the key inputs.
5. Click Save.
6. Verify by re-snapshotting the page and confirming the key input shows a populated/masked value. If empty, ask the user to re-enter and save again.

## Step 3: Profile / Experience / Education — offer resume upload first

Navigate to `/settings`:

```
mcp__playwright__browser_navigate → http://localhost:3000/settings
mcp__playwright__browser_snapshot
```

Ask in chat:

> "Want to import your profile, work experience, and education from a PDF or DOCX resume? It's much faster than typing each one out. Or we can fill them in by hand."

**If the user wants to upload:**

1. Ask the user to drag and drop their resume file into the chat if their harness supports it. If not, ask for the absolute file path.
2. Copy the file into the project directory because Playwright MCP may restrict file access to the project root:
    ```bash
    cp '<ORIGINAL_PATH>' '<PROJECT_ROOT>/data/tmp-resume-upload.<ext>'
    ```
3. Use `mcp__playwright__browser_run_code` to trigger the file chooser and attach the project-local copy in one atomic action:
    ```js
    ;async (page) => {
        const [fileChooser] = await Promise.all([
            page.waitForEvent("filechooser"),
            page.getByRole("button", { name: "Upload Resume" }).click(),
        ])
        await fileChooser.setFiles(
            "<PROJECT_ROOT>/data/tmp-resume-upload.<ext>",
        )
    }
    ```
4. Clean up the temporary project-local copy after upload completes:
    ```bash
    rm '<PROJECT_ROOT>/data/tmp-resume-upload.<ext>'
    ```
5. Wait for the preview modal to appear (`browser_wait_for` text "Apply Selected" or similar).
6. Read the modal's contents back to the user. Help them decide which rows to keep checked. Click "Apply Selected".
7. Snapshot to confirm the modal closed and the Profile / Experience / Education tabs are populated.
8. Skip Steps 3a / 3b / 3c below (they're already done).

**If the user prefers to type by hand:**

### Step 3a: Profile (tour-driven)

Walk through the visible fields in the Profile tab. For each one, ask the user to provide a value in chat, then type it via Playwright. Required fields: name, email, phone, jobTitle. Optional: location, linkedin, github, summary, skills.

Click Save.

### Step 3b: Experience (tour-driven)

Click the **Experience** tab. For each role the user wants to add, click "Add Experience", fill in company / title / startDate / endDate / type / techStack / highlights, click Save. Repeat until the user says they're done.

### Step 3c: Education (tour-driven)

Click the **Education** tab. For each entry, click "Add Education", fill in degree / field / institution, click Save. Repeat until done.

## Step 4: Scraper Config (chat-driven for sources, tour-driven for keywords)

Click the **Scraper Config** tab. Explain in chat:

> "The scraper pulls jobs from one or more sources. The available sources are: Google Jobs, RemoteOK, We Work Remotely, Himalayas, Jobicy, and LinkedIn. Google Jobs and the smaller boards work without login. LinkedIn requires you to sign in once (the scrape skill handles that)."

Ask the user which sources to enable. Toggle them in the form.

For keywords, suggest defaults based on the job title from the Profile tab:

- Title contains "frontend" / "react" → suggest `["react", "typescript", "frontend"]`
- Title contains "backend" / "node" → suggest `["node", "typescript", "backend", "api"]`
- Title contains "fullstack" → suggest `["typescript", "react", "node"]`
- Title contains "data" → suggest `["python", "sql", "data"]`
- Otherwise: ask the user.

Ask the user for any blocked keywords (e.g. "senior", "blockchain", "crypto") and blocked companies. Fill in. Click Save.

If the user enabled LinkedIn, walk over to the **LinkedIn** tab and explain that they need to add at least one LinkedIn search URL (e.g. <https://www.linkedin.com/jobs/search/?keywords=frontend%20engineer>). Help them build one.

## Step 5: Form Defaults (tour-driven)

Click the **Form Defaults** tab. These are answers to common application form fields the auto-apply skill will fill in. Walk through quickly. Most have sane defaults. Click Save.

## Step 6: EEO & Work Auth (chat-driven)

Click the **EEO & Work Auth** tab. Explain in chat:

> "These are optional demographic questions that often appear in application forms. The auto-apply skill uses these answers to fill those fields automatically. You can leave them all blank — auto-apply will skip them. Or fill them in once here so you don't have to retype them on every application."

Ask each question gently:

- Gender: prefer not to say / male / female / non-binary
- Ethnicity: prefer not to say / [list]
- Veteran status: prefer not to say / yes / no
- Disability status: prefer not to say / yes / no
- **Work authorization** (this one matters): "Authorized to work without sponsorship" / "Need visa sponsorship"
- Requires visa sponsorship (boolean)

Fill via Playwright. Click Save.

## Step 7: Scoring Weights (chat-driven)

Click the **Scoring Weights** tab. Explain:

> "This is how the AI scores each role. Each factor can be weighted High / Medium / Low. The scorer multiplies these against its evaluation of the role to produce a 0–100 score."

Walk through each:

- **Title and seniority** — does the role title and level match what you want? (Default: high)
- **Skills** — does the role need skills you have? (Default: high)
- **Salary** — is the salary in your range? (Default: high)
- **Location** — is the location remote / where you want? (Default: medium)
- **Industry** — is the industry one you want? (Default: low)

Ask which they want to bump or lower. Fill via Playwright. Click Save.

## Step 8: Hand off

Tell the user:

> "Setup complete! You're ready to:
>
> - Run `/rj-scrape` to pull new job listings
> - Run `/rj-auto-apply` after scoring to apply to the top-scored unapplied role
> - Open <http://localhost:3000> to see your dashboard
>
> You can come back to <http://localhost:3000/settings> any time to update these values."

Close the Playwright browser (`mcp__playwright__browser_close`), then stop.

## Notes

- If the dev server dies mid-walkthrough, tell the user and stop. Don't try to restart it from this skill (auto-start is pre-flight only, in Step 0).
- If a Playwright action fails twice in a row on the same field, surface the failure to the user and ask whether to skip that field or stop.
- Don't try to verify saved values via the API — verify by re-snapshotting the form and reading the input values from the DOM.
