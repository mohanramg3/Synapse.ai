import { create } from "zustand";
import { taskApi, type Task } from "@/lib/api/taskApi";
import { toApiError } from "@/lib/api/client";
import { toast } from "sonner";

type TaskState = {
  tasks: Task[];
  byProject: Record<string, Task[]>;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchByProject: (projectId: string) => Promise<void>;
  createTask: (payload: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  byProject: {},
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskApi.list();
      set({ tasks, loading: false });
    } catch (err) {
      set({ loading: false, error: toApiError(err).message });
    }
  },

  fetchByProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskApi.byProject(projectId);
      set((s) => ({ byProject: { ...s.byProject, [projectId]: tasks }, loading: false }));
    } catch (err) {
      set({ loading: false, error: toApiError(err).message });
    }
  },

  createTask: async (payload) => {
    set({ loading: true, error: null });
    try {
      const task = await taskApi.create(payload);
      set((s) => ({
        tasks: [task, ...s.tasks],
        byProject: task.project_id
          ? { ...s.byProject, [task.project_id]: [task, ...(s.byProject[task.project_id] || [])] }
          : s.byProject,
        loading: false,
      }));
      toast.success("Task created");
      return task;
    } catch (err) {
      const apiErr = toApiError(err);
      set({ loading: false, error: apiErr.message });
      toast.error(`Failed to create task: ${apiErr.message}`);
      return null;
    }
  },

  updateTask: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      const updated = await taskApi.update(id, patch);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
        byProject: Object.fromEntries(
          Object.entries(s.byProject).map(([pid, tasks]) => [
            pid,
            tasks.map((t) => (t.id === id ? updated : t)),
          ]),
        ),
        loading: false,
      }));
      toast.success("Task updated");
    } catch (err) {
      const apiErr = toApiError(err);
      set({ loading: false, error: apiErr.message });
      toast.error(`Failed to update task: ${apiErr.message}`);
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await taskApi.delete(id);
      set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
        byProject: Object.fromEntries(
          Object.entries(s.byProject).map(([pid, tasks]) => [
            pid,
            tasks.filter((t) => t.id !== id),
          ]),
        ),
        loading: false,
      }));
      toast.success("Task deleted");
    } catch (err) {
      const apiErr = toApiError(err);
      set({ loading: false, error: apiErr.message });
      toast.error(`Failed to delete task: ${apiErr.message}`);
    }
  },
}));
