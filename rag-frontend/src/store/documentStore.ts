import { create } from "zustand";
import { documentApi, type DocumentRecord } from "@/lib/api/documentApi";
import { toApiError } from "@/lib/api/client";
import { toast } from "sonner";

type DocumentState = {
  documents: DocumentRecord[];
  uploads: Record<string, { name: string; progress: number; status: string }>;
  loading: boolean;
  error: string | null;
  fetch: (projectId?: string) => Promise<void>;
  upload: (file: File, projectId?: string) => Promise<DocumentRecord | null>;
  deleteDocument: (id: string) => Promise<void>;
};

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  uploads: {},
  loading: false,
  error: null,

  fetch: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const documents = await documentApi.list(projectId);
      set({ documents, loading: false });
    } catch (err) {
      set({ loading: false, error: toApiError(err).message });
    }
  },

  upload: async (file, projectId) => {
    const key = `${file.name}-${Date.now()}`;
    set((s) => ({
      uploads: { ...s.uploads, [key]: { name: file.name, progress: 0, status: "uploading" } },
    }));
    try {
      const doc = await documentApi.upload(file, projectId, (p) => {
        set((s) => ({
          uploads: { ...s.uploads, [key]: { ...s.uploads[key], progress: p } },
        }));
      });
      set((s) => ({
        documents: [doc, ...s.documents],
        uploads: { ...s.uploads, [key]: { ...s.uploads[key], progress: 100, status: "ready" } },
      }));
      toast.success(`${file.name} uploaded and processing`);
      return doc;
    } catch (err) {
      const apiErr = toApiError(err);
      set((s) => ({
        error: apiErr.message,
        uploads: { ...s.uploads, [key]: { ...s.uploads[key], status: "failed" } },
      }));
      toast.error(`Upload failed: ${apiErr.message}`);
      return null;
    }
  },

  deleteDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      await documentApi.delete(id);
      set((s) => ({
        documents: s.documents.filter((d) => d.id !== id),
        loading: false,
      }));
      toast.success("Document deleted");
    } catch (err) {
      const apiErr = toApiError(err);
      set({ loading: false, error: apiErr.message });
      toast.error(`Failed to delete document: ${apiErr.message}`);
    }
  },
}));
