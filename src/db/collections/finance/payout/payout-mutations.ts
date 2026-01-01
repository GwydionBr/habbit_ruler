import { db } from "@/db/powersync/db";
import { payoutsCollection } from "./payout-collection";
import { singleCashflowsCollection } from "@/db/collections/finance/single-cashflow/single-cashflow-collection";
import { syncSingleCashflowCategories } from "@/db/collections/finance/single-cashflow/single-cashflow-mutations";
import { workProjectsCollection } from "@/db/collections/work/work-project/work-project-collection";
import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { Payout } from "@/types/finance.types";
import { Tables, TablesUpdate } from "@/types/db.types";

/**
 * Adds a new Payout with side effects.
 * Returns the transaction for further processing.
 *
 * Side effects:
 * - Creates a single_cash_flow entry linked to the payout
 * - Updates timer_project.total_payout if timer_project_id is set
 * - Links timer_sessions to the payout if provided
 *
 * @param newPayout - The data of the new payout
 * @param userId - The user ID
 * @param options - Optional configuration for side effects
 * @returns Transaction object with isPersisted promise
 */
export const addPayout = (
  newPayout: Omit<Tables<"payout">, "id" | "created_at" | "user_id"> & {
    id?: string;
  },
  userId: string,
  options?: {
    createCashflow?: boolean;
    cashflowCategoryIds?: string[];
    timerSessionIds?: string[];
  }
) => {
  const payoutId = newPayout.id || crypto.randomUUID();
  const transaction = payoutsCollection.insert({
    ...newPayout,
    id: payoutId,
    created_at: new Date().toISOString(),
    user_id: userId,
  });

  // Handle side effects after payout is created
  if (options?.createCashflow !== false) {
    transaction.isPersisted.promise.then(async () => {
      // Create single cash flow linked to payout
      const cashflowId = crypto.randomUUID();
      await singleCashflowsCollection.insert({
        id: cashflowId,
        title: newPayout.title,
        amount: newPayout.value,
        currency: newPayout.currency,
        date: new Date().toISOString().split("T")[0],
        payout_id: payoutId,
        user_id: userId,
        created_at: new Date().toISOString(),
        is_active: true,
        finance_project_id: null,
        finance_client_id: null,
        recurring_cash_flow_id: null,
        changed_date: null,
      }).isPersisted.promise;

      // Sync categories if provided
      if (
        options?.cashflowCategoryIds &&
        options.cashflowCategoryIds.length > 0
      ) {
        await syncSingleCashflowCategories(
          cashflowId,
          options.cashflowCategoryIds,
          userId
        );
      }
    });
  }

  // Update timer_project.total_payout if timer_project_id is set
  if (newPayout.timer_project_id) {
    transaction.isPersisted.promise.then(async () => {
      const project = await db.getOptional<{ total_payout: number }>(
        "SELECT total_payout FROM timer_project WHERE id = ?",
        [newPayout.timer_project_id]
      );

      if (project) {
        const newTotalPayout =
          (parseFloat(project.total_payout.toString()) || 0) + newPayout.value;
        await workProjectsCollection.update(
          newPayout.timer_project_id,
          (draft) => {
            draft.total_payout = newTotalPayout;
          }
        ).isPersisted.promise;
      }
    });
  }

  // Link timer_sessions to payout if provided
  if (options?.timerSessionIds && options.timerSessionIds.length > 0) {
    transaction.isPersisted.promise.then(async () => {
      const updatePromises = options.timerSessionIds!.map((sessionId) =>
        workTimeEntriesCollection.update(sessionId, (draft) => {
          draft.payout_id = payoutId;
        })
      );
      await Promise.all(updatePromises.map((tx) => tx.isPersisted.promise));
    });
  }

  return transaction;
};

/**
 * Updates a Payout with side effects.
 *
 * Side effects:
 * - Updates the linked single_cash_flow if it exists
 * - Updates timer_project.total_payout if timer_project_id changed
 *
 * @param id - The ID or IDs of the payout to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updatePayout = (
  id: string | string[],
  item: TablesUpdate<"payout">
) => {
  const payoutId = typeof id === "string" ? id : id[0];

  // Get current payout to calculate differences
  const currentPayoutPromise = db.getOptional<Tables<"payout">>(
    "SELECT * FROM payout WHERE id = ?",
    [payoutId]
  );

  const transaction = payoutsCollection.update(id, (draft) => {
    Object.assign(draft, item);
  });

  // Update linked cashflow if payout value or currency changed
  transaction.isPersisted.promise.then(async () => {
    const currentPayout = await currentPayoutPromise;
    if (!currentPayout) return;

    const updatedPayout = { ...currentPayout, ...item };

    // Find and update linked cashflow
    const cashflow = await db.getOptional<{ id: string }>(
      "SELECT id FROM single_cash_flow WHERE payout_id = ?",
      [payoutId]
    );

    if (cashflow && (item.value !== undefined || item.currency !== undefined)) {
      await singleCashflowsCollection.update(cashflow.id, (draft) => {
        if (item.value !== undefined) {
          draft.amount = item.value;
        }
        if (item.currency !== undefined) {
          draft.currency = item.currency;
        }
        if (item.title !== undefined) {
          draft.title = item.title;
        }
      }).isPersisted.promise;
    }

    // Update timer_project.total_payout if timer_project_id or value changed
    if (
      updatedPayout.timer_project_id &&
      (item.value !== undefined || item.timer_project_id !== undefined)
    ) {
      const project = await db.getOptional<{ total_payout: number }>(
        "SELECT total_payout FROM timer_project WHERE id = ?",
        [updatedPayout.timer_project_id]
      );

      if (project) {
        const oldValue = currentPayout.value;
        const newValue = item.value !== undefined ? item.value : oldValue;
        const difference = newValue - oldValue;

        if (difference !== 0) {
          const newTotalPayout =
            (parseFloat(project.total_payout.toString()) || 0) + difference;
          await workProjectsCollection.update(
            updatedPayout.timer_project_id,
            (draft) => {
              draft.total_payout = newTotalPayout;
            }
          ).isPersisted.promise;
        }
      }
    }
  });

  return transaction;
};

/**
 * Deletes a Payout with side effects.
 *
 * Side effects:
 * - Sets payout_id to null in linked single_cash_flow
 * - Sets payout_id to null in linked timer_sessions
 * - Updates timer_project.total_payout if timer_project_id is set
 *
 * @param id - The ID or IDs of the payout to delete
 * @returns Transaction object with isPersisted promise
 */
export const deletePayout = (id: string | string[]) => {
  const payoutId = typeof id === "string" ? id : id[0];

  // Get payout data before deletion for side effects
  const payoutPromise = db.getOptional<Tables<"payout">>(
    "SELECT * FROM payout WHERE id = ?",
    [payoutId]
  );

  const transaction = payoutsCollection.delete(id);

  // Handle side effects after payout is deleted
  transaction.isPersisted.promise.then(async () => {
    const payout = await payoutPromise;
    if (!payout) return;

    // Unlink cashflow
    const cashflow = await db.getOptional<{ id: string }>(
      "SELECT id FROM single_cash_flow WHERE payout_id = ?",
      [payoutId]
    );

    if (cashflow) {
      await singleCashflowsCollection.update(cashflow.id, (draft) => {
        draft.payout_id = null;
      }).isPersisted.promise;
    }

    // Unlink timer sessions
    const timerSessions = await db.getAll<{ id: string }>(
      "SELECT id FROM timer_session WHERE payout_id = ?",
      [payoutId]
    );

    if (timerSessions.length > 0) {
      const updatePromises = timerSessions.map((session) =>
        workTimeEntriesCollection.update(session.id, (draft) => {
          draft.payout_id = null;
        })
      );
      await Promise.all(updatePromises.map((tx) => tx.isPersisted.promise));
    }

    // Update timer_project.total_payout
    if (payout.timer_project_id) {
      const project = await db.getOptional<{ total_payout: number }>(
        "SELECT total_payout FROM timer_project WHERE id = ?",
        [payout.timer_project_id]
      );

      if (project) {
        const newTotalPayout = Math.max(
          0,
          (parseFloat(project.total_payout.toString()) || 0) - payout.value
        );
        await workProjectsCollection.update(
          payout.timer_project_id,
          (draft) => {
            draft.total_payout = newTotalPayout;
          }
        ).isPersisted.promise;
      }
    }
  });

  return transaction;
};

/**
 * Loads a complete Payout with all related entities.
 *
 * @param payoutId - The payout ID
 * @returns Complete Payout or undefined if not found
 */
export async function getPayoutWithRelations(
  payoutId: string
): Promise<Payout | undefined> {
  // Get the payout
  const payout = await db.getOptional<
    Omit<Payout, "cashflow" | "timer_project" | "timer_sessions">
  >("SELECT * FROM payout WHERE id = ?", [payoutId]);

  if (!payout) return undefined;

  // Get the linked cashflow
  const cashflow = await db.getOptional<Tables<"single_cash_flow">>(
    "SELECT * FROM single_cash_flow WHERE payout_id = ?",
    [payoutId]
  );

  // Get the linked timer project
  const timerProject = payout.timer_project_id
    ? await db.getOptional<Tables<"timer_project">>(
        "SELECT * FROM timer_project WHERE id = ?",
        [payout.timer_project_id]
      )
    : null;

  // Get the linked timer sessions
  const timerSessions = await db.getAll<Tables<"timer_session">>(
    "SELECT * FROM timer_session WHERE payout_id = ?",
    [payoutId]
  );

  return {
    ...payout,
    cashflow: cashflow || null,
    timer_project: timerProject || null,
    timer_sessions: timerSessions || [],
  } as Payout;
}
