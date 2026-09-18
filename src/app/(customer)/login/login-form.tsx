"use client";

import { useActionState, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { login, continueAsGuest, type LoginState, type GuestState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"login" | "guest">("login");
  const [loginState, loginFormAction, loginPending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );
  const [guestState, guestFormAction, guestPending] = useActionState<GuestState, FormData>(
    continueAsGuest,
    undefined,
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_event, value) => {
          if (value) setMode(value);
        }}
        sx={{ display: "flex" }}
      >
        <ToggleButton value="login" sx={{ flex: 1 }}>
          Log in
        </ToggleButton>
        <ToggleButton value="guest" sx={{ flex: 1 }}>
          Continue as Guest
        </ToggleButton>
      </ToggleButtonGroup>

      {mode === "login" ? (
        <Box component="form" action={loginFormAction} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <input type="hidden" name="next" value={next} />

          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            fullWidth
            error={Boolean(loginState?.errors?.email)}
            helperText={loginState?.errors?.email?.[0]}
          />

          <TextField
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            fullWidth
            error={Boolean(loginState?.errors?.password)}
            helperText={loginState?.errors?.password?.[0]}
          />

          {loginState?.formError && <Alert severity="error">{loginState.formError}</Alert>}

          <Button type="submit" variant="contained" disabled={loginPending} sx={{ height: 48 }}>
            {loginPending ? "Logging in…" : "Log in"}
          </Button>
        </Box>
      ) : (
        <Box component="form" action={guestFormAction} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <input type="hidden" name="next" value={next} />

          <TextField
            id="guest-name"
            name="name"
            type="text"
            label="Name"
            autoComplete="name"
            fullWidth
            error={Boolean(guestState?.errors?.name)}
            helperText={guestState?.errors?.name?.[0]}
          />

          <Button type="submit" variant="contained" disabled={guestPending} sx={{ height: 48 }}>
            {guestPending ? "Continuing…" : "Continue as Guest"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
