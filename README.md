# aja Brandt

Personal website monorepo built with Next.js, React, and TypeScript.

# aja Brandt Portfolio OS

An interactive OS-style developer portfolio built with Next.js and TypeScript.

## Concept

I wanted a portfolio that felt like exploring a system rather than scrolling a page.

The site mimics a lightweight desktop OS where each window represents a project,
experience, or technical artifact. The goal was to create a memorable experience
while still showcasing my engineering work.

## Demo

Live site: https://ajabrandt.com

![Portfolio Screenshot](./docs/app-screenshot.png)

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Components:** Radix UI primitives
- **Monorepo:** pnpm workspaces + Turborepo
- **Analytics:** PostHog
- **Email:** Resend

## Interesting Engineering Decisions

### Window Manager

Each window is a React component managed by a global window registry.
This allows windows to be opened, closed, minimized, and stacked.

### File System Routing

Desktop icons map to dynamic routes that behave like files within the system.

### Performance

The desktop environment uses memoization and minimal re-renders to keep the
UI responsive even when multiple windows are open.

## Monorepo Structure

```
apps/
  web/                    → Next.js web application

packages/
  _api/                   → Server actions and validation schemas
    contact/              → Contact form submission API

  _app/                   → Application feature packages
    contact/              → Contact form component
    home/                 → Home screen with state management

  _core/                  → Reusable utilities and configuration
    dates/                → Date formatting utilities
    eslint/               → Shared ESLint configs
    localstorage/         → Type-safe localStorage wrapper
    next-safe-action/     → Type-safe server action client
    numbers/              → Number formatting utilities
    result/               → Result type for error handling
    tsconfig/             → Shared TypeScript configs
    types/                → Shared type definitions
    use-click-outside/    → Click outside detection hook
    use-initial-load/     → Initial load detection hook

  _design/
    ui/                   → Component library (Radix UI + Tailwind CSS)

  _integrations/          → Third-party service integrations
    analytics/            → Analytics abstraction layer
    email/                → Email sending abstraction
    posthog-analytics/    → PostHog provider implementation
    resend/               → Resend email provider implementation

  _shared/
    consts/               → Shared constants and feature flags
```

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 10

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Opens the app at [http://localhost:3000](http://localhost:3000) with Turbopack hot reload.

### Build

```bash
pnpm build
```

## Scripts

| Script             | Description                  |
| ------------------ | ---------------------------- |
| `pnpm dev`         | Start development server     |
| `pnpm build`       | Build all packages and apps  |
| `pnpm lint`        | Lint all packages            |
| `pnpm check-types` | Run TypeScript type checking |
| `pnpm test`        | Run tests                    |
| `pnpm format`      | Format code with Prettier    |
