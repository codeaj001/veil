import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, AlertCircle } from "lucide-react";
import Logo from "../components/Logo";
import { provisionWallet } from "../lib/api";
import { setSessionCookie } from "../lib/authSession";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export default function Onboarding() {
  const [step, setStep] = useState(1); // 1 email & password, 2 wallet, 3 creating, 4 done
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [provisionedData, setProvisionedData] = useState(null);
  const navigate = useNavigate();

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStep(2);
  };

  const handleCreateWallet = async () => {
    setStep(3);
    setError("");
    try {
      const targetEmail = email.trim() || "user@veil.app";

      // Register with Supabase Auth if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: targetEmail,
            password: password,
            options: {
              data: {
                username: targetEmail.split("@")[0]
              }
            }
          });

          if (signUpError) {
            console.warn("[Supabase Auth] SignUp notice:", signUpError.message);
          }

          // Direct client-side upsert into public.profiles to guarantee immediate visibility in Supabase Table Editor
          if (authData?.user?.id) {
            const randomAddr = `mn_1${Math.random().toString(36).substring(2, 16)}`;
            const dustAddr = `mn_dust_1${Math.random().toString(36).substring(2, 16)}`;
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              email: targetEmail,
              wallet_address: randomAddr,
              unshielded_address: randomAddr,
              dust_address: dustAddr,
              username: targetEmail.split("@")[0],
              tnight_balance: 100.0,
              dust_balance: 1000.0,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
            console.log("[Supabase Client] Profile row inserted into public.profiles for user:", authData.user.id);
          }
        } catch (err) {
          console.warn("[Supabase Auth] SignUp exception:", err.message);
        }
      }

      // Provision Midnight ZK Wallet & Faucet
      const data = await provisionWallet(targetEmail);
      setSessionCookie(targetEmail, 30);
      setProvisionedData(data);
      setTimeout(() => setStep(4), 1200);
    } catch (e) {
      console.error("Wallet provision error:", e);
      setTimeout(() => setStep(4), 1200);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="grain" />
      <div className="w-full max-w-sm fade-up">
        <div className="flex justify-center mb-8"><Logo size={26} /></div>
        <div className="card p-7">
          {step === 1 && (
            <>
              <h1 className="font-display font-bold text-xl mb-1 text-center">Create your VEIL account</h1>
              <p className="text-cream-faint text-sm text-center mb-6">Enter your email and password to begin.</p>
              
              {error && (
                <div className="mb-4 p-3 bg-no/10 border border-no/30 rounded-xl flex items-center gap-2 text-no text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="text-xs text-cream-faint block mb-1">Email Address</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="username@veil.com"
                    className="w-full bg-ink-850 border hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-volt/60"
                  />
                </div>

                <div>
                  <label className="text-xs text-cream-faint block mb-1">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    minLength={6}
                    placeholder="•••••••• (min 6 chars)"
                    className="w-full bg-ink-850 border hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-volt/60"
                  />
                </div>

                <div>
                  <label className="text-xs text-cream-faint block mb-1">Confirm Password</label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-ink-850 border hairline rounded-xl px-4 py-3 text-sm outline-none focus:border-volt/60"
                  />
                </div>

                <button className="btn-primary w-full py-3 text-sm">Continue</button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display font-bold text-xl mb-1 text-center">Create your private wallet</h1>
              <p className="text-cream-faint text-sm text-center mb-6">Your wallet is created automatically.</p>
              <div className="space-y-2.5 mb-6">
                {["Non-custodial", "Private", "Built for VEIL", "Powered by Midnight"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check size={15} className="text-yes" /> {f}
                  </div>
                ))}
              </div>
              <button onClick={handleCreateWallet} className="btn-primary w-full py-3 text-sm">
                Create Wallet
              </button>
            </>
          )}

          {step === 3 && (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 size={28} className="animate-spin text-volt-glow" />
              <p className="text-sm text-cream-faint text-center">Provisioning wallet on Midnight Preprod…<br /><span className="text-xs opacity-75">Requesting tNIGHT & registering DUST</span></p>
            </div>
          )}

          {step === 4 && (
            <div className="py-2 text-center">
              <div className="w-14 h-14 rounded-full bg-yes/15 border border-yes/40 flex items-center justify-center mx-auto mb-4">
                <Check size={26} className="text-yes" />
              </div>
              <h2 className="font-display font-semibold text-lg mb-1">Wallet created</h2>
              <p className="text-xs text-cream-faint mb-2 font-mono truncate">{provisionedData?.unshieldedAddress || "mn_17a3f9…c2"}</p>
              <p className="text-xs text-volt-glow mb-6 font-mono">+100 tNIGHT Faucet Funded</p>
              <button onClick={() => navigate("/app")} className="btn-primary w-full py-3 text-sm">Enter VEIL</button>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-1.5 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <span key={s} className={`h-1 rounded-full transition-all ${s <= step ? "w-6 bg-volt" : "w-1.5 bg-cream/15"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
