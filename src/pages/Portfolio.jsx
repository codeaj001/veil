import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import PageHeader from "../components/PageHeader";
import Locked from "../components/Locked";
import { fmtSigned } from "../lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { fetchPortfolio } from "../lib/api";

export default function Portfolio() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchPortfolio().then(setData).catch(console.error);
  }, []);

  const positions = data?.positions || [];
  const history = data?.history || [];
  const wallet = data?.wallet;
  const categoryPerformance = data?.categories || [];

  const totalValue = wallet ? (wallet.balance || 1000).toLocaleString('en-US') : "1,000";
  const totalPnl = positions.reduce((acc, p) => acc + (Number(p.pnl) || 0), 0);
  const winCount = positions.filter((p) => (Number(p.pnl) || 0) >= 0).length;
  const winRate = positions.length > 0 ? ((winCount / positions.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="YOUR VEIL" title="Your Portfolio" right={<Locked />} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5"><div className="text-xs text-cream-faint mb-2">Total Balance (tDUST)</div><div className="font-mono font-bold text-2xl">{totalValue}</div></div>
        <div className={`card p-5 ${totalPnl >= 0 ? "border-yes/30" : "border-no/30"}`}><div className="text-xs text-cream-faint mb-2">Total P&L</div><div className={`font-mono font-bold text-2xl ${totalPnl >= 0 ? "text-yes" : "text-no"}`}>{fmtSigned(totalPnl)}</div></div>
        <div className="card p-5"><div className="text-xs text-cream-faint mb-2">Win Rate</div><div className="font-mono font-bold text-2xl">{winRate}%</div></div>
        <div className="card p-5"><div className="text-xs text-cream-faint mb-2">Forecast Accuracy</div><div className="font-mono font-bold text-2xl">{winRate}%</div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5 lg:p-6">
          <h3 className="font-display font-semibold mb-4 text-sm">Portfolio value</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid stroke="rgba(255,248,231,0.06)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: "#B8B29E", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#B8B29E", fontSize: 10 }} axisLine={false} tickLine={false} domain={["dataMin - 300", "dataMax + 300"]} />
              <Tooltip contentStyle={{ background: "#101016", border: "1px solid rgba(255,248,231,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="v" stroke="#3B6BFF" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5 lg:p-6">
          <h3 className="font-display font-semibold mb-4 text-sm">P&L</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2FD489" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#2FD489" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,248,231,0.06)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: "#B8B29E", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#B8B29E", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#101016", border: "1px solid rgba(255,248,231,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke="#2FD489" strokeWidth={2.5} fill="url(#pnlFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5 lg:p-6">
          <h3 className="font-display font-semibold mb-4 text-sm">Positions</h3>
          <div className="divide-y hairline">
            {positions.length === 0 ? (
              <div className="py-6 text-xs text-cream-faint text-center">No active positions yet.</div>
            ) : (
              positions.map((p) => (
                <div key={p.market} className="flex items-center justify-between py-3.5 text-sm">
                  <span className="truncate pr-3 flex-1">{p.market}</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full border mr-3 ${p.side === "YES" ? "border-yes/40 text-yes" : "border-no/40 text-no"}`}>{p.side}</span>
                  <span className={`font-mono flex items-center gap-1 ${p.pnl >= 0 ? "text-yes" : "text-no"}`}>
                    {p.pnl >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {fmtSigned(p.pnl)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="card p-5 lg:p-6">
          <h3 className="font-display font-semibold mb-4 text-sm">Performance by category</h3>
          <div className="space-y-4">
            {categoryPerformance.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-cream-faint">{c.label}</span><span className="font-mono">{c.value}%</span></div>
                <div className="bar-track h-1.5"><div className="bar-yes h-full" style={{ width: `${c.value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
