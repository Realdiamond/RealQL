import type { DataSchema } from "@/lib/types";

export const usersSchema: DataSchema = {
  id: "users",
  name: "users",
  label: "Users",
  description: "Application user accounts and profiles",
  icon: "Users",
  fields: [
    { name: "name", label: "Name", type: "string", description: "Full name" },
    { name: "age", label: "Age", type: "number", description: "User age" },
    {
      name: "email",
      label: "Email",
      type: "string",
      description: "Email address",
    },
    {
      name: "status",
      label: "Status",
      type: "enum",
      enumValues: ["active", "inactive", "suspended", "pending"],
      description: "Account status",
    },
    {
      name: "role",
      label: "Role",
      type: "enum",
      enumValues: ["admin", "editor", "viewer", "moderator"],
      description: "User role",
    },
    {
      name: "country",
      label: "Country",
      type: "string",
      description: "Country of residence",
    },
    {
      name: "createdAt",
      label: "Created At",
      type: "date",
      description: "Account creation date",
    },
    {
      name: "isVerified",
      label: "Verified",
      type: "boolean",
      description: "Email verified status",
    },
  ],
};

const firstNames = [
  "Adaeze", "Babatunde", "Chidera", "Damilola", "Emeka", "Fatima",
  "Gbenga", "Halima", "Ibrahim", "Jumoke", "Kelechi", "Lola",
  "Musa", "Ngozi", "Oluwaseun", "Patience", "Quadri", "Rashidat",
  "Sade", "Tunde", "Uche", "Victoria", "Wale", "Yetunde", "Zainab",
  "James", "Sarah", "Michael", "Emma", "David", "Olivia", "Robert",
  "Sophia", "William", "Ava", "Chen", "Yuki", "Raj", "Priya", "Carlos",
  "Maria", "Hans", "Lina", "Pierre", "Amelie", "Kenji", "Aiko",
  "Diego", "Luna", "Aaliya",
];

const lastNames = [
  "Okafor", "Adeyemi", "Balogun", "Chukwu", "Dada", "Eze",
  "Fashola", "Garba", "Hassan", "Idris", "Johnson", "Kamara",
  "Lawal", "Mohammed", "Nwachukwu", "Obi", "Peters", "Quadri",
  "Rahman", "Salami", "Taiwo", "Usman", "Vincent", "Williams",
  "Yakubu", "Smith", "Brown", "Wilson", "Taylor", "Anderson",
  "Zhang", "Tanaka", "Sharma", "Patel", "Garcia", "Martinez",
  "Müller", "Johansson", "Bernard", "Dubois", "Watanabe", "Sato",
  "Lopez", "Morales", "Ali",
];

const countries = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United States",
  "United Kingdom", "Canada", "Germany", "France", "Japan",
  "India", "Brazil", "Australia", "Mexico", "Egypt",
];

const statuses = ["active", "inactive", "suspended", "pending"] as const;
const roles = ["admin", "editor", "viewer", "moderator"] as const;

function randomEl<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return d.toISOString().split("T")[0];
}

// Seed-based pseudo-random for reproducible data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function seededEl<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function seededInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function seededDate(start: Date, end: Date): string {
  const d = new Date(
    start.getTime() + rand() * (end.getTime() - start.getTime())
  );
  return d.toISOString().split("T")[0];
}

export const usersData: Record<string, unknown>[] = Array.from(
  { length: 150 },
  (_, i) => ({
    id: i + 1,
    name: `${seededEl(firstNames)} ${seededEl(lastNames)}`,
    age: seededInt(18, 65),
    email: `user${i + 1}@${seededEl(["gmail.com", "outlook.com", "yahoo.com", "company.io", "mail.ng"])}`,
    status: seededEl(statuses),
    role: seededEl(roles),
    country: seededEl(countries),
    createdAt: seededDate(new Date("2022-01-01"), new Date("2025-12-31")),
    isVerified: rand() > 0.3,
  })
);
