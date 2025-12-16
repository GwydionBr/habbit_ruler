import { createFileRoute, redirect } from "@tanstack/react-router";
import { SettingsSync } from "@/components/Settings/SettingsSync";
import { settingsQueryOptions } from "@/db/queries/settings/use-settings";
import { profileQueryOptions } from "@/db/queries/profile/use-profile";
import { Shell } from "@/components/AppShell/Shell";
import { PowerSyncInitializer } from "@/components/PowerSyncInitializer";
import { RoutePrefetcher } from "@/components/RoutePrefetcher";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/auth" });
    }
  },
  loader: async ({ context }) => {
    const { queryClient } = context;

    try {
      // Versuche Daten zu laden (funktioniert online und offline mit PowerSync)
      const profile =
        await context.queryClient.ensureQueryData(profileQueryOptions);
      if (!profile.initialized) {
        throw redirect({ to: "/new-user" });
      }
      await queryClient.ensureQueryData(settingsQueryOptions);
    } catch (error) {
      // Offline oder Fehler beim Laden → lasse trotzdem weiter navigieren
      // PowerSync wird die Daten im Component laden

      // Nur bei echten Fehlern loggen, nicht bei Redirects (Status 307)
      if (error instanceof Response && error.status === 307) {
        // Redirect - das ist OK, wird vom Router gehandhabt
        throw error;
      }

      // Bei anderen Fehlern (z.B. offline): Weiter navigieren
      console.debug(
        "Loader: Using offline mode, data will load from PowerSync"
      );
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <PowerSyncInitializer />
      <SettingsSync />
      <RoutePrefetcher />
      <Shell />
    </>
  );
}
