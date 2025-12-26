import {
  createCollection,
  createLiveQueryCollection,
  useLiveQuery,
} from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { eq } from "@tanstack/db";
import { useMemo } from "react";
import { WorkProject } from "@/types/work.types";
import { financeCategoriesCollection } from "@/db/collections/finance/finance-category/finance-category-collection";
// Importiere deine PowerSync-DB und das App-Schema
import { db } from "@/db/powersync/db";
import { AppSchema } from "@/db/powersync/schema";
import {
  workProjectSchema,
  workProjectDeserializationSchema,
  workProjectCategorySchema,
  workProjectCategoryDeserializationSchema,
} from "@/db/collections/work/work-project/work-project-schema";

// Collection basierend auf der PowerSync-Tabelle 'timer_project'
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

// Cached Live Query: Project → Categories Mapping
const projectCategoryMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: workProjectCategoriesCollection })
    .innerJoin(
      { category: financeCategoriesCollection },
      ({ relations, category }) =>
        eq(relations.finance_category_id, category.id)
    )
    .select(({ relations, category }) => ({
      projectId: relations.timer_project_id,
      category,
    }))
);

export const useWorkProjects = () => {
  const { data: projects } = useLiveQuery((q) =>
    q.from({ workProjects: workProjectsCollection })
  );
  const { data: mappings } = useLiveQuery((q) =>
    q.from({ mappings: projectCategoryMappingCollection })
  );

  return useMemo((): WorkProject[] => {
    if (!projects) return [];

    const categoriesByProject = new Map<string, WorkProject["categories"]>();
    mappings?.forEach(({ projectId, category }) => {
      if (!categoriesByProject.has(projectId)) {
        categoriesByProject.set(projectId, []);
      }
      categoriesByProject.get(projectId)!.push(category);
    });

    return projects.map((project) => ({
      ...project,
      categories: categoriesByProject.get(project.id) || [],
    }));
  }, [projects, mappings]);
};

export const useWorkProjectById = (projectId: string) => {
  const { data: project } = useLiveQuery((q) =>
    q
      .from({ workProjects: workProjectsCollection })
      .where(({ workProjects }) => eq(workProjects.id, projectId))
      .findOne()
  );

  const { data: mappings } = useLiveQuery((q) =>
    q
      .from({ mappings: projectCategoryMappingCollection })
      .where(({ mappings }) => eq(mappings.projectId, projectId))
  );

  return useMemo((): WorkProject | undefined => {
    if (!project) return undefined;

    return {
      ...project,
      categories: mappings?.map(({ category }) => category) || [],
    };
  }, [project, mappings]);
};

/**
 * Synchronisiert die Many-to-Many Relations zwischen Project und Finance Categories
 * Löscht alte Relations und erstellt neue basierend auf categoryIds
 */
export async function syncProjectCategories(
  projectId: string,
  categoryIds: string[],
  userId: string
): Promise<void> {
  // 1. Hole alle bestehenden Relations für dieses Projekt
  const existingRelations = await db.getAll<{
    id: string;
    finance_category_id: string;
  }>(
    "SELECT id, finance_category_id FROM timer_project_category WHERE timer_project_id = ?",
    [projectId]
  );

  const existingCategoryIds = existingRelations.map(
    (r) => r.finance_category_id
  );
  const newCategoryIds = categoryIds || [];

  // 2. Finde Relations zum Löschen (in existing aber nicht in new)
  const relationsToDelete = existingRelations.filter(
    (relation) => !newCategoryIds.includes(relation.finance_category_id)
  );

  // 3. Finde Categories zum Hinzufügen (in new aber nicht in existing)
  const categoriesToAdd = newCategoryIds.filter(
    (categoryId) => !existingCategoryIds.includes(categoryId)
  );

  // 4. Lösche alte Relations
  const deletePromises = relationsToDelete.map((relation) =>
    workProjectCategoriesCollection.delete(relation.id)
  );

  // 5. Erstelle neue Relations
  const insertPromises = categoriesToAdd.map((categoryId) =>
    workProjectCategoriesCollection.insert({
      id: crypto.randomUUID(),
      timer_project_id: projectId,
      finance_category_id: categoryId,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  );

  // 6. Warte auf alle Transaktionen
  const allTransactions = [...deletePromises, ...insertPromises];
  await Promise.all(allTransactions.map((tx) => tx.isPersisted.promise));
}

/**
 * Lädt ein vollständiges WorkProject mit allen Categories
 */
export async function getWorkProjectWithCategories(
  projectId: string
): Promise<WorkProject | undefined> {
  // Hole das Projekt
  const project = await db.getOptional<Omit<WorkProject, "categories">>(
    "SELECT * FROM timer_project WHERE id = ?",
    [projectId]
  );

  if (!project) return undefined;

  // Hole die zugehörigen Categories
  const categoryRelations = await db.getAll<{
    finance_category_id: string;
  }>(
    "SELECT finance_category_id FROM timer_project_category WHERE timer_project_id = ?",
    [projectId]
  );

  const categoryIds = categoryRelations.map((r) => r.finance_category_id);

  // Hole die vollständigen Category-Daten
  const categories =
    categoryIds.length > 0
      ? await db.getAll(
          `SELECT * FROM finance_category WHERE id IN (${categoryIds.map(() => "?").join(",")})`,
          categoryIds
        )
      : [];

  return {
    ...project,
    categories: categories || [],
  } as WorkProject;
}
