import { apiClient, unwrapArray } from "./client";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  assignee?: { id: string; name?: string; avatar_url?: string };
  module_id?: string;
  module_name?: string;
  checklist?: Array<{ id: string; label: string; done?: boolean }>;
  project_id?: string;
  [key: string]: unknown;
};

export const taskApi = {
  list: () => apiClient.get<unknown>("/tasks").then((r) => unwrapArray<Task>(r.data, "tasks")),
  byProject: (projectId: string) =>
    apiClient.get<unknown>(`/tasks/project/${projectId}`).then((r) => unwrapArray<Task>(r.data, "tasks")),
  create: (payload: Partial<Task>) =>
    apiClient.post<Task>("/tasks", payload).then((r) => r.data),
  update: (id: string, patch: Partial<Task>) =>
    apiClient.patch<Task>(`/tasks/${id}`, patch).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};
