import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Atlas" },
      { name: "description", content: "Workspace, profile, security, and AI configuration." },
    ],
  }),
  component: makePlaceholder("Settings", "Workspace, profile, security, and AI configuration."),
});
