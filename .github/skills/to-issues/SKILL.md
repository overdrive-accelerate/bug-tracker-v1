---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues using tracer-bullet vertical slices. Use when the user wants to convert a plan into issues, create implementation tickets, or break down work into smaller tasks.
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes an issue reference or description, read it fully.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state. Issue titles and descriptions should use the project's vocabulary from AGENTS.md/CLAUDE.md.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be:
- **HITL** (Human-in-the-loop): Requires human interaction, such as an architectural decision or design review
- **AFK** (Away from keyboard): Can be implemented and merged without human interaction

Prefer AFK over HITL where possible.

**Vertical slice rules:**
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if applicable)

Ask the user:
- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Output the issues

For each approved slice, output a formatted issue. Present issues in dependency order (blockers first).

**Issue template:**

```markdown
## Title

[Short descriptive name]

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- [Reference to blocking issue] (if any)
- Or "None — can start immediately" if no blockers.
```

Do NOT close or modify any parent issue.
