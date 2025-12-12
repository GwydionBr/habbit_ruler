import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Tables } from "@/types/db.types";

export const getAllFinanceCategories = createServerFn({
  method: "GET",
}).handler(async (): Promise<Tables<"finance_category">[]> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("finance_category")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
});
