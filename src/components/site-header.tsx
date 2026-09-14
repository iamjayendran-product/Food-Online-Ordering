import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/(customer)/login/actions";
import { BasketLink } from "@/components/basket-link";
import { LinkButton, LinkTypography } from "@/components/next-link-mui";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <AppBar position="sticky">
      <Container>
        <Toolbar disableGutters sx={{ gap: 1.5, minHeight: { xs: 60, sm: 68 } }}>
          <LinkTypography
            href="/"
            sx={{
              mr: "auto",
              fontSize: "1.125rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "text.primary",
              textDecoration: "none",
            }}
          >
            T Nagar{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              Food
            </Box>
          </LinkTypography>

          <BasketLink />

          {user ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Hi {user.name.split(" ")[0]}
              </Typography>
              <form action={logout} style={{ display: "flex" }}>
                <Button type="submit" size="small" color="inherit">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <LinkButton href="/login" size="small" variant="contained">
              Login
            </LinkButton>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
