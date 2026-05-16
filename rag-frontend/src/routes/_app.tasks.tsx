import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2, ListChecks, RefreshCw, Trash2, CheckCircle, Circle } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { PageHeader, EmptyState, Pill, Skeleton } from "@/components/common/Primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Atlas" },
      { name: "description", content: "Linear-style task surface with kanban, list, and module grouping." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks, loading, error, fetchAll, deleteTask, updateTask } = useTaskStore();

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return (
    <div>
      <PageHeader
        eyebrow="Execution layer"
        title="Tasks"
        description="Tasks generated from uploaded documents and AI analysis, grouped into operational execution work."
        actions={
          <button
            onClick={() => void fetchAll()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium transition hover:bg-surface-elevated"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        }
      />

      {loading && tasks.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={ListChecks} title="Could not load tasks" description={error} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No tasks generated yet"
          description="Upload and analyze project documents to create execution tasks."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[1fr_120px_120px_80px] gap-3 border-b border-border px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Task</div>
            <div>Priority</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="group grid grid-cols-[1fr_120px_120px_80px] gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-surface/30"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{task.title}</div>
                {task.description && (
                  <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</div>
                )}
                {task.checklist && task.checklist.length > 0 && (
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {task.checklist.length} checklist items
                  </div>
                )}
              </div>
              <div>{task.priority && <Pill tone="warning">{task.priority}</Pill>}</div>
              <div>{task.status && <Pill tone={task.status.toLowerCase() === "done" ? "success" : "muted"}>{task.status}</Pill>}</div>
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() =>
                    updateTask(task.id, {
                      status: task.status?.toLowerCase() === "done" ? "TODO" : "DONE",
                    })
                  }
                  className={cn(
                    "rounded-md p-1.5 transition",
                    task.status?.toLowerCase() === "done"
                      ? "text-success hover:bg-success/10"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                  title={task.status?.toLowerCase() === "done" ? "Mark as Todo" : "Mark as Done"}
                >
                  {task.status?.toLowerCase() === "done" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete task "${task.title}"?`)) {
                      void deleteTask(task.id);
                    }
                  }}
                  className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
