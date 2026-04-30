# AGENTS.md

## Project Overview

Notion-like document editor with pages and blocks. Next.js 16 frontend + Convex real-time backend + Better Auth (email/password).

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 6, Tailwind CSS v4, shadcn/ui, Lucide React, Phosphor Icons
- **Backend**: Convex (serverless DB + real-time sync)
- **Auth**: Better Auth with Convex adapter
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack React Table

## Commands

```bash
npm run dev          # Start Next.js dev server (also run `npx convex dev` for backend)
npm run build        # Production build
npm run format       # Prettier format all files
npm run format:check # Check formatting
```

## Architecture

### Route Groups

- `src/app/(app)/` — Protected routes. Auth checked server-side in layout, redirects to `/login` if unauthenticated.
- `src/app/(auth)/` — Public auth routes. Redirects to `/` if already authenticated.
- `src/app/api/auth/` — Better Auth API route handler.

### Key Directories

| Directory            | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `src/components/`    | React components (no nesting beyond `ui/`) |
| `src/components/ui/` | shadcn/ui primitives                       |
| `src/lib/`           | Auth helpers, utilities                    |
| `convex/`            | Backend: schema, queries, mutations        |
| `convex/betterAuth/` | Better Auth Convex component               |

### Data Model

- **pages**: `title`, `userId`, `updatedAt`, `isDeleted`, `deletedAt` — soft-delete pattern
- **blocks**: `pageId`, `type` (text | image | table), `content` (string), `position` (number)

Blocks use position-based ordering with midpoint interpolation for reordering.

## Conventions

### Components

- `"use client"` directive for interactive components; server components for layouts/auth checks
- Style with Tailwind utility classes + `cn()` from `src/lib/utils.ts`
- Toasts via Sonner (`toast.success()`, `toast.error()`)
- Loading states use Skeleton components

### Convex Functions

All mutations must verify ownership via:

```ts
const userId = await getAuthUserId(ctx); // throws if unauthenticated
```

- Queries/mutations live in top-level `convex/*.ts` files
- Schema defined in `convex/schema.ts` with `defineSchema`/`defineTable`
- Import path alias: `@/*` → `src/*`

### Auth Flow

- Server-side: `isAuthenticated()`, `getToken()` from `src/lib/auth-server.ts`
- Client-side: `authClient` from `src/lib/auth-client.ts`
- `ConvexClientProvider` wraps the app and provides auth context

## Configuration Notes

- React Compiler is enabled (`next.config.mjs`)
- TypeScript strict mode is **off**
- No ESLint configured — only Prettier for formatting

## React & Performance Rules

- **React Compiler is ON** — do NOT use `useMemo`, `useCallback`, or `React.memo` for memoization. The compiler handles this automatically.
- **No unnecessary `useEffect`** — only use `useEffect` when absolutely necessary (e.g., subscriptions, imperative DOM APIs, syncing with external systems). Never use it for derived state or event handling.
- **Avoid re-renders & infinite loops** — watch for state updates inside effects that trigger re-renders.
- **No dead code** — remove unused variables, imports, functions, and commented-out code.
- **No overengineering** — don't add abstractions, helpers, or wrappers for one-time operations. Keep it simple and direct.
- **Fix discrepancies and bugs** — always validate against documentation and best practices before implementing.

## Workflow Rules

- **Ask questions first** — before starting implementation or bug fixes, always ask clarifying questions to avoid confusion and mistakes.
- **Post-change audit** — after every implementation or bug fix, audit all changes:
  - Sanity check, validity check, hallucination check
  - Look for bugs, discrepancies, re-renders, infinite loops, `useMemo`, `useCallback`
  - Verify changes work on top of existing logic and do not break anything
  - Reference the Documentation References below for correctness

## Context & Memory Management

Context window degrades after ~70% usage. Auto-compaction loses critical details. Use the memory system proactively to prevent this.

### Rules

1. **First turn of any new chat**: Before doing any work, read all files in `/memories/repo/` to load persistent codebase knowledge. This eliminates the need to re-scan the codebase from scratch. The comprehensive analysis there contains file purposes, patterns, conventions, and data flow — treat it as your pre-loaded understanding of the codebase.
2. **At the start of multi-step work**: Write a plan to session memory (`/memories/session/`) with the task, approach, files involved, and decisions made.
3. **After each major milestone**: Update session memory with what was completed, what's left, and any key discoveries.
4. **Before making architectural decisions**: Record the decision and reasoning to session memory so it survives compaction.
5. **After completing a task**: Write a summary to session memory with: files changed, what was done, key patterns used, and anything the next turn needs to know.
6. **When resuming after compaction**: Always read session memory files first to restore full context before continuing work. Then read `/memories/repo/` if codebase understanding feels incomplete.
7. **Codebase facts**: Store verified, reusable facts (build commands, patterns, gotchas) in repo memory (`/memories/repo/`) so they never need rediscovery.

### What to Save

- Current task and its phase (planning, implementing, reviewing)
- Files being modified and why
- Key decisions made during the conversation
- Bugs found and how they were fixed
- Patterns discovered that apply broadly

### What NOT to Save

- Obvious things already in AGENTS.md
- Temporary debugging output
- Information that will be immediately outdated

### Memory Scopes

| Scope | Path | Survives | Use For |
|-------|------|----------|---------|
| User | `/memories/` | All conversations | Preferences, patterns, lessons learned |
| Session | `/memories/session/` | Current chat only | Task plans, progress, in-flight decisions |
| Repo | `/memories/repo/` | All chats in this workspace | Codebase facts, verified patterns, gotchas |

## Skills

This project uses Agent Skills (`.github/skills/`) for specialized workflows. Skills are auto-invoked by GitHub Copilot based on your prompt, or manually via `/skill-name` slash commands.

| Skill | When It Activates |
|-------|-------------------|
| `using-superpowers` | Meta-skill: ensures other skills are checked before any action |
| `feature-dev` | "Build a feature", "Add functionality", multi-file implementation |
| `code-review` | "Review code", "Check for bugs", "Audit changes" |
| `code-simplifier` | "Simplify this", "Clean up", "Refine code" |
| `pr-review-toolkit` | "Thorough review", "PR review", comprehensive quality check |
| `tdd` | "Use TDD", "Red-green-refactor", "Test-first" |
| `typescript-lsp` | TypeScript errors, type safety, type design |
| `agents-md-management` | "Audit AGENTS.md", "Update project docs" |
| `grill-me` | "Grill me", "Stress-test this plan" |
| `grill-with-docs` | "Grill against docs", challenge plan against domain model |
| `to-prd` | "Write a PRD", "Document requirements" |
| `to-issues` | "Break into issues", "Create tickets" |
| `improve-codebase-architecture` | "Improve architecture", "Find refactoring opportunities" |
| `frontend-design` | "Design UI", "Build a page", "Style this component" |

## Documentation References

Always consult these docs when making changes to the corresponding areas:

### Next.js 16 (App Router)

- [Server & Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Mutating Data](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Caching](https://nextjs.org/docs/app/getting-started/caching)
- [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating)
- [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)
- [Images](https://nextjs.org/docs/app/getting-started/images)
- [CSS](https://nextjs.org/docs/app/getting-started/css)
- [Fonts](https://nextjs.org/docs/app/getting-started/fonts)
- [Metadata & OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)

### Backend & Database

- [Convex Docs](https://docs.convex.dev/home)
- [Better Auth](https://better-auth.com/docs/introduction)

### UI & Styling

- [Tailwind CSS v4](https://tailwindcss.com/docs/styling-with-utility-classes)
- [BlockNote Editor](https://www.blocknotejs.org/docs)
- [TanStack React Table](https://tanstack.com/table/latest)

### Forms, Validation & State

- [React Hook Form](https://react-hook-form.com/get-started)
- [Zod](https://zod.dev/api)
- [TanStack Query](https://tanstack.com/query/latest) — reference for caching/state management patterns

### React

- [React Docs](https://react.dev/learn/describing-the-ui)
