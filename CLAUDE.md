# CLAUDE.md

> Drop this file in your project root. Claude Code reads it automatically on every session.
> Customize the [PROJECT CUSTOMIZATION] sections for your specific project.

---

## Project Overview

<!-- [PROJECT CUSTOMIZATION] Replace with your project description -->
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
npm run typecheck    # Type check
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

## Conventions

<!-- [PROJECT CUSTOMIZATION] Add your coding conventions -->

- Use TypeScript for all files
- No dead code — remove unused variables, imports, functions
- No overengineering — don't add abstractions for one-time operations
- All mutations/queries verify authentication
- Proper error handling at system boundaries

## Performance Rules

<!-- [PROJECT CUSTOMIZATION] Add framework-specific performance rules -->

## Workflow Rules

- **Ask questions first** — before starting implementation or bug fixes, ask clarifying questions to avoid confusion and mistakes.
- **Post-change audit** — after every implementation or bug fix, audit all changes:
  - Sanity check, validity check, hallucination check
  - Look for bugs, discrepancies, infinite loops
  - Verify changes work on top of existing logic and do not break anything

---

## Context & Memory Management

Context window degrades over long conversations. Use the memory system proactively to prevent knowledge loss.

### Codebase Snapshot Protocol

On the **first message of any new session** where `.ai-memory/codebase-snapshot.md` does not exist:

1. Perform a comprehensive codebase scan:
   - Read every key file (components, routes, services, utilities, config)
   - Document each file's purpose, exports, key patterns, and interactions
   - Map the data flow (how data moves through the system)
   - Capture naming conventions, error handling patterns, styling patterns
   - Note auth patterns, state management, and architectural decisions
   - Identify gotchas, non-obvious behaviors, and project-specific rules

2. Save the scan to `.ai-memory/codebase-snapshot.md` with sections:
   - Project overview & tech stack
   - Directory structure & file purposes
   - Component/module patterns (props, state, effects, refs)
   - Data flow (API calls, state management, rendering)
   - Error handling patterns
   - Auth patterns
   - Naming conventions
   - Key gotchas & non-obvious behaviors
   - DO/DON'T best practices

3. Save quick-reference facts to `.ai-memory/codebase-facts.md`:
   - Build/dev/test commands
   - Key patterns (one-liners)
   - Architecture overview
   - Common gotchas

4. Add `.ai-memory/` to `.gitignore` (if not already present)

### Keeping Memory Current

After completing any feature, bug fix, or architectural change:
- If the change affects patterns, conventions, or architecture → update `.ai-memory/codebase-snapshot.md`
- If new gotchas or facts were discovered → update `.ai-memory/codebase-facts.md`
- Do NOT let memory become stale — an outdated snapshot is worse than none

### Rules

1. **First message of any session**: Read all files in `.ai-memory/` to load persistent codebase knowledge. If no snapshot exists, create one using the Codebase Snapshot Protocol above.
2. **At the start of multi-step work**: Create a plan file (`.ai-memory/session/current-plan.md`) with the task, approach, files involved, and decisions made.
3. **After each major milestone**: Update the plan file with what was completed, what's left, and any key discoveries.
4. **After completing a task**: Update `.ai-memory/session/completed.md` with: files changed, what was done, key patterns used.
5. **Codebase facts**: Store verified, reusable facts in `.ai-memory/codebase-facts.md` so they never need rediscovery.

### Memory File Structure

```
.ai-memory/
├── codebase-snapshot.md    # Deep codebase analysis (auto-generated)
├── codebase-facts.md       # Quick-reference facts and gotchas
└── session/                # Current session notes (transient)
    ├── current-plan.md     # Active task plan
    └── completed.md        # Recently completed work
```

---

## Structured Workflows

Use these structured approaches for complex tasks. Apply them based on the type of work requested.

### Feature Development (7 phases)

When building new features that touch multiple files:

1. **Discovery** — Understand what needs to be built; ask clarifying questions
2. **Codebase Exploration** — Find similar patterns, understand architecture
3. **Clarifying Questions** — Fill gaps, resolve ambiguities (DO NOT SKIP)
4. **Architecture Design** — Present 2-3 approaches with trade-offs; get approval
5. **Implementation** — Build following chosen approach and codebase conventions
6. **Quality Review** — Check for bugs, convention violations, simplification opportunities
7. **Summary** — Document what was accomplished, files changed, decisions made

### Code Review

When reviewing code for quality:

1. Gather context (CLAUDE.md guidelines, project conventions)
2. Multi-perspective analysis: bugs, silent failures, convention compliance, type safety
3. Confidence scoring (0-100) — only report issues with confidence ≥ 80
4. Present findings grouped by severity: Critical → Important → Minor

### Code Simplification

When simplifying or cleaning up code:

1. Identify recently modified code sections
2. Analyze for: unnecessary complexity, redundant code, unclear naming, dead code
3. Apply project conventions and best practices
4. Ensure all functionality remains unchanged
5. Prefer clarity over brevity — explicit > clever

### Test-Driven Development

When building with TDD:

1. **Plan** — Confirm interface and behaviors to test with user
2. **Tracer bullet** — ONE test → minimal implementation → passes
3. **Incremental loop** — Next test → minimal code → passes (repeat)
4. **Refactor** — Only after all tests pass; never refactor while RED

Rules: Vertical slices (not horizontal), test behavior (not implementation), one test at a time.

### Architecture Improvement

When improving codebase architecture:

1. **Explore** — Walk codebase, note friction points and shallow modules
2. **Present candidates** — List deepening opportunities with files, problem, solution, benefits
3. **Grilling loop** — Stress-test chosen approach with user
4. **Implement** — Build the refactor, preserve existing functionality

### Grilling / Plan Stress-Test

When the user wants to stress-test a plan:

- Interview relentlessly about every aspect
- Walk down each branch of the decision tree
- For each question, provide your recommended answer
- Challenge assumptions with specific scenarios
- Probe edge cases and failure modes
- If a question can be answered by exploring the codebase, do that instead of asking

### PRD Generation

When formalizing requirements:

1. Explore repo to understand current state
2. Sketch major modules (look for deep module opportunities)
3. Write PRD with: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope

### Issue Breakdown

When breaking plans into tasks:

1. Draft **vertical slices** (tracer bullets) — thin end-to-end paths, NOT horizontal layers
2. Mark each as HITL (needs human) or AFK (fully autonomous)
3. Show dependencies between slices
4. Get user approval on granularity
5. Output formatted issues with acceptance criteria

---

## Documentation References

<!-- [PROJECT CUSTOMIZATION] Add links to docs relevant to your stack -->
