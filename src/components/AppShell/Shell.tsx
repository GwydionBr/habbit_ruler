import { useSettingsStore } from "@/stores/settingsStore";

import { AppShell } from "@mantine/core";
import { Outlet } from "@tanstack/react-router";
import SettingsModal from "@/components/Settings/SettingsModal";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Aside from "./Aside";
import Header from "./Header";

export function Shell() {
  const { isAsideOpen, toggleAside } = useSettingsStore();

  return (
    <AppShell
      header={{ height: 45 }}
      aside={{
        width: isAsideOpen ? 300 : 50,
        breakpoint: "md",
        collapsed: { desktop: false, mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main style={{ transition: "0.4s ease-in" }}>
        <Outlet />
      </AppShell.Main>
      <AppShell.Aside
        bg="var(--mantine-color-body)"
        style={{ transition: "width 0.4s ease-in", overflow: "hidden" }}
      >
        <Aside toggleAside={toggleAside} isAsideOpen={isAsideOpen} />
      </AppShell.Aside>
      <SettingsModal />
      <OfflineIndicator />
    </AppShell>
  );
}
