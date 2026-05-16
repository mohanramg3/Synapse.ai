import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/team")({
  head: () => ({
    meta: [
      { title: "Team — Atlas" },
      { name: "description", content: "Members, roles, workload, contribution, and project assignments." },
    ],
  }),
  component: makePlaceholder("Team", "Members, roles, workload, contribution, and project assignments."),
});
