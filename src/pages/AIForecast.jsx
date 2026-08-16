import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { fetchMarkets } from "../lib/api";

const factors = [
  { label: "Market momentum", value: 80 },
  { label: "Historical similarity", value: 70 },
  { label: "News sentiment", value: 82 },
  { label: "On-chain indicators", value: 91 },
];

export default function AIForecast() {
  const [marketList, setMarketList] = useState([]);
  const [marketId, setMarketId] = useState("");

  useEffect(() => {
    fetchMarkets().then((data) => {
      if (data && data.length > 0) {
        setMarketList(data);
        setMarketId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const market = marketList.find((m) => m.id === marketId) || marketList[0] || { question: "No Active Markets", yes: 50 };
  const aiYes = Math.min(99, Math.max(1, Math.round((market.yes || 50) + 4.6)));

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="DISCOVER" title="VEIL Intelligence" desc="An analysis layer, not an oracle. The AI never determines outcomes." />

      <select value={marketId} onChange={(e) => setMarketId(e.target.value)} className="bg-ink-850 border hairline rounded-xl px-4 py-3 text-sm mb-8 w-full sm:w-auto outline-none">
        {marketList.map((m) => <option key={m.id} value={m.id}>{m.question}</option>)}
      </select>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 text-center">
          <div className="text-xs text-cream-faint mb-2">AI Forecast — YES</div>
          <div className="font-mono font-bold text-3xl text-volt-glow">{aiYes}%</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-xs text-cream-faint mb-2">Confidence</div>
          <div className="font-mono font-bold text-3xl">82%</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-xs text-cream-faint mb-2">Human Market</div>
          <div className="font-mono font-bold text-3xl text-yes">{market.yes}%</div>
        </div>
      </div>

      <div className="card p-5 mb-8 flex items-center justify-between">
        <span className="text-sm text-cream-faint">AI divergence from market</span>
        <span className={`font-mono font-semibold ${aiYes - market.yes >= 0 ? "text-yes" : "text-no"}`}>
          {aiYes - market.yes >= 0 ? "+" : ""}{(aiYes - market.yes).toFixed(1)}%
        </span>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold mb-5 text-sm">Why?</h3>
        <div className="space-y-4">
          {factors.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-cream-faint">{f.label}</span><span className="font-mono">{f.value}%</span></div>
              <div className="bar-track h-1.5"><div className="bar-yes h-full" style={{ width: `${f.value}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
