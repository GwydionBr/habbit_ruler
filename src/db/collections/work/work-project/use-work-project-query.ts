import { WorkProject } from "@/types/work.types";
import { createLiveQueryCollection, eq, useLiveQuery } from "@tanstack/react-db";
import { workProjectsCollection, workProjectCategoriesCollection } from "./work-project-collection";
import { useMemo } from "react";
import { financeCategoriesCollection } from "@/db/collections/finance/finance-category/finance-category-collection";

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
