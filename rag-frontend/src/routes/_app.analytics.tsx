import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Atlas" },
      { name: "description", content: "Operational analytics across projects, AI workers, and team velocity." },
    ],
  }),
  component: makePlaceholder("Analytics", "Operational analytics across projects, AI workers, and team velocity."),
});
