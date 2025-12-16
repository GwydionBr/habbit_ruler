import { Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { IntlExample } from "@/components/examples/IntlExample";
import { db, connector } from "@/db/powersync/db";

export const Route = createFileRoute("/_app/test")({
  component: Test,
  ssr: false,
});

function Test() {
  console.log("PowerSync connected:", db.connected);
  console.log("Connector ready:", connector.ready);
  console.log("Current session:", connector.currentSession);
  return (
    <Stack align="center">
      <IntlExample />
    </Stack>
  );
}
