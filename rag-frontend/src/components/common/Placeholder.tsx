import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/common/Primitives";
import { Construction } from "lucide-react";

function makePlaceholder(title: string, description: string) {
  return function Placeholder() {
    return (
      <div>
        <PageHeader eyebrow="Coming soon" title={title} description={description} />
        <EmptyState
          icon={Construction}
          title="Section under construction"
          description="The frontend architecture is ready. This module will activate once the backend endpoint is wired in."
        />
      </div>
    );
  };
}

export { makePlaceholder };
