import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Users, FileText, AlertTriangle, Trash2 } from "lucide-react";
import type { ProjectSummary } from "@/lib/api/projectApi";
import { useProjectStore } from "@/store/projectStore";
import { Pill } from "@/components/common/Primitives";
import { cn } from "@/lib/utils";

function riskTone(risk?: string) {
  if (!risk) return "muted";
  const r = risk.toLowerCase();
  if (r === "high" || r === "critical") return "destructive";
  if (r === "medium") return "warning";
  return "success";
}

function statusTone(status?: string) {
  if (!status) return "muted";
  const s = status.toLowerCase();
  if (s.includes("active") || s === "in_progress") return "primary";
  if (s.includes("done") || s.includes("complete")) return "success";
  if (s.includes("blocked") || s.includes("risk")) return "destructive";
  if (s.includes("plan")) return "warning";
  return "default";
}

export function ProjectCard({ project, index = 0 }: { project: ProjectSummary; index?: number }) {
  const { deleteProject } = useProjectStore();
  const progress = Math.max(0, Math.min(100, project.progress ?? 0));
  const health = project.health_score ?? null;
  const members = project.members ?? [];

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${project.name}?`)) {
      await deleteProject(project.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
    >
      <Link
        to="/projects/$projectId"
        params={{ projectId: project.id }}
        className="group relative block overflow-hidden rounded-xl border border-border bg-card p-5 transition hover:border-border-strong hover:bg-surface-elevated"
      >
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition group-hover:opacity-100">
          <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur" />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={statusTone(project.status) as any}>
                {project.status || "Draft"}
              </Pill>
              {project.risk_level && (
                <Pill tone={riskTone(project.risk_level) as any}>
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {project.risk_level} risk
                </Pill>
              )}
            </div>
            <h3 className="mt-3 truncate font-display text-lg font-semibold leading-snug">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
          {health !== null && (
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  className={cn(
                    health >= 75 ? "text-success" : health >= 50 ? "text-warning" : "text-destructive",
                  )}
                  strokeWidth="3"
                  strokeDasharray={`${(health / 100) * 94.2} 94.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-[10px] font-semibold tabular-nums">
                {Math.round(health)}
              </div>
            </div>
          )}
          <button
            onClick={handleDelete}
            className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progress</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" /> {project.document_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3 w-3" /> {project.task_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> {members.length}
            </span>
          </div>
          {project.updated_at && (
            <span>{new Date(project.updated_at).toLocaleDateString()}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
