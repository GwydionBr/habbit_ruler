import { useBankAccounts } from "@/db/collections/finance/bank-account/bank-account-collection";
import { useFinanceStore } from "@/stores/financeStore";

import { Select } from "@mantine/core";

export default function SelectBankAccount() {
  const { data: bankAccounts } = useBankAccounts();
  const { activeBankAccountId, setActiveBankAccountId } = useFinanceStore();

  return (
    <Select
      data={bankAccounts.map((bankAccount) => ({
        label: bankAccount.title,
        value: bankAccount.id,
      }))}
      styles={{
        input: {
          textAlign: "center",
        },
      }}
      value={activeBankAccountId}
      onChange={(value) => setActiveBankAccountId(value as string)}
    />
  );
}
