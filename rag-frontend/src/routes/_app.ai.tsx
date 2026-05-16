import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Sparkles, FileText, Brain, ChevronRight, Loader2 } from "lucide-react";
import { useAIStore } from "@/store/aiStore";
import { useProjectStore } from "@/store/projectStore";
import { PageHeader, Pill, EmptyState, Skeleton } from "@/components/common/Primitives";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({
    meta: [
      { title: "AI Insights — Atlas" },
      {
        name: "description",
        content: "Search project knowledge, analyze requirements, and extract insights using RAG.",
      },
    ],
  }),
  component: AIInsightsPage,
});

function AIInsightsPage() {
  const { projects, fetchProjects } = useProjectStore();
  const { ragSearch, error } = useAIStore();
  const [projectId, setProjectId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<Record<string, any>>>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    const data = await ragSearch(query, projectId || undefined);
    setResults(data);
    setSearching(false);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Intelligence Layer"
        title="AI Insights"
        description="Search across all uploaded project knowledge. Atlas uses RAG (Retrieval-Augmented Generation) to find relevant context from your documents."
      />

      {/* Search Bar */}
      <section className="relative mb-10">
        <form
          onSubmit={handleSearch}
          className="relative flex items-center gap-3 rounded-2xl border border-primary/20 bg-card p-2 shadow-xl shadow-primary/5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50"
        >
          <div className="flex flex-1 items-center gap-3 px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your projects..."
              className="h-12 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="h-10 w-px bg-border mx-2" />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-10 rounded-lg bg-surface px-3 text-sm outline-none hover:bg-surface-elevated transition"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {searching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </button>
        </form>

        {/* Search Suggestions */}
        <div className="mt-4 flex flex-wrap gap-2 px-2">
          <span className="text-xs text-muted-foreground pt-1.5">Try:</span>
          {[
            "What are the main risks in Apollo?",
            "Summarize the technical architecture",
            "Show me project dependencies",
            "What is the timeline for phase 1?",
          ].map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
              }}
              className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {searching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="font-display text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Search Results
                </h2>
                <span className="text-xs text-muted-foreground">{results.length} chunks found</span>
              </div>
              {results.map((res, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-xl border border-border bg-card p-6 transition hover:border-primary/30 hover:bg-surface/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate text-sm font-semibold">
                          {String(res.document_name ?? res.metadata?.filename ?? "Knowledge Chunk")}
                        </h3>
                        <div className="flex items-center gap-2">
                          {res.score !== undefined && (
                            <Pill tone="primary">
                              {Math.round(res.score * 100)}% match
                            </Pill>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-sm leading-relaxed text-foreground/90">
                        {String(res.content ?? res.text ?? "No content available.")}
                      </div>
                      {res.project_name && (
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Brain className="h-3 w-3" />
                          <span>Project: {String(res.project_name)}</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : query && !searching ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <EmptyState
                icon={Search}
                title="No results found"
                description="Try broadening your search or choosing a different project."
              />
            </motion.div>
          ) : (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                <Brain className="h-10 w-10 opacity-50" />
              </div>
              <h2 className="font-display text-xl font-medium">Knowledge Base</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Ask questions about your projects and Atlas will retrieve context from your uploaded documents.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
