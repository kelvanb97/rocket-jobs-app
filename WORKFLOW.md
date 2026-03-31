---
tracker:
    kind: github
    api_key: $GITHUB_TOKEN # export GITHUB_TOKEN=ghp_...
    project_slug: kelvanb97/rocket-jobs-app
    active_states: ["symphony:active"]
    terminal_states: ["symphony:done"]
    working_state: "symphony:in-progress"
    completion_state: "symphony:in-review"
    backlog_states: ["symphony:backlog"]

polling:
    interval_ms: 60000

agent:
    command: claude --model claude-opus-4-6
    max_turns: 60
    max_concurrent_agents: 3
    turn_timeout_ms: 3600000
    read_timeout_ms: 120000
    stall_timeout_ms: 300000

workspace:
    root: ~/.simphony/workspaces/rocket-jobs-app

hooks:
    after_create: |
        git clone git@github.com:kelvanb97/rocket-jobs-app.git .
    before_run: |
        git fetch origin
        git checkout -B main origin/main
        git reset --hard origin/main

server:
    port: 8090
---

You are an expert engineer working on **rocket-jobs-app**.

## Your issue

**{{ issue.identifier }}: {{ issue.title }}**

{% if issue.description %}
{{ issue.description }}
{% endif %}

Issue URL: {{ issue.url }}

{% if issue.comments %}

## Comments

{% for comment in issue.comments %}
**{{ comment.author_name }}**: {{ comment.body }}

{% endfor %}
{% endif %}

---

## Project Conventions

This project has a `CLAUDE.md`. Read it before touching any code:

```bash
cat CLAUDE.md
```

Follow all conventions, architecture rules, and preferences documented there.

---

## Step 1 — Explore before touching anything

Read the issue. Explore the relevant code before making changes.

Re-read `CLAUDE.md` if you are unsure about conventions.

---

## Step 2 — Create a branch

```bash
git checkout -b {{ issue.branch_name | default: issue.identifier | replace: "#", "" | downcase }}
```

---

## Step 3 — Implement

Read `CLAUDE.md` to understand project conventions before writing any code:

```bash
cat CLAUDE.md
```

If `CLAUDE.md` does not exist, explore the repository structure, identify the dominant patterns and conventions, create `CLAUDE.md` documenting them, and then implement.

Detected stacks: Node.js. Follow their conventions as documented in `CLAUDE.md`.

---

## Step 4 — Run checks

Read `CLAUDE.md` for the project's test and lint commands. If `CLAUDE.md` does not exist, discover the check commands by exploring the repository (look for `Makefile`, `package.json` scripts, CI config, etc.).

```bash
# Node.js
pnpm run test
pnpm run lint
pnpm run build
```

---

## Step 5 — Commit and open PR

```bash
git add <specific files>
git commit -m "feat: <description> ({{ issue.identifier }})"
git push -u origin HEAD
gh pr create --title "<title> ({{ issue.identifier }})" --body "Closes {{ issue.url }}"
```

---

## Step 6 — Post PR link to tracker

After the PR is open, post its URL as a comment on the tracker issue so it is visible in GitHub:

```bash
PR_URL=$(gh pr view --json url -q .url)
gh issue comment {{ issue.identifier | remove: "#" }} --body "🤖 Opened PR: ${PR_URL}"
```

---

## Rules

- Complete the issue fully before stopping.
- Never commit `.env` files or secrets.
- All conventions in `CLAUDE.md` apply — do not deviate without a documented reason.
