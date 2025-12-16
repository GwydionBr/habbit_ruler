import { useEffect, useState } from "react";
import { Notification } from "@mantine/core";
import { IconWifiOff, IconWifi } from "@tabler/icons-react";

/**
 * Zeigt dem User an, wenn die App offline ist
 * Nützlich, um zu verstehen warum bestimmte Features evtl. nicht funktionieren
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      // Nach 3 Sekunden ausblenden
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 10000,
        maxWidth: 400,
      }}
    >
      {isOnline ? (
        <Notification
          icon={<IconWifi size="1.2rem" />}
          color="teal"
          title="Wieder online"
          onClose={() => setShowNotification(false)}
        >
          Die Verbindung wurde wiederhergestellt.
        </Notification>
      ) : (
        <Notification
          icon={<IconWifiOff size="1.2rem" />}
          color="orange"
          title="Offline-Modus"
          withCloseButton={false}
        >
          Du bist offline. Die App funktioniert weiterhin mit lokalen Daten.
        </Notification>
      )}
    </div>
  );
}
