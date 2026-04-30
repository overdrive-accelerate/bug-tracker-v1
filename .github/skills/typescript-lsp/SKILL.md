---
name: typescript-lsp
description: TypeScript code intelligence and type safety practices. Use when the user asks about TypeScript errors, type issues, type safety improvements, or wants to leverage TypeScript features for better code quality. Guides proper use of TypeScript in the project.
---

# TypeScript LSP & Type Safety

Guide for leveraging TypeScript's type system effectively in this project. VS Code provides built-in TypeScript language services (go-to-definition, find references, error checking). This skill focuses on best practices for type safety.

## Type Checking

Run type check with:
```bash
npx tsc --noEmit
```

Always run after significant changes to catch type errors early.

## Project Configuration

- TypeScript strict mode is **off** (tsconfig.json)
- Import path alias: `@/*` → `src/*`
- React Compiler is enabled — types flow through automatically

## Type Safety Guidelines

### Do

- Use explicit types for function parameters at module boundaries
- Use Convex's generated types (`Id<"pages">`, `Doc<"pages">`) for database entities
- Use discriminated unions for state that has multiple shapes
- Use `as const` for literal type narrowing
- Leverage inference — don't over-annotate obvious types
- Use Zod schemas for runtime validation at system boundaries (API inputs, form data)

### Don't

- Don't use `any` — use `unknown` and narrow instead
- Don't use type assertions (`as`) unless absolutely necessary
- Don't ignore TypeScript errors with `@ts-ignore` — fix the underlying issue
- Don't create overly complex generic types for simple operations
- Don't duplicate types that Convex already generates

## Common Patterns in This Project

### Convex Types
```ts
import { Id, Doc } from "@/convex/_generated/dataModel";

// Use generated types for documents
type Page = Doc<"pages">;
type PageId = Id<"pages">;
```

### Component Props
```ts
// Explicit props types for components
type Props = {
  pageId: Id<"pages">;
  onClose: () => void;
};
```

### Form Validation
```ts
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  type: z.enum(["text", "image", "table"]),
});
```

## When to Check Types

- After implementing new features
- After refactoring
- Before considering work "done"
- When TypeScript errors appear in the editor
