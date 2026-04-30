---
name: pr-review-toolkit
description: Comprehensive code review toolkit with 6 specialized review perspectives — comments, tests, silent failures, type design, general quality, and simplification. Use when the user asks for thorough review, PR review, or wants multiple aspects of code quality checked before committing or merging.
---

# PR Review Toolkit

A comprehensive collection of 6 specialized review perspectives for thorough code analysis. Each focuses on a specific aspect of code quality. Use individually for targeted reviews or together for comprehensive analysis.

## Review Perspectives

### 1. Comment Analyzer

**Focus**: Code comment accuracy and maintainability

Checks for:
- Comment accuracy vs actual code behavior
- Documentation completeness
- Comment rot and technical debt
- Misleading or outdated comments

**Trigger**: "Check if the comments are accurate", "Review documentation"

---

### 2. Test Analyzer

**Focus**: Test coverage quality and completeness

Checks for:
- Behavioral vs line coverage
- Critical gaps in test coverage
- Test quality and resilience
- Edge cases and error conditions

**Trigger**: "Check if tests are thorough", "Review test coverage"

---

### 3. Silent Failure Hunter

**Focus**: Error handling and silent failures

Checks for:
- Silent failures in catch blocks
- Inadequate error handling
- Inappropriate fallback behavior
- Missing error logging or user feedback

**Trigger**: "Review error handling", "Check for silent failures"

---

### 4. Type Design Analyzer

**Focus**: Type design quality and invariants

Rates (1-10 each):
- Type encapsulation
- Invariant expression
- Type usefulness
- Invariant enforcement

**Trigger**: "Review type design", "Check if this type has strong invariants"

---

### 5. Code Reviewer

**Focus**: General code review for project guidelines

Checks for:
- Project convention compliance
- Style violations
- Bug detection
- Code quality issues
- Confidence scoring (0-100, only report ≥80)

**Trigger**: "Review my changes", "Check if everything looks good"

---

### 6. Code Simplifier

**Focus**: Code simplification and refactoring

Checks for:
- Code clarity and readability
- Unnecessary complexity and nesting
- Redundant code and abstractions
- Consistency with project standards
- Overly compact or clever code

**Trigger**: "Simplify this code", "Make this clearer"

---

## Usage Patterns

### Individual Review
Ask questions that match a perspective's focus:
- "Can you check if the tests cover all edge cases?" → Test Analyzer
- "Review the error handling in the API client" → Silent Failure Hunter
- "I've added documentation — is it accurate?" → Comment Analyzer

### Comprehensive Review
For thorough review before committing:
1. Review for bugs and correctness (Code Reviewer)
2. Check for silent failures (Silent Failure Hunter)
3. Verify comments are accurate (Comment Analyzer)
4. Review any new types (Type Design Analyzer)
5. Simplify if needed (Code Simplifier)

### When to Use Each

**Before Committing:**
- Code Reviewer (general quality)
- Silent Failure Hunter (if changed error handling)

**Before Creating PR:**
- Test Analyzer (coverage check)
- Comment Analyzer (if added/modified comments)
- Type Design Analyzer (if added/modified types)
- Code Reviewer (final sweep)

**After Passing Review:**
- Code Simplifier (improve clarity and maintainability)

## Output Format

All reviews provide:
- Clear issue identification
- Specific file and line references
- Explanation of why it's a problem
- Suggestions for improvement
- Prioritized by severity

## Best Practices

- Be specific: Target specific perspectives for focused review
- Use proactively: Run before committing, not after
- Address critical issues first: Priorities matter
- Iterate: Run again after fixes to verify
- Focus on changed code: Don't review entire codebase unless asked
