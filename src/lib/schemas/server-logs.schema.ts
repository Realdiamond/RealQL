import type { DataSchema } from "@/lib/types";

export const serverLogsSchema: DataSchema = {
  id: "server_logs",
  name: "server_logs",
  label: "Server Logs",
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

export const serverLogsData: Record<string, unknown>[] = [
  { id: "log_001", timestamp: "2026-06-01T08:15:22Z", level: "INFO", service: "api-gateway", message: "Request processed successfully", latencyMs: 45, isError: false },
  { id: "log_002", timestamp: "2026-06-01T08:15:23Z", level: "DEBUG", service: "auth-service", message: "Verifying JWT token", latencyMs: 12, isError: false },
  { id: "log_003", timestamp: "2026-06-01T08:16:05Z", level: "WARN", service: "billing", message: "Rate limit threshold reached for org_xyz", latencyMs: 230, isError: false },
  { id: "log_004", timestamp: "2026-06-01T08:17:10Z", level: "ERROR", service: "worker-queue", message: "Failed to connect to Redis cluster", latencyMs: 5005, isError: true },
  { id: "log_005", timestamp: "2026-06-01T08:17:15Z", level: "FATAL", service: "worker-queue", message: "Queue processor crashed due to OOM", latencyMs: 0, isError: true },
  { id: "log_006", timestamp: "2026-06-01T08:18:00Z", level: "INFO", service: "worker-queue", message: "Restarting queue processor", latencyMs: 1500, isError: false },
  { id: "log_007", timestamp: "2026-06-01T08:20:12Z", level: "INFO", service: "api-gateway", message: "Routing request to billing service", latencyMs: 32, isError: false },
  { id: "log_008", timestamp: "2026-06-01T08:20:15Z", level: "ERROR", service: "billing", message: "Payment gateway timeout", latencyMs: 10002, isError: true },
  { id: "log_009", timestamp: "2026-06-01T08:22:30Z", level: "INFO", service: "web-client", message: "User session initialized", latencyMs: 85, isError: false },
  { id: "log_010", timestamp: "2026-06-01T08:25:45Z", level: "WARN", service: "api-gateway", message: "High latency detected on /graphql endpoint", latencyMs: 1450, isError: false },
  { id: "log_011", timestamp: "2026-06-01T08:30:00Z", level: "DEBUG", service: "auth-service", message: "Cache miss for user profile", latencyMs: 45, isError: false },
  { id: "log_012", timestamp: "2026-06-01T08:31:22Z", level: "INFO", service: "auth-service", message: "User password updated successfully", latencyMs: 120, isError: false },
  { id: "log_013", timestamp: "2026-06-01T08:35:10Z", level: "ERROR", service: "api-gateway", message: "Invalid payload format", latencyMs: 15, isError: true },
  { id: "log_014", timestamp: "2026-06-01T08:40:05Z", level: "INFO", service: "worker-queue", message: "Batch processing complete (100 items)", latencyMs: 3500, isError: false },
  { id: "log_015", timestamp: "2026-06-01T08:45:30Z", level: "WARN", service: "billing", message: "Invoice generation delayed", latencyMs: 4200, isError: false },
];
