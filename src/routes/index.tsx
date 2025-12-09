// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Center, Title } from "@mantine/core";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Center>
      <Title order={1}>Habbit Ruler</Title>
      <SignedIn>
        <p>You are signed in</p>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <p>You are signed out</p>
        <SignInButton />
      </SignedOut>
    </Center>
  );
}
