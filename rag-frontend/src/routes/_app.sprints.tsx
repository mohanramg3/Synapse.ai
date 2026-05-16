import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/sprints")({
  head: () => ({
    meta: [
      { title: "Sprint Planning — Atlas" },
      { name: "description", content: "AI-proposed sprints from generated modules and team capacity." },
    ],
  }),
  component: makePlaceholder("Sprint Planning", "AI-proposed sprints from generated modules and team capacity."),
});
