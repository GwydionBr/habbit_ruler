import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";

import {
  singleCashflowsCollection,
  singleCashflowCategoriesCollection,
} from "./single-cashflow-collection";
import { financeCategoriesCollection } from "@/db/collections/finance/finance-category/finance-category-collection";

import { SingleCashFlow } from "@/types/finance.types";

// Cached Live Query: Single Cashflow → Categories Mapping
const singleCashflowCategoryMappingCollection = createLiveQueryCollection((q) =>
  q
    .from({ relations: singleCashflowCategoriesCollection })
    .innerJoin(
      { category: financeCategoriesCollection },
      ({ relations, category }) =>
        eq(relations.finance_category_id, category.id)
    )
    .select(({ relations, category }) => ({
      cashflowId: relations.single_cash_flow_id,
      category,
    }))
);

export const useSingleCashflows = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const {
    data: cashflows,
    isLoading: isCashflowsLoading,
    isReady: isCashflowsReady,
  } = useLiveQuery((q) =>
    q.from({ singleCashflows: singleCashflowsCollection })
  );
  const {
    data: mappings,
    isLoading: isMappingsLoading,
    isReady: isMappingsReady,
  } = useLiveQuery((q) =>
    q.from({ mappings: singleCashflowCategoryMappingCollection })
  );

  useEffect(() => {
    setIsLoading(isCashflowsLoading || isMappingsLoading);
  }, [isCashflowsLoading, isMappingsLoading]);

  useEffect(() => {
    setIsReady(isCashflowsReady && isMappingsReady);
  }, [isCashflowsReady, isMappingsReady]);

  const cashflowsWithCategories = useMemo((): SingleCashFlow[] => {
    if (!cashflows) return [];

    const categoriesByCashflow = new Map<
      string,
      SingleCashFlow["categories"]
    >();
    mappings?.forEach(({ cashflowId, category }) => {
      if (!categoriesByCashflow.has(cashflowId)) {
        categoriesByCashflow.set(cashflowId, []);
      }
      categoriesByCashflow.get(cashflowId)!.push({
        finance_category: category,
      });
    });

    return cashflows.map((cashflow) => ({
      ...cashflow,
      categories: categoriesByCashflow.get(cashflow.id) || [],
    }));
  }, [cashflows, mappings]);

  return { data: cashflowsWithCategories, isLoading, isReady };
};
