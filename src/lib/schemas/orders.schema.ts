import type { DataSchema } from "@/lib/types";

export const ordersSchema: DataSchema = {
  id: "orders",
  name: "orders",
  label: "Orders",
  description: "Customer order transactions",
  icon: "ShoppingCart",
  fields: [
    {
      name: "orderId",
      label: "Order ID",
      type: "string",
      description: "Unique order identifier",
    },
    {
      name: "total",
      label: "Total",
      type: "number",
      description: "Order total in USD",
    },
    {
      name: "status",
      label: "Status",
      type: "enum",
      enumValues: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      description: "Order status",
    },
    {
      name: "customerName",
      label: "Customer Name",
      type: "string",
      description: "Customer full name",
    },
    {
      name: "itemCount",
      label: "Items",
      type: "number",
      description: "Number of items",
    },
    {
      name: "orderDate",
      label: "Order Date",
      type: "date",
      description: "Date order was placed",
    },
    {
      name: "isPaid",
      label: "Paid",
      type: "boolean",
      description: "Payment received",
    },
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

const rand = seededRandom(256);

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

const customerNames = [
  "Aisha Bello", "Chinedu Okafor", "Fatima Garba", "Ibrahim Musa",
  "Kemi Adeyemi", "Tolu Bakare", "Yusuf Hassan", "Ngozi Eze",
  "David Johnson", "Sarah Williams", "Maria Garcia", "James Brown",
  "Emma Wilson", "Chen Wei", "Yuki Tanaka", "Raj Patel",
  "Priya Sharma", "Hans Müller", "Pierre Dubois", "Carlos Lopez",
  "Sofia Martinez", "Kenji Watanabe", "Luna Morales", "Diego Rivera",
  "Aaliya Khan", "Robert Taylor", "Olivia Anderson", "William Clark",
  "Ava Thomas", "Michael Davis",
];

const statuses = [
  "pending", "processing", "shipped", "delivered", "cancelled", "refunded",
] as const;

export const ordersData: Record<string, unknown>[] = Array.from(
  { length: 100 },
  (_, i) => {
    const status = pick(statuses);
    const isPaid =
      status === "delivered" || status === "shipped"
        ? true
        : status === "cancelled" || status === "refunded"
          ? rand() > 0.7
          : rand() > 0.4;

    return {
      id: i + 1,
      orderId: `ORD-${String(2024000 + i + 1)}`,
      total: Math.round((rand() * 500 + 10) * 100) / 100,
      status,
      customerName: pick(customerNames),
      itemCount: randInt(1, 12),
      orderDate: randDate(new Date("2024-01-01"), new Date("2025-12-31")),
      isPaid,
    };
  }
);
