import { z } from "zod";

export const guestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(80, "Name is too long."),
});

export type GuestInput = z.infer<typeof guestSchema>;
