import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Tables, TablesUpdate } from "@/types/db.types";

export const updateFinanceClient = createServerFn({ method: "POST" })
  .inputValidator((data: TablesUpdate<"finance_client">) => data)
  .handler(async ({ data: client }): Promise<Tables<"finance_client">> => {
    if (!client.id) {
      throw new Error("Client id is required");
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("finance_client")
      .update(client)
      .eq("id", client.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });
