import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Tables, TablesInsert } from "@/types/db.types";

export const createFinanceCategory = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { category: TablesInsert<"finance_category"> }) => data
  )
  .handler(
    async ({ data: { category } }): Promise<Tables<"finance_category">> => {
      const supabase = getSupabaseServerClient();

      const { data, error } = await supabase
        .from("finance_category")
        .insert(category)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  );
