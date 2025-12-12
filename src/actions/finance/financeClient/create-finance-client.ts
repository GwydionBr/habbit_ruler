import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Tables, TablesInsert } from "@/types/db.types";

export const createFinanceClient = createServerFn({ method: "POST" })
  .inputValidator((data: TablesInsert<"finance_client">) => data)
  .handler(async ({ data: client }): Promise<Tables<"finance_client">> => {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("finance_client")
      .insert({ ...client })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
