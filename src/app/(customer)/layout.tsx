import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { SiteHeader } from "@/components/site-header";
import { BasketProvider } from "@/components/basket-provider";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <SiteHeader />
      <Box component="main" sx={{ flex: 1, pb: 8 }}>
        <Container sx={{ py: { xs: 3, sm: 4 } }}>{children}</Container>
      </Box>
      <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", py: 2 }}>
        <Container>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
            Foodlicious is a demo project. Restaurant names shown are for illustration only and are
            not affiliated with or endorsed by these businesses.
          </Typography>
        </Container>
      </Box>
    </BasketProvider>
  );
}
