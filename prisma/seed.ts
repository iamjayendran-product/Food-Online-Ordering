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
  grill: "https://images.unsplash.com/photo-1544025162-d76694265947",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
  generic: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
} as const;

const PHOTO_KEYWORDS: Array<[RegExp, string]> = [
  [/biryani/i, PHOTO.biryani],
  [/chicken|mutton|chettinad|kebab|skewer|tikka|fish|prawn/i, PHOTO.curry],
  [/dosa|uthappam/i, PHOTO.dosa],
  [/idli|pongal|vada/i, PHOTO.idli],
  [/thali|meals|curd rice|lemon rice|tamarind rice|kootu|poriyal|rasam|sambar$/i, PHOTO.thali],
  [/puri|chaat|tikki|samosa|pav bhaji|bhel|nachos/i, PHOTO.chaat],
  [/jalebi|gulab|kesari|halwa|pak|adhirasam|peda|jangiri|laddu/i, PHOTO.sweets],
  [/cake|pastry|slice|plum/i, PHOTO.dessert],
  [/coffee|kaapi/i, PHOTO.coffee],
  [/tea|chai/i, PHOTO.chai],
  [/milk|lassi|buttermilk|sarbath|soda|juice|coconut|mojito/i, PHOTO.coldDrink],
  [/bread|bun|puff|biscuit|rusk|mixture|thattai|murukku|boondi|naan/i, PHOTO.bakery],
  [/chutney|sambar \(extra\)/i, PHOTO.bowl],
  [/pizza/i, PHOTO.pizza],
  [/burger|sandwich/i, PHOTO.burger],
  [/manchurian|fried rice|dal makhani|paneer/i, PHOTO.curryAlt],
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

// 10 real, currently-operating T Nagar-area restaurants (researched
// 2026-09-16), each with real, standard dishes for that establishment —
// not verbatim-scraped pricing for all ~100 items, which is out of scope.
const restaurants: SeedRestaurant[] = [
  {
    slug: "hotel-saravana-bhavan",
    name: "Hotel Saravana Bhavan",
    cuisines: ["South Indian", "Pure Veg", "Tiffin"],
    address: "Sir Thyagaraya Road, T Nagar, Chennai",
    images: [PHOTO.dosa, PHOTO.idli, PHOTO.sweets],
    pickupMinutes: 20,
    ratingAvg: 4.7,
    reviewCount: 812,
    categories: [
      {
        name: "Tiffin",
        sortOrder: 0,
        items: [
          { name: "Ghee Roast Dosa", description: "Crisp rice crepe roasted in ghee.", pricePaise: rupees(140), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Mysore Masala Dosa", description: "Dosa with spiced red chutney and potato filling.", pricePaise: rupees(130), isVeg: true, isRecommended: true, sortOrder: 1 },
          { name: "Pongal", description: "Rice and lentils cooked with pepper and ghee.", pricePaise: rupees(90), isVeg: true, sortOrder: 2 },
          { name: "Idli", description: "Steamed rice cakes, served with sambar and chutney.", pricePaise: rupees(70), isVeg: true, sortOrder: 3 },
          { name: "Medhu Vada", description: "Crisp lentil doughnuts.", pricePaise: rupees(95), isVeg: true, sortOrder: 4 },
        ],
      },
      {
        name: "Sweets & Desserts",
        sortOrder: 1,
        items: [
          { name: "Rava Kesari", description: "Sweet semolina pudding.", pricePaise: rupees(80), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Badam Halwa", description: "Rich almond halwa.", pricePaise: rupees(140), isVeg: true, sortOrder: 1 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(50), isVeg: true, sortOrder: 0 },
          { name: "Sweet Lassi", description: "Chilled sweetened yogurt drink.", pricePaise: rupees(90), isVeg: true, sortOrder: 1 },
          { name: "Rose Milk", description: "Chilled milk with rose syrup.", pricePaise: rupees(80), isVeg: true, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "ponnusamy-hotel",
    name: "Ponnusamy Hotel",
    cuisines: ["South Indian", "Chettinad"],
    address: "North Usman Road, T Nagar, Chennai",
    images: [PHOTO.curry, PHOTO.biryaniAlt, PHOTO.thali],
    pickupMinutes: 25,
    ratingAvg: 4.5,
    reviewCount: 654,
    categories: [
      {
        name: "Chettinad Specials",
        sortOrder: 0,
        items: [
          { name: "Chicken Chettinad", description: "Chicken simmered in a roasted-spice Chettinad masala.", pricePaise: rupees(280), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Mutton Chukka", description: "Dry-roasted mutton with curry leaves.", pricePaise: rupees(320), isVeg: false, isRecommended: true, sortOrder: 1 },
          { name: "Pepper Chicken", description: "Chicken tossed in crushed black pepper masala.", pricePaise: rupees(260), isVeg: false, sortOrder: 2 },
          { name: "Fish Fry", description: "Spiced, shallow-fried fish fillets.", pricePaise: rupees(240), isVeg: false, sortOrder: 3 },
        ],
      },
      {
        name: "Biryani",
        sortOrder: 1,
        items: [
          { name: "Chicken Biryani", description: "Slow-cooked basmati with spiced chicken.", pricePaise: rupees(220), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Mutton Biryani", description: "Basmati layered with tender mutton.", pricePaise: rupees(280), isVeg: false, sortOrder: 1 },
          { name: "Egg Biryani", description: "Basmati with boiled eggs and fried onions.", pricePaise: rupees(150), isVeg: false, sortOrder: 2 },
          { name: "Veg Biryani", description: "Basmati with mixed vegetables and spices.", pricePaise: rupees(160), isVeg: true, sortOrder: 3 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Buttermilk", description: "Spiced yogurt drink.", pricePaise: rupees(30), isVeg: true, sortOrder: 0 },
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(40), isVeg: true, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    slug: "dindigul-thalappakatti",
    name: "Dindigul Thalappakatti",
    cuisines: ["Biryani", "South Indian"],
    address: "Habibullah Road, T Nagar, Chennai",
    images: [PHOTO.biryani, PHOTO.curry, PHOTO.chaat],
    pickupMinutes: 22,
    ratingAvg: 4.6,
    reviewCount: 921,
    categories: [
      {
        name: "Biryani",
        sortOrder: 0,
        items: [
          { name: "Seeraga Samba Chicken Biryani", description: "Signature short-grain seeraga samba rice with spiced chicken.", pricePaise: rupees(260), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Seeraga Samba Mutton Biryani", description: "Seeraga samba rice layered with tender mutton.", pricePaise: rupees(340), isVeg: false, isRecommended: true, sortOrder: 1 },
          { name: "Egg Biryani", description: "Seeraga samba rice with boiled eggs.", pricePaise: rupees(170), isVeg: false, sortOrder: 2 },
          { name: "Veg Biryani", description: "Seeraga samba rice with mixed vegetables.", pricePaise: rupees(180), isVeg: true, sortOrder: 3 },
        ],
      },
      {
        name: "Starters",
        sortOrder: 1,
        items: [
          { name: "Chicken 65", description: "Deep-fried spiced chicken bites.", pricePaise: rupees(210), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Mutton Chukka", description: "Dry-roasted mutton with curry leaves.", pricePaise: rupees(260), isVeg: false, sortOrder: 1 },
          // Deliberately marked recommended *and* unavailable: proves the
          // Recommended shortcut excludes items the customer can't actually order.
          { name: "Gobi Manchurian", description: "Crisp cauliflower tossed in Indo-Chinese sauce.", pricePaise: rupees(170), isVeg: true, isAvailable: false, isRecommended: true, sortOrder: 2 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Buttermilk", description: "Spiced yogurt drink.", pricePaise: rupees(30), isVeg: true, sortOrder: 0 },
          { name: "Sweet Lassi", description: "Chilled sweetened yogurt drink.", pricePaise: rupees(60), isVeg: true, sortOrder: 1 },
          { name: "Nannari Sarbath", description: "Sarsaparilla root sherbet.", pricePaise: rupees(50), isVeg: true, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "the-grand-sweets-and-snacks",
    name: "The Grand Sweets and Snacks",
    cuisines: ["Sweets", "Snacks"],
    address: "14th Avenue, Harrington Road area, T Nagar, Chennai",
    images: [PHOTO.sweets, PHOTO.dessert, PHOTO.bakery],
    pickupMinutes: 9,
    ratingAvg: 4.5,
    reviewCount: 402,
    categories: [
      {
        name: "Sweets",
        sortOrder: 0,
        items: [
          { name: "Mysore Pak", description: "Dense gram-flour and ghee sweet.", pricePaise: rupees(60), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Adhirasam", description: "Deep-fried jaggery and rice-flour sweet.", pricePaise: rupees(50), isVeg: true, sortOrder: 1 },
          { name: "Badam Halwa", description: "Rich almond halwa.", pricePaise: rupees(90), isVeg: true, isRecommended: true, sortOrder: 2 },
          { name: "Rava Laddu", description: "Semolina and cashew sweet balls.", pricePaise: rupees(60), isVeg: true, sortOrder: 3 },
        ],
      },
      {
        name: "Savoury Snacks",
        sortOrder: 1,
        items: [
          { name: "Mixture", description: "Savoury fried snack mix.", pricePaise: rupees(50), isVeg: true, sortOrder: 0 },
          { name: "Thattai", description: "Crisp savoury rice crackers.", pricePaise: rupees(40), isVeg: true, sortOrder: 1 },
          { name: "Murukku", description: "Spiced, crunchy rice-flour spirals.", pricePaise: rupees(45), isVeg: true, isRecommended: true, sortOrder: 2 },
          { name: "Kara Boondi", description: "Spiced crisp gram-flour pearls.", pricePaise: rupees(45), isVeg: true, isAvailable: false, sortOrder: 3 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(40), isVeg: true, sortOrder: 0 },
          { name: "Masala Chai", description: "Spiced milk tea.", pricePaise: rupees(30), isVeg: true, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    slug: "ratna-cafe",
    name: "Ratna Cafe",
    cuisines: ["South Indian", "Tiffin"],
    address: "Sir Thyagaraya Road, T Nagar, Chennai",
    images: [PHOTO.idli, PHOTO.dosa, PHOTO.coffee],
    pickupMinutes: 11,
    ratingAvg: 4.4,
    reviewCount: 567,
    categories: [
      {
        name: "Tiffin",
        sortOrder: 0,
        items: [
          { name: "Sambar Idli", description: "Steamed rice cakes soaked in hot sambar.", pricePaise: rupees(80), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Onion Rava Dosa", description: "Crisp semolina crepe with onion.", pricePaise: rupees(110), isVeg: true, isRecommended: true, sortOrder: 1 },
          { name: "Ghee Podi Idli", description: "Idli tossed in ghee and spiced lentil powder.", pricePaise: rupees(90), isVeg: true, sortOrder: 2 },
          { name: "Pongal", description: "Rice and lentils cooked with pepper and ghee.", pricePaise: rupees(85), isVeg: true, sortOrder: 3 },
          { name: "Uthappam", description: "Thick rice pancake with onion and chilli.", pricePaise: rupees(100), isVeg: true, sortOrder: 4 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 1,
        items: [
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(40), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Tea", description: "Milk tea.", pricePaise: rupees(30), isVeg: true, sortOrder: 1 },
          { name: "Badam Milk", description: "Chilled milk with almond and saffron.", pricePaise: rupees(90), isVeg: true, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "murugan-idli-shop",
    name: "Murugan Idli Shop",
    cuisines: ["South Indian", "Tiffin"],
    address: "Bazaar Street area, T Nagar, Chennai",
    images: [PHOTO.idli, PHOTO.dosa],
    pickupMinutes: 10,
    ratingAvg: 4.5,
    reviewCount: 689,
    categories: [
      {
        name: "Tiffin",
        sortOrder: 0,
        items: [
          { name: "Idli (4 pcs)", description: "Soft steamed rice cakes, the shop's signature.", pricePaise: rupees(80), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Kal Dosa", description: "Soft, thick fermented rice dosa.", pricePaise: rupees(100), isVeg: true, isRecommended: true, sortOrder: 1 },
          { name: "Podi Idli", description: "Idli tossed in spiced lentil powder and gingelly oil.", pricePaise: rupees(90), isVeg: true, sortOrder: 2 },
          { name: "Rava Idli", description: "Steamed semolina cakes.", pricePaise: rupees(90), isVeg: true, sortOrder: 3 },
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
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(40), isVeg: true, sortOrder: 0 },
          { name: "Sukku Coffee", description: "Dry-ginger spiced coffee.", pricePaise: rupees(50), isVeg: true, isRecommended: true, sortOrder: 1 },
        ],
      },
      {
        // Deliberately empty: the menu page must drop categories with no items.
        name: "Seasonal Specials",
        sortOrder: 3,
        items: [],
      },
    ],
  },
  {
    slug: "adyar-ananda-bhavan",
    name: "Adyar Ananda Bhavan",
    cuisines: ["South Indian", "Pure Veg", "Sweets"],
    address: "G N Chetty Road, T Nagar, Chennai",
    images: [PHOTO.dosa, PHOTO.sweets, PHOTO.idli],
    pickupMinutes: 14,
    ratingAvg: 4.3,
    reviewCount: 445,
    categories: [
      {
        name: "Tiffin",
        sortOrder: 0,
        items: [
          { name: "Masala Dosa", description: "Crisp rice crepe with spiced potato filling.", pricePaise: rupees(110), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Rava Dosa", description: "Crisp, lacy semolina crepe.", pricePaise: rupees(120), isVeg: true, sortOrder: 1 },
          { name: "Pongal", description: "Rice and lentils cooked with pepper and ghee.", pricePaise: rupees(90), isVeg: true, sortOrder: 2 },
          { name: "Idli", description: "Steamed rice cakes, served with sambar and chutney.", pricePaise: rupees(70), isVeg: true, sortOrder: 3 },
        ],
      },
      {
        name: "Sweets",
        sortOrder: 1,
        items: [
          { name: "Kaju Katli", description: "Cashew fudge diamonds.", pricePaise: rupees(120), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Milk Peda", description: "Soft milk-solid sweet.", pricePaise: rupees(90), isVeg: true, sortOrder: 1 },
          { name: "Jangiri", description: "Crisp, syrup-soaked spiral sweet.", pricePaise: rupees(60), isVeg: true, sortOrder: 2 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Filter Coffee", description: "Strong South Indian filter coffee.", pricePaise: rupees(40), isVeg: true, sortOrder: 0 },
          { name: "Rose Milk", description: "Chilled milk with rose syrup.", pricePaise: rupees(70), isVeg: true, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    slug: "absolute-barbecues",
    name: "Absolute Barbecues",
    cuisines: ["Barbecue", "Grill", "North Indian"],
    address: "Usman Road, T Nagar, Chennai",
    images: [PHOTO.grill, PHOTO.curry, PHOTO.curryAlt],
    pickupMinutes: 28,
    ratingAvg: 4.4,
    reviewCount: 738,
    categories: [
      {
        name: "Starters",
        sortOrder: 0,
        items: [
          { name: "Peri Peri Chicken Skewers", description: "Grilled chicken skewers in peri peri marinade.", pricePaise: rupees(280), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Paneer Tikka", description: "Char-grilled marinated paneer cubes.", pricePaise: rupees(220), isVeg: true, isRecommended: true, sortOrder: 1 },
          { name: "Fish Tikka", description: "Char-grilled marinated fish.", pricePaise: rupees(300), isVeg: false, sortOrder: 2 },
        ],
      },
      {
        name: "Grill Mains",
        sortOrder: 1,
        items: [
          { name: "Mutton Seekh Kebab", description: "Minced mutton skewers grilled over coal.", pricePaise: rupees(320), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Chicken Malai Tikka", description: "Creamy, char-grilled chicken tikka.", pricePaise: rupees(260), isVeg: false, sortOrder: 1 },
          { name: "Grilled Veg Platter", description: "Mixed vegetables grilled with herbs.", pricePaise: rupees(240), isVeg: true, sortOrder: 2 },
          { name: "Prawn Skewers", description: "Grilled marinated prawns.", pricePaise: rupees(340), isVeg: false, isAvailable: false, sortOrder: 3 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Virgin Mojito", description: "Lime, mint and soda mocktail.", pricePaise: rupees(150), isVeg: true, sortOrder: 0 },
          { name: "Fresh Lime Soda", description: "Lime juice with soda, sweet or salted.", pricePaise: rupees(80), isVeg: true, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    slug: "pakwan",
    name: "Pakwan",
    cuisines: ["North Indian", "Chinese"],
    address: "Panagal Park, T Nagar, Chennai",
    // Deliberately photo-less: the discovery card and restaurant page must
    // fall back to their placeholders and render no <img> element at all.
    images: [],
    pickupMinutes: 18,
    ratingAvg: 4.2,
    reviewCount: 356,
    categories: [
      {
        name: "North Indian",
        sortOrder: 0,
        items: [
          { name: "Paneer Butter Masala", description: "Paneer cubes in a creamy tomato gravy.", pricePaise: rupees(220), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Dal Makhani", description: "Slow-cooked black lentils with butter and cream.", pricePaise: rupees(190), isVeg: true, sortOrder: 1 },
          { name: "Butter Naan", description: "Leavened flatbread brushed with butter.", pricePaise: rupees(50), isVeg: true, isRecommended: true, sortOrder: 2 },
          { name: "Veg Biryani", description: "Basmati with mixed vegetables and spices.", pricePaise: rupees(180), isVeg: true, sortOrder: 3 },
        ],
      },
      {
        name: "Indo-Chinese",
        sortOrder: 1,
        items: [
          { name: "Veg Manchurian", description: "Fried vegetable dumplings in a tangy sauce.", pricePaise: rupees(170), isVeg: true, sortOrder: 0 },
          { name: "Chilli Chicken", description: "Wok-tossed chicken in chilli-garlic sauce.", pricePaise: rupees(230), isVeg: false, isRecommended: true, sortOrder: 1 },
          { name: "Veg Fried Rice", description: "Wok-fried rice with mixed vegetables.", pricePaise: rupees(160), isVeg: true, sortOrder: 2 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Sweet Lassi", description: "Chilled sweetened yogurt drink.", pricePaise: rupees(80), isVeg: true, sortOrder: 0 },
          { name: "Masala Soda", description: "Spiced, chilled soda.", pricePaise: rupees(50), isVeg: true, sortOrder: 1 },
        ],
      },
    ],
  },
  {
    slug: "sin-and-tonic",
    name: "Sin & Tonic",
    cuisines: ["Continental", "Multi-cuisine"],
    address: "Vijayaraghava Road, T Nagar, Chennai",
    images: [PHOTO.burger, PHOTO.pizza, PHOTO.chaat],
    pickupMinutes: 20,
    ratingAvg: 4.3,
    reviewCount: 298,
    categories: [
      {
        name: "Small Plates",
        sortOrder: 0,
        items: [
          { name: "Loaded Nachos", description: "Tortilla chips with cheese, salsa and jalapeños.", pricePaise: rupees(250), isVeg: true, isRecommended: true, sortOrder: 0 },
          { name: "Chicken Wings", description: "Roasted chicken wings tossed in a house glaze.", pricePaise: rupees(280), isVeg: false, isRecommended: true, sortOrder: 1 },
          { name: "Paneer Tikka", description: "Char-grilled marinated paneer cubes.", pricePaise: rupees(220), isVeg: true, sortOrder: 2 },
        ],
      },
      {
        name: "Mains",
        sortOrder: 1,
        items: [
          { name: "Grilled Chicken Burger", description: "Grilled chicken patty with lettuce and mayo.", pricePaise: rupees(260), isVeg: false, isRecommended: true, sortOrder: 0 },
          { name: "Veg Club Sandwich", description: "Triple-decker sandwich with mixed vegetables.", pricePaise: rupees(190), isVeg: true, sortOrder: 1 },
          { name: "Margherita Pizza", description: "Classic tomato, mozzarella and basil pizza.", pricePaise: rupees(280), isVeg: true, sortOrder: 2 },
        ],
      },
      {
        name: "Beverages",
        sortOrder: 2,
        items: [
          { name: "Virgin Mojito", description: "Lime, mint and soda mocktail.", pricePaise: rupees(150), isVeg: true, sortOrder: 0 },
          { name: "Iced Tea", description: "Chilled lemon iced tea.", pricePaise: rupees(120), isVeg: true, sortOrder: 1 },
        ],
      },
    ],
  },
];

type SeedCampaign = {
  restaurantSlug: string;
  headline: string;
  imageUrl: string;
  sortOrder: number;
};

// Decorative promo text for the discovery-page banner carousel, not a real
// promotions system: doesn't affect pricing or availability.
const campaigns: SeedCampaign[] = [
  { restaurantSlug: "ratna-cafe", headline: "20% off today at Ratna Cafe", imageUrl: PHOTO.tiffin, sortOrder: 0 },
  { restaurantSlug: "adyar-ananda-bhavan", headline: "New: Filter coffee combo at A2B", imageUrl: PHOTO.coffee, sortOrder: 1 },
  { restaurantSlug: "absolute-barbecues", headline: "Weekend grill buffet special", imageUrl: PHOTO.grill, sortOrder: 2 },
  { restaurantSlug: "the-grand-sweets-and-snacks", headline: "Order ahead: festive sweet boxes", imageUrl: PHOTO.dessert, sortOrder: 3 },
  { restaurantSlug: "sin-and-tonic", headline: "Happy hour snacks, 15% off", imageUrl: PHOTO.chaat, sortOrder: 4 },
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

async function seedCampaign(campaign: SeedCampaign) {
  const restaurant = await prisma.restaurant.findUniqueOrThrow({
    where: { slug: campaign.restaurantSlug },
  });
  await prisma.campaign.upsert({
    where: { restaurantId_headline: { restaurantId: restaurant.id, headline: campaign.headline } },
    create: {
      restaurantId: restaurant.id,
      headline: campaign.headline,
      imageUrl: campaign.imageUrl,
      sortOrder: campaign.sortOrder,
    },
    update: { imageUrl: campaign.imageUrl, sortOrder: campaign.sortOrder },
  });
}

// Removes restaurants that used to be seeded but no longer are (e.g. a full
// data refresh like the Foodlicious relaunch's real-restaurant roster).
// Skips any that still have real orders against them rather than silently
// deleting order history — those are left for a person to clean up.
async function removeStaleRestaurants() {
  const currentSlugs = restaurants.map((r) => r.slug);
  const stale = await prisma.restaurant.findMany({
    where: { slug: { notIn: currentSlugs } },
    select: { id: true, slug: true, _count: { select: { orders: true } } },
  });

  for (const restaurant of stale) {
    if (restaurant._count.orders > 0) {
      console.warn(
        `Skipping removal of stale restaurant "${restaurant.slug}": it has ${restaurant._count.orders} order(s).`,
      );
      continue;
    }
    await prisma.favorite.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.restaurant.delete({ where: { id: restaurant.id } });
  }
}

async function main() {
  await removeStaleRestaurants();
  for (const restaurant of restaurants) {
    await seedRestaurant(restaurant);
  }
  for (const campaign of campaigns) {
    await seedCampaign(campaign);
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
