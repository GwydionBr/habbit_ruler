import { useFinanceStore } from "@/stores/financeStore";

import FinanceOverviewTab from "@/components/Finances/Overview/FinanceOverviewTab";
import FinanceProjectTab from "@/components/Finances/Project/FinanceProjectsTab";
import { FinanceTab } from "@/types/finance.types";

export default function FinanceTabs() {
  const { activeTab } = useFinanceStore();

  switch (activeTab) {
    case FinanceTab.Analysis:
      return <FinanceOverviewTab />;
    case FinanceTab.Projects:
      return <FinanceProjectTab />;
  }
}
