import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md", className)}
      style={{ minHeight: 12 }}
    />
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {eyebrow && (
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-semibold leading-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ElementType;
  accent?: "primary" | "accent" | "success" | "warning" | "destructive";
  loading?: boolean;
}) {
  const accentClass =
    accent === "accent"
      ? "from-accent/30 to-transparent text-accent"
      : accent === "success"
        ? "from-success/30 to-transparent text-success"
        : accent === "warning"
          ? "from-warning/30 to-transparent text-warning"
          : accent === "destructive"
            ? "from-destructive/30 to-transparent text-destructive"
            : "from-primary/30 to-transparent text-primary";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5"
    >
      <div className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-50 blur-2xl", accentClass)} />
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {Icon && <Icon className={cn("h-4 w-4", accentClass.split(" ").pop())} />}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tabular-nums">
        {loading ? <Skeleton className="h-8 w-20" /> : value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </motion.div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="font-display text-lg font-medium">{title}</div>
      {description && (
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
}) {
  const tones: Record<string, string> = {
    default: "bg-surface text-foreground border-border",
    primary: "bg-primary/15 text-primary border-primary/25",
    success: "bg-success/15 text-success border-success/25",
    warning: "bg-warning/15 text-warning border-warning/25",
    destructive: "bg-destructive/15 text-destructive border-destructive/25",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-surface hover:text-foreground"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border bg-surface/30 px-6 py-4">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}
