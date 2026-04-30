# Skills Guide

A practical guide to using the AI skills in this project with GitHub Copilot in VS Code. Skills are specialized workflows that activate automatically based on your prompt, or manually via `/skill-name` slash commands.

---

## How Skills Work

Skills live in `.github/skills/`. Each is a folder containing a `SKILL.md` file with instructions that GitHub Copilot loads when relevant.

**Two ways to invoke:**
1. **Automatic** — Copilot reads your prompt and loads matching skills based on their description
2. **Manual** — Type `/skill-name` in the chat input (e.g., `/feature-dev Add user auth`)

**The philosophy:** Skills enforce discipline. Instead of jumping straight into code, they guide structured thinking — asking questions first, exploring the codebase, designing before implementing, and auditing after.

---

## Skill Reference

### `/using-superpowers` — The Meta-Skill

**What it does:** Ensures all other skills are checked before any action. It's the "always check your tools first" discipline.

**When it activates:** At the start of any conversation or task.

**Philosophy:** Most mistakes happen because we skip the process. This skill prevents rationalizations like "this is just a quick fix" or "I don't need a formal workflow for this."

**You'll rarely invoke this manually** — it's a background enforcer that reminds Copilot to check for applicable skills before responding.

---

### `/feature-dev` — Structured Feature Development

**What it does:** A 7-phase workflow: Discovery → Codebase Exploration → Clarifying Questions → Architecture Design → Implementation → Quality Review → Summary.

**When to use:** Building anything that touches multiple files or requires architectural decisions.

**Example prompts:**
- "Build a feature to add comments to pages"
- "Add real-time collaboration to the editor"
- `/feature-dev Add a notifications system`

**Philosophy:** The best code comes from understanding before acting. Phase 3 (Clarifying Questions) is the most important — it prevents building the wrong thing. Phase 4 (Architecture) gives you options instead of committing to the first idea.

**What to expect:**
1. Copilot asks what you're building and confirms understanding
2. Explores similar features in your codebase
3. Asks specific questions about edge cases, error handling, scope
4. Presents 2-3 architecture approaches with trade-offs
5. Implements after your approval
6. Reviews its own code for quality
7. Summarizes what was built

---

### `/code-review` — Confidence-Scored Code Review

**What it does:** Reviews code for real bugs and convention violations. Uses a 0-100 confidence scale, only reporting issues scored ≥80 to eliminate noise.

**When to use:** After implementing changes, before committing, or when you want a sanity check.

**Example prompts:**
- "Review my recent changes"
- "Check for bugs in the database filter"
- "Audit the changes I just made"
- `/code-review`

**Philosophy:** Most automated reviews produce noise — flagging style preferences, theoretical issues, and false positives. This skill only flags things that will actually cause problems. If the confidence is below 80, it's filtered out.

**What to expect:**
- Issues grouped by severity (Critical → Important → Minor)
- Each issue has a file reference, explanation, and suggested fix
- After presenting findings, asks what you want to do: fix now, fix later, or proceed

---

### `/code-simplifier` — Code Clarity Agent

**What it does:** Simplifies recently modified code for clarity and consistency while preserving all functionality.

**When to use:** After implementation passes review but feels complex. Or when code works but you know it could be cleaner.

**Example prompts:**
- "Simplify this component"
- "Clean up the code I just wrote"
- "Refine the database filter logic"
- `/code-simplifier`

**Philosophy:** Simplicity is not about fewer lines — it's about fewer concepts to hold in your head. Nested ternaries are "short" but not simple. A clear if/else chain that reads like prose is simpler than a dense one-liner.

**What to expect:**
- Only touches recently modified code (unless you specify broader scope)
- Reduces nesting, eliminates redundancy, improves naming
- Never changes behavior — only structure
- Respects project conventions (React Compiler, no useMemo/useCallback)

---

### `/pr-review-toolkit` — 6-Perspective Deep Review

**What it does:** Comprehensive analysis from 6 specialized angles: comments, tests, silent failures, type design, general quality, and simplification.

**When to use:** Before creating a PR. When you want thorough, multi-angle analysis.

**Example prompts:**
- "Do a thorough review before I commit"
- "PR review my changes"
- "Check error handling and type design"
- `/pr-review-toolkit`

**Philosophy:** No single reviewer catches everything. A bug hunter misses documentation issues. A type analyst misses silent failures. Six perspectives cover blind spots.

**What to expect:**
- Can run individual perspectives ("check for silent failures") or all 6
- Each perspective provides severity-prioritized findings
- Actionable output with specific file/line references

---

### `/tdd` — Test-Driven Development

**What it does:** Guides red-green-refactor loop with vertical slices (one test → one implementation → repeat).

**When to use:** Building features test-first. Fixing bugs where you want regression protection.

**Example prompts:**
- "Use TDD to build the comment system"
- "Red-green-refactor for the filter logic"
- "Write tests first for this feature"
- `/tdd Add pagination to the database view`

**Philosophy:** Write tests one at a time, not in bulk. Each test responds to what you learned from the previous cycle. Tests verify *behavior through public interfaces*, not implementation details. A good test survives refactoring because it doesn't care about internal structure.

**Anti-pattern to avoid:** Writing all tests first, then all implementation (horizontal slices). This produces tests that verify imagined behavior.

**What to expect:**
1. Planning phase: confirm interfaces and behaviors to test
2. Tracer bullet: one test → one implementation (proves the path works)
3. Incremental loop: one test at a time, minimal code to pass
4. Refactor: only after all tests pass

---

### `/typescript-lsp` — Type Safety Guide

**What it does:** Guides effective use of TypeScript's type system in this project.

**When to use:** TypeScript errors, type design questions, or wanting to improve type safety.

**Example prompts:**
- "Fix the TypeScript errors"
- "How should I type this component's props?"
- "Review type design for the filter system"
- `/typescript-lsp`

**Philosophy:** Types are documentation that the compiler verifies. Use Convex's generated types, leverage inference, and validate at boundaries with Zod. Don't over-annotate obvious things.

---

### `/agents-md-management` — Project Documentation Audit

**What it does:** Audits AGENTS.md quality, scores it against criteria, and proposes targeted improvements.

**When to use:** After conventions change, after major refactors, or periodically to keep docs current.

**Example prompts:**
- "Audit the AGENTS.md"
- "Is our project documentation up to date?"
- "Update AGENTS.md with what we learned"
- `/agents-md-management`

**Philosophy:** AGENTS.md is project memory. Stale memory is worse than no memory — it leads the AI astray. Regular audits keep it accurate and actionable.

**What to expect:**
- Quality report with scores (A-F) across 6 criteria
- Specific issues identified
- Targeted additions proposed (not rewrites)
- Asks for confirmation before making changes

---

### `/grill-me` — Plan Stress-Testing

**What it does:** Interviews you relentlessly about your plan until reaching shared understanding. Walks the decision tree branch by branch.

**When to use:** Before implementing a complex feature. When you have a plan but want to validate it.

**Example prompts:**
- "Grill me on my plan for the notification system"
- "Stress-test this architecture"
- "Challenge my design decisions"
- `/grill-me`

**Philosophy:** Plans fail because of unresolved ambiguity. Grilling forces you to be specific about edge cases, failure modes, and trade-offs *before* writing code. The interviewer provides recommended answers so you can confirm or correct — it's faster than starting from blank.

**What to expect:**
- One question at a time (not a wall of questions)
- Each question comes with a recommended answer
- Challenges assumptions with specific scenarios
- Cross-references your answers against existing code
- Stops when all branches are resolved and summarizes decisions

---

### `/grill-with-docs` — Domain-Aware Grilling

**What it does:** Same as grill-me, but challenges your plan against the project's established language and documented decisions.

**When to use:** When your plan involves domain concepts, naming, or conflicts with existing conventions.

**Example prompts:**
- "Grill my plan against our docs"
- "Challenge this against our domain model"
- `/grill-with-docs`

**Philosophy:** Terminology drift causes bugs. If your codebase calls it a "page" but your plan says "document", that inconsistency will propagate into code, UI, and conversations. This skill catches it early and updates documentation as decisions crystallize.

**What to expect:**
- Challenges any term that conflicts with AGENTS.md vocabulary
- Proposes precise terms when you use vague language
- Cross-references your statements against actual code behavior
- Updates project docs inline as decisions are made
- Offers ADRs only when decisions are hard to reverse and surprising

---

### `/to-prd` — Generate a PRD

**What it does:** Synthesizes the current conversation context into a Product Requirements Document.

**When to use:** After discussing a feature, when you want to formalize requirements.

**Example prompts:**
- "Write a PRD from what we discussed"
- "Document the requirements for this feature"
- `/to-prd`

**Philosophy:** A PRD captures *what* to build and *why*, not *how*. It's a contract between you and the implementation. Good PRDs have extensive user stories, clear implementation decisions, and explicit scope boundaries.

**What to expect:**
- Problem Statement, Solution, User Stories
- Implementation Decisions (modules, interfaces, schema)
- Testing Decisions (what to test, what makes a good test)
- Out of Scope (prevents scope creep)

---

### `/to-issues` — Break Plan into Issues

**What it does:** Breaks a plan or PRD into independently-grabbable issues using vertical slices.

**When to use:** After a PRD or plan is approved, to create actionable work items.

**Example prompts:**
- "Break this into issues"
- "Create tickets from the PRD"
- "Slice this into implementable tasks"
- `/to-issues`

**Philosophy:** Horizontal slices ("build all the backend, then all the frontend") leave you with nothing demoable until the end. Vertical slices ("user can create a page end-to-end") are demoable after each slice completes.

**What to expect:**
- Each issue is a thin vertical slice through all layers (schema → API → UI)
- Issues marked HITL (needs human decision) or AFK (can implement independently)
- Dependency order shown (what blocks what)
- User approves granularity before output is finalized

---

### `/improve-codebase-architecture` — Architecture Deepening

**What it does:** Finds modules that are "shallow" (interface as complex as implementation) and proposes refactors to make them "deep" (lots of behavior behind a simple interface).

**When to use:** When the codebase feels friction-y, when you keep bouncing between files, or when testing is hard.

**Example prompts:**
- "Find refactoring opportunities"
- "Improve the architecture"
- "What modules are too shallow?"
- `/improve-codebase-architecture`

**Philosophy:** Good architecture = deep modules. A deep module hides complexity behind a simple interface. Shallow modules (pass-throughs, thin wrappers) add files without reducing cognitive load. The "deletion test": if you delete the module and complexity vanishes, it was a pass-through.

**What to expect:**
1. Explores codebase organically (not rigid heuristics)
2. Presents numbered candidates with problem/solution/benefits
3. Asks which to explore
4. Grilling conversation about the chosen candidate
5. Implements after approval

---

### `/frontend-design` — Distinctive UI Design

**What it does:** Creates production-grade frontends with high design quality. Avoids generic AI aesthetics.

**When to use:** Building new pages, components, or restyling existing UI.

**Example prompts:**
- "Design a landing page"
- "Build a dashboard component"
- "Style the settings page"
- `/frontend-design`

**Philosophy:** Good design is intentional — bold maximalism and refined minimalism both work. The key is committing to a clear aesthetic direction and executing with precision. Never converge on generic choices (Inter font, purple gradients, standard card layouts).

---

## Workflow Combinations

Skills compose naturally. Common workflows:

| Goal | Skill Sequence |
|------|---------------|
| Build a complex feature | `/grill-me` → `/feature-dev` → `/code-review` → `/code-simplifier` |
| Plan then implement | `/grill-with-docs` → `/to-prd` → `/to-issues` → `/feature-dev` |
| TDD a feature | `/grill-me` → `/tdd` → `/code-review` |
| Post-implementation polish | `/code-review` → `/code-simplifier` → `/pr-review-toolkit` |
| Architecture improvement | `/improve-codebase-architecture` → `/grill-me` → implementation |

---

## Tips

1. **Skills auto-activate** — just describe what you want naturally. Copilot matches your intent to the right skill.
2. **Slash commands for precision** — when you want a specific workflow, use `/skill-name` directly.
3. **Skills are composable** — use multiple skills in sequence for complex tasks.
4. **AGENTS.md is the source of truth** — all skills reference it for project conventions.
5. **Skills ask before acting** — they won't start implementing without your approval on the plan.

---

## Credits

These skills are adapted from:
- [Anthropic's official Claude plugins](https://github.com/anthropics/claude-plugins-official) (code-review, code-simplifier, feature-dev, typescript-lsp, claude-md-management, pr-review-toolkit)
- [Matt Pocock's skills](https://github.com/mattpocock/skills) (tdd, to-issues, to-prd, grill-me, grill-with-docs, improve-codebase-architecture)
- [Jesse Vincent's Superpowers](https://github.com/obra/superpowers) (using-superpowers, frontend-design)

All adapted for VS Code + GitHub Copilot Agent Skills format.
