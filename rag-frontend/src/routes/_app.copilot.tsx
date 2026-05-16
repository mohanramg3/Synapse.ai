import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  User, 
  ShieldCheck, 
  FileSearch, 
  AlertCircle,
  MessageSquare,
  ChevronDown
} from "lucide-react";
import { chatApi } from "@/lib/api/chatApi";
import { useProjectStore } from "@/store/projectStore";
import { PageHeader, Skeleton, Pill } from "@/components/common/Primitives";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot — Atlas" },
      { name: "description", content: "Always-on copilot for execution decisions and document analysis." },
    ],
  }),
  component: CopilotPage,
});

type ChatMessage = {
  id?: number;
  role: "user" | "assistant";
  message: string;
  sources?: any[];
  created_at?: string;
};

function CopilotPage() {
  const { projects, fetchProjects, loading: projectsLoading } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(Number(projects[0].id));
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      void loadHistory(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async (pid: number) => {
    try {
      const history = await chatApi.getHistory(pid);
      setMessages(history);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || !selectedProjectId || loading) return;

    const currentQuery = query.trim();
    setQuery("");
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", message: currentQuery };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await chatApi.sendMessage(selectedProjectId, currentQuery);
      const aiMsg: ChatMessage = {
        role: "assistant",
        message: response.answer,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error("Failed to get AI response");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { label: "Summarize project", icon: FileSearch, q: "Give me a high-level summary of this project based on the documents." },
    { label: "Identify risks", icon: AlertCircle, q: "What are the main risks identified in the source material?" },
    { label: "Tech requirements", icon: ShieldCheck, q: "List the technical requirements and architecture constraints." },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <PageHeader
        eyebrow="Intelligence layer"
        title="AI Copilot"
        description="Interact with Atlas's core intelligence to query documents, analyze risks, and refine execution strategy."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedProjectId ?? ""}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                className="h-9 w-48 appearance-none rounded-md border border-border bg-surface pl-3 pr-8 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <button
              onClick={() => selectedProjectId && loadHistory(selectedProjectId)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface transition hover:bg-surface-elevated"
              title="Refresh history"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-6">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-thin">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="max-w-sm">
                <h3 className="text-lg font-semibold">How can I help with your project?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask questions about requirements, risks, or implementation details from your documents.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      setQuery(s.q);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-medium transition hover:border-primary/50 hover:bg-primary/5"
                  >
                    <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-4xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "h-9 w-9 shrink-0 rounded-full flex items-center justify-center border",
                msg.role === "user" 
                  ? "bg-surface border-border text-foreground" 
                  : "bg-primary border-primary text-primary-foreground"
              )}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                "flex-1 min-w-0 space-y-2",
                msg.role === "user" ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "inline-block rounded-2xl px-5 py-3 text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-surface-elevated border border-border"
                )}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                  </div>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Sources:
                    </span>
                    {msg.sources.slice(0, 3).map((s: any, i: number) => (
                      <Pill key={i} tone="muted" className="text-[9px]">
                        Ref {i + 1} ({Math.round((s.score || 0) * 10) / 10})
                      </Pill>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 mr-auto max-w-4xl"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-surface-elevated border border-border rounded-2xl px-5 py-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground italic">Analyzing project context...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-surface p-4">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Atlas about requirements, architecture, or risks..."
                className="w-full bg-card border border-border rounded-xl py-4 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query.length > 0 && (
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">↵</span>
                  </kbd>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className={cn(
                "flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:grayscale",
                loading && "bg-muted"
              )}
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <MessageSquare className="h-3 w-3" /> Atlas AI can make mistakes. Always verify critical execution decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
