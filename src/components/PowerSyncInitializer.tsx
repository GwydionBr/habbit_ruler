import { useEffect, useState } from "react";

/**
 * Komponente zur Initialisierung des PowerSync Connectors
 * Holt die Session vom Server und synchronisiert sie mit dem Client
 *
 * WICHTIG: PowerSync ist eine Client-only Bibliothek und darf nicht auf dem Server geladen werden
 */
export function PowerSyncInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // PowerSync nur auf dem Client initialisieren
    const initializeConnector = async () => {
      if (isInitialized || typeof window === "undefined") {
        return;
      }

      try {
        // Lazy load PowerSync connector nur auf dem Client
        const { connector } = await import("@/db/powersync/db");
        await connector.init();
        setIsInitialized(true);
        console.log("PowerSync Connector initialized successfully");
      } catch (error) {
        console.error("Failed to initialize PowerSync Connector:", error);
      }
    };

    initializeConnector();
  }, [isInitialized]);

  return null; // Diese Komponente rendert nichts
}
