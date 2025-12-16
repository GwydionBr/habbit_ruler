import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { useIntl } from "@/hooks/useIntl";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconHome, IconRefresh, IconArrowLeft } from "@tabler/icons-react";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const { getLocalizedText } = useIntl();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

  return (
    <Container size="md" py="xl">
      <Stack
        align="center"
        gap="xl"
        style={{ minHeight: "60vh" }}
        justify="center"
      >
        <Paper shadow="md" p="xl" radius="md" withBorder w="100%">
          <Stack gap="lg">
            <Stack gap="xs" align="center">
              <Title order={2} c="red">
                {getLocalizedText(
                  "Ein Fehler ist aufgetreten",
                  "An error occurred"
                )}
              </Title>
              <Text size="sm" c="dimmed">
                {getLocalizedText(
                  "Es tut uns leid, aber etwas ist schiefgelaufen.",
                  "We're sorry, but something went wrong."
                )}
              </Text>
            </Stack>

            <ErrorComponent error={error} />

            <Group justify="center" gap="sm" mt="md">
              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={() => {
                  router.invalidate();
                }}
                variant="filled"
              >
                {getLocalizedText("Erneut versuchen", "Try again")}
              </Button>
              {isRoot ? (
                <Button
                  component={Link}
                  to="/"
                  leftSection={<IconHome size={16} />}
                  variant="light"
                >
                  {getLocalizedText("Zur Startseite", "Go to the start page")}
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.back();
                  }}
                  variant="light"
                >
                  {getLocalizedText("Zurück", "Go back")}
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
