import { db } from "@/db/powersync/db";
import {
  recurringCashflowsCollection,
  recurringCashflowCategoriesCollection,
} from "./recurring-cashflow-collection";
import { RecurringCashFlow } from "@/types/finance.types";
import { Tables, TablesUpdate } from "@/types/db.types";

/**
 * Adds a new Recurring Cashflow.
 * Returns the transaction for further processing.
 *
 * @param newRecurringCashflow - The data of the new cashflow
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise
 */
export const addRecurringCashflow = (
  newRecurringCashflow: Omit<
    Tables<"recurring_cash_flow">,
    "id" | "created_at" | "user_id"
  > & { id?: string },
  userId: string
) => {
  const transaction = recurringCashflowsCollection.insert({
    ...newRecurringCashflow,
    id: newRecurringCashflow.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
  });

  return transaction;
};

/**
 * Updates a Recurring Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updateRecurringCashflow = (
  id: string | string[],
  item: TablesUpdate<"recurring_cash_flow">
) => {
  return recurringCashflowsCollection.update(id, (draft) => {
    Object.assign(draft, item);
  });
};

/**
 * Deletes a Recurring Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to delete
 * @returns Transaction object with isPersisted promise
 */
export const deleteRecurringCashflow = (id: string | string[]) => {
  return recurringCashflowsCollection.delete(id);
};

/**
 * Synchronizes the Many-to-Many relations between Recurring Cashflow and Finance Categories.
 * Deletes old relations and creates new ones based on categoryIds.
 *
 * @param cashflowId - The cashflow ID
 * @param categoryIds - Array of category IDs to associate
 * @param userId - The user ID
 */
export async function syncRecurringCashflowCategories(
  cashflowId: string,
  categoryIds: string[],
  userId: string
): Promise<void> {
  // 1. Get all existing relations for this cashflow
  const existingRelations = await db.getAll<{
    id: string;
    finance_category_id: string;
  }>(
    "SELECT id, finance_category_id FROM recurring_cash_flow_category WHERE recurring_cash_flow_id = ?",
    [cashflowId]
  );

  const existingCategoryIds = existingRelations.map(
    (r) => r.finance_category_id
  );
  const newCategoryIds = categoryIds || [];

  // 2. Find relations to delete (in existing but not in new)
  const relationsToDelete = existingRelations.filter(
    (relation) => !newCategoryIds.includes(relation.finance_category_id)
  );

  // 3. Find categories to add (in new but not in existing)
  const categoriesToAdd = newCategoryIds.filter(
    (categoryId) => !existingCategoryIds.includes(categoryId)
  );

  // 4. Delete old relations
  const deletePromises = relationsToDelete.map((relation) =>
    recurringCashflowCategoriesCollection.delete(relation.id)
  );

  // 5. Create new relations
  const insertPromises = categoriesToAdd.map((categoryId) =>
    recurringCashflowCategoriesCollection.insert({
      id: crypto.randomUUID(),
      recurring_cash_flow_id: cashflowId,
      finance_category_id: categoryId,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  );

  // 6. Wait for all transactions
  const allTransactions = [...deletePromises, ...insertPromises];
  await Promise.all(allTransactions.map((tx) => tx.isPersisted.promise));
}

/**
 * Loads a complete RecurringCashFlow with all Categories.
 *
 * @param cashflowId - The cashflow ID
 * @returns Complete RecurringCashFlow or undefined if not found
 */
export async function getRecurringCashflowWithCategories(
  cashflowId: string
): Promise<RecurringCashFlow | undefined> {
  // Get the cashflow
  const cashflow = await db.getOptional<Omit<RecurringCashFlow, "categories">>(
    "SELECT * FROM recurring_cash_flow WHERE id = ?",
    [cashflowId]
  );

  if (!cashflow) return undefined;

  // Get the associated categories
  const categoryRelations = await db.getAll<{
    finance_category_id: string;
  }>(
    "SELECT finance_category_id FROM recurring_cash_flow_category WHERE recurring_cash_flow_id = ?",
    [cashflowId]
  );

  const categoryIds = categoryRelations.map((r) => r.finance_category_id);

  // Get the complete category data
  const categories =
    categoryIds.length > 0
      ? await db
          .getAll<
            Tables<"finance_category">
          >(`SELECT * FROM finance_category WHERE id IN (${categoryIds.map(() => "?").join(",")})`, categoryIds)
          .then((cats) => cats.map((cat) => ({ finance_category: cat })))
      : [];

  return {
    ...cashflow,
    categories: categories || [],
  } as RecurringCashFlow;
}
