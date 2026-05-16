import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* Left: form */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold">Atlas</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8 space-y-4">{children}</div>
          {footer && <div className="mt-6 text-center text-xs text-muted-foreground">{footer}</div>}
        </motion.div>
      </div>

      {/* Right: cinematic AI panel */}
      <div className="relative hidden flex-1 overflow-hidden border-l border-border lg:block">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Floating particles */}
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                boxShadow: "0 0 10px var(--primary)",
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 p-12">
          <div className="max-w-md">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> AI-native execution
            </div>
            <p className="font-display text-2xl font-semibold leading-tight">
              From document to execution — instantly.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Atlas reads your BRDs, PRDs, and specs and assembles the operational
              workspace your team can actually run.
            </p>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-1/4 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      </div>
    </div>
  );
}

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

export function AuthButton({
  loading,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className="relative flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
    >
      {loading ? "Working…" : children}
    </button>
  );
}
