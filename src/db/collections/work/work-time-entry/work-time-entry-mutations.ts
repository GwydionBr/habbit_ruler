import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { InsertWorkTimeEntry, UpdateWorkTimeEntry } from "@/types/work.types";

/**
 * Adds a new Work Time Entry.
 * Returns the transaction for further processing.
 *
 * @param newWorkTimeEntry - The data of the new time entry
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise
 */
export const addWorkTimeEntry = (
  newWorkTimeEntry: InsertWorkTimeEntry,
  userId: string
) => {
  const transaction = workTimeEntriesCollection.insert({
    ...newWorkTimeEntry,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
    currency: newWorkTimeEntry.currency ?? "USD",
    memo: newWorkTimeEntry.memo ?? null,
    paid: false,
    paused_seconds: 0,
    payout_id: newWorkTimeEntry.payout_id ?? null,
    project_id: newWorkTimeEntry.project_id ?? "",
    real_start_time: new Date().toISOString(),
    single_cash_flow_id: null,
    time_fragments_interval: newWorkTimeEntry.time_fragments_interval ?? null,
    hourly_payment: newWorkTimeEntry.hourly_payment ?? false,
  });

  return transaction;
};

/**
 * Updates a Work Time Entry.
 *
 * @param id - The ID or IDs of the time entry to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updateWorkTimeEntry = (
  id: string | string[],
  item: UpdateWorkTimeEntry
) => {
  return workTimeEntriesCollection.update(id, (draft) => {
    Object.assign(draft, item);
  });
};

/**
 * Deletes a Work Time Entry.
 *
 * @param id - The ID or IDs of the time entry to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteWorkTimeEntry = (id: string | string[]) => {
  return workTimeEntriesCollection.delete(id);
};
