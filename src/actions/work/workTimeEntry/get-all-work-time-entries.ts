import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { WorkTimeEntry } from "@/types/work.types";
import { createServerFn } from "@tanstack/react-start";

export const getAllWorkTimeEntries = createServerFn({ method: "GET" }).handler(
  async (): Promise<WorkTimeEntry[]> => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("timer_session").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
);
