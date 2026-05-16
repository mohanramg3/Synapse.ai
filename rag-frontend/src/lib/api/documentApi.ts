import { apiClient, unwrapArray } from "./client";

export type DocumentRecord = {
  id: string;
  name: string;
  size?: number;
  mime_type?: string;
  project_id?: string;
  status?: "uploading" | "extracting" | "chunking" | "analyzing" | "ready" | "failed" | string;
  chunk_count?: number;
  ai_summary?: string;
  risk_level?: string;
  uploaded_at?: string;
  [key: string]: unknown;
};

export const documentApi = {
  list: (projectId?: string) =>
    apiClient
      .get<unknown>("/documents", { params: projectId ? { project_id: projectId } : {} })
      .then((r) =>
        unwrapArray<Record<string, unknown>>(r.data, "documents").map(normalizeDocument),
      ),
  upload: (file: File, projectId?: string, onProgress?: (p: number) => void) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient
      .post<unknown>("/documents/upload", form, {
        params: projectId ? { project_id: projectId } : undefined,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      })
      .then((r) => normalizeDocument((r.data as { document?: unknown })?.document ?? r.data));
  },
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
};

const normalizeDocument = (doc: unknown): DocumentRecord => {
  const value = (doc ?? {}) as Record<string, unknown>;
  return {
    ...value,
    id: String(value.id ?? value.file_path ?? value.original_name ?? ""),
    name: String(value.name ?? value.original_name ?? value.filename ?? "Document"),
    mime_type: value.mime_type as string | undefined ?? value.file_type as string | undefined,
    status: value.status as string | undefined ?? value.processing_status as string | undefined,
    uploaded_at: value.uploaded_at as string | undefined ?? value.created_at as string | undefined,
    project_id: value.project_id == null ? undefined : String(value.project_id),
  };
};
