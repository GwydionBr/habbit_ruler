import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettings } from "@/actions/settings/update-settings";
import { useUserPreferences } from "@/stores/userPreferencesStore";
import { Database } from "@/types/db.types";

type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

/**
 * Hook for updating user settings with optimistic updates.
 * Automatically syncs with the Zustand store and React Query cache.
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const setPreferences = useUserPreferences((state) => state.setPreferences);

  return useMutation({
    mutationFn: (data: SettingsUpdate) => updateSettings({ data }),
    onSuccess: (updatedSettings) => {
      // Update React Query cache
      queryClient.setQueryData(["settings"], updatedSettings);

      // Sync to Zustand store
      setPreferences(updatedSettings);
    },
    onError: () => {
      // Invalidate to refetch from server on error
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
