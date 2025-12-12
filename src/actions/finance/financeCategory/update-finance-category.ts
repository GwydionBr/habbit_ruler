import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Tables, TablesUpdate } from "@/types/db.types";

export const updateFinanceCategory = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { category: TablesUpdate<"finance_category"> }) => data
  )
  .handler(
    async ({ data: { category } }): Promise<Tables<"finance_category">> => {
      const supabase = getSupabaseServerClient();

      if (!category.id) {
        throw new Error("Category id is required");
      }

      const { data, error } = await supabase
        .from("finance_category")
        .update(category)
        .eq("id", category.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  );
