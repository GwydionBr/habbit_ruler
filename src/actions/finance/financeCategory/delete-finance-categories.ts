import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export const deleteFinanceCategories = createServerFn({ method: "POST" })
  .inputValidator((data: { ids: string[] }) => data)
  .handler(async ({ data: { ids } }): Promise<boolean> => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("finance_category")
      .delete()
      .in("id", ids);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  });
