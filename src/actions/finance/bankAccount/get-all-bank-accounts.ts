import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Tables } from "@/types/db.types";

export const getAllBankAccounts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Tables<"bank_account">[]> => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bank_account")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
);
