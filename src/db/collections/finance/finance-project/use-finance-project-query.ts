import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  financeProjectsCollection,
  financeProjectCategoriesCollection,
} from "./finance-project-collection";
import { financeCategoriesCollection } from "@/db/collections/finance/finance-category/finance-category-collection";

import { FinanceProject } from "@/types/finance.types";

// Cached Live Query: Finance Project → Categories Mapping
const financeProjectCategoryMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: financeProjectCategoriesCollection })
    .innerJoin(
      { category: financeCategoriesCollection },
      ({ relations, category }) =>
        eq(relations.finance_category_id, category.id)
    )
    .select(({ relations, category }) => ({
      projectId: relations.finance_project_id,
      category,
    }))
);

export const useFinanceProjects = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const {
    data: projects,
    isLoading: isProjectsLoading,
    isReady: isProjectsReady,
  } = useLiveQuery((q) =>
    q.from({ financeProjects: financeProjectsCollection })
  );
  const {
    data: mappings,
    isLoading: isMappingsLoading,
    isReady: isMappingsReady,
  } = useLiveQuery((q) =>
    q.from({ mappings: financeProjectCategoryMappingCollection })
  );

  useEffect(() => {
    setIsLoading(isProjectsLoading || isMappingsLoading);
  }, [isProjectsLoading, isMappingsLoading]);

  useEffect(() => {
    setIsReady(isProjectsReady && isMappingsReady);
  }, [isProjectsReady, isMappingsReady]);

  const projectsWithCategories = useMemo((): FinanceProject[] => {
    if (!projects) return [];

    const categoriesByProject = new Map<string, FinanceProject["categories"]>();
    mappings?.forEach(({ projectId, category }) => {
      if (!categoriesByProject.has(projectId)) {
        categoriesByProject.set(projectId, []);
      }
      categoriesByProject.get(projectId)!.push({
        finance_category: category,
      });
    });

    return projects.map((project) => ({
      ...project,
      categories: categoriesByProject.get(project.id) || [],
      adjustments: [],
      finance_client: null,
    }));
  }, [projects, mappings]);

  return { data: projectsWithCategories, isLoading, isReady };
};
