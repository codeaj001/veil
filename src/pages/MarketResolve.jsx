import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { fetchMarketById } from "../lib/api";

export default function MarketResolve() {
  const { id } = useParams();
  const [market, setMarket] = useState(null);

  useEffect(() => {
    fetchMarketById(id).then((data) => {
      if (data) setMarket(data);
    }).catch(console.error);
  }, [id]);

  const activeMarket = market || { question: "Midnight Prediction Market" };

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 pt-8">
      <div className="card p-8 text-center fade-up">
        <span className="text-xs font-mono tracking-widest text-cream-faint">MARKET RESOLVED</span>
        <h1 className="font-display font-bold text-2xl mt-3 mb-6">{activeMarket.question}</h1>
        <div className="inline-flex items-center gap-2 text-yes font-mono font-bold text-2xl border border-yes/40 bg-yes/10 rounded-full px-6 py-2 mb-8">
          <CheckCircle2 size={20} /> YES
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
          <div className="border hairline rounded-xl p-4">
            <div className="text-xs text-cream-faint mb-1">Resolution source</div>
            <div className="text-sm">Bitcoin price oracle</div>
          </div>
          <div className="border hairline rounded-xl p-4">
            <div className="text-xs text-cream-faint mb-1">Resolved</div>
            <div className="text-sm">Jan 1, 2027</div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-volt-glow mb-8">
          <ShieldCheck size={16} /> Proof: Verified on Midnight
        </div>
        <p className="text-xs text-cream-faint">Payouts are settled privately to eligible wallets.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Link to="/portfolio" className="card card-hover p-5 text-center text-sm">View your private result →</Link>
        <Link to="/proofs" className="card card-hover p-5 text-center text-sm">Open proof explorer →</Link>
      </div>
    </div>
  );
}
