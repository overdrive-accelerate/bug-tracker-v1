---
name: code-review
description: Review code for bugs, quality issues, and project convention compliance. Use when the user asks to review code, check for bugs, audit changes, or verify code quality. Performs confidence-scored analysis focused on real issues, not nitpicks.
---

# Code Review

Automated code review focused on finding real bugs and AGENTS.md compliance issues. Uses confidence scoring to filter false positives, ensuring only high-quality, actionable feedback.

## Review Process

1. **Gather context**: Read AGENTS.md guidelines and understand project conventions
2. **Identify scope**: Determine which files were recently modified or specified by the user
3. **Multi-perspective analysis**: Review from multiple angles:
   - AGENTS.md compliance (coding standards, patterns, conventions)
   - Bug detection (logic errors, edge cases, race conditions)
   - Silent failures (empty catch blocks, swallowed errors, missing validation)
   - Historical context (does the change break existing patterns?)
4. **Confidence scoring**: Rate each issue 0-100
5. **Filter**: Only report issues with confidence ≥ 80
6. **Present findings**: Clear, actionable output with file references

## Confidence Scale

| Score | Meaning |
|-------|---------|
| 0 | False positive, doesn't stand up to scrutiny |
| 25 | Might be real, but could be false positive |
| 50 | Real issue, but minor or unlikely in practice |
| 75 | Very likely real, will be hit in practice |
| 100 | Definitely real, confirmed with evidence |

## What to Flag (High Confidence)

- Logic errors that will cause incorrect behavior
- Missing error handling in critical paths
- Race conditions or state management bugs
- Security vulnerabilities (XSS, injection, auth bypass)
- Memory leaks (unsubscribed listeners, uncleaned effects)
- Breaking changes to existing functionality
- Violations of AGENTS.md conventions that will cause issues

## What NOT to Flag (False Positives)

- Pre-existing issues not introduced in recent changes
- Something that looks like a bug but isn't
- Pedantic nitpicks a senior engineer wouldn't call out
- Issues a linter or TypeScript compiler would catch
- General code quality issues unless explicitly in AGENTS.md
- Issues explicitly silenced in code (lint ignore comments)
- Changes in functionality that are intentional
- Stylistic preferences not documented in AGENTS.md

## Output Format

For each issue found:
1. Brief description of the problem
2. File and line reference
3. Why it's a problem (impact)
4. Suggested fix
5. Confidence score

## After Review

- Present all high-confidence (≥80) issues
- Group by severity: Critical → Important → Minor
- Ask user what they want to do: fix now, fix later, or proceed as-is
