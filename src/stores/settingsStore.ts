"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum SettingsTab {
  GENERAL = "general",
  WORK = "work",
  FINANCE = "finance",
  CALENDAR = "calendar",
}

interface SettingsState {
  isModalOpen: boolean;
  selectedTab: SettingsTab;
  isWorkNavbarOpen: boolean;
  isFinanceNavbarOpen: boolean;
}

interface SettingsActions {
  setSelectedTab: (tab: SettingsTab) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
  toggleWorkNavbar: () => void;
  toggleFinanceNavbar: () => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      isModalOpen: false,
      selectedTab: SettingsTab.GENERAL,
      isWorkNavbarOpen: true,
      isFinanceNavbarOpen: true,

      setSelectedTab: (tab: SettingsTab) => {
        set({ selectedTab: tab });
      },
      setIsModalOpen: (isModalOpen: boolean) => {
        set({ isModalOpen: isModalOpen });
      },
      toggleWorkNavbar: () => {
        set({ isWorkNavbarOpen: !get().isWorkNavbarOpen });
      },
      toggleFinanceNavbar: () => {
        set({ isFinanceNavbarOpen: !get().isFinanceNavbarOpen });
      },
    }),
    {
      name: "settings",
    }
  )
);

export default useSettingsStore;
