import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { UpdateBankAccount, BankAccount } from "@/types/finance.types";

export const updateBankAccount = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateBankAccount) => data)
  .handler(async ({ data: bankAccount }): Promise<BankAccount> => {
    if (!bankAccount.id) {
      throw new Error("Bank account id is required");
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bank_account")
      .update(bankAccount)
      .eq("id", bankAccount.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
