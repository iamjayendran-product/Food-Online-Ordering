import { test, expect } from "@playwright/test";
import { testDb } from "../support/db";
import { safeNextPath } from "../../src/lib/auth/safe-redirect";
import { loginSchema } from "../../src/lib/auth/login-schema";

test("TC-1.4 login validation rejects malformed email or empty password", () => {
  const malformedEmail = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
  expect(malformedEmail.success).toBe(false);
  if (!malformedEmail.success) {
    expect(malformedEmail.error.flatten().fieldErrors.email).toBeDefined();
  }

  const emptyPassword = loginSchema.safeParse({ email: "priya@example.com", password: "" });
  expect(emptyPassword.success).toBe(false);
  if (!emptyPassword.success) {
    expect(emptyPassword.error.flatten().fieldErrors.password).toBeDefined();
  }
});

test("TC-1.9 safeNextPath only accepts an internal path", () => {
  expect(safeNextPath("/checkout")).toBe("/checkout");
  expect(safeNextPath("https://evil.com")).toBe("/");
  expect(safeNextPath("//evil.com")).toBe("/");
  expect(safeNextPath("javascript:alert(1)")).toBe("/");
  expect(safeNextPath("")).toBe("/");
  expect(safeNextPath(null)).toBe("/");
});

test("TC-1.11 seeded customers store a bcrypt hash, not the plaintext password", async () => {
  const user = await testDb.user.findUnique({ where: { email: "priya@example.com" } });
  expect(user).not.toBeNull();
  expect(user?.passwordHash).not.toBe("password123");
  expect(user?.passwordHash).toMatch(/^\$2[aby]\$/);
});
