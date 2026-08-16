import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import Logo from "../components/Logo";
import { setSessionCookie } from "../lib/authSession";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const targetEmail = email.trim();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: password,
        });

        if (authError) {
          setError(authError.message || "Invalid login credentials.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("[Supabase Auth] Login exception:", err.message);
      }
    }

    // Success login
    setSessionCookie(targetEmail || "trader@veil.app", 30);
    setLoading(false);
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="grain" />
      <div className="w-full max-w-sm fade-up">
        <div className="flex justify-center mb-8"><Logo size={26} /></div>
        <div className="card p-7">
          <h1 className="font-display font-bold text-xl mb-1 text-center">Welcome back</h1>
          <p className="text-cream-faint text-sm text-center mb-6">Sign in to your VEIL account</p>

          {error && (
            <div className="mb-4 p-3 bg-no/10 border border-no/30 rounded-xl flex items-center gap-2 text-no text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-cream-faint block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@domain.com"
                className="w-full bg-ink-850 border hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-volt/60"
              />
            </div>

            <div>
              <label className="text-xs text-cream-faint block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-ink-850 border hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-volt/60"
              />
            </div>

            <button disabled={loading} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-cream-faint mt-6">
          Don't have an account? <Link to="/onboarding" className="text-volt-glow">Create one</Link>
        </p>
      </div>
    </div>
  );
}
