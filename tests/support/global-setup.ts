import "dotenv/config";
import { execSync } from "node:child_process";

async function globalSetup() {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("TEST_DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }

  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    // Prisma refuses `migrate reset` when it detects an AI agent unless this
    // is set. The owner explicitly consented to this script resetting only
    // TEST_DATABASE_URL, on every test run, during F0 setup (2026-09-11).
    PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "Yes, proceed",
  };

  // Prisma 7's `migrate reset` no longer seeds automatically; it must be run
  // as a separate step even with `migrations.seed` configured.
  execSync("npx prisma migrate reset --force", { stdio: "inherit", env });
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env });
}

export default globalSetup;
