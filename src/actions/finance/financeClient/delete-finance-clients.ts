import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export const deleteFinanceClients = createServerFn({ method: "POST" })
  .inputValidator((data: string[]) => data)
  .handler(async ({ data: ids }): Promise<boolean> => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("finance_client")
      .delete()
      .in("id", ids);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  });
