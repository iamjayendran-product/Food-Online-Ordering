"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { authenticate } from "@/lib/auth/authenticate";
import { loginSchema } from "@/lib/auth/login-schema";
import { safeNextPath } from "@/lib/auth/safe-redirect";

export type LoginState =
  | {
      errors?: { email?: string[]; password?: string[] };
      formError?: string;
    }
  | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const result = await authenticate(validated.data.email, validated.data.password);
  if (!result.success) {
    return { formError: result.error };
  }

  await createSession(result.userId);
  redirect(safeNextPath(formData.get("next") as string | null));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
