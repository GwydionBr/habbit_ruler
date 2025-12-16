import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { connector } from "@/db/powersync/db";

export type AuthState = {
  session: Session | null;
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
};

/**
 * Client-seitiger Auth-Hook, der offline funktioniert
 * Nutzt die lokale Session von Supabase, die im localStorage gespeichert ist
 */
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    userId: null,
    isLoading: true,
    isInitialized: false,
  });

  useEffect(() => {
    let mounted = true;

    // Initial Session abrufen (funktioniert offline)
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await connector.client.auth.getSession();

        if (mounted) {
          setAuthState({
            session,
            user: session?.user ?? null,
            userId: session?.user?.id ?? null,
            isLoading: false,
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setAuthState({
            session: null,
            user: null,
            userId: null,
            isLoading: false,
            isInitialized: true,
          });
        }
      }
    };

    initAuth();

    // Auth-Änderungen überwachen
    const {
      data: { subscription },
    } = connector.client.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAuthState({
          session,
          user: session?.user ?? null,
          userId: session?.user?.id ?? null,
          isLoading: false,
          isInitialized: true,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return authState;
}

/**
 * Holt die aktuelle Session synchron aus dem localStorage
 * Nützlich für Route Guards, die sofort eine Entscheidung treffen müssen
 */
export function getAuthStateSync(): { userId: string | null } {
  if (typeof window === "undefined") {
    return { userId: null };
  }

  try {
    // Supabase speichert die Session im localStorage unter diesem Key
    const storageKey = `sb-${connector.config.supabaseUrl.split("://")[1].split(".")[0]}-auth-token`;
    const sessionData = localStorage.getItem(storageKey);

    if (!sessionData) {
      return { userId: null };
    }

    const parsed = JSON.parse(sessionData);
    const userId = parsed?.currentSession?.user?.id ?? null;

    return { userId };
  } catch (error) {
    console.error("Error reading auth state from localStorage:", error);
    return { userId: null };
  }
}
