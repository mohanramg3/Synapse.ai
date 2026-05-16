import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Atlas" },
      { name: "description", content: "Telegram, GitHub, Jira, Slack, CI/CD, calendars, and MCP." },
    ],
  }),
  component: makePlaceholder("Integrations", "Telegram, GitHub, Jira, Slack, CI/CD, calendars, and MCP."),
});
