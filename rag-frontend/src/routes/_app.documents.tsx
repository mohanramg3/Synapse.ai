import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, FolderKanban, RefreshCw, Trash2 } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { useProjectStore } from "@/store/projectStore";
import { PageHeader, EmptyState, Pill, Skeleton } from "@/components/common/Primitives";
import { DocumentUploader } from "@/components/documents/DocumentUploader";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Atlas" },
      { name: "description", content: "Drag-and-drop uploads, extraction, chunking, AI analysis, and processing logs." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { projects, fetchProjects } = useProjectStore();
  const { documents, loading, error, fetch, deleteDocument } = useDocumentStore();
  const [projectId, setProjectId] = useState<string>("");

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteDocument(id);
    }
  };

  useEffect(() => {
    void fetchProjects();
    void fetch();
  }, [fetchProjects, fetch]);

  useEffect(() => {
    if (!projectId && projects[0]?.id) setProjectId(projects[0].id);
  }, [projectId, projects]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects],
  );

  const visibleDocuments = projectId
    ? documents.filter((document) => String(document.project_id ?? "") === projectId)
    : documents;

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge intake"
        title="Documents"
        description="Upload real project source material and let the backend extract, chunk, and analyze it into an execution workspace."
        actions={
          <button
            onClick={() => void fetch(projectId || undefined)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium transition hover:bg-surface-elevated"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Project
            </label>
            <select
              value={projectId}
              onChange={(event) => {
                setProjectId(event.target.value);
                void fetch(event.target.value || undefined);
              }}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {selectedProject && (
              <p className="mt-2 text-xs text-muted-foreground">
                Uploads will refresh {selectedProject.name}'s AI summary, modules, risks, and tasks.
              </p>
            )}
          </div>
          <DocumentUploader projectId={projectId || undefined} onComplete={() => fetch(projectId || undefined)} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-medium">Uploaded documents</h2>
            <Pill tone="muted">{visibleDocuments.length} files</Pill>
          </div>
          {loading && visibleDocuments.length === 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
          ) : error ? (
            <EmptyState icon={FileText} title="Could not load documents" description={error} />
          ) : visibleDocuments.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No documents uploaded"
              description="Choose a project and upload source material to start AI analysis."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleDocuments.map((document) => (
                <div key={document.id} className="group relative rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{document.name}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Pill tone={document.status === "FAILED" ? "destructive" : "muted"}>
                          {document.status ?? "UPLOADED"}
                        </Pill>
                        {document.mime_type && <Pill tone="default">{document.mime_type}</Pill>}
                      </div>
                      {document.uploaded_at && (
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          {new Date(document.uploaded_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(document.id, document.name)}
                      className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
