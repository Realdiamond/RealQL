import type { DataSchema } from "@/lib/types";

export const issuesSchema: DataSchema = {
  id: "issues",
  name: "issues",
  label: "Issues",
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

export const issuesData: Record<string, unknown>[] = [
  { id: "ENG-101", title: "Migrate to parameterized queries", assignee: "Alex Chen", status: "Done", priority: "High", storyPoints: 5, labels: "security, core", dueDate: "2026-06-01" },
  { id: "ENG-102", title: "Implement backdrop-blur in dropdowns", assignee: "Sam Taylor", status: "In Progress", priority: "Medium", storyPoints: 2, labels: "ui, polish", dueDate: "2026-06-05" },
  { id: "ENG-103", title: "Add Issues schema", assignee: "Sam Taylor", status: "Done", priority: "High", storyPoints: 3, labels: "feature, backend", dueDate: "2026-06-02" },
  { id: "ENG-104", title: "Fix iOS Safari scrolling bug", assignee: "Jordan Lee", status: "Todo", priority: "Medium", storyPoints: 3, labels: "bug, mobile", dueDate: "2026-06-10" },
  { id: "ENG-105", title: "Drop Elasticsearch cluster", assignee: "Alex Chen", status: "Canceled", priority: "Low", storyPoints: 8, labels: "infra", dueDate: "2026-07-01" },
  { id: "ENG-106", title: "Update caching layer to Redis 7", assignee: "Casey Smith", status: "Backlog", priority: "No Priority", storyPoints: 5, labels: "infra, tech-debt", dueDate: "2026-08-15" },
  { id: "ENG-107", title: "Implement SSO login", assignee: "Alex Chen", status: "In Review", priority: "Urgent", storyPoints: 8, labels: "auth, enterprise", dueDate: "2026-06-15" },
  { id: "ENG-108", title: "Design system refresh", assignee: "Sam Taylor", status: "In Progress", priority: "High", storyPoints: 13, labels: "ui, design", dueDate: "2026-06-20" },
  { id: "ENG-109", title: "Upgrade Next.js to v16", assignee: "Casey Smith", status: "Todo", priority: "Medium", storyPoints: 5, labels: "core, tech-debt", dueDate: "2026-06-25" },
  { id: "ENG-110", title: "Fix pagination overlap", assignee: "Jordan Lee", status: "Done", priority: "Medium", storyPoints: 2, labels: "bug, ui", dueDate: "2026-06-01" },
  { id: "ENG-111", title: "Add dark mode toggle to landing page", assignee: "Jordan Lee", status: "Done", priority: "Low", storyPoints: 1, labels: "feature, ui", dueDate: "2026-06-01" },
  { id: "ENG-112", title: "Setup automated E2E tests", assignee: "Alex Chen", status: "Backlog", priority: "Low", storyPoints: 8, labels: "testing, infra", dueDate: "2026-07-15" },
  { id: "ENG-113", title: "Optimize image assets", assignee: "Sam Taylor", status: "Todo", priority: "Medium", storyPoints: 3, labels: "performance", dueDate: "2026-06-12" },
  { id: "ENG-114", title: "Document API endpoints", assignee: "Casey Smith", status: "In Progress", priority: "High", storyPoints: 5, labels: "docs, api", dueDate: "2026-06-08" },
  { id: "ENG-115", title: "Deprecate v1 API", assignee: "Alex Chen", status: "In Review", priority: "High", storyPoints: 3, labels: "api, tech-debt", dueDate: "2026-06-10" },
];
