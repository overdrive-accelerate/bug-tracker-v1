# Bug tracker
Bug tracker is a collaborative workspace for pages, rich documents, and inline databases. It combines a Notion-style editor with database views (table, board, list), nested pages, auth, comments, and file attachments.

## Tech stack
- Next.js 16 (App Router), React 19, TypeScript
- Convex (database, realtime sync, file storage, server functions)
- Better Auth + `@convex-dev/better-auth`
- BlockNote editor
- Tailwind CSS v4 and custom UI components

## Core features
- Email/password authentication (`/login`, `/signup`)
- Rich document editor with slash menu and file upload support
- Nested pages with sidebar navigation and trash workflow
- Inline databases with custom properties
- Multiple database views: table, board, and list
- Row detail panel with comments, subtasks, and supporting files
- Light/dark theme toggle

## Project structure
- `src/app/` - App Router route groups (`(marketing)`, `(auth)`, `(app)`) and API routes
- `src/components/` - Editor, layout, page tree, database views, and shared UI
- `src/lib/` - Auth clients/helpers and shared utilities/types
- `convex/` - Schema, mutations/queries/actions, Better Auth integration, and HTTP routes

## Local development
### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_SITE_URL=your_convex_site_url
SITE_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_auth_secret
```

### 3) Start Convex backend
```bash
npx convex dev
```

### 4) Start Next.js app
```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts
- `npm run dev` - Start local Next.js dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run format` - Format codebase with Prettier
- `npm run format:check` - Check formatting

## Notes
- Auth API route is implemented at `src/app/api/auth/[...all]/route.ts`.
- File serving is handled through Convex HTTP route `/file/{storageId}` in `convex/http.ts`.
