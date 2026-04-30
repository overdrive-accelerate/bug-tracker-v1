---
name: grill-with-docs
description: Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation inline as decisions crystallize. Use when user wants to stress-test a plan against their project's language and documented decisions.
---

# Grill With Docs

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing.

If a question can be answered by exploring the codebase, explore the codebase instead.

## Domain Awareness

During codebase exploration, look for existing documentation:
- `AGENTS.md` / `CLAUDE.md` — project conventions, architecture, key terms
- `CONTEXT.md` — domain glossary (if exists)
- `docs/adr/` — architecture decision records (if exist)

## During the Session

### Challenge against the glossary

When the user uses a term that conflicts with established vocabulary in project docs, call it out immediately. "Your docs define 'X' as Y, but you seem to mean Z — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code does X, but you just said Y — which is right?"

### Update docs inline

When a term is resolved or a decision is made:
- If the project has a CONTEXT.md, update it with the new term/definition
- If an architectural decision is made that is hard to reverse, surprising without context, and the result of a real trade-off — offer to create an ADR

Don't batch updates — capture them as they happen.

### Offer ADRs sparingly

Only offer to create an ADR when ALL three are true:
1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR.
