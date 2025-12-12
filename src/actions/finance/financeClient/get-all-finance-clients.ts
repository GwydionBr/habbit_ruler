import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Tables } from "@/types/db.types";

export const getAllFinanceClients = createServerFn({ method: "GET" }).handler(
  async (): Promise<Tables<"finance_client">[]> => {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("finance_client")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
);
