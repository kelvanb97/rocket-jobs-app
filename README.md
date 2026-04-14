[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-161618?logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![Anthropic](https://img.shields.io/badge/Claude_AI-D4A574?logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)](https://openai.com/)

# Rocket Jobs App

An AI-powered job search pipeline that scrapes, scores, generates tailored documents, and auto-applies to the best remote roles - so I can focus on interviewing, not searching.

Job hunting is a full-time job. I got tired of refreshing five different job boards, skimming hundreds of listings, and losing track of which ones were actually worth applying to. So I built a system that does it for me - scrapes listings across multiple boards, scores every role against my actual preferences using a configured LLM provider, generates tailored resumes and cover letters, and auto-applies to the top matches.

## Join the community

Ask for help, share your wins, or just say hi.

[![Discord](https://img.shields.io/badge/Discord-Join_the_community-5865F2?logo=discord&logoColor=white)](https://discord.gg/UkFSyB59)

## Prerequisites

1. AI coding assistant (harness) to run the skills — [Claude Code](https://claude.com/claude-code), [Codex](https://github.com/openai/codex), [OpenCode](https://opencode.ai), or any other agentic coding harness that supports the [agentskills.io](https://agentskills.io) spec.

2. API key from at least one supported LLM provider — [Anthropic](https://console.anthropic.com/settings/keys) or [OpenAI](https://platform.openai.com/api-keys) — for scoring roles and generating tailored resumes and cover letters.

## Install

Clone the repository `https://github.com/rocket-jobs-ai/rocket-jobs-app.git`

Open the `rocket-jobs-app` folder with your AI coding assistant and run:

```console
/rj-install
```

For manual installation without an AI assistant, see [Manual Install](./MANUAL_INSTALL.md).

## Getting started

Run `/rj-setup` using your AI assistant to configure the app and tell it about yourself. You'll be prompted to fill in details about your background, job preferences, and what you're looking for. You can also upload your resume (PDF or DOCX) to auto-fill most of it.

## Skills

The repo ships with shared Rocket Jobs skills under [`.skills/rj-*`](./.skills/). The harness-specific entrypoints [`.agents/skills/`](./.agents/skills/) and [`.claude/skills/`](./.claude/skills/) are compatibility symlinks that resolve to that same shared source. Codex also reads repo guidance from [AGENTS.md](./AGENTS.md) and project MCP config from [`.codex/config.toml`](./.codex/config.toml).

See [**.skills/rj-help/SKILL.md**](./.skills/rj-help/SKILL.md) for the full table of available skills, what each one does, what you'll need, and when to use it. That file is the single source of truth — it's what `/rj-help` renders in your AI assistant.

## Help I'm stuck!

Run `/rj-help` in your AI assistant for a full list of available skills, what they do, and when to use them.

Still stuck? Hop into the [Rocket Jobs Discord](https://discord.gg/UkFSyB59) and ask away!

Discord not your thing? Book a call with me and we can troubleshoot together: <https://cal.com/kelvan-brandt/15min>
