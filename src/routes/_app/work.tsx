import { createFileRoute } from "@tanstack/react-router";
import { useLists } from "@/db/collections/work-project-collection";
import { Group, Text, Stack } from "@mantine/core";

export const Route = createFileRoute("/_app/work")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  // Führe eine Live-Query aus: alle Projekte abrufen
  const { data: lists } = useLists();

  return (
    <Stack>
      {!lists && <Text>Lade Listen...</Text>}

      {lists && lists.length === 0 && (
        <Text c="dimmed">Keine Listen gefunden</Text>
      )}

      {lists && lists.length > 0 && (
        <ul>
          {lists.map((list) => (
            <Group key={list.id}>
              <Text>{list.name}</Text>
            </Group>
          ))}
        </ul>
      )}
    </Stack>
  );
}
