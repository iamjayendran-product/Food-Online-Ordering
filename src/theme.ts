import { createTheme } from "@mui/material/styles";

// Brand: white and bronze.
//
// Bronze carries every interactive role and white is the canvas. Mapping it the
// other way round is not viable: MUI paints contained buttons, links, focus
// rings and active states with `primary`, so a white primary renders white text
// on white. Classic bronze (#CD7F32) is only 3.14:1 against white — enough for
// borders and large accents, but below the 4.5:1 WCAG AA needs for text and
// button fills — so interactive bronze is deepened to #8C5A22 (5.83:1).
const BRONZE = "#8C5A22";
const BRONZE_ACCENT = "#CD7F32";
const BRONZE_DARK = "#5C3A16";
const BRONZE_TINT = "#FAF7F2";
const INK = "#1C1917";
const INK_MUTED = "#6F6259";

export const brand = {
  bronze: BRONZE,
  bronzeAccent: BRONZE_ACCENT,
  bronzeTint: BRONZE_TINT,
} as const;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: BRONZE,
      light: BRONZE_ACCENT,
      dark: BRONZE_DARK,
      contrastText: "#FFFFFF",
    },
    // White as a usable colour role: secondary buttons and surfaces that sit on
    // bronze or photography.
    secondary: {
      main: "#FFFFFF",
      dark: "#F2EDE6",
      contrastText: INK,
    },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
    text: { primary: INK, secondary: INK_MUTED },
    divider: "rgba(28, 25, 23, 0.12)",
    error: { main: "#B3261E" },
    warning: { main: "#8A5A00" },
    success: { main: "#1B6B3A" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontSize: "1.0625rem", fontWeight: 600 },
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
        root: { borderRadius: 999, backgroundColor: BRONZE_TINT, color: INK_MUTED },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 12, backgroundColor: "#FFFFFF" } },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: { root: { color: BRONZE, fontWeight: 600 } },
    },
    MuiContainer: { defaultProps: { maxWidth: "lg" } },
  },
});
