import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { InsertBankAccount, BankAccount } from "@/types/finance.types";

export const createBankAccount = createServerFn({ method: "POST" })
  .inputValidator((data: InsertBankAccount) => data)
  .handler(async ({ data }): Promise<BankAccount> => {
    const supabase = getSupabaseServerClient();
    const { data: result, error } = await supabase
      .from("bank_account")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return result;
  });
