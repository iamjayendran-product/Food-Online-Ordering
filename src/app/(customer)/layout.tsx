import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { SiteHeader } from "@/components/site-header";
import { BasketProvider } from "@/components/basket-provider";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <SiteHeader />
      <Box component="main" sx={{ flex: 1, pb: 8 }}>
        <Container sx={{ py: { xs: 3, sm: 4 } }}>{children}</Container>
      </Box>
    </BasketProvider>
  );
}
