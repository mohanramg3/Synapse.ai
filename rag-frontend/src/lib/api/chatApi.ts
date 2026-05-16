import { apiClient } from "./client";

export const chatApi = {
  sendMessage: (projectId: number, query: string) =>
    apiClient.post(`/chat/${projectId}`, { query }).then((r) => r.data),
  
  getHistory: (projectId: number) =>
    apiClient.get(`/chat/history/${projectId}`).then((r) => r.data),
};
