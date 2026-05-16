import { createFileRoute } from "@tanstack/react-router";
import { makePlaceholder } from "@/components/common/Placeholder";

export const Route = createFileRoute("/_app/knowledge-graph")({
  head: () => ({
    meta: [
      { title: "Knowledge Graph — Atlas" },
      { name: "description", content: "Cross-project knowledge graph from documents, modules, and decisions." },
    ],
  }),
  component: makePlaceholder("Knowledge Graph", "Cross-project knowledge graph from documents, modules, and decisions."),
});
