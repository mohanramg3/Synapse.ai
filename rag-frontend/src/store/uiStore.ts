import { create } from "zustand";

type UIState = {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  aiPanelOpen: boolean;
  notificationsOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
  setCommand: (v: boolean) => void;
  setAIPanel: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  aiPanelOpen: false,
  notificationsOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebar: (v) => set({ sidebarCollapsed: v }),
  setCommand: (v) => set({ commandOpen: v }),
  setAIPanel: (v) => set({ aiPanelOpen: v }),
  setNotifications: (v) => set({ notificationsOpen: v }),
}));
