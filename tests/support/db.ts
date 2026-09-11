import "dotenv/config";
import { execSync } from "node:child_process";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) {
  throw new Error("TEST_DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

const adapter = new PrismaPg({ connectionString });
export const testDb = new PrismaClient({ adapter });

// Restores seed data to its defaults and clears any orders a test placed.
// Menu/restaurant/user rows are reset in place (seed.ts upserts, it doesn't
// insert duplicates), so this is safe to call between tests.
export async function reseed() {
  await testDb.orderItem.deleteMany();
  await testDb.order.deleteMany();
  execSync("npx tsx prisma/seed.ts", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: connectionString },
  });
}
