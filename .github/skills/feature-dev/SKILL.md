---
name: feature-dev
description: Guided 7-phase feature development workflow with codebase exploration, clarifying questions, architecture design, implementation, and quality review. Use when the user asks to build a new feature, add functionality, or implement something that touches multiple files and requires architectural decisions.
---

# Feature Development

A systematic 7-phase approach to building new features. Instead of jumping straight into code, this guides you through understanding the codebase, asking clarifying questions, designing architecture, and ensuring quality.

## Core Principles

- **Ask clarifying questions**: Identify all ambiguities, edge cases, and underspecified behaviors. Ask specific, concrete questions rather than making assumptions. Wait for user answers before proceeding.
- **Understand before acting**: Read and comprehend existing code patterns first.
- **Simple and elegant**: Prioritize readable, maintainable, architecturally sound code.
- **Track progress**: Use todo list to track all phases and progress.

---

## Phase 1: Discovery

**Goal**: Understand what needs to be built

**Actions**:
1. Create todo list with all phases
2. If feature is unclear, ask user for:
   - What problem are they solving?
   - What should the feature do?
   - Any constraints or requirements?
3. Summarize understanding and confirm with user

---

## Phase 2: Codebase Exploration

**Goal**: Understand relevant existing code and patterns

**Actions**:
1. Explore the codebase to find:
   - Similar features and how they're implemented
   - Architecture and abstractions for the relevant area
   - UI patterns, data flow, and conventions
2. Read all key files identified during exploration
3. Present comprehensive summary of findings and patterns discovered

---

## Phase 3: Clarifying Questions

**Goal**: Fill in gaps and resolve all ambiguities before designing

**CRITICAL**: This is one of the most important phases. DO NOT SKIP.

**Actions**:
1. Review the codebase findings and original feature request
2. Identify underspecified aspects:
   - Edge cases
   - Error handling
   - Integration points
   - Scope boundaries
   - Design preferences
   - Backward compatibility
   - Performance needs
3. **Present all questions to the user in a clear, organized list**
4. **Wait for answers before proceeding to architecture design**

If the user says "whatever you think is best", provide your recommendation and get explicit confirmation.

---

## Phase 4: Architecture Design

**Goal**: Design implementation approach with clear trade-offs

**Actions**:
1. Design 2-3 approaches with different focuses:
   - Minimal changes (smallest change, maximum reuse)
   - Clean architecture (maintainability, elegant abstractions)
   - Pragmatic balance (speed + quality)
2. Present to user:
   - Brief summary of each approach
   - Trade-offs comparison
   - **Your recommendation with reasoning**
3. **Ask user which approach they prefer**

---

## Phase 5: Implementation

**Goal**: Build the feature

**DO NOT START WITHOUT USER APPROVAL**

**Actions**:
1. Wait for explicit user approval
2. Read all relevant files identified in previous phases
3. Implement following chosen architecture
4. Follow codebase conventions strictly (check AGENTS.md)
5. Write clean, well-structured code
6. Update todos as you progress

---

## Phase 6: Quality Review

**Goal**: Ensure code is simple, DRY, elegant, and functionally correct

**Actions**:
1. Review from multiple perspectives:
   - Simplicity/DRY/Elegance
   - Bugs/Functional correctness
   - Project conventions/AGENTS.md compliance
2. Identify highest severity issues
3. **Present findings to user and ask what they want to do** (fix now, fix later, or proceed as-is)
4. Address issues based on user decision

---

## Phase 7: Summary

**Goal**: Document what was accomplished

**Actions**:
1. Mark all todos complete
2. Summarize:
   - What was built
   - Key decisions made
   - Files modified
   - Suggested next steps

---

## When to Use This Workflow

**Use for:**
- New features that touch multiple files
- Features requiring architectural decisions
- Complex integrations with existing code
- Features where requirements are unclear

**Don't use for:**
- Single-line bug fixes
- Trivial changes
- Well-defined, simple tasks
- Urgent hotfixes
