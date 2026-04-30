# AGENTS.md

> Drop this file in your project root. GitHub Copilot (VS Code) reads it on every turn.
> Customize the [PROJECT CUSTOMIZATION] sections for your specific project.

---

## Project Overview

<!-- [PROJECT CUSTOMIZATION] Replace with your project description -->
<!-- Example: "E-commerce platform with Next.js frontend and Express API backend." -->

[Describe your project in 1-2 sentences]

## Tech Stack

<!-- [PROJECT CUSTOMIZATION] Replace with your actual tech stack -->

- **Frontend**: [Framework, language, styling]
- **Backend**: [Framework, database, ORM]
- **Auth**: [Auth solution]
- **Testing**: [Test framework]
- **Other**: [Package manager, CI/CD, etc.]

## Commands

<!-- [PROJECT CUSTOMIZATION] Add your actual commands -->

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Production build

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode

# Code Quality
npm run lint         # Lint code
npm run format       # Format code
npm run typecheck    # Type check (e.g., npx tsc --noEmit)
```

## Architecture

<!-- [PROJECT CUSTOMIZATION] Describe your directory structure -->

```
src/
├── app/            # Routes / pages
├── components/     # Reusable UI components
├── lib/            # Shared utilities
├── services/       # Business logic / API calls
└── types/          # TypeScript types
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/components/` | React components |
| `src/lib/` | Shared utilities |

## Conventions

<!-- [PROJECT CUSTOMIZATION] Add your coding conventions -->

### Components
- Use TypeScript for all files
- Style with [your styling approach]
- Name components in PascalCase

### Backend
- All mutations/queries verify authentication
- Use proper error handling at boundaries

### General
- No dead code — remove unused variables, imports, functions
- No overengineering — don't add abstractions for one-time operations

## Performance Rules

<!-- [PROJECT CUSTOMIZATION] Add framework-specific rules -->
<!-- Examples:
- React Compiler is ON — do NOT use useMemo, useCallback, or React.memo
- Use server components by default; client components only when interactive
- Lazy-load heavy components
-->

## Workflow Rules

- **Ask questions first** — before starting implementation or bug fixes, ask clarifying questions to avoid confusion and mistakes.
- **Post-change audit** — after every implementation or bug fix, audit all changes:
  - Sanity check, validity check, hallucination check
  - Look for bugs, discrepancies, infinite loops
  - Verify changes work on top of existing logic and do not break anything

---

## Context & Memory Management

Context window degrades after ~70% usage. Auto-compaction loses critical details. Use the memory system proactively to prevent this.

### Codebase Snapshot Protocol

On the **first turn of any new chat** where `/memories/repo/` is empty or does not contain a `codebase-snapshot.md`:

1. Perform a comprehensive codebase scan:
   - Read every key file (components, routes, services, utilities, config)
   - Document each file's purpose, exports, key patterns, and interactions
   - Map the data flow (how data moves through the system)
   - Capture naming conventions, error handling patterns, styling patterns
   - Note auth patterns, state management, and architectural decisions
   - Identify gotchas, non-obvious behaviors, and project-specific rules

2. Save the scan to `/memories/repo/codebase-snapshot.md` with sections:
   - Project overview & tech stack
   - Directory structure & file purposes
   - Component/module patterns
   - Data flow (queries, mutations, API calls)
   - Error handling patterns
   - Auth patterns
   - Naming conventions
   - Key gotchas & non-obvious behaviors
   - DO/DON'T best practices

3. Save quick-reference facts to `/memories/repo/codebase-facts.md`:
   - Build/dev/test commands
   - Key patterns (one-liners)
   - Architecture overview
   - Common gotchas

### Keeping Memory Current

After completing any feature, bug fix, or architectural change:
- If the change affects patterns, conventions, or architecture → update `/memories/repo/codebase-snapshot.md`
- If new gotchas or facts were discovered → update `/memories/repo/codebase-facts.md`
- Do NOT let memory become stale — an outdated snapshot is worse than none

### Rules

1. **First turn of any new chat**: Read all files in `/memories/repo/` to load persistent codebase knowledge. If no snapshot exists, create one using the Codebase Snapshot Protocol above. This eliminates the need to re-scan the codebase from scratch.
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
| Repo | `/memories/repo/` | All chats in this workspace | Codebase snapshot, verified patterns, gotchas |

---

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

---

## Documentation References

<!-- [PROJECT CUSTOMIZATION] Add links to docs relevant to your stack -->
<!-- Examples:
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
-->
