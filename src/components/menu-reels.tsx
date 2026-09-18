import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RamenDiningIcon from "@mui/icons-material/RamenDining";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import BrunchDiningIcon from "@mui/icons-material/BrunchDining";
import IcecreamIcon from "@mui/icons-material/Icecream";
import { brand } from "@/theme";

type ReelKind = "wokToss" | "tandoor" | "steamer" | "plating" | "dessert";

const REEL_VARIANTS: Record<
  ReelKind,
  { Icon: typeof RamenDiningIcon; gradient: string; caption: string; animation: string; keyframes: string }
> = {
  wokToss: {
    Icon: RamenDiningIcon,
    gradient: `linear-gradient(160deg, ${brand.tomato} 0%, ${brand.tomatoDark} 100%)`,
    caption: "Wok-tossed, fresh off the flame",
    animation: "foodlicious-reel-toss 1.6s ease-in-out infinite",
    keyframes: `@keyframes foodlicious-reel-toss {
      0%, 100% { transform: translateY(0) rotate(-4deg); }
      50% { transform: translateY(-8px) rotate(4deg); }
    }`,
  },
  tandoor: {
    Icon: LocalFireDepartmentIcon,
    gradient: `linear-gradient(160deg, ${brand.sunshineFill} 0%, ${brand.tomatoDark} 100%)`,
    caption: "Straight from the tandoor",
    animation: "foodlicious-reel-flicker 1.1s ease-in-out infinite",
    keyframes: `@keyframes foodlicious-reel-flicker {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.12); opacity: 0.85; }
    }`,
  },
  steamer: {
    Icon: SoupKitchenIcon,
    gradient: `linear-gradient(160deg, ${brand.kiwi} 0%, ${brand.forest} 100%)`,
    caption: "Steamed to order",
    animation: "foodlicious-reel-rise 2s ease-in-out infinite",
    keyframes: `@keyframes foodlicious-reel-rise {
      0%, 100% { transform: translateY(0); opacity: 0.9; }
      50% { transform: translateY(-6px); opacity: 1; }
    }`,
  },
  plating: {
    Icon: BrunchDiningIcon,
    gradient: `linear-gradient(160deg, ${brand.kiwiFill} 0%, ${brand.kiwi} 100%)`,
    caption: "Plated fresh for pickup",
    animation: "foodlicious-reel-garnish 1.4s ease-in-out infinite",
    keyframes: `@keyframes foodlicious-reel-garnish {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(8deg); }
    }`,
  },
  dessert: {
    Icon: IcecreamIcon,
    gradient: `linear-gradient(160deg, ${brand.tomatoLight} 0%, ${brand.sunshineFill} 100%)`,
    caption: "Sweet finish, made in-house",
    animation: "foodlicious-reel-drizzle 1.8s ease-in-out infinite",
    keyframes: `@keyframes foodlicious-reel-drizzle {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(3px) scale(1.05); }
    }`,
  },
};

// Picks 3 cuisine-appropriate reel kinds — a small shared illustration pool,
// not unique content per restaurant, matched by keyword the same way
// PHOTO_KEYWORDS assigns menu item photos in prisma/seed.ts.
function reelKindsFor(cuisines: string[]): ReelKind[] {
  const text = cuisines.join(" ").toLowerCase();
  const kinds: ReelKind[] = [];

  if (/biryani|chettinad|north indian|grill|barbecue/.test(text)) kinds.push("tandoor");
  if (/tiffin|south indian|snacks/.test(text)) kinds.push("steamer");
  if (/chinese|multi-cuisine|continental/.test(text)) kinds.push("wokToss");
  if (/sweets/.test(text)) kinds.push("dessert");
  kinds.push("plating");

  const unique = [...new Set(kinds)];
  while (unique.length < 3) {
    const filler = (["wokToss", "plating", "steamer", "tandoor", "dessert"] as ReelKind[]).find(
      (kind) => !unique.includes(kind),
    );
    if (!filler) break;
    unique.push(filler);
  }
  return unique.slice(0, 3);
}

export function MenuReels({ cuisines }: { cuisines: string[] }) {
  const kinds = reelKindsFor(cuisines);

  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Typography variant="h2" component="h2" sx={{ mb: 0.25 }}>
        From the kitchen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Illustrative clips, not real footage
      </Typography>
      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1, "&::-webkit-scrollbar": { display: "none" } }}>
        {kinds.map((kind, index) => {
          const variant = REEL_VARIANTS[kind];
          const Icon = variant.Icon;
          return (
            <Box
              key={`${kind}-${index}`}
              role="img"
              aria-label={`Illustration: ${variant.caption}`}
              sx={{
                position: "relative",
                flexShrink: 0,
                width: 132,
                height: 220,
                borderRadius: 3,
                overflow: "hidden",
                background: variant.gradient,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon sx={{ fontSize: 40, color: "#FFFFFF", animation: variant.animation }} />
              <style>{variant.keyframes}</style>
              <Typography
                variant="body2"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  color: "#FFFFFF",
                  fontWeight: 600,
                  textAlign: "center",
                  px: 1.25,
                  pb: 1.5,
                  pt: 3,
                  background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
                }}
              >
                {variant.caption}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
