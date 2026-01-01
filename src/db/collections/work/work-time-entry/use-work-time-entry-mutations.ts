import { useCallback, useRef, useEffect } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";

import {
  showActionSuccessNotification,
  showActionErrorNotification,
  showOverlapNotification,
  showCompleteOverlapNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addWorkTimeEntry,
  updateWorkTimeEntry,
  deleteWorkTimeEntry,
} from "./work-time-entry-mutations";
import {
  InsertWorkTimeEntry,
  UpdateWorkTimeEntry,
  WorkTimeEntry,
} from "@/types/work.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import { getTimeFragmentSession } from "@/lib/helper/getTimeFragmentSession";
import { resolveTimeEntryOverlaps } from "@/lib/helper/resolveTimeEntryOverlaps";

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
  const { data: workTimeEntries } = useWorkTimeEntries();
  const { getLocalizedText } = useIntl();

  // Use a ref to always have the latest workTimeEntries for overlap detection
  const workTimeEntriesRef = useRef(workTimeEntries);

  useEffect(() => {
    workTimeEntriesRef.current = workTimeEntries;
  }, [workTimeEntries]);

  /**
   * Adds a new Work Time Entry with automatic notification.
   */
  const handleAddWorkTimeEntry = useCallback(
    async (
      newWorkTimeEntry: InsertWorkTimeEntry,
      roundingSettings: TimerRoundingSettings
    ) => {
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
        const newTimeEntry: WorkTimeEntry = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          user_id: profile.id,
          currency: newWorkTimeEntry.currency ?? "USD",
          hourly_payment: newWorkTimeEntry.hourly_payment ?? false,
          memo: newWorkTimeEntry.memo ?? null,
          true_end_time: new Date(newWorkTimeEntry.end_time).toISOString(),
          start_time: new Date(newWorkTimeEntry.start_time).toISOString(),
          end_time: new Date(newWorkTimeEntry.end_time).toISOString(),
          active_seconds: newWorkTimeEntry.active_seconds,
          paid: newWorkTimeEntry.paid ?? false,
          paused_seconds: newWorkTimeEntry.paused_seconds ?? 0,
          payout_id: newWorkTimeEntry.payout_id ?? null,
          project_id: newWorkTimeEntry.project_id ?? "",
          real_start_time: new Date(newWorkTimeEntry.start_time).toISOString(),
          single_cash_flow_id: null,
          time_fragments_interval:
            newWorkTimeEntry.time_fragments_interval ?? null,
          salary: newWorkTimeEntry.salary ?? 0,
        };
        let updatedTimeEntry: WorkTimeEntry = newTimeEntry;
        if (roundingSettings.roundInTimeFragments) {
          updatedTimeEntry = getTimeFragmentSession(
            roundingSettings.timeFragmentInterval,
            newTimeEntry
          ) as WorkTimeEntry;
        }

        // Use the ref to get the latest data, even if the hook hasn't updated yet
        const currentTimeEntries = workTimeEntriesRef.current ?? [];
        const { adjustedTimeEntries, overlappingTimeEntries } =
          resolveTimeEntryOverlaps(
            currentTimeEntries.filter(
              (entry) => entry.project_id === newWorkTimeEntry.project_id
            ),
            updatedTimeEntry
          );

        if (!adjustedTimeEntries) {
          showCompleteOverlapNotification();
          return;
        } else if (overlappingTimeEntries.length > 0) {
          showOverlapNotification(
            updatedTimeEntry,
            overlappingTimeEntries,
            adjustedTimeEntries
          );
        } else {
          showActionSuccessNotification(
            getLocalizedText(
              "Arbeitszeit erfolgreich erstellt",
              "Work time successfully created"
            )
          );
        }

        const transaction = addWorkTimeEntry(adjustedTimeEntries);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

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
