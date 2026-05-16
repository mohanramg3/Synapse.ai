import { create } from "zustand";
import { projectApi, type ProjectDashboard, type ProjectDetail, type ProjectSummary } from "@/lib/api/projectApi";
import { toApiError } from "@/lib/api/client";
import { toast } from "sonner";

type Filters = {
  search: string;
  status: string | null;
  priority: string | null;
  minHealth: number | null;
  sortBy: "updated" | "name" | "health";
};

type ProjectState = {
  projects: ProjectSummary[];
  byId: Record<string, ProjectDetail>;
  dashboard: ProjectDashboard | null;
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  createProject: (payload: Partial<ProjectSummary>) => Promise<ProjectSummary | null>;
  updateProject: (id: string, payload: Partial<ProjectSummary>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
};

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  byId: {},
  dashboard: null,
  loading: false,
  error: null,
  filters: { search: "", status: null, priority: null, minHealth: null, sortBy: "updated" },

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectApi.list();
      set({ projects, loading: false });
    } catch (err) {
      set({ loading: false, error: toApiError(err).message });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const detail = await projectApi.get(id);
      set((s) => ({ byId: { ...s.byId, [id]: detail }, loading: false }));
    } catch (err) {
      set({ loading: false, error: toApiError(err).message });
    }
  },

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const dashboard = await projectApi.dashboard();
      set({ dashboard, loading: false });
    } catch (err) {
      set({ loading: false, error: toApiError(err).message });
    }
  },

  createProject: async (payload) => {
    set({ loading: true, error: null });
    try {
      const project = await projectApi.create(payload);
      set((s) => ({ projects: [project, ...s.projects], loading: false }));
      toast.success("Project created successfully");
      return project;
    } catch (err) {
      const apiErr = toApiError(err);
      set({ loading: false, error: apiErr.message });
      toast.error(`Failed to create project: ${apiErr.message}`);
      return null;
    }
  },

  updateProject: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const updated = await projectApi.update(id, payload);
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? updated : p)),
        byId: { ...s.byId, [id]: { ...s.byId[id], ...updated } },
        loading: false,
      }));
      toast.success("Project updated");
    } catch (err) {
      const apiErr = toApiError(err);
      set({ loading: false, error: apiErr.message });
      toast.error(`Failed to update project: ${apiErr.message}`);
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await projectApi.delete(id);
      set((s) => {
        const { [id]: _, ...remainingById } = s.byId;
        return {
          projects: s.projects.filter((p) => p.id !== id),
          byId: remainingById,
          loading: false,
        };
      });
      toast.success("Project deleted");
    } catch (err) {
      const apiErr = toApiError(err);
      set({ loading: false, error: apiErr.message });
      toast.error(`Failed to delete project: ${apiErr.message}`);
    }
  },
}));
