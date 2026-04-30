---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when the user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing.

If a question can be answered by exploring the codebase, explore the codebase instead of asking the user.

## Guidelines

- Be rigorous — don't accept vague answers
- Challenge assumptions with specific scenarios
- Probe edge cases and failure modes
- When the user's answer conflicts with existing code patterns, surface it
- Keep questions focused and specific — not open-ended
- For each question, provide your own recommended answer so the user can just confirm or correct
- Track resolved decisions as you go
- Stop when all branches have been resolved and summarize the decisions made
