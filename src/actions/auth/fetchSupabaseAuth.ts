import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export const fetchSupabaseAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  }
);
