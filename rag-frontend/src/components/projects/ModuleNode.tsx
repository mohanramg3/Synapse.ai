import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, AlertTriangle, ListChecks, GitBranch, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/common/Primitives";

type AnyRecord = Record<string, any>;

/**
 * Renders a single AI-generated module dynamically. Handles unknown structure
 * by walking common keys (tasks, checklist, risks, dependencies). Falls back
 * to a JSON-shaped renderer for fields it doesn't recognize, so future backend
 * additions render gracefully without code changes.
 */
export function ModuleNode({ module, depth = 0 }: { module: AnyRecord; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);

  const tasks = (module.tasks ?? []) as AnyRecord[];
  const checklist = (module.checklist ?? []) as AnyRecord[];
  const risks = (module.risks ?? []) as AnyRecord[];
  const dependencies = (module.dependencies ?? []) as AnyRecord[];
  const submodules = (module.modules ?? module.children ?? []) as AnyRecord[];

  const knownKeys = new Set([
    "id",
    "name",
    "title",
    "description",
    "tasks",
    "checklist",
    "risks",
    "dependencies",
    "modules",
    "children",
    "status",
    "priority",
  ]);
  const extra = Object.entries(module).filter(([k]) => !knownKeys.has(k));

  return (
    <div className={cn("rounded-lg border border-border bg-card", depth > 0 && "bg-surface/40")}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-elevated/40"
      >
        <ChevronRight
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", open && "rotate-90 text-primary")}
        />
        <Folder className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-medium">
            {String(module.name ?? module.title ?? "Untitled module")}
          </div>
          {module.description && (
            <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {String(module.description)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {tasks.length > 0 && <Pill tone="primary">{tasks.length} tasks</Pill>}
          {checklist.length > 0 && <Pill tone="default">{checklist.length} checks</Pill>}
          {risks.length > 0 && <Pill tone="destructive">{risks.length} risks</Pill>}
          {module.status && <Pill tone="muted">{String(module.status)}</Pill>}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border px-4 py-4">
              {tasks.length > 0 && (
                <Section icon={ListChecks} label="Tasks">
                  <ul className="space-y-1.5">
                    {tasks.map((t, i) => (
                      <li
                        key={String(t.id ?? i)}
                        className="flex items-start gap-2 rounded border border-border bg-background/40 px-3 py-2 text-xs"
                      >
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{String(t.title ?? t.name ?? "Task")}</div>
                          {t.description && (
                            <div className="mt-0.5 line-clamp-2 text-muted-foreground">
                              {String(t.description)}
                            </div>
                          )}
                        </div>
                        {t.priority && <Pill tone="warning">{String(t.priority)}</Pill>}
                        {t.status && <Pill tone="muted">{String(t.status)}</Pill>}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {checklist.length > 0 && (
                <Section icon={ListChecks} label="Checklist">
                  <ul className="space-y-1">
                    {checklist.map((c, i) => (
                      <li key={String(c.id ?? i)} className="flex items-center gap-2 text-xs">
                        <span
                          className={cn(
                            "flex h-3.5 w-3.5 items-center justify-center rounded border",
                            c.done ? "border-success bg-success/20 text-success" : "border-border",
                          )}
                        >
                          {c.done && "✓"}
                        </span>
                        <span className={cn(c.done && "text-muted-foreground line-through")}>
                          {String(c.label ?? c.title ?? "Item")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {risks.length > 0 && (
                <Section icon={AlertTriangle} label="Risks" tone="warning">
                  <ul className="space-y-1.5">
                    {risks.map((r, i) => (
                      <li
                        key={String(r.id ?? i)}
                        className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{String(r.title ?? "Risk")}</div>
                          {r.severity && <Pill tone="destructive">{String(r.severity)}</Pill>}
                        </div>
                        {r.description && (
                          <div className="mt-1 text-muted-foreground">{String(r.description)}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {dependencies.length > 0 && (
                <Section icon={GitBranch} label="Dependencies">
                  <div className="flex flex-wrap gap-1.5">
                    {dependencies.map((d, i) => (
                      <Pill key={String(d.id ?? i)} tone="default">
                        {String(d.name ?? d.title ?? d)}
                      </Pill>
                    ))}
                  </div>
                </Section>
              )}

              {extra.length > 0 && (
                <Section label="Additional structure">
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    {extra.slice(0, 6).map(([k, v]) => (
                      <div key={k} className="rounded border border-border bg-background/40 px-2 py-1.5">
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {k}
                        </dt>
                        <dd className="mt-0.5 line-clamp-2 break-words font-mono text-[11px]">
                          {typeof v === "object" ? JSON.stringify(v).slice(0, 80) : String(v)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Section>
              )}

              {submodules.length > 0 && (
                <div className="space-y-2">
                  {submodules.map((m, i) => (
                    <ModuleNode key={String(m.id ?? i)} module={m} depth={depth + 1} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  tone?: "warning";
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      {children}
    </div>
  );
}
