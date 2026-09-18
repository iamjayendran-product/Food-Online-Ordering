"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { authenticate } from "@/lib/auth/authenticate";
import { loginSchema } from "@/lib/auth/login-schema";
import { guestSchema } from "@/lib/auth/guest-schema";
import { safeNextPath } from "@/lib/auth/safe-redirect";
import { db } from "@/lib/db";

export type LoginState =
  | {
      errors?: { email?: string[]; password?: string[] };
      formError?: string;
    }
  | undefined;

export type GuestState =
  | {
      errors?: { name?: string[] };
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

export async function continueAsGuest(_state: GuestState, formData: FormData): Promise<GuestState> {
  const validated = guestSchema.safeParse({ name: formData.get("name") });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const user = await db.user.create({
    data: { name: validated.data.name, isGuest: true },
  });

  await createSession(user.id);
  redirect(safeNextPath(formData.get("next") as string | null));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
