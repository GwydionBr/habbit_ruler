import { useEffect, useRef } from "react";

/**
 * Komponente zur Initialisierung des PowerSync Connectors
 * Holt die Session vom Server und synchronisiert sie mit dem Client
 *
 * WICHTIG: PowerSync ist eine Client-only Bibliothek und darf nicht auf dem Server geladen werden
 */
export function PowerSyncInitializer() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // PowerSync nur auf dem Client initialisieren
    const initializeConnector = async () => {
      try {
        // Lazy load PowerSync connector nur auf dem Client
        const { connector, db } = await import("@/db/powersync/db");

        // Check if we have a session before initializing
        const session = await connector.getCurrentSession();

        if (!session) {
          // No session yet, will be initialized when session becomes available
          return;
        }

        // Initialize connector (will check ready state internally)
        await connector.init();

        // Reconnect database if it was disconnected (e.g., after logout)
        // After disconnectAndClear, we need to reconnect
        try {
          db.connect(connector);
        } catch (error) {
          // Connection might already be established, which is fine
          console.debug("Database connection check:", error);
        }

        initializedRef.current = true;
        console.log("PowerSync Connector initialized successfully");
      } catch (error) {
        console.error("Failed to initialize PowerSync Connector:", error);
        initializedRef.current = false;
      }
    };

    // Check for session and initialize
    // Also set up polling to check for session changes after logout/login
    const checkAndInitialize = async () => {
      const { connector } = await import("@/db/powersync/db");
      const session = await connector.getCurrentSession();

      if (session && !initializedRef.current) {
        console.log("Session detected, initializing PowerSync...");
        await initializeConnector();
      } else if (!session && initializedRef.current) {
        // Session was lost (logout), reset initialization state
        initializedRef.current = false;
      }
    };

    // Try initial initialization
    checkAndInitialize();

    // Poll for session changes (e.g., after logout/login)
    // This is a fallback since we can't easily hook into the connector's listeners
    const intervalId = setInterval(checkAndInitialize, 2000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty deps - we want this to run once and handle reinitialization via polling

  return null; // Diese Komponente rendert nichts
}
