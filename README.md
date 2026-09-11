# T Nagar Food Ordering

An online food ordering webapp (Foodhub-style) for restaurants in T Nagar, Chennai. See [CLAUDE.md](./CLAUDE.md) for full project scope, architecture, and conventions.

## Getting started

1. Copy the env file:
   ```bash
   cp .env.example .env
   ```
2. Start Postgres locally:
   ```bash
   npm run db:up
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

To stop the database:

```bash
npm run db:down
```

## Status

Project structure only — no features implemented yet. Database schema, auth, and pages will be added incrementally.
