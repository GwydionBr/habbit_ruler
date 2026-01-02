import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addRecurringCashflowMutation,
  updateRecurringCashflowMutation,
  deleteRecurringCashflowMutation,
} from "./recurring-cashflow-mutations";
import {
  InsertRecurringCashFlow,
  RecurringCashFlow,
  DeleteRecurringCashFlowMode,
} from "@/types/finance.types";
import { TablesUpdate } from "@/types/db.types";
import { processRecurringCashFlows } from "@/lib/helper/processRecurringCashflows";
import {
  addSingleCashflowMutation,
  deleteSingleCashflowMutation,
} from "../single-cashflow/single-cashflow-mutations";
import { useSingleCashflowsQuery } from "../single-cashflow/use-single-cashflow-query";

/**
 * Hook for Recurring Cashflow operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Recurring Cashflows with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useRecurringCashflowMutations = () => {
  const { data: profile } = useProfile();
  const { data: singleCashflows } = useSingleCashflowsQuery();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Recurring Cashflow with automatic notification.
   */
  const handleAddRecurringCashflow = useCallback(
    async (
      newRecurringCashflow: InsertRecurringCashFlow
    ): Promise<RecurringCashFlow | undefined> => {
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
        const { promise, data } = await addRecurringCashflowMutation(
          { ...newRecurringCashflow },
          profile.id
        );

        if (promise.error) {
          console.error("Error adding recurring cashflow", promise.error);
          showActionErrorNotification(promise.error.message);
          return;
        }

        const singleCashflowsToInsert = processRecurringCashFlows([data], []);

        await addSingleCashflowMutation(singleCashflowsToInsert, profile.id);

        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich erstellt",
            "Recurring cashflow successfully created"
          )
        );
      } catch (error) {
        console.error("Error adding recurring cashflow try/catch", error);
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
   * Updates a Recurring Cashflow with automatic notification.
   */
  const handleUpdateRecurringCashflow = useCallback(
    async (
      id: string | string[],
      item: TablesUpdate<"recurring_cash_flow">,
      categoryIds?: string[]
    ): Promise<RecurringCashFlow | undefined> => {
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
        const transaction = updateRecurringCashflowMutation(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // // Sync categories if provided
        // const cashflowId = typeof id === "string" ? id : id[0];
        // if (categoryIds !== undefined) {
        //   await syncRecurringCashflowCategoriesMutation(
        //     cashflowId,
        //     categoryIds,
        //     profile.id
        //   );
        // }

        // // Get complete cashflow with categories
        // const completeCashflow =
        //   await getRecurringCashflowWithCategories(cashflowId);

        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich aktualisiert",
            "Recurring cashflow successfully updated"
          )
        );

        // return completeCashflow;
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
   * Deletes a Recurring Cashflow with automatic notification.
   */
  const handleDeleteRecurringCashflow = useCallback(
    async (id: string | string[], mode: DeleteRecurringCashFlowMode) => {
      try {
        const ids = Array.isArray(id) ? id : [id];
        if (mode === DeleteRecurringCashFlowMode.keep_unlinked) {
          const transaction = deleteRecurringCashflowMutation(ids);
          await transaction.isPersisted.promise;
          showActionSuccessNotification(
            getLocalizedText(
              "Wiederkehrender Cashflow erfolgreich gelöscht (Verknüpfung entfernt)",
              "Recurring cashflow successfully deleted (unlinked)"
            )
          );
        } else if (mode === DeleteRecurringCashFlowMode.delete_all) {
          const singleCashflowsToDelete = singleCashflows.filter((cashflow) =>
            ids.includes(cashflow.recurring_cash_flow_id ?? "")
          );
          const transaction = deleteRecurringCashflowMutation(ids);
          await transaction.isPersisted.promise;
          deleteSingleCashflowMutation(
            singleCashflowsToDelete.map((cashflow) => cashflow.id)
          );
          showActionSuccessNotification(
            getLocalizedText(
              "Wiederkehrender Cashflow und alle verknüpften Einmal-Cashflows erfolgreich gelöscht",
              "Recurring cashflow and all linked single cashflows successfully deleted"
            )
          );
        }
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
    addRecurringCashflow: handleAddRecurringCashflow,
    updateRecurringCashflow: handleUpdateRecurringCashflow,
    deleteRecurringCashflow: handleDeleteRecurringCashflow,
  };
};
