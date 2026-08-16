import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, Eye, ShieldCheck, ChevronRight } from "lucide-react";
import Logo from "../components/Logo";
import ProbabilityBar from "../components/ProbabilityBar";
import { fetchMarkets } from "../lib/api";

export default function Landing() {
  const [topMarket, setTopMarket] = useState(null);

  useEffect(() => {
    fetchMarkets().then((list) => {
      if (list && list.length > 0) setTopMarket(list[0]);
    }).catch(console.error);
  }, []);

  const btc = topMarket || {
    question: "Midnight Network Prediction Market",
    yes: 50.0,
    volume: 0,
    traders: 0,
    category: "PREPROD"
  };
  return (
    <div className="min-h-screen">
      <div className="grain" />
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-6 max-w-7xl mx-auto">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-cream-faint">
          <Link to="/markets" className="hover:text-cream">Markets</Link>
          <Link to="/discover/ai-forecasts" className="hover:text-cream">Discover</Link>
          <Link to="/leaderboard" className="hover:text-cream">Leaderboard</Link>
          <Link to="/privacy" className="hover:text-cream">Privacy Center</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-cream-faint hover:text-cream hidden sm:block">Sign in</Link>
          <Link to="/onboarding" className="btn-primary text-sm px-5 py-2.5">Create Account</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 lg:pt-16 pb-24 grid lg:grid-cols-2 gap-14 items-center">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-volt-glow border border-volt/30 bg-volt/10 rounded-full px-3 py-1 mb-6">
            <Lock size={11} /> Powered by Midnight
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-cream mb-6">
            The future is uncertain.<br />
            <span className="text-volt-glow">Your position doesn't have to be public.</span>
          </h1>
          <p className="text-cream-faint text-base lg:text-lg max-w-lg mb-8 leading-relaxed">
            Trade your predictions on real-world events while keeping your positions, capital and conviction private.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/markets" className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
              Explore Markets <ArrowRight size={15} />
            </Link>
            <Link to="/onboarding" className="btn-ghost px-6 py-3 text-sm">Create Account</Link>
          </div>
        </div>

        <div className="relative fade-up" style={{ animationDelay: "120ms" }}>
          <div className="absolute -inset-6 bg-volt/20 blur-3xl rounded-full" />
          <div className="relative card p-6 max-w-sm ml-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono tracking-widest text-cream-faint uppercase">Crypto · Live</span>
              <span className="w-2 h-2 rounded-full bg-yes tick" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-4">{btc.question}</h3>
            <div className="flex items-end gap-3 mb-3">
              <span className="font-mono font-bold text-4xl text-yes">{btc.yes}%</span>
              <span className="text-cream-faint text-sm mb-1.5">YES</span>
            </div>
            <ProbabilityBar yes={btc.yes} size="lg" />
            <div className="flex justify-between text-xs text-cream-faint mt-4 font-mono">
              <span>${btc.volume.toLocaleString()} volume</span>
              <span>{btc.traders.toLocaleString()} traders</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6 text-[11px] font-mono text-cream-faint">
            <span className="chip active px-3 py-1">PUBLIC MARKET</span>
            <ChevronRight size={13} />
            <span className="chip px-3 py-1 border-volt/40">PRIVATE POSITION</span>
            <ChevronRight size={13} />
            <span className="chip px-3 py-1">ZK VERIFICATION</span>
          </div>
        </div>
      </section>

      {/* Why VEIL */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 border-t hairline">
        <div className="glow-line w-24 mb-6" />
        <h2 className="font-display font-bold text-2xl lg:text-3xl mb-10">Why VEIL?</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Eye, title: "Public Markets", desc: "See what the world believes. Probability, volume and liquidity, live." },
            { icon: Lock, title: "Private Positions", desc: "Keep your capital and strategy private, always, by default." },
            { icon: ShieldCheck, title: "Verifiable Outcomes", desc: "Midnight proves the rules were followed without exposing sensitive information." },
          ].map((c) => (
            <div key={c.title} className="card card-hover p-6">
              <c.icon size={22} className="text-volt-glow mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">{c.title}</h3>
              <p className="text-sm text-cream-faint leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 border-t hairline">
        <h2 className="font-display font-bold text-2xl lg:text-3xl mb-10">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            ["01", "Choose a market", "Browse public markets across crypto, politics, sports, Africa and more."],
            ["02", "Make your prediction", "Take a YES or NO position with any amount."],
            ["03", "Your position stays private", "Midnight generates a proof, not a public record."],
            ["04", "Receive your result", "Payouts settle privately to your wallet."],
          ].map(([n, t, d]) => (
            <div key={n} className="relative">
              <div className="font-mono text-volt-glow/60 text-3xl font-bold mb-3">{n}</div>
              <h4 className="font-display font-semibold mb-2">{t}</h4>
              <p className="text-sm text-cream-faint leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy explanation */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 border-t hairline">
        <h2 className="font-display font-bold text-2xl lg:text-3xl mb-2 max-w-xl">Everyone sees the market. Nobody sees your position.</h2>
        <p className="text-cream-faint mb-10">Powered by Midnight's programmable privacy.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="card p-6">
            <div className="text-xs font-mono tracking-widest text-cream-faint mb-4">PUBLIC</div>
            {["Market probability", "Volume", "Liquidity", "Resolution"].map((x) => (
              <div key={x} className="flex items-center justify-between py-2.5 border-b hairline last:border-0 text-sm">
                {x} <span className="text-yes">✓</span>
              </div>
            ))}
          </div>
          <div className="card p-6 border-volt/30">
            <div className="text-xs font-mono tracking-widest text-volt-glow mb-4">PRIVATE</div>
            {["Your position", "Your balance", "Your strategy", "Your conviction", "Your P&L"].map((x) => (
              <div key={x} className="flex items-center justify-between py-2.5 border-b hairline last:border-0 text-sm">
                {x} <Lock size={13} className="text-volt-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 border-t hairline text-center">
        <h2 className="font-display font-bold text-3xl lg:text-4xl mb-4">VEIL doesn't hide the market.</h2>
        <p className="text-cream-faint text-lg mb-8">It hides what shouldn't be public.</p>
        <Link to="/onboarding" className="btn-primary px-8 py-3.5 text-sm inline-flex items-center gap-2">
          Create Account <ArrowRight size={15} />
        </Link>
      </section>

      <footer className="border-t hairline py-8 text-center text-xs text-cream-faint font-mono">
        VEIL — Predict openly. Position privately. · Powered by Midnight
      </footer>
    </div>
  );
}
