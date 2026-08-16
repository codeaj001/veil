import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { categories } from "../data/mock";
import { Check } from "lucide-react";
import { createMarket } from "../lib/api";

export default function CreateMarket() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Crypto");
  const [liquidity, setLiquidity] = useState(500);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMarket({ question, category, initialLiquidity: liquidity });
      setSubmitted(true);
    } catch (err) {
      console.error("Market creation error:", err);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-24 text-center fade-up">
        <div className="w-14 h-14 rounded-full bg-yes/15 border border-yes/40 flex items-center justify-center mx-auto mb-4">
          <Check size={26} className="text-yes" />
        </div>
        <h2 className="font-display font-semibold text-xl mb-2">Market submitted</h2>
        <p className="text-cream-faint text-sm mb-6">Your market is being deployed and will go live once verified.</p>
        <button onClick={() => navigate("/markets")} className="btn-primary px-6 py-3 text-sm">View Markets</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="CREATE" title="Create Market" desc="Anyone can propose a market. Resolution rules must be verifiable." />
      <form onSubmit={handleSubmit} className="card p-6 lg:p-8 space-y-5">
        <Field label="Question">
          <input required value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Will…?" className="input" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              {categories.filter((c) => c !== "All" && c !== "Trending").map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Resolution date">
            <input type="date" required className="input" />
          </Field>
        </div>
        <Field label="Resolution source">
          <select className="input">
            <option>Chainlink / API oracle</option>
            <option>Official government source</option>
            <option>Sports result API</option>
            <option>Crypto price oracle</option>
            <option>Admin / jury (MVP)</option>
          </select>
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="YES description">
            <textarea rows={3} placeholder="Resolves YES if…" className="input resize-none" />
          </Field>
          <Field label="NO description">
            <textarea rows={3} placeholder="Resolves NO if…" className="input resize-none" />
          </Field>
        </div>
        <Field label="Initial liquidity (tDUST)">
          <input type="number" min={1} value={liquidity} onChange={(e) => setLiquidity(Number(e.target.value) || 0)} className="input" />
        </Field>
        <button className="btn-primary w-full py-3.5 text-sm">Create Market</button>
      </form>

      <style>{`.input{ width:100%; background:#101016; border:1px solid rgba(255,248,231,0.1); border-radius:12px; padding:12px 16px; font-size:14px; outline:none; color:#FFF8E7; } .input:focus{ border-color: rgba(0,71,255,0.6); }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-cream-faint block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
