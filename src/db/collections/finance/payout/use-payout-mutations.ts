import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addPayout,
  updatePayout,
  deletePayout,
  getPayoutWithRelations,
} from "./payout-mutations";
import { Payout } from "@/types/finance.types";
import { Tables, TablesUpdate } from "@/types/db.types";

/**
 * Hook for Payout operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Payouts with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const usePayoutMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Payout with automatic notification and side effects.
   */
  const handleAddPayout = useCallback(
    async (
      newPayout: Omit<Tables<"payout">, "id" | "created_at" | "user_id"> & {
        id?: string;
      },
      options?: {
        createCashflow?: boolean;
        cashflowCategoryIds?: string[];
        timerSessionIds?: string[];
      }
    ): Promise<Payout | undefined> => {
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
        const payoutId = newPayout.id || crypto.randomUUID();
        const transaction = addPayout(
          { ...newPayout, id: payoutId },
          profile.id,
          options
        );
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Wait a bit for side effects to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get complete payout with relations
        const completePayout = await getPayoutWithRelations(payoutId);

        showActionSuccessNotification(
          getLocalizedText(
            "Auszahlung erfolgreich erstellt",
            "Payout successfully created"
          )
        );

        return completePayout;
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
   * Updates a Payout with automatic notification and side effects.
   */
  const handleUpdatePayout = useCallback(
    async (
      id: string | string[],
      item: TablesUpdate<"payout">
    ): Promise<Payout | undefined> => {
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
        const transaction = updatePayout(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Wait a bit for side effects to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get complete payout with relations
        const payoutId = typeof id === "string" ? id : id[0];
        const completePayout = await getPayoutWithRelations(payoutId);

        showActionSuccessNotification(
          getLocalizedText(
            "Auszahlung erfolgreich aktualisiert",
            "Payout successfully updated"
          )
        );

        return completePayout;
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
   * Deletes a Payout with automatic notification and side effects.
   */
  const handleDeletePayout = useCallback(
    async (id: string | string[]) => {
      try {
        const transaction = deletePayout(id);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Wait a bit for side effects to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        showActionSuccessNotification(
          getLocalizedText(
            "Auszahlung erfolgreich gelöscht",
            "Payout successfully deleted"
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
    addPayout: handleAddPayout,
    updatePayout: handleUpdatePayout,
    deletePayout: handleDeletePayout,
    // Helper functions
    getPayoutWithRelations,
  };
};
