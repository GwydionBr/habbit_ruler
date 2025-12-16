import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "./supabaseServerClient";
import type { Session } from "@supabase/supabase-js";

/**
 * Server-Funktion zum Abrufen der aktuellen Supabase Session
 * Wird vom PowerSync Connector verwendet, um die Session vom Server zum Client zu übertragen
 */
export const fetchSupabaseSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<Session | null> => {
    const supabase = getSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  }
);
