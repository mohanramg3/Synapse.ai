import { useRef, useState } from "react";
import { UploadCloud, Loader2, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { useDocumentStore } from "@/store/documentStore";
import { useProjectStore } from "@/store/projectStore";
import { useAIStore } from "@/store/aiStore";
import { cn } from "@/lib/utils";

export function DocumentUploader({
  projectId,
  onComplete,
}: {
  projectId?: string;
  onComplete?: () => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing" | "analyzing" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const upload = useDocumentStore((s) => s.upload);
  const uploads = useDocumentStore((s) => s.uploads);
  const fetchDocuments = useDocumentStore((s) => s.fetch);
  const fetchProject = useProjectStore((s) => s.fetchProject);
  const triggerAnalysis = useAIStore((s) => s.triggerAnalysis);
  const fetchAI = useAIStore((s) => s.fetchAll);

  const activeUploads = Object.values(uploads).slice(-3);

  const handleFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (!projectId) {
      setPhase("error");
      setMessage("Choose a project before uploading a document.");
      return;
    }

    setPhase("uploading");
    setMessage(null);
    const document = await upload(file, projectId);
    if (!document) {
      setPhase("error");
      setMessage("Upload failed. Check the backend and try again.");
      return;
    }

    setPhase("processing");
    await fetchDocuments(projectId);
    await fetchProject(projectId);

    setPhase("analyzing");
    await triggerAnalysis(projectId);
    await Promise.all([fetchAI(projectId), fetchProject(projectId), fetchDocuments(projectId)]);
    await onComplete?.();

    setPhase("done");
    setMessage("Document processed and AI workspace refreshed.");
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/70 px-6 py-10 text-center transition",
          dragging && "border-primary bg-primary/10",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {phase === "uploading" || phase === "processing" || phase === "analyzing" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : phase === "done" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : phase === "error" ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </div>
        <div className="mt-3 font-display text-sm font-medium">
          {phase === "uploading"
            ? "Uploading document"
            : phase === "processing"
              ? "Extracting and chunking"
              : phase === "analyzing"
                ? "Running AI analysis"
                : "Upload project document"}
        </div>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          Drop a BRD, PRD, transcript, PDF, or text file. Atlas will refresh modules, tasks, risks, and checklists.
        </p>
      </button>

      {activeUploads.length > 0 && (
        <div className="space-y-2">
          {activeUploads.map((item) => (
            <div key={item.name} className="rounded-lg border border-border bg-surface/50 px-3 py-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate">{item.name}</span>
                <span className="text-muted-foreground">{item.status}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-xs", phase === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary")}>
          <Sparkles className="h-3.5 w-3.5" />
          {message}
        </div>
      )}
    </div>
  );
}
