import { createFileRoute, redirect } from "@tanstack/react-router";
import InitializeProfile from "@/components/Starter/InitializeProfile";

export const Route = createFileRoute("/new-user")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/auth" });
    }
  },
  component: InitializeProfile,
});
