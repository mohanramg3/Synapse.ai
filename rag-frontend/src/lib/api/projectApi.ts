import { apiClient, unwrapArray } from "./client";

// Loose, dynamic shapes — backend is the source of truth. We never hardcode modules.
export type ProjectSummary = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  progress?: number;
  health_score?: number;
  risk_level?: "low" | "medium" | "high" | string;
  members?: Array<{ id: string; name?: string; avatar_url?: string }>;
  document_count?: number;
  task_count?: number;
  updated_at?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type ProjectDetail = ProjectSummary & {
  ai_summary?: string;
  modules?: Array<Record<string, unknown>>;
  tasks?: Array<Record<string, unknown>>;
  risks?: Array<Record<string, unknown>>;
  dependencies?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  documents?: Array<Record<string, unknown>>;
  team_activity?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type ProjectDashboard = {
  active_projects?: number;
  pending_tasks?: number;
  documents_processed?: number;
  ai_insights?: number;
  health_average?: number;
  recent_activity?: Array<Record<string, unknown>>;
  processing_queue?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  trends?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

const normalizeProject = <T extends Record<string, unknown>>(project: T): T & ProjectSummary => ({
  ...project,
  id: String(project.id ?? ""),
  name: String(project.name ?? project.title ?? "Untitled project"),
  description: project.description as string | undefined,
  updated_at: (project.updated_at ?? project.created_at) as string | undefined,
});

const normalizeProjects = (payload: unknown) =>
  unwrapArray<Record<string, unknown>>(payload, "projects").map((project) => normalizeProject(project));

export const projectApi = {
  list: () => apiClient.get<unknown>("/projects/").then((r) => normalizeProjects(r.data)),
  get: (id: string) =>
    apiClient.get<Record<string, unknown>>(`/projects/${id}`).then((r) => normalizeProject(r.data) as ProjectDetail),
  dashboard: async (id?: string) => {
    if (id) return apiClient.get<ProjectDashboard>(`/projects/${id}/dashboard`).then((r) => r.data);
    const projects = await projectApi.list();
    return {
      active_projects: projects.length,
      pending_tasks: projects.reduce((total, project) => total + Number(project.task_count ?? 0), 0),
      documents_processed: projects.reduce((total, project) => total + Number(project.document_count ?? 0), 0),
      ai_insights: projects.reduce(
        (total, project) => total + (Array.isArray(project.modules) ? project.modules.length : 0),
        0,
      ),
      recent_activity: projects.slice(0, 5).map((project) => ({
        id: project.id,
        message: `${project.name} is ${project.status ?? "active"}`,
        timestamp: project.updated_at ?? project.created_at,
      })),
    } satisfies ProjectDashboard;
  },
  create: (payload: Partial<ProjectSummary>) =>
    apiClient.post<Record<string, unknown>>("/projects/", payload).then((r) => normalizeProject(r.data)),
  update: (id: string, payload: Partial<ProjectSummary>) =>
    apiClient.patch<Record<string, unknown>>(`/projects/${id}`, payload).then((r) => normalizeProject(r.data)),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};
