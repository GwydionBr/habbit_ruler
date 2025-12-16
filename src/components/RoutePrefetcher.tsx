import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Liste der kritischen Routes, die vorgeladen werden sollen
 * Diese sind dann offline verfügbar
 */
const CRITICAL_ROUTES = [
  "/dashboard",
  "/work",
  "/finance",
  "/calendar",
  "/habbit-tracker",
];

/**
 * Komponente die kritische Routes im Hintergrund vorlädt
 * Macht diese Routes offline-verfügbar
 */
export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Nur im Browser ausführen
    if (typeof window === "undefined") {
      return;
    }

    // Warte bis App geladen ist, dann prefetch im Hintergrund
    const prefetchRoutes = async () => {
      // Warte 2 Sekunden nach Initial Load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("🚀 Prefetching critical routes for offline availability...");

      for (const route of CRITICAL_ROUTES) {
        try {
          // Prefetch Route (lädt JS Bundles)
          await router.preloadRoute({ to: route });

          console.log(`✓ Prefetched: ${route}`);
        } catch (error) {
          console.warn(`✗ Failed to prefetch ${route}:`, error);
        }

        // Kleine Pause zwischen Prefetches um Browser nicht zu überlasten
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log(
        "✅ All critical routes prefetched and ready for offline use"
      );
    };

    // Nur prefetchen wenn online
    if (navigator.onLine) {
      prefetchRoutes();
    } else {
      console.log(
        "📡 Offline - skipping route prefetch, will retry when online"
      );
    }

    // Wenn App wieder online kommt, prefetche fehlende Routes
    const handleOnline = () => {
      console.log("📡 Back online - starting route prefetch");
      prefetchRoutes();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [router]);

  return null; // Keine UI
}
