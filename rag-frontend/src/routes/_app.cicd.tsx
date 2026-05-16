import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/cicd")({
  head: () => ({
    meta: [
      { title: "CI/CD Monitoring — Atlas" },
      { name: "description", content: "Build, deploy, and pipeline observability." },
    ],
  }),
  component: makePlaceholder("CI/CD Monitoring", "Build, deploy, and pipeline observability."),
});
