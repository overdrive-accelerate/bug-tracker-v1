---
name: typescript-lsp
description: TypeScript code intelligence and type safety practices. Use when the user asks about TypeScript errors, type issues, type safety improvements, or wants to leverage TypeScript features for better code quality. Guides proper use of TypeScript in the project.
---

# TypeScript LSP & Type Safety

Guide for leveraging TypeScript's type system effectively. VS Code provides built-in TypeScript language services (go-to-definition, find references, error checking). This skill focuses on best practices for type safety.

## Type Checking

Run type check with:
```bash
npx tsc --noEmit
```

Always run after significant changes to catch type errors early.

## Type Safety Guidelines

### Do

- Use explicit types for function parameters at module boundaries
- Use generated types from your ORM/framework (Prisma, Drizzle, Convex, etc.) for database entities
- Use discriminated unions for state that has multiple shapes
- Use `as const` for literal type narrowing
- Leverage inference — don't over-annotate obvious types
- Use Zod/Valibot schemas for runtime validation at system boundaries (API inputs, form data)
- Use `unknown` and narrow with type guards instead of `any`
- Prefer interfaces for object shapes that may be extended
- Use type predicates (`is` functions) for complex narrowing

### Don't

- Don't use `any` — use `unknown` and narrow instead
- Don't use type assertions (`as`) unless absolutely necessary
- Don't ignore TypeScript errors with `@ts-ignore` — fix the underlying issue
- Don't create overly complex generic types for simple operations
- Don't duplicate types that your framework already generates
- Don't use `!` (non-null assertion) when you can check properly
- Don't suppress errors to "get it working" — types exist to catch bugs

## Common Patterns

### Discriminated Unions
```ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Data }
  | { status: "error"; error: Error };
```

### Type Guards
```ts
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value;
}
```

### Generic Constraints
```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### Utility Types
```ts
// Pick only what you need
type UserPreview = Pick<User, "id" | "name" | "avatar">;

// Make fields optional for updates
type UpdateUser = Partial<Omit<User, "id" | "createdAt">>;
```

## When to Check Types

- After implementing new features
- After refactoring
- Before considering work "done"
- When TypeScript errors appear in the editor
- After changing function signatures or data shapes
