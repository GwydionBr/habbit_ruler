import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addWorkTimeEntry,
  updateWorkTimeEntry,
  deleteWorkTimeEntry,
} from "./work-time-entry-mutation";
import { InsertWorkTimeEntry, UpdateWorkTimeEntry } from "@/types/work.types";

/**
 * Hook for Work Time Entry operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Work Time Entries with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useWorkTimeEntryMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Work Time Entry with automatic notification.
   */
  const handleAddWorkTimeEntry = useCallback(
    async (newWorkTimeEntry: InsertWorkTimeEntry) => {
      if (!profile?.id) {
        showActionErrorNotification(
          getLocalizedText(
            "Kein Benutzerprofil gefunden",
            "No user profile found"
          )
        );
        return;
      }

      try {
        const transaction = addWorkTimeEntry(newWorkTimeEntry, profile.id);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Sitzung erfolgreich erstellt",
            "Session successfully created"
          )
        );

        return result;
      } catch (error) {
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [profile?.id, getLocalizedText]
  );

  /**
   * Updates a Work Time Entry with automatic notification.
   */
  const handleUpdateWorkTimeEntry = useCallback(
    async (id: string | string[], item: UpdateWorkTimeEntry) => {
      try {
        const transaction = updateWorkTimeEntry(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Sitzung erfolgreich aktualisiert",
            "Session successfully updated"
          )
        );

        return result;
      } catch (error) {
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [getLocalizedText]
  );

  /**
   * Deletes a Work Time Entry with automatic notification.
   */
  const handleDeleteWorkTimeEntry = useCallback(
    async (id: string) => {
      try {
        const transaction = deleteWorkTimeEntry(id);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Sitzung erfolgreich gelöscht",
            "Session successfully deleted"
          )
        );

        return result;
      } catch (error) {
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [getLocalizedText]
  );

  return {
    addWorkTimeEntry: handleAddWorkTimeEntry,
    updateWorkTimeEntry: handleUpdateWorkTimeEntry,
    deleteWorkTimeEntry: handleDeleteWorkTimeEntry,
  };
};
