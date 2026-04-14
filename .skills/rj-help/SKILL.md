---
name: rj-help
description: >
    Use when the user says "/rj-help", "what rj skills exist", "list rocket jobs
    skills", or "how do I use rocket jobs". Renders a table of all rj-* project
    skills with descriptions, prerequisites, and usage so the user can discover
    what's available in this repo.
user-invocable: true
---

# rj-help Skill

Render the table below to the user **verbatim**, then answer any follow-up questions about a specific skill by quoting from its `SKILL.md` body.

> This file is the single source of truth for the skills table. `README.md` links here instead of duplicating it. If you add or remove an `rj-*` skill, update this table only.

## Rocket Jobs Skills

| Skill | What it does | You'll need | When to use it |
| --- | --- | --- | --- |
| `/rj-install` | Handles installing and updating the Rocket Jobs app on your computer. Works on Mac, Linux, and Windows. | Your computer and this folder open in an AI assistant such as Codex or Claude Code. | The first time you set up the app, or if you ever need a fresh reinstall. |
| `/rj-setup` | Walks you through telling the app about yourself — your background, job preferences, and what you're looking for — so it knows which jobs to find for you. You can also upload your resume to fill in most of it automatically. | The app running on your computer. (If it isn't, this skill will point you to `/rj-install` first.) | Right after installing, before your first job search. |
| `/rj-scrape` | Finds new job listings that match what you're looking for and adds them to your dashboard. | You've finished setup. | Whenever you want fresh job postings — most people run this daily. |
| `/rj-auto-apply` | Picks the best-matching job for you, writes a tailored resume and cover letter, opens the application, and fills it out. You get to review everything before anything is actually submitted. | A completed profile and some jobs on your dashboard. | When you're ready to start applying. |
| `/rj-help` | Shows you this list of what the app can do. | Nothing. | Any time you want a reminder of what's available. |

## Notes

- All `rj-*` skills assume you're inside the Rocket Jobs folder. Open it in your AI assistant first.
- `/rj-install` and `/rj-setup` are designed for first-time users. Once you're set up, you'll mostly use `/rj-scrape` and `/rj-auto-apply` from day to day.
