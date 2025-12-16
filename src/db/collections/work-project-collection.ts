import { createCollection, useLiveQuery } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";

// Collection basierend auf der PowerSync-Tabelle 'timer_project'
export const listsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.lists, // Verweise auf die Lists-Tabelle
  })
);

export const useLists = () =>
  useLiveQuery((q) => q.from({ lists: listsCollection }));
