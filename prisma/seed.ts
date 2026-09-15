import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Every URL below was checked to return HTTP 200 when this seed was written.
// Photos are assigned by keyword rather than hand-mapped per dish, so adding a
// menu item can't silently leave it without a picture.
const PHOTO = {
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
  biryaniAlt: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
  curry: "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
  curryAlt: "https://images.unsplash.com/photo-1596797038530-2c107229654b",
  tiffin: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc",
  dosa: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8",
  idli: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
  thali: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976",
  chaat: "https://images.unsplash.com/photo-1606491956689-2ea866880c84",
  streetFood: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  sweets: "https://images.unsplash.com/photo-1626132647523-66f5bf380027",
  dessert: "https://images.unsplash.com/photo-1565958011703-44f9829ba187",
  coffee: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
  coffeeAlt: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
  chai: "https://images.unsplash.com/photo-1613145997970-db84a7975fbb",
  coldDrink: "https://images.unsplash.com/photo-1541167760496-1628856ab772",
  juice: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
  bakery: "https://images.unsplash.com/photo-1571091718767-18b5b1457add",
  bowl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  generic: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
} as const;

const PHOTO_KEYWORDS: Array<[RegExp, string]> = [
  [/biryani/i, PHOTO.biryani],
  [/chicken|mutton|egg puff/i, PHOTO.curry],
  [/dosa|uthappam/i, PHOTO.dosa],
  [/idli|pongal|vada/i, PHOTO.idli],
  [/meals|curd rice|lemon rice|tamarind rice|kootu|poriyal|rasam|sambar/i, PHOTO.thali],
  [/puri|chaat|tikki|samosa|pav bhaji|bhel/i, PHOTO.chaat],
  [/jalebi|gulab|rasmalai|kesari|rabri|halwa/i, PHOTO.sweets],
  [/cake|pastry|slice|plum/i, PHOTO.dessert],
  [/coffee|kaapi/i, PHOTO.coffee],
  [/tea|chai/i, PHOTO.chai],
  [/milk|lassi|buttermilk|sarbath|soda|juice|coconut/i, PHOTO.coldDrink],
  [/bread|bun|puff|biscuit|rusk|mixture/i, PHOTO.bakery],
  [/chutney|sambar \(extra\)/i, PHOTO.bowl],
];

function photoFor(name: string): string {
  for (const [pattern, url] of PHOTO_KEYWORDS) {
    if (pattern.test(name)) return url;
  }
  return PHOTO.generic;
}

type SeedItem = {
  name: string;
  description: string;
  pricePaise: number;
  isVeg: boolean;
  isAvailable?: boolean;
  isRecommended?: boolean;
  sortOrder: number;
};

type SeedCategory = {
  name: string;
  sortOrder: number;
  items: SeedItem[];
};

type SeedRestaurant = {
  slug: string;
  name: string;
  cuisines: string[];
  address: string;
  images: string[];
  pickupMinutes: number;
  ratingAvg: number;
  reviewCount: number;
  categories: SeedCategory[];
};

const rupees = (r: number) => r * 100;

const restaurants: SeedRestaurant[] = [
  {
    slug: "ranganathan-street-biryani",
    name: "Ranganathan Street Biryani",
    cuisines: ["Biryani", "North Indian"],
    address: "45 Ranganathan Street, T Nagar, Chennai",
    images: [PHOTO.biryani, PHOTO.biryaniAlt, PHOTO.curry],
    pickupMinutes: 18,
    ratingAvg: 4.4,
    reviewCount: 312,
    categories: [
      {
        name: "Biryani",
        sortOrder: 0,
        items: [
          { name: "Chicken Biryani", description: "Slow-cooked basmati with spiced chicken.", pricePaise: rupees(220), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Mutton Biryani", description: "Basmati layered with tender mutton.", pricePaise: rupees(280), isVeg: false, isRecommended: true, sortOrder: 1 },
          { name: "Egg Biryani", description: "Basmati with boiled eggs and fried onions.", pricePaise: rupees(150), isVeg: false, sortOrder: 2 },
          { name: "Veg Biryani", description: "Basmati with mixed vegetables and spices.", pricePaise: rupees(160), isVeg: true, sortOrder: 3 },
        ],
      },
      {
        name: "Starters",
        sortOrder: 1,
        items: [
          { name: "Chicken 65", description: "Deep-fried spiced chicken bites.", pricePaise: rupees(180), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Mutton Chukka", description: "Dry-roasted mutton with curry leaves.", pricePaise: rupees(250), isVeg: false, sortOrder: 1 },
          // Deliberately marked recommended *and* unavailable: proves the
          // Recommended shortcut excludes items the customer can't actually order.
          { name: "Gobi Manchurian", description: "Crisp cauliflower tossed in Indo-Chinese sauce.", pricePaise: rupees(140), isVeg: true, isAvailable: false, isRecommended: true, sortOrder: 2 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Buttermilk", description: "Spiced yogurt drink.", pricePaise: rupees(30), isVeg: true, sortOrder: 0 },
          { name: "Sweet Lassi", description: "Chilled sweetened yogurt drink.", pricePaise: rupees(50), isVeg: true, sortOrder: 1 },
          { name: "Rasmalai", description: "Soft paneer discs in sweetened milk.", pricePaise: rupees(80), isVeg: true, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "pondy-bazaar-tiffin-house",
    name: "Pondy Bazaar Tiffin House",
    cuisines: ["South Indian", "Tiffin"],
    address: "18 Pondy Bazaar Main Road, T Nagar, Chennai",
    images: [PHOTO.tiffin, PHOTO.dosa, PHOTO.idli],
    pickupMinutes: 12,
    ratingAvg: 4.6,
    reviewCount: 508,
    categories: [
      {
        name: "Tiffin",
        sortOrder: 0,
        items: [
          { name: "Idli", description: "Steamed rice cakes, served with sambar and chutney.", pricePaise: rupees(60), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Masala Dosa", description: "Crisp rice crepe with spiced potato filling.", pricePaise: rupees(90), isVeg: true, isRecommended: true, sortOrder: 1 },
          { name: "Plain Dosa", description: "Crisp rice crepe.", pricePaise: rupees(70), isVeg: true, sortOrder: 2 },
          { name: "Pongal", description: "Rice and lentils cooked with pepper and ghee.", pricePaise: rupees(80), isVeg: true, sortOrder: 3 },
          { name: "Uthappam", description: "Thick rice pancake with onion and chilli.", pricePaise: rupees(85), isVeg: true, sortOrder: 4 },
          { name: "Rava Kesari", description: "Sweet semolina pudding.", pricePaise: rupees(50), isVeg: true, sortOrder: 5 },
        ],
      },
      {
        name: "Chutneys & Sides",
        sortOrder: 1,
        items: [
          { name: "Sambar (extra)", description: "Lentil and vegetable stew.", pricePaise: rupees(30), isVeg: true, sortOrder: 0 },
          { name: "Chutney (extra)", description: "Coconut chutney.", pricePaise: rupees(20), isVeg: true, sortOrder: 1 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(30), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Tea", description: "Milk tea.", pricePaise: rupees(20), isVeg: true, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    slug: "panagal-park-chaat-corner",
    name: "Panagal Park Chaat Corner",
    cuisines: ["Chaat", "Street Food"],
    address: "3 Panagal Park, T Nagar, Chennai",
    images: [PHOTO.chaat, PHOTO.streetFood, PHOTO.sweets],
    pickupMinutes: 10,
    ratingAvg: 4.2,
    reviewCount: 189,
    categories: [
      {
        name: "Chaat",
        sortOrder: 0,
        items: [
          { name: "Pani Puri", description: "Crisp puris with spiced tamarind water.", pricePaise: rupees(50), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Bhel Puri", description: "Puffed rice tossed with chutneys and sev.", pricePaise: rupees(60), isVeg: true, sortOrder: 1 },
          { name: "Sev Puri", description: "Crisp puris topped with potato and sev.", pricePaise: rupees(60), isVeg: true, sortOrder: 2 },
          { name: "Dahi Puri", description: "Puris filled with yogurt and chutneys.", pricePaise: rupees(70), isVeg: true, sortOrder: 3 },
          { name: "Aloo Tikki", description: "Pan-fried spiced potato patties.", pricePaise: rupees(55), isVeg: true, sortOrder: 4 },
          { name: "Samosa Chaat", description: "Crushed samosa with chutneys and yogurt.", pricePaise: rupees(65), isVeg: true, isRecommended: true, sortOrder: 5 },
          { name: "Pav Bhaji", description: "Spiced mashed vegetables with buttered buns.", pricePaise: rupees(90), isVeg: true, isRecommended: true, sortOrder: 6 },
        ],
      },
      {
        name: "Sweets",
        sortOrder: 1,
        items: [
          { name: "Jalebi", description: "Crisp fried batter soaked in sugar syrup.", pricePaise: rupees(60), isVeg: true, sortOrder: 0 },
          { name: "Gulab Jamun", description: "Fried milk-solid balls in sugar syrup.", pricePaise: rupees(50), isVeg: true, sortOrder: 1 },
          { name: "Rabri", description: "Sweetened, thickened milk.", pricePaise: rupees(70), isVeg: true, isAvailable: false, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "usman-road-mess",
    name: "Usman Road Mess",
    cuisines: ["South Indian", "Pure Veg"],
    address: "27 Usman Road, T Nagar, Chennai",
    images: [PHOTO.thali, PHOTO.bowl, PHOTO.curryAlt],
    pickupMinutes: 22,
    ratingAvg: 4.7,
    reviewCount: 741,
    categories: [
      {
        name: "Meals",
        sortOrder: 0,
        items: [
          { name: "Veg Meals", description: "Rice, sambar, rasam, poriyal and curd.", pricePaise: rupees(120), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Curd Rice", description: "Rice mixed with yogurt, tempered.", pricePaise: rupees(70), isVeg: true, sortOrder: 1 },
          { name: "Lemon Rice", description: "Rice tempered with lemon and peanuts.", pricePaise: rupees(70), isVeg: true, sortOrder: 2 },
          { name: "Tamarind Rice", description: "Rice tossed in tangy tamarind paste.", pricePaise: rupees(75), isVeg: true, sortOrder: 3 },
        ],
      },
      {
        name: "Curries",
        sortOrder: 1,
        items: [
          { name: "Kootu", description: "Lentils cooked with vegetables.", pricePaise: rupees(50), isVeg: true, sortOrder: 0 },
          { name: "Poriyal", description: "Stir-fried vegetables with coconut.", pricePaise: rupees(50), isVeg: true, sortOrder: 1 },
          { name: "Rasam", description: "Tangy, peppery lentil soup.", pricePaise: rupees(40), isVeg: true, sortOrder: 2 },
          { name: "Sambar Vada", description: "Lentil fritters soaked in sambar.", pricePaise: rupees(60), isVeg: true, isRecommended: true, sortOrder: 3 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(30), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Buttermilk", description: "Spiced yogurt drink.", pricePaise: rupees(25), isVeg: true, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    slug: "burkit-road-bakes",
    name: "Burkit Road Bakes",
    cuisines: ["Bakery", "Desserts"],
    address: "9 Burkit Road, T Nagar, Chennai",
    // Deliberately photo-less: the discovery card must fall back to its
    // initials tile and render no <img> element at all.
    images: [],
    pickupMinutes: 8,
    ratingAvg: 4.0,
    reviewCount: 96,
    categories: [
      {
        name: "Breads & Buns",
        sortOrder: 0,
        items: [
          { name: "Bread Loaf", description: "Fresh white bread loaf.", pricePaise: rupees(45), isVeg: true, sortOrder: 0 },
          { name: "Butter Bun", description: "Soft bun with a butter glaze.", pricePaise: rupees(25), isVeg: true, isRecommended: true, sortOrder: 1 },
          { name: "Veg Puff", description: "Flaky pastry with spiced vegetable filling.", pricePaise: rupees(30), isVeg: true, isRecommended: true, sortOrder: 2 },
          { name: "Egg Puff", description: "Flaky pastry with spiced egg filling.", pricePaise: rupees(35), isVeg: false, sortOrder: 3 },
        ],
      },
      {
        name: "Cakes & Pastries",
        sortOrder: 1,
        items: [
          { name: "Black Forest Slice", description: "Chocolate sponge with cream and cherries.", pricePaise: rupees(70), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Pineapple Pastry", description: "Vanilla sponge with pineapple cream.", pricePaise: rupees(65), isVeg: true, sortOrder: 1 },
          { name: "Plum Cake", description: "Rich fruit and nut cake.", pricePaise: rupees(150), isVeg: true, sortOrder: 2 },
        ],
      },
      {
        name: "Snacks",
        sortOrder: 2,
        items: [
          { name: "Mixture", description: "Savoury fried snack mix.", pricePaise: rupees(40), isVeg: true, sortOrder: 0 },
          { name: "Khara Biscuit", description: "Savoury spiced biscuits.", pricePaise: rupees(35), isVeg: true, sortOrder: 1 },
          { name: "Rusk", description: "Twice-baked sweet bread.", pricePaise: rupees(30), isVeg: true, isAvailable: false, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "thyagaraya-filter-kaapi",
    name: "Thyagaraya Filter Kaapi",
    cuisines: ["Beverages", "South Indian"],
    address: "60 Thyagaraya Road, T Nagar, Chennai",
    // The previous single photo URL had rotted to a 404; replaced with
    // verified coffee imagery.
    images: [PHOTO.coffee, PHOTO.coffeeAlt, PHOTO.chai],
    pickupMinutes: 6,
    ratingAvg: 4.5,
    reviewCount: 233,
    categories: [
      {
        name: "Coffee & Tea",
        sortOrder: 0,
        items: [
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(25), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Strong Coffee", description: "Extra-strong filter coffee.", pricePaise: rupees(30), isVeg: true, sortOrder: 1 },
          { name: "Masala Chai", description: "Spiced milk tea.", pricePaise: rupees(25), isVeg: true, isRecommended: true, sortOrder: 2 },
          { name: "Ginger Tea", description: "Tea brewed with fresh ginger.", pricePaise: rupees(25), isVeg: true, sortOrder: 3 },
        ],
      },
      {
        name: "Cool Drinks",
        sortOrder: 1,
        items: [
          { name: "Rose Milk", description: "Chilled milk with rose syrup.", pricePaise: rupees(40), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Badam Milk", description: "Chilled milk with almond and saffron.", pricePaise: rupees(50), isVeg: true, sortOrder: 1 },
          { name: "Nannari Sarbath", description: "Sarsaparilla root sherbet.", pricePaise: rupees(35), isVeg: true, sortOrder: 2 },
          { name: "Lemon Juice", description: "Fresh lime juice.", pricePaise: rupees(30), isVeg: true, sortOrder: 3 },
          { name: "Tender Coconut", description: "Chilled tender coconut water.", pricePaise: rupees(40), isVeg: true, sortOrder: 4 },
          { name: "Fresh Lime Soda", description: "Lime juice with soda, sweet or salted.", pricePaise: rupees(35), isVeg: true, sortOrder: 5 },
        ],
      },
      {
        // Deliberately empty: F2/F3 must drop categories with no items.
        name: "Seasonal Specials",
        sortOrder: 2,
        items: [],
      },
    ],
  },
];

type SeedCustomer = {
  email: string;
  name: string;
  password: string;
};

const customers: SeedCustomer[] = [
  { email: "priya@example.com", name: "Priya Raman", password: "password123" },
  { email: "arjun@example.com", name: "Arjun Kumar", password: "password123" },
];

async function seedRestaurant(restaurant: SeedRestaurant) {
  const fields = {
    name: restaurant.name,
    cuisines: restaurant.cuisines,
    address: restaurant.address,
    images: restaurant.images,
    pickupMinutes: restaurant.pickupMinutes,
    ratingAvg: restaurant.ratingAvg,
    reviewCount: restaurant.reviewCount,
  };

  const record = await prisma.restaurant.upsert({
    where: { slug: restaurant.slug },
    create: { slug: restaurant.slug, ...fields },
    update: fields,
  });

  for (const category of restaurant.categories) {
    const categoryRecord = await prisma.menuCategory.upsert({
      where: { restaurantId_name: { restaurantId: record.id, name: category.name } },
      create: {
        restaurantId: record.id,
        name: category.name,
        sortOrder: category.sortOrder,
      },
      update: {
        sortOrder: category.sortOrder,
      },
    });

    for (const item of category.items) {
      const itemFields = {
        name: item.name,
        description: item.description,
        pricePaise: item.pricePaise,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable ?? true,
        isRecommended: item.isRecommended ?? false,
        imageUrl: photoFor(item.name),
        sortOrder: item.sortOrder,
      };

      await prisma.menuItem.upsert({
        where: { categoryId_name: { categoryId: categoryRecord.id, name: item.name } },
        create: {
          restaurantId: record.id,
          categoryId: categoryRecord.id,
          ...itemFields,
        },
        update: itemFields,
      });
    }
  }
}

async function seedCustomer(customer: SeedCustomer) {
  const passwordHash = await bcrypt.hash(customer.password, 10);
  await prisma.user.upsert({
    where: { email: customer.email },
    create: {
      email: customer.email,
      name: customer.name,
      passwordHash,
    },
    update: {
      name: customer.name,
      passwordHash,
    },
  });
}

async function main() {
  for (const restaurant of restaurants) {
    await seedRestaurant(restaurant);
  }
  for (const customer of customers) {
    await seedCustomer(customer);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
