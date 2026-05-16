import { create } from "zustand";
import { aiApi, type AIModule, type AIRisk, type AISummary } from "@/lib/api/aiApi";
import { toApiError } from "@/lib/api/client";

type AIState = {
  summaries: Record<string, AISummary>;
  modules: Record<string, AIModule[]>;
  risks: Record<string, AIRisk[]>;
  loading: Record<string, boolean>;
  error: string | null;
  fetchAll: (projectId: string) => Promise<void>;
  triggerAnalysis: (projectId: string) => Promise<void>;
  ragSearch: (query: string, projectId?: string) => Promise<Array<Record<string, unknown>>>;
};

export const useAIStore = create<AIState>((set) => ({
  summaries: {},
  modules: {},
  risks: {},
  loading: {},
  error: null,

  fetchAll: async (projectId) => {
    set((s) => ({ loading: { ...s.loading, [projectId]: true }, error: null }));
    try {
      const [summary, modules, risks] = await Promise.allSettled([
        aiApi.summary(projectId),
        aiApi.modules(projectId),
        aiApi.risks(projectId),
      ]);
      set((s) => ({
        summaries:
          summary.status === "fulfilled" ? { ...s.summaries, [projectId]: summary.value } : s.summaries,
        modules:
          modules.status === "fulfilled" ? { ...s.modules, [projectId]: modules.value } : s.modules,
        risks: risks.status === "fulfilled" ? { ...s.risks, [projectId]: risks.value } : s.risks,
        loading: { ...s.loading, [projectId]: false },
      }));
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [projectId]: false },
        error: toApiError(err).message,
      }));
    }
  },

  triggerAnalysis: async (projectId) => {
    set((s) => ({ loading: { ...s.loading, [projectId]: true }, error: null }));
    try {
      await aiApi.analyze(projectId);
      // Automatically fetch all after successful analysis
      const store = useAIStore.getState();
      await store.fetchAll(projectId);
    } catch (err) {
      set((s) => ({
        loading: { ...s.loading, [projectId]: false },
        error: toApiError(err).message,
      }));
    }
  },

  ragSearch: async (query, projectId) => {
    set({ error: null });
    try {
      const data = await aiApi.ragSearch(query, projectId);
      return data.results || [];
    } catch (err) {
      set({ error: toApiError(err).message });
      return [];
    }
  },
}));
