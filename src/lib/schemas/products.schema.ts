import type { DataSchema } from "@/lib/types";

export const productsSchema: DataSchema = {
  id: "products",
  name: "products",
  label: "Products",
  description: "Product catalog and inventory",
  icon: "Package",
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
      description: "Product name",
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      description: "Price in USD",
    },
    {
      name: "category",
      label: "Category",
      type: "enum",
      enumValues: [
        "electronics",
        "clothing",
        "food",
        "books",
        "home",
        "sports",
        "beauty",
      ],
      description: "Product category",
    },
    {
      name: "inStock",
      label: "In Stock",
      type: "boolean",
      description: "Availability",
    },
    {
      name: "rating",
      label: "Rating",
      type: "number",
      description: "Average rating (0-5)",
    },
    {
      name: "releasedAt",
      label: "Released At",
      type: "date",
      description: "Release date",
    },
    { name: "sku", label: "SKU", type: "string", description: "Stock unit ID" },
  ],
};

// Seeded random for reproducible data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(137);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randDate(start: Date, end: Date): string {
  const d = new Date(
    start.getTime() + rand() * (end.getTime() - start.getTime())
  );
  return d.toISOString().split("T")[0];
}

const adjectives = [
  "Premium", "Ultra", "Pro", "Essential", "Classic", "Advanced",
  "Compact", "Slim", "Smart", "Eco", "Turbo", "Elite",
];

const nouns: Record<string, string[]> = {
  electronics: ["Laptop", "Headphones", "Monitor", "Keyboard", "Mouse", "Tablet", "Speaker", "Webcam"],
  clothing: ["T-Shirt", "Jacket", "Sneakers", "Hoodie", "Jeans", "Cap", "Scarf", "Boots"],
  food: ["Coffee Beans", "Protein Bar", "Green Tea", "Olive Oil", "Honey", "Almonds", "Pasta", "Spice Set"],
  books: ["Handbook", "Guide", "Masterclass", "Workbook", "Novel", "Biography", "Cookbook", "Manual"],
  home: ["Lamp", "Pillow", "Blanket", "Shelf", "Vase", "Candle", "Mirror", "Rug"],
  sports: ["Yoga Mat", "Dumbbell", "Water Bottle", "Resistance Band", "Jump Rope", "Foam Roller", "Grip Tape", "Ball"],
  beauty: ["Serum", "Moisturizer", "Lip Balm", "Face Wash", "Sunscreen", "Eye Cream", "Toner", "Mask"],
};

const categories = [
  "electronics", "clothing", "food", "books", "home", "sports", "beauty",
] as const;

export const productsData: Record<string, unknown>[] = Array.from(
  { length: 120 },
  (_, i) => {
    const category = pick(categories);
    const noun = pick(nouns[category]);
    return {
      id: i + 1,
      title: `${pick(adjectives)} ${noun}`,
      price: Math.round((rand() * 300 + 5) * 100) / 100,
      category,
      inStock: rand() > 0.2,
      rating: Math.round((rand() * 4 + 1) * 10) / 10,
      releasedAt: randDate(new Date("2021-06-01"), new Date("2025-11-30")),
      sku: `SKU-${String(randInt(1000, 9999))}-${String.fromCharCode(65 + randInt(0, 25))}`,
    };
  }
);
