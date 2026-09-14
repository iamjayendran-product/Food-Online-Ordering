"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <Box component="form" action={formAction} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <input type="hidden" name="next" value={next} />

      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        fullWidth
        error={Boolean(state?.errors?.email)}
        helperText={state?.errors?.email?.[0]}
      />

      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        fullWidth
        error={Boolean(state?.errors?.password)}
        helperText={state?.errors?.password?.[0]}
      />

      {state?.formError && <Alert severity="error">{state.formError}</Alert>}

      <Button type="submit" variant="contained" disabled={pending} sx={{ height: 48 }}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </Box>
  );
}
