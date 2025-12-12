import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export const deleteBankAccounts = createServerFn({ method: "POST" })
  .inputValidator((data: string[]) => data)
  .handler(async ({ data: ids }): Promise<boolean> => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("bank_account")
      .delete()
      .in("id", ids);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  });
