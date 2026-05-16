import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/automation")({
  head: () => ({
    meta: [
      { title: "Automation Center — Atlas" },
      { name: "description", content: "Triggers, recipes, and AI-powered workflow automation." },
    ],
  }),
  component: makePlaceholder("Automation Center", "Triggers, recipes, and AI-powered workflow automation."),
});
