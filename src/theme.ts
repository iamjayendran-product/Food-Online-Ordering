import { createTheme } from "@mui/material/styles";

// Brand: Sunshine, Tomato Burst, Forest Green, Kiwi — a vibrant multi-accent
// palette, not a single primary/secondary pair. Each colour keeps one
// deliberate role, and (following the same methodology as the bronze
// palette this replaced) every colour used as an icon or text fill directly
// on white is deepened until it clears the WCAG contrast floor that role
// needs: 4.5:1 for text/button fills, 3:1 for large-scale icons and
// non-text UI. The brighter "_LIGHT" companion of each is for filled
// badge/chip backgrounds with dark text on top, or borders/gradients —
// never for a colour foreground directly on white.
const TOMATO = "#C43A2F"; // primary / CTA — 5.26:1 on white
const TOMATO_LIGHT = "#E4573F"; // borders, gradients, large accents — 3.66:1
const TOMATO_DARK = "#8C2A22"; // hover/pressed states
const SUNSHINE = "#A87900"; // ratings / highlight icons on white — 3.89:1
const SUNSHINE_FILL = "#F4B400"; // badge/chip fill (dark text on top) — 9.48:1 for that text
const FOREST = "#1B6B3A"; // success / vegetarian marker — 6.54:1
const KIWI = "#5B8C2A"; // secondary accent icons/borders on white — 4.02:1
const KIWI_FILL = "#8BC34A"; // badge/chip fill (dark text on top)
const INK = "#1C1917";
const INK_MUTED = "#6F6259";
const TOMATO_TINT = "#FBEAE7";

export const brand = {
  tomato: TOMATO,
  tomatoLight: TOMATO_LIGHT,
  tomatoDark: TOMATO_DARK,
  sunshine: SUNSHINE,
  sunshineFill: SUNSHINE_FILL,
  forest: FOREST,
  kiwi: KIWI,
  kiwiFill: KIWI_FILL,
} as const;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: TOMATO,
      light: TOMATO_LIGHT,
      dark: TOMATO_DARK,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FFFFFF",
      dark: TOMATO_TINT,
      contrastText: INK,
    },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
    text: { primary: INK, secondary: INK_MUTED },
    divider: "rgba(28, 25, 23, 0.12)",
    error: { main: "#B3261E" },
    // Ratings and highlight badges — see SUNSHINE/SUNSHINE_FILL above.
    warning: { main: SUNSHINE, light: SUNSHINE_FILL, contrastText: INK },
    // Vegetarian marker and confirmation states — the role green already played.
    success: { main: FOREST },
    // MUI's own defaults here are neutral grey (rgba(0,0,0,...)), which is
    // why hover/selected states read as generic rather than branded.
    // Overriding once at the theme level covers every component that uses
    // the default interaction-state mechanism (buttons, list/menu items,
    // chips) without touching each one individually.
    action: {
      hover: "rgba(196, 58, 47, 0.06)",
      hoverOpacity: 0.06,
      selected: "rgba(196, 58, 47, 0.12)",
      selectedOpacity: 0.12,
      focus: "rgba(196, 58, 47, 0.16)",
      focusOpacity: 0.16,
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    h1: {
      fontFamily: "var(--font-space-grotesk), var(--font-geist-sans), system-ui, sans-serif",
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: "var(--font-space-grotesk), var(--font-geist-sans), system-ui, sans-serif",
      fontSize: "1.25rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: "var(--font-space-grotesk), var(--font-geist-sans), system-ui, sans-serif",
      fontSize: "1.0625rem",
      fontWeight: 600,
    },
    button: { textTransform: "none", fontWeight: 600 },
    body2: { lineHeight: 1.5 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20 },
        sizeSmall: { paddingInline: 14 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(28, 25, 23, 0.12)",
          boxShadow: "none",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid rgba(28, 25, 23, 0.12)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, backgroundColor: TOMATO_TINT, color: INK_MUTED },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          "&.Mui-selected": {
            backgroundColor: TOMATO,
            color: "#FFFFFF",
            "&:hover": { backgroundColor: TOMATO_DARK },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 12, backgroundColor: "#FFFFFF" } },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: { root: { color: TOMATO, fontWeight: 600 } },
    },
    MuiContainer: { defaultProps: { maxWidth: "lg" } },
  },
});
