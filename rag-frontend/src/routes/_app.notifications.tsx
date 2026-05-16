import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Atlas" },
      { name: "description", content: "Telegram alerts, AI signals, task reminders, and project updates." },
    ],
  }),
  component: makePlaceholder("Notifications", "Telegram alerts, AI signals, task reminders, and project updates."),
});
