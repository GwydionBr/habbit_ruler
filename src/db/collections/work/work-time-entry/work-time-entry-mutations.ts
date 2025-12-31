import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { UpdateWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";

/**
 * Adds a new Work Time Entry.
 * Returns the transaction for further processing.
 *
 * @param newWorkTimeEntry - The data of the new time entry or an array of time entries
 * @returns Transaction object with isPersisted promise
 */
export const addWorkTimeEntry = (
  newWorkTimeEntry: WorkTimeEntry[] | WorkTimeEntry
) => {
  const transaction = workTimeEntriesCollection.insert(newWorkTimeEntry);

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
