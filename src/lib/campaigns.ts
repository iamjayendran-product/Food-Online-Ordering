import { db } from "@/lib/db";

export type CampaignItem = {
  id: string;
  headline: string;
  restaurantName: string;
  restaurantSlug: string;
};

export async function listCampaigns(): Promise<CampaignItem[]> {
  const campaigns = await db.campaign.findMany({
    orderBy: [{ restaurantId: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      headline: true,
      restaurant: { select: { name: true, slug: true } },
    },
  });

  return campaigns.map((campaign) => ({
    id: campaign.id,
    headline: campaign.headline,
    restaurantName: campaign.restaurant.name,
    restaurantSlug: campaign.restaurant.slug,
  }));
}
