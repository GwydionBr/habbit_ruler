import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
// Import the PowerSync DB and the App Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  workProjectSchema,
  workProjectDeserializationSchema,
  workProjectCategorySchema,
  workProjectCategoryDeserializationSchema,
} from "@/db/collections/work/work-project/work-project-schema";

// Collection based on the PowerSync table 'timer_project'
export const workProjectsCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.timer_project,
    schema: workProjectSchema,
    deserializationSchema: workProjectDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);

export const workProjectCategoriesCollection = createCollection(
  powerSyncCollectionOptions({
    database: db,
    table: AppSchema.props.timer_project_category,
    schema: workProjectCategorySchema,
    deserializationSchema: workProjectCategoryDeserializationSchema,
    onDeserializationError: (error) => {
      console.error(error);
    },
  })
);
