# RealQL — Visual Query Builder Studio

A production-grade visual query construction studio that lets you craft complex, nested database queries through an intuitive graphical interface. Built with recursive UI engineering, real-time multi-format preview, and schema-driven rendering.

**Live Demo:** [realql.vercel.app](https://realql.vercel.app)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Recursive Query Builder** | Unlimited nesting depth — groups can contain rules or other groups, infinitely |
| **4 Output Formats** | Live preview in SQL, MongoDB, GraphQL, and JSON |
| **18 Operators** | `equals`, `contains`, `between`, `regex`, `before`, `after`, `in_array`, and more |
| **Schema-Driven** | Field selectors, operator filters, and value inputs all adapt to the active schema |
| **Drag & Drop** | Reorder rules and groups with DnD Kit, including cross-group moves and cycle prevention |
| **Undo / Redo** | Full snapshot-based undo/redo stack (up to 50 levels) |
| **Query History** | Auto-saved execution history with named preset support, persisted to localStorage |
| **Import / Export** | Export queries as JSON files, import with Zod-powered validation |
| **Keyboard Shortcuts** | 9 shortcuts including `⌘Enter` (execute), `⌘Z` (undo), `⌘S` (save preset) |
| **Dark / Light Mode** | System-aware theme switching with smooth transitions |
| **Expandable Result Cards** | Toggle between table view and expandable card view for query results |
| **Validation Engine** | 10 validation rules with inline error/warning messages |

---

## 🏗️ Architecture

### The Recursive Tree Model

The entire application centers around a single recursive type:

```typescript
type QueryNode = QueryGroup | QueryRule;

interface QueryGroup {
  id: string;
  type: "group";
  combinator: "AND" | "OR";
  children: QueryNode[];  // ← THIS is the recursion
  collapsed: boolean;
  negated?: boolean;
}

interface QueryRule {
  id: string;
  type: "rule";
  field: string;
  operator: OperatorType;
  value: RuleValue;
  disabled?: boolean;
}
```

Every mutation (add, move, update, remove) is processed through **pure, side-effect-free functions** in `tree-utils.ts` that return a brand new tree. This functional core enables trivial undo/redo by simply pushing state snapshots.

### Three-Store Pattern (Zustand)

```
┌────────────────────┐  ┌─────────────────┐  ┌──────────────┐
│    queryStore      │  │ queryHistoryStore│  │   uiStore    │
│                    │  │                 │  │              │
│  rootGroup (tree)  │  │  history[]      │  │ previewFormat│
│  activeSchemaId    │  │  presets[]      │  │ sidebarOpen  │
│  undoStack[]       │  │  (persisted)    │  │ theme state  │
│  redoStack[]       │  │                 │  │              │
└────────────────────┘  └─────────────────┘  └──────────────┘
```

- **queryStore**: The source of truth for the recursive query tree. All mutations go through here.
- **queryHistoryStore**: Persisted to localStorage via `zustand/persist`. Stores execution history and named presets.
- **uiStore**: Ephemeral UI state (sidebar visibility, preview format, dialog states).

### Engine Layer

All business logic lives in `src/lib/engine/` as **pure functions** — no React, no state, no side effects:

| Module | Purpose |
|---|---|
| `tree-utils.ts` | Recursive tree mutations (insert, remove, update, move, clone, find) |
| `query-validator.ts` | 10-rule validation engine with per-node error reporting |
| `query-executor.ts` | In-memory dataset filtering against the query tree |
| `sql-generator.ts` | Generates SQL WHERE clauses |
| `mongo-generator.ts` | Generates MongoDB filter documents with schema-aware type coercion |
| `graphql-generator.ts` | Generates Hasura-style GraphQL where clauses |
| `json-generator.ts` | Serializes the query tree as formatted JSON |
| `query-generator.ts` | Unified dispatcher for all output formats |

---

## 🛡️ Security & Validation

- **Import validation**: All imported JSON is validated through a Zod schema that checks operators, structure, and enforces a max nesting depth of 20
- **Sanitization**: Imported trees have all IDs regenerated and unknown fields stripped
- **SQL escaping**: User values are escaped in SQL preview to prevent injection
- **Recursive guard**: Max 20 nesting levels enforced in the store

---

## 🧪 Testing

**210+ tests** across 9 test suites:

```
✓ tree-utils.test.ts         (36 tests)  — recursive tree mutations
✓ query-validator.test.ts    (37 tests)  — all 10 validation rules
✓ query-executor.test.ts     (29 tests)  — in-memory execution
✓ sql-generator.test.ts      (23 tests)  — SQL output
✓ mongo-generator.test.ts    (25 tests)  — MongoDB output
✓ graphql-generator.test.ts  (24 tests)  — GraphQL output
✓ query-store.test.ts        (23 tests)  — Zustand store actions
✓ json-validator.test.ts     (14 tests)  — import validation
✓ sanitize.test.ts           (5 tests)   — import sanitization
```

Run tests:
```bash
pnpm test
```

---

## 🎨 Design System

The UI uses a custom CSS variable-based design system defined in `globals.css` (~250 lines). Key decisions:

- **Color palette**: Indigo accent, warm neutrals, semantic colors — all defined as CSS custom properties
- **Typography**: Inter (UI) + JetBrains Mono (code preview) via `next/font`
- **Depth indicators**: Nested groups get hue-shifting left borders per depth level
- **Dark mode**: System-aware via `next-themes`, smooth transitions between themes
- **Animations**: Framer Motion for sidebar slide-in, rule/group add/remove transitions

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.6 (App Router) | React framework |
| TypeScript | 5.x | Type safety |
| Zustand | 5.x | State management |
| TailwindCSS | 4.x | Styling |
| DnD Kit | 6.x | Drag and drop |
| Framer Motion | 12.x | Animations |
| Zod | 4.x | Import validation |
| Vitest | 4.x | Testing |
| React Testing Library | 16.x | Component testing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (Required for Next.js 16 and uuid@14 global crypto)
- pnpm 9+

### Installation
```bash
git clone https://github.com/Realdiamond/RealQL.git
cd RealQL
pnpm install
```

### Development
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

### Build
```bash
pnpm build
```

### Validation & Testing

We enforce strict validation to ensure stability. Use the following commands:
| Command | Category | Description |
|---|---|---|
| `pnpm typecheck` | Lint & Type | Run TypeScript compiler checks |
| `pnpm lint` | Lint & Type | Run ESLint to catch code quality issues |
| `pnpm test` | Unit Tests | Run Vitest unit tests (216 tests) |
| `pnpm test:coverage` | Unit Tests | Run Vitest and generate a coverage report |
| `pnpm test:e2e` | E2E Tests | Run Playwright browser tests headlessly |
| `pnpm test:e2e:ui` | E2E Tests | Run Playwright tests with a visual UI |
---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + providers
│   ├── page.tsx                  # Main page
│   └── globals.css               # Design system tokens
│
├── components/
│   ├── layout/                   # App shell (Header, ThemeToggle, etc.)
│   ├── query-builder/            # ★ Core recursive builder
│   │   ├── QueryBuilder.tsx      # Root orchestrator
│   │   ├── QueryGroup.tsx        # THE recursive component
│   │   ├── QueryRule.tsx         # Single condition row
│   │   ├── dnd/                  # Drag-and-drop wrappers
│   │   ├── fields/               # Field selector
│   │   ├── operators/            # Operator selector
│   │   └── value-inputs/         # 7 type-specific value inputs
│   ├── query-preview/            # Live SQL/Mongo/GraphQL/JSON preview
│   ├── query-results/            # Execution results (table + cards)
│   ├── query-history/            # History sidebar + presets + import/export
│   └── ui/                       # Shadcn/UI primitives
│
├── lib/
│   ├── engine/                   # Pure business logic (zero React deps)
│   ├── store/                    # Zustand stores
│   ├── schemas/                  # Mock data schemas + datasets
│   ├── types/                    # TypeScript type definitions
│   ├── constants/                # Operator matrix, shortcuts
│   └── utils/                    # cn, id, json-validator, sanitize
│
└── hooks/                        # Custom React hooks
```

---

## 🎯 Design Decisions

### Why recursive tree over flat array?
A recursive tree maps 1:1 to the recursive component tree. This makes rendering trivial — each `QueryGroup` renders its `children`, which may include more `QueryGroup`s. The alternative (flat array with parent IDs) would require reconstruction at render time and complicate mutations.

### Why 3 separate Zustand stores?
Separation of concerns. The query tree is the hot path (mutated on every keystroke). History is cold (written once per execution). UI state is ephemeral. Keeping them separate prevents unnecessary re-renders and makes each store independently testable.

### Why CSS custom properties instead of Tailwind classes?
A single source of truth for the entire color system. Changing the accent color or dark mode palette requires editing one file (`globals.css`), not hundreds of class names across components.

### Why pure-function engine layer?
Every generator and the executor are pure functions with zero side effects. This makes them trivially testable (no mocking needed), reusable outside React, and safe to run in any context.

---

## 📄 License

MIT
