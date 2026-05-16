import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toApiError } from "@/lib/api/client";
import { AuthShell, AuthInput, AuthButton } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Atlas" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in to Atlas"
      subtitle="Resume your AI-orchestrated workspaces."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
        <AuthButton loading={loading} type="submit">
          Sign in
        </AuthButton>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
