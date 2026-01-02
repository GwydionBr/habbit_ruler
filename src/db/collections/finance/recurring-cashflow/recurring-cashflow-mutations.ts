import { db } from "@/db/powersync/db";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";
import { createTransaction } from "@tanstack/react-db";
import {
  recurringCashflowsCollection,
  recurringCashflowCategoriesCollection,
} from "./recurring-cashflow-collection";
import {
  InsertRecurringCashFlow,
  RecurringCashFlow,
} from "@/types/finance.types";
import { Tables, TablesUpdate } from "@/types/db.types";

/**
 * Adds a new Recurring Cashflow.
 * Returns the transaction for further processing.
 *
 * @param newRecurringCashflow - The data of the new cashflow
 * @param userId - The user ID
 * @returns Transaction object with isPersisted promise and created cashflow
 */
export const addRecurringCashflowMutation = async (
  newRecurringCashflow: InsertRecurringCashFlow,
  userId: string
) => {
  const customTransaction = createTransaction({
    autoCommit: false,
    mutationFn: async ({ transaction }) => {
      // Use PowerSyncTransactor to apply the transaction to PowerSync
      await new PowerSyncTransactor({ database: db }).applyTransaction(
        transaction
      );
    },
  });
  const { categories, ...cashflowData } = newRecurringCashflow;
  const dataToInsert = {
    ...cashflowData,
    currency: newRecurringCashflow.currency || "EUR",
    start_date: newRecurringCashflow.start_date || new Date().toISOString(),
    end_date: newRecurringCashflow.end_date || null,
    finance_client_id: newRecurringCashflow.finance_client_id || null,
    interval: newRecurringCashflow.interval || "month",
    title: newRecurringCashflow.title || "",
    description: newRecurringCashflow.description || "",
    id: newRecurringCashflow.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    user_id: userId,
  };

  customTransaction.mutate(() => {
    recurringCashflowsCollection.insert(dataToInsert);
    categories.forEach((category) => {
      recurringCashflowCategoriesCollection.insert({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        recurring_cash_flow_id: dataToInsert.id,
        finance_category_id: category.id,
        user_id: userId,
      });
    });
  });

  await customTransaction.commit();
  const promise = await customTransaction.isPersisted.promise;

  return {
    promise,
    data: { ...dataToInsert, categories } as RecurringCashFlow,
  };
};

/**
 * Updates a Recurring Cashflow.
 *
 * @param id - The ID or IDs of the cashflow to update
 * @param item - The item to update
 * @returns Transaction object with isPersisted promise
 */
export const updateRecurringCashflowMutation = (
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
export const deleteRecurringCashflowMutation = (id: string | string[]) => {
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
          .then((cats) => cats.map((cat) => cat))
      : [];

  return {
    ...cashflow,
    categories: categories || [],
  } as RecurringCashFlow;
}
