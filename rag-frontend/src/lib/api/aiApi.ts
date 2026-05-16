import { apiClient, unwrapArray } from "./client";

export type AISummary = { summary: string; highlights?: string[]; [key: string]: unknown };
export type AIModule = {
  id: string;
  name: string;
  description?: string;
  tasks?: Array<Record<string, unknown>>;
  checklist?: Array<Record<string, unknown>>;
  risks?: Array<Record<string, unknown>>;
  dependencies?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};
export type AIRisk = {
  id: string;
  title: string;
  severity?: "low" | "medium" | "high" | "critical" | string;
  description?: string;
  mitigation?: string;
  [key: string]: unknown;
};

export const aiApi = {
  analyze: (projectId: string) =>
    apiClient.post<Record<string, unknown>>(`/ai/analyze/${projectId}`).then((r) => r.data),
  summary: (projectId: string) =>
    apiClient.get<AISummary>(`/ai/summary/${projectId}`).then((r) => r.data),
  modules: (projectId: string) =>
    apiClient.get<unknown>(`/ai/modules/${projectId}`).then((r) => unwrapArray<AIModule>(r.data, "modules")),
  risks: (projectId: string) =>
    apiClient.get<unknown>(`/ai/risks/${projectId}`).then((r) => unwrapArray<AIRisk>(r.data, "risks")),
  ragSearch: (query: string, projectId?: string) =>
    apiClient
      .get<{ results: Array<Record<string, unknown>> }>("/rag/search", {
        params: { query, project_id: projectId },
      })
      .then((r) => r.data),
};
