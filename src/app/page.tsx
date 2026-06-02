"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Database, Zap, Shield, ArrowRight, Code2, Layers, GitMerge } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-1/2 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/20 opacity-30 blur-[120px]" />
      
      {/* --- Navigation --- */}
      <nav className="relative z-10 border-b border-border-subtle bg-background/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white shadow-lg shadow-primary/20">
              <Database className="size-4" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">
              RealQL
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/Realdiamond/RealQL"
              target="_blank"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              GitHub
            </Link>
            <Link
              href="/builder"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-105"
            >
              Open Studio
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-16 sm:pt-24 lg:px-8 lg:pt-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-sm"
          >
            <span className="flex size-2 rounded-full bg-primary" />
            RealQL Engine v2.0 is live
          </motion.div>

          <h1 className="font-heading text-6xl font-extrabold tracking-tight text-foreground sm:text-8xl">
            Query generation, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-hover to-accent-600 dark:to-accent-300">
              perfected.
            </span>
          </h1>
          
          <p className="mt-8 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            Construct complex, deeply nested SQL, MongoDB, and GraphQL queries visually. 
            RealQL is an enterprise-grade visual builder designed for developers who demand 
            precision without the boilerplate.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/builder"
              className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Launch Studio
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/Realdiamond/RealQL"
              target="_blank"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-surface px-8 text-sm font-semibold text-foreground transition-all hover:bg-surface-elevated hover:border-border-subtle"
            >
              View on GitHub
            </Link>
          </div>
        </motion.div>

        {/* --- Interactive Mockup Window --- */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          {/* Glow behind mockup */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-primary/50 to-primary/10 opacity-50 blur-2xl" />
          
          <div className="relative rounded-2xl border border-border/50 bg-white dark:bg-[#0a0a0a] shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            {/* Mac Window Header */}
            <div className="flex items-center gap-2 border-b border-border-subtle bg-surface px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
              </div>
              <div className="ml-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Database className="size-3" />
                <span>realql-studio / builder</span>
              </div>
            </div>
            
            {/* Window Content (Code Mockup) */}
            <div className="grid grid-cols-1 text-left sm:grid-cols-12 min-h-[300px]">
              {/* Fake Sidebar */}
              <div className="hidden border-r border-border-subtle bg-surface p-4 sm:block sm:col-span-3">
                <div className="space-y-3">
                  <div className="h-2 w-16 rounded bg-surface-elevated" />
                  <div className="h-2 w-24 rounded bg-primary/20" />
                  <div className="h-2 w-20 rounded bg-surface-elevated" />
                  <div className="h-2 w-28 rounded bg-surface-elevated" />
                </div>
              </div>
              {/* Fake Code Editor */}
              <div className="p-6 font-mono text-sm leading-relaxed sm:col-span-9">
                <div className="text-primary-hover"><span className="text-pink-500">SELECT</span> *</div>
                <div className="text-primary-hover"><span className="text-pink-500">FROM</span> users</div>
                <div className="text-primary-hover"><span className="text-pink-500">WHERE</span> (</div>
                <div className="pl-4 text-foreground">
                  status <span className="text-pink-500">=</span> <span className="text-secondary">&apos;active&apos;</span>
                </div>
                <div className="pl-4 text-primary-hover"><span className="text-pink-500">AND</span> age <span className="text-pink-500">&gt;=</span> <span className="text-warning">18</span></div>
                <div className="text-primary-hover">) <span className="text-pink-500">ORDER BY</span> created_at <span className="text-pink-500">DESC</span>;</div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mt-2 h-4 w-2 bg-primary"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* --- Feature Grid --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 border-t border-border-subtle">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for scale. Designed for speed.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stop writing boilerplate database queries. Visualise complex logic instantly.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative rounded-2xl border border-border-subtle bg-surface/50 p-8 backdrop-blur-sm transition-all hover:bg-surface-elevated hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {feature.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: "Enterprise Architecture",
    description: "Built-in support for complex, hierarchical data models. Dynamically load your entire database schema and build queries with full type safety.",
    icon: Layers,
  },
  {
    name: "Zero-Latency AST",
    description: "The execution simulator evaluates deep ASTs instantly using a zero-latency engine. Immediate feedback loops without hitting production.",
    icon: Zap,
  },
  {
    name: "Injection-Proof",
    description: "Generates strict, parameterized SQL statements out of the box. Enterprise-grade security for your dynamic queries.",
    icon: Shield,
  },
  {
    name: "Multi-Dialect Support",
    description: "Compile a single visual AST into PostgreSQL, MongoDB Aggregations, or GraphQL seamlessly. Build once, query anywhere.",
    icon: Code2,
  },
  {
    name: "Advanced Operators",
    description: "Support for highly specific logic including fuzzy text searching, nested group structures, and regex pattern matching.",
    icon: GitMerge,
  },
  {
    name: "Secure Schemas",
    description: "Lock down your query builder to specific database tables and fields, ensuring users can only query what they are authorized to see.",
    icon: Database,
  },
];
