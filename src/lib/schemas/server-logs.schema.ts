import type { DataSchema } from "@/lib/types";

export const serverLogsSchema: DataSchema = {
  id: "server_logs",
  name: "server_logs",
  label: "Server Logs",
  description: "Backend infrastructure execution logs",
  icon: "terminal",
  fields: [
    { name: "id", label: "Log ID", type: "string" },
    { name: "timestamp", label: "Timestamp", type: "date" },
    { name: "level", label: "Log Level", type: "enum", enumValues: ["INFO", "WARN", "ERROR", "DEBUG", "FATAL"] },
    { name: "service", label: "Service Name", type: "enum", enumValues: ["api-gateway", "auth-service", "billing", "worker-queue", "web-client"] },
    { name: "message", label: "Message", type: "string" },
    { name: "latencyMs", label: "Latency (ms)", type: "number" },
    { name: "isError", label: "Is Error", type: "boolean" },
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

const rand = seededRandom(99);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

const levels = ["INFO", "WARN", "ERROR", "DEBUG", "FATAL"];
const services = ["api-gateway", "auth-service", "billing", "worker-queue", "web-client"];
const messages = [
  "Request processed successfully",
  "Verifying JWT token",
  "Rate limit threshold reached",
  "Failed to connect to Redis",
  "Queue processor crashed",
  "Restarting service",
  "Routing request",
  "Payment gateway timeout",
  "User session initialized",
  "High latency detected",
  "Cache miss",
  "Password updated",
  "Invalid payload",
  "Batch processing complete",
  "Generation delayed",
];

export const serverLogsData: Record<string, unknown>[] = Array.from({ length: 1500 }, (_, i) => {
  const level = pick(levels);
  const isError = level === "ERROR" || level === "FATAL";
  
  // Random timestamp within a recent day
  const d = new Date(new Date("2026-06-01T08:00:00Z").getTime() + rand() * 86400000);
  
  return {
    id: `log_${String(i + 1).padStart(5, '0')}`,
    timestamp: d.toISOString(),
    level,
    service: pick(services),
    message: pick(messages),
    latencyMs: isError ? randInt(1000, 15000) : randInt(10, 500),
    isError,
  };
});
