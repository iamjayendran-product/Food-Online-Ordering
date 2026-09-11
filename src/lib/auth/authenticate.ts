import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Same message for "no such account" and "wrong password" so a login
// attempt can't be used to discover which emails are registered.
const INVALID_CREDENTIALS_ERROR = "Invalid email or password.";

// A bcrypt hash of an unused, random password. When no account matches, we
// still run bcrypt.compare against this so the response takes roughly the
// same time either way — otherwise a wrong-password attempt (a real compare)
// would be measurably slower than an unknown-email attempt (no compare),
// letting timing defeat the identical error message above.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8G6MDGD8VuMkOzHwq.5/BwVQjPCGX6";

type AuthenticateResult = { success: true; userId: string } | { success: false; error: string };

export async function authenticate(email: string, password: string): Promise<AuthenticateResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email: normalizedEmail } });

  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    return { success: false, error: INVALID_CREDENTIALS_ERROR };
  }

  return { success: true, userId: user.id };
}
