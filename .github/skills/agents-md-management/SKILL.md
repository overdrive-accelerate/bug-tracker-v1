---
name: agents-md-management
description: Audit, evaluate, and improve AGENTS.md or CLAUDE.md to ensure optimal project context. Use when the user asks to check, audit, update, improve, or fix the project instruction file, or when project conventions have changed and need to be captured.
---

# AGENTS.md / CLAUDE.md Management

Audit and improve the project instruction file (AGENTS.md for GitHub Copilot, CLAUDE.md for Claude Code) to ensure it provides optimal project context. Keeps project memory current and actionable.

## Workflow

### Phase 1: Discovery

Find the instruction file and any related configuration:
- `./AGENTS.md` — Primary project context (GitHub Copilot)
- `./CLAUDE.md` — Primary project context (Claude Code)
- `.github/copilot-instructions.md` — Copilot-specific instructions (if exists)

### Phase 2: Quality Assessment

Evaluate against quality criteria:

| Criterion | Weight | Check |
|-----------|--------|-------|
| Commands/workflows documented | High | Are build/test/deploy commands present? |
| Architecture clarity | High | Can the agent understand the codebase structure? |
| Non-obvious patterns | Medium | Are gotchas and quirks documented? |
| Conciseness | Medium | No verbose explanations or obvious info? |
| Currency | High | Does it reflect current codebase state? |
| Actionability | High | Are instructions executable, not vague? |

**Quality Scores:**
- **A (90-100)**: Comprehensive, current, actionable
- **B (70-89)**: Good coverage, minor gaps
- **C (50-69)**: Basic info, missing key sections
- **D (30-49)**: Sparse or outdated
- **F (0-29)**: Missing or severely outdated

### Phase 3: Quality Report

**ALWAYS output the quality report BEFORE making any updates.**

Format:
```
## Quality Report

### Summary
- Score: XX/100 (Grade: X)

### Assessment
| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | X/20 | ... |
| Architecture clarity | X/20 | ... |
| Non-obvious patterns | X/15 | ... |
| Conciseness | X/15 | ... |
| Currency | X/15 | ... |
| Actionability | X/15 | ... |

### Issues
- [List specific problems]

### Recommended Updates
- [List what should be added/changed]
```

### Phase 4: Targeted Updates

After outputting the quality report, ask user for confirmation before updating.

**Update Guidelines:**

1. **Propose targeted additions only** — Focus on genuinely useful info:
   - Commands or workflows discovered during analysis
   - Gotchas or non-obvious patterns found in code
   - Architecture changes that weren't reflected
   - Testing approaches that work
   - Configuration quirks

2. **Keep it minimal** — Avoid:
   - Restating what's obvious from the code
   - Generic best practices already covered
   - One-off fixes unlikely to recur
   - Verbose explanations when a one-liner suffices

3. **Show diffs** — For each change, show:
   - The specific addition or modification
   - Brief explanation of why this helps

### Phase 5: Apply Updates

After user approval, apply changes. Preserve existing content structure.

## Common Issues to Flag

1. **Stale commands**: Build commands that no longer work
2. **Missing dependencies**: Required tools not mentioned
3. **Outdated architecture**: File structure that's changed
4. **Missing environment setup**: Required env vars or config
5. **Undocumented gotchas**: Non-obvious patterns not captured
6. **Redundant sections**: Duplicate or overly verbose content

## What Makes a Great Instruction File

**Key principles:**
- Concise and scannable
- Actionable commands that can be copy-pasted
- Project-specific patterns, not generic advice
- Non-obvious gotchas and warnings
- Current with the actual codebase state

**Recommended sections** (use only what's relevant):
- Commands (build, test, dev, lint)
- Architecture (directory structure, key patterns)
- Conventions (components, backend, naming)
- Configuration notes (compiler, TypeScript, tooling)
- Performance rules (project-specific)
- Workflow rules (process expectations)
- Documentation references (links to relevant docs)
