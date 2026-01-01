import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  singleCashflowDeserializationSchema,
  singleCashflowSchema,
  singleCashflowCategorySchema,
  singleCashflowCategoryDeserializationSchema,
} from "@/db/collections/finance/single-cashflow/single-cashflow-schema";

// Collection basierend auf der PowerSync-Tabelle 'single_cash_flow'
export const singleCashflowsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.single_cash_flow,
    schema: singleCashflowSchema,
    deserializationSchema: singleCashflowDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

// Collection basierend auf der PowerSync-Tabelle 'single_cash_flow_category'
export const singleCashflowCategoriesCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.single_cash_flow_category,
    schema: singleCashflowCategorySchema,
    deserializationSchema: singleCashflowCategoryDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

