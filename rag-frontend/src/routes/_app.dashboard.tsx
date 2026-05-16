import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  FolderKanban,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { PageHeader, StatCard, EmptyState, Pill, Skeleton } from "@/components/common/Primitives";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Atlas" },
      {
        name: "description",
        content: "Live operational view of projects, AI insights, processing queue and recent activity.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { dashboard, projects, loading, fetchDashboard, fetchProjects } = useProjectStore();

  useEffect(() => {
    void fetchDashboard();
    void fetchProjects();
  }, [fetchDashboard, fetchProjects]);

  const recent = (dashboard?.recent_activity ?? []) as Array<Record<string, any>>;
  const queue = (dashboard?.processing_queue ?? []) as Array<Record<string, any>>;
  const recommendations = (dashboard?.recommendations ?? []) as Array<Record<string, any>>;

  return (
    <div>
      <PageHeader
        eyebrow="Workspace overview"
        title="Operational intelligence"
        description="Atlas converts your documents into execution. Here's the live state of every project, signal, and AI worker."
        actions={
          <Link
            to="/projects"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            View all projects <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={dashboard?.active_projects ?? projects.length}
          hint="Currently in execution"
          icon={FolderKanban}
          accent="primary"
          loading={loading && !dashboard}
        />
        <StatCard
          label="Pending Tasks"
          value={dashboard?.pending_tasks ?? "—"}
          hint="Across all modules"
          icon={CheckCircle2}
          accent="accent"
          loading={loading && !dashboard}
        />
        <StatCard
          label="Documents Processed"
          value={dashboard?.documents_processed ?? "—"}
          hint="BRDs, PRDs, transcripts"
          icon={FileText}
          accent="success"
          loading={loading && !dashboard}
        />
        <StatCard
          label="AI Insights"
          value={dashboard?.ai_insights ?? "—"}
          hint="Generated this week"
          icon={Sparkles}
          accent="warning"
          loading={loading && !dashboard}
        />
      </div>

      {/* Two column section */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Recent Projects
            </h2>
            <Link to="/projects" className="text-xs text-primary hover:underline">
              See all
            </Link>
          </div>
          {loading && projects.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Upload a BRD or PRD and Atlas will build the first execution workspace."
              action={
                <Link
                  to="/projects"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
                >
                  Create project
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.slice(0, 4).map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* AI processing + activity */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-medium">AI Processing Queue</h3>
              <span className="flex h-2 w-2 rounded-full bg-primary pulse-ring" />
            </div>
            {queue.length === 0 ? (
              <p className="text-xs text-muted-foreground">All workers idle.</p>
            ) : (
              <ul className="space-y-3">
                {queue.slice(0, 5).map((item, i) => (
                  <motion.li
                    key={item.id ?? i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 text-xs"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{String(item.name ?? item.title ?? "Document analysis")}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {String(item.stage ?? item.status ?? "processing")}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-sm font-medium">AI Recommendations</h3>
            {recommendations.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Recommendations appear once AI finishes analyzing your latest documents.
              </p>
            ) : (
              <ul className="space-y-3">
                {recommendations.slice(0, 4).map((r, i) => (
                  <li key={r.id ?? i} className="flex gap-3">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <div className="text-xs">
                      <div className="font-medium">{String(r.title ?? "Recommendation")}</div>
                      {r.description && (
                        <div className="mt-0.5 text-muted-foreground">{String(r.description)}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-sm font-medium">Activity</h3>
            {recent.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {recent.slice(0, 6).map((a, i) => (
                  <li key={a.id ?? i} className="flex gap-3 text-xs">
                    <Activity className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{String(a.message ?? a.title ?? "Activity")}</div>
                      {a.timestamp && (
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(String(a.timestamp)).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Risks strip */}
      {dashboard?.health_average !== undefined && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <div className="text-sm">
              <div className="font-medium">Portfolio health</div>
              <div className="text-xs text-muted-foreground">
                Average health score across all active projects
              </div>
            </div>
          </div>
          <Pill tone="warning">{Math.round(dashboard.health_average)}%</Pill>
        </div>
      )}
    </div>
  );
}
