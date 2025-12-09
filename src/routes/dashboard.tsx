// src/routes/dashboard.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Container, Title, Text, Stack, Button, Group } from "@mantine/core";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/tanstack-react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";

const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { userId } = await auth();
  return { userId };
});

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { userId } = await checkAuth();
    if (!userId) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={1}>Dashboard</Title>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </Group>

        <SignedIn>
          <Text size="lg" c="dimmed">
            Welcome to your Habbit Ruler dashboard! Start tracking your habits
            and building a better routine.
          </Text>
        </SignedIn>

        <SignedOut>
          <Text size="lg" c="dimmed">
            Please sign in to access your dashboard.
          </Text>
        </SignedOut>
      </Stack>
    </Container>
  );
}
