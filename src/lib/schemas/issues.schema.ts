import type { DataSchema } from "@/lib/types";

export const issuesSchema: DataSchema = {
  id: "issues",
  name: "issues",
  label: "Issues",
  description: "Linear/Jira style project management issues",
  icon: "check-circle",
  fields: [
    { name: "id", label: "Issue ID", type: "string" },
    { name: "title", label: "Title", type: "string" },
    { name: "assignee", label: "Assignee", type: "string" },
    { name: "status", label: "Status", type: "enum", enumValues: ["Backlog", "Todo", "In Progress", "In Review", "Done", "Canceled"] },
    { name: "priority", label: "Priority", type: "enum", enumValues: ["No Priority", "Low", "Medium", "High", "Urgent"] },
    { name: "storyPoints", label: "Story Points", type: "number" },
    { name: "labels", label: "Labels", type: "string" },
    { name: "dueDate", label: "Due Date", type: "date" },
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

const rand = seededRandom(42);

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

const assignees = ["Alex Chen", "Sam Taylor", "Jordan Lee", "Casey Smith", "Morgan Davis", "Riley Johnson"];
const statuses = ["Backlog", "Todo", "In Progress", "In Review", "Done", "Canceled"];
const priorities = ["No Priority", "Low", "Medium", "High", "Urgent"];
const allLabels = ["bug", "ui", "core", "api", "infra", "tech-debt", "performance", "docs", "feature", "security"];

export const issuesData: Record<string, unknown>[] = Array.from({ length: 500 }, (_, i) => {
  const numLabels = randInt(1, 3);
  const labels = [];
  for(let j=0; j<numLabels; j++) labels.push(pick(allLabels));

  return {
    id: `ENG-${101 + i}`,
    title: `Task for ${pick(allLabels)} system`,
    assignee: pick(assignees),
    status: pick(statuses),
    priority: pick(priorities),
    storyPoints: pick([1, 2, 3, 5, 8, 13]),
    labels: Array.from(new Set(labels)).join(", "),
    dueDate: randDate(new Date("2026-01-01"), new Date("2026-12-31")),
  };
});
