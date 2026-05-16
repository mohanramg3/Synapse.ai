import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authApi } from "@/lib/api/authApi";
import { AuthShell, AuthInput, AuthButton } from "@/components/auth/AuthShell";
import { toApiError } from "@/lib/api/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Atlas" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setDone(true);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a recovery link."
      footer={
        <>
          Remember it?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {done ? (
        <div className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          If an account exists for {email}, you'll receive a reset link shortly.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <AuthButton loading={loading} type="submit">
            Send recovery link
          </AuthButton>
        </form>
      )}
    </AuthShell>
  );
}
