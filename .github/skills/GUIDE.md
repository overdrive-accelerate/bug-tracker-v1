# AI Rules Guide

Complete documentation for the AI Rules kit. Covers setup, workflows, customization, and skill reference for both GitHub Copilot and Claude Code.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Setup](#setup)
3. [How Memory Works](#how-memory-works)
4. [Skills Reference](#skills-reference)
5. [Customization](#customization)
6. [Workflow Combinations](#workflow-combinations)
7. [Troubleshooting](#troubleshooting)
8. [Credits](#credits)

---

## Philosophy

### The Problem

AI coding assistants suffer from three core issues:

1. **Amnesia** — Every new chat starts with zero knowledge of your codebase
2. **Context Loss** — Long conversations auto-compact, losing critical details
3. **No Discipline** — Without structure, the AI makes avoidable mistakes

### The Solution

This kit addresses all three:

- **Persistent Memory**: The AI scans your codebase once and saves a comprehensive snapshot. Every future chat loads this snapshot instantly — no re-scanning needed.
- **Self-Updating Knowledge**: After every feature or fix, memory updates automatically. It never becomes stale.
- **Structured Workflows**: Skills provide tested, repeatable processes for common tasks (feature development, code review, TDD, etc.)

### Design Principles

- **Works for any project** — Language/framework agnostic
- **Zero maintenance** — Memory updates itself
- **Non-invasive** — Drop files in, remove them anytime
- **Progressive enhancement** — Use what you need, ignore the rest

---

## Setup

### GitHub Copilot (VS Code)

**Required files:**
```
your-project/
├── AGENTS.md                    # ← Copy from this kit
└── .github/
    └── skills/
        ├── using-superpowers/SKILL.md
        ├── feature-dev/SKILL.md
        ├── code-review/SKILL.md
        ├── code-simplifier/SKILL.md
        ├── pr-review-toolkit/SKILL.md
        ├── tdd/SKILL.md
        ├── typescript-lsp/SKILL.md
        ├── agents-md-management/SKILL.md
        ├── grill-me/SKILL.md
        ├── grill-with-docs/SKILL.md
        ├── to-prd/SKILL.md
        ├── to-issues/SKILL.md
        ├── improve-codebase-architecture/SKILL.md
        └── frontend-design/SKILL.md
```

**How it works:**
- `AGENTS.md` is loaded on every single turn (never compacted)
- Skills are loaded on-demand when their description matches your prompt
- Memory persists in `/memories/repo/` across all chats in the workspace

### Claude Code

**Required files:**
```
your-project/
├── CLAUDE.md                    # ← Copy from this kit
└── .ai-memory/                  # ← Auto-created by Claude
    ├── codebase-snapshot.md
    ├── codebase-facts.md
    └── session/
```

**How it works:**
- `CLAUDE.md` is loaded automatically at the start of every session
- Workflows are embedded directly (Claude Code doesn't support external skills)
- Memory persists in `.ai-memory/` (add to `.gitignore`)

### Post-Setup

After dropping in the files:

1. **Customize** the `[PROJECT CUSTOMIZATION]` sections in AGENTS.md or CLAUDE.md
2. **First chat**: The AI will perform a deep scan and create the memory snapshot
3. **Done** — Every future chat starts with full context

---

## How Memory Works

### The Codebase Snapshot

On first use, the AI generates a comprehensive analysis covering:

| Section | Contents |
|---------|----------|
| Project Overview | Tech stack, features, architecture |
| File Purposes | Every file — what it does, what it exports |
| Component Patterns | Props, state, effects, event handling |
| Data Flow | How data moves through the system end-to-end |
| Error Handling | Patterns used across the codebase |
| Auth Patterns | How authentication works at each layer |
| Naming Conventions | Files, functions, variables, types |
| Gotchas | Non-obvious behaviors, pitfalls, quirks |
| Best Practices | Project-specific DO/DON'T rules |

### When Memory Updates

The snapshot updates automatically when:
- A new feature is completed (new patterns, new files)
- Architecture changes (new directories, new data flow)
- New gotchas are discovered during development
- Conventions change (new rules added to AGENTS.md)

### Memory Scopes (GitHub Copilot)

| Scope | Path | Lifetime | Purpose |
|-------|------|----------|---------|
| Repo | `/memories/repo/` | Permanent (workspace) | Codebase snapshot, patterns, facts |
| Session | `/memories/session/` | Current chat only | Task plan, progress, decisions |
| User | `/memories/` | All workspaces | Personal preferences, cross-project lessons |

### Memory Scopes (Claude Code)

| Scope | Path | Lifetime | Purpose |
|-------|------|----------|---------|
| Repo | `.ai-memory/` | Permanent (project) | Codebase snapshot, patterns, facts |
| Session | `.ai-memory/session/` | Current session | Task plan, progress, decisions |

---

## Skills Reference

Skills are specialized workflows that activate based on your prompt. They work with GitHub Copilot's Agent Skills system.

### Activation

Skills activate automatically when Copilot detects a matching prompt:
- "Build a feature" → `feature-dev`
- "Review this code" → `code-review`
- "Simplify this" → `code-simplifier`

You can also invoke manually (where supported):
- `/feature-dev`
- `/code-review`

### Skill Catalog

#### `using-superpowers` (Meta-Skill)
**Purpose**: Ensures all other skills are consulted before any action.

Key rule: Even a 1% chance a skill applies = check the skill. This prevents the AI from skipping structured workflows and jumping straight into code.

---

#### `feature-dev` (Feature Development)
**Purpose**: 7-phase guided feature development.

Phases: Discovery → Codebase Exploration → Clarifying Questions → Architecture Design → Implementation → Quality Review → Summary

Best for: Features touching multiple files, unclear requirements, architectural decisions needed.

---

#### `code-review` (Code Review)
**Purpose**: Confidence-scored code review focused on real issues.

Key features:
- Multi-perspective analysis (bugs, conventions, silent failures)
- Confidence scoring (0-100, only reports ≥80)
- Filters false positives and nitpicks

---

#### `code-simplifier` (Code Simplification)
**Purpose**: Simplify code for clarity without changing functionality.

Looks for: Unnecessary nesting, redundant code, dead code, unclear naming, inconsistent patterns, overly abstract patterns.

---

#### `pr-review-toolkit` (PR Review)
**Purpose**: 6 specialized review perspectives for comprehensive analysis.

Perspectives: Comments, Tests, Silent Failures, Type Design, General Quality, Simplification.

---

#### `tdd` (Test-Driven Development)
**Purpose**: Red-green-refactor with vertical slices.

Key principles:
- Vertical slices (ONE test → ONE implementation → repeat)
- Test behavior, not implementation
- Never refactor while RED

---

#### `typescript-lsp` (TypeScript)
**Purpose**: Type safety practices and error resolution.

Covers: Type checking commands, proper patterns, DO/DON'T for types, common patterns for the project.

---

#### `agents-md-management` (AGENTS.md Audit)
**Purpose**: Audit and improve AGENTS.md quality.

Evaluates: Commands, architecture clarity, non-obvious patterns, conciseness, currency, actionability.

---

#### `grill-me` (Plan Stress-Test)
**Purpose**: Relentless interviewing to stress-test a plan.

Approach: Walk every branch of the decision tree, one question at a time, with recommended answers. Challenge assumptions, probe edge cases.

---

#### `grill-with-docs` (Domain-Aware Grilling)
**Purpose**: Stress-test plan against existing domain model and documentation.

Additional: Challenges terminology against glossary, sharpens fuzzy language, updates docs inline as decisions crystallize.

---

#### `to-prd` (PRD Generation)
**Purpose**: Turn conversation context into a Product Requirements Document.

Output: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope.

---

#### `to-issues` (Issue Breakdown)
**Purpose**: Break plans into independently-grabbable vertical slice issues.

Key: Tracer bullet slices (thin end-to-end paths, NOT horizontal layers). Each slice is HITL or AFK.

---

#### `improve-codebase-architecture` (Architecture)
**Purpose**: Find deepening opportunities — turn shallow modules into deep ones.

Uses: Deletion test, locality/leverage analysis, seam identification.

---

#### `frontend-design` (UI Design)
**Purpose**: Create distinctive, production-grade frontend interfaces.

Key: Bold aesthetic direction, avoids generic AI aesthetics, implements working code with exceptional attention to design details.

---

## Customization

### Step 1: Project Basics

Replace all `[PROJECT CUSTOMIZATION]` sections in AGENTS.md or CLAUDE.md:

```markdown
## Project Overview
E-commerce platform with Next.js 14 frontend and tRPC API layer.

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma, PostgreSQL
- **Auth**: NextAuth.js with Google OAuth
- **Testing**: Vitest + Playwright

## Commands
npm run dev         # Start Next.js + tRPC
npm run test        # Vitest
npm run e2e         # Playwright
npm run db:push     # Prisma push
```

### Step 2: Add Your Conventions

Document project-specific rules the AI should follow:

```markdown
## Conventions
- Server components by default; "use client" only for interactivity
- Use Prisma generated types — never duplicate
- Error boundaries at route level
- Zod schemas for all API inputs
- No barrel exports (index.ts re-exports)
```

### Step 3: Add Documentation References

Link to framework docs the AI should consult:

```markdown
## Documentation References
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [tRPC](https://trpc.io/docs)
```

### Step 4: Remove Unused Skills (Optional)

If your project doesn't need certain skills, simply don't copy them. The system works with any subset.

---

## Workflow Combinations

### Building a New Feature
1. `feature-dev` — Structured 7-phase approach
2. `tdd` — If you want test-first development
3. `code-review` — After implementation
4. `code-simplifier` — Final polish

### Before a PR
1. `pr-review-toolkit` — Comprehensive 6-perspective review
2. `code-simplifier` — Clean up any issues found

### Planning & Design
1. `grill-me` or `grill-with-docs` — Stress-test the plan
2. `to-prd` — Formalize into a PRD
3. `to-issues` — Break into actionable tickets

### Architecture Work
1. `improve-codebase-architecture` — Find opportunities
2. `grill-me` — Validate the refactoring approach
3. `tdd` — Implement with test-first discipline

---

## Troubleshooting

### "The AI didn't scan on first chat"

Ensure the `AGENTS.md` (or `CLAUDE.md`) is in the project root and the memory rules are present. The instruction that triggers scanning is:

> "First turn of any new chat: Read all files in /memories/repo/. If no snapshot exists, create one."

### "Memory is outdated"

Ask: "Update the codebase snapshot to reflect recent changes" — or the AI should do this automatically after completing work.

### "Skills aren't activating"

For GitHub Copilot:
- Verify `.github/skills/<name>/SKILL.md` exists
- Check the YAML frontmatter has `name` and `description` fields
- The `description` must match your prompt semantically

### "Memory files are cluttering git"

For Claude Code: Add `.ai-memory/` to `.gitignore`
For GitHub Copilot: The `/memories/` system is workspace-local (not in your repo)

### "I want different skills for different projects"

Only copy the skills you need. The system works with any subset — there are no dependencies between skills.

---

## Credits

Inspired by and adapted from:
- [obra/superpowers](https://github.com/obra/superpowers) — `using-superpowers` meta-skill
- [anthropics/claude-code-best-practices](https://github.com/anthropics) — `code-review`, `code-simplifier`, `feature-dev`, `agents-md-management`, `pr-review-toolkit`, `typescript-lsp`
- [mattpocock/skills](https://github.com/mattpocock) — `tdd`, `to-issues`, `to-prd`, `grill-me`, `grill-with-docs`, `improve-codebase-architecture`
- GitHub Copilot Agent Skills documentation

---

## License

MIT — Use freely in any project.
