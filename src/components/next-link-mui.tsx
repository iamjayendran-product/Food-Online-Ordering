"use client";

import NextLink from "next/link";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { ButtonProps } from "@mui/material/Button";
import type { CardActionAreaProps } from "@mui/material/CardActionArea";
import type { ChipProps } from "@mui/material/Chip";
import type { LinkProps } from "@mui/material/Link";
import type { TypographyProps } from "@mui/material/Typography";

// A Server Component cannot write `component={NextLink}` on a MUI component:
// every MUI component is a Client Component, and `component` would hand it a
// function across the server/client boundary, which React rejects outright
// ("Functions cannot be passed directly to Client Components"). Binding
// NextLink here — inside a Client Component — keeps client-side navigation
// while letting Server Components pass nothing but serialisable props.

export function LinkButton(props: ButtonProps<typeof NextLink>) {
  return <Button component={NextLink} {...props} />;
}

export function LinkTypography(props: TypographyProps<typeof NextLink>) {
  return <Typography component={NextLink} {...props} />;
}

export function LinkCardActionArea(props: CardActionAreaProps<typeof NextLink>) {
  return <CardActionArea component={NextLink} {...props} />;
}

export function TextLink(props: LinkProps<typeof NextLink>) {
  return <MuiLink component={NextLink} {...props} />;
}

export function LinkChip(props: ChipProps<typeof NextLink>) {
  return <Chip component={NextLink} clickable {...props} />;
}
