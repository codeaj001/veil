import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Lock, ChevronLeft, LogIn } from "lucide-react";
import StatusDot from "../components/StatusDot";
import ProofModal from "../components/ProofModal";
import { fmtFull } from "../lib/utils";
import { fetchMarketById, claimPayout } from "../lib/api";
import { isSessionValid } from "../lib/authSession";

const timeFilters = ["1H", "6H", "1D", "1W", "1M", "ALL"];

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [side, setSide] = useState("YES");
  const [amount, setAmount] = useState(100);
  const [tf, setTf] = useState("1W");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMarketById(id)
      .then((data) => setMarket(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const activeMarket = market;
  const history = activeMarket?.history || [50];
  const chartData = useMemo(() => history.map((v, i) => ({ t: `T-${history.length - i}`, v })), [history]);
  const price = side === "YES" ? (activeMarket?.yes || 50) : 100 - (activeMarket?.yes || 50);
  const potentialReturn = (amount * (100 / Math.max(1, price) - 1)).toFixed(2);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-12 text-center">
        <div className="text-sm font-mono text-cream-faint animate-pulse">Loading live market on Midnight testnet...</div>
      </div>
    );
  }

  if (!activeMarket) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-12 text-center">
        <Link to="/markets" className="inline-flex items-center gap-1 text-xs text-cream-faint hover:text-cream mb-5"><ChevronLeft size={14} /> All markets</Link>
        <div className="card p-8 max-w-md mx-auto">
          <h2 className="font-display font-semibold text-lg mb-2">Market Not Found</h2>
          <p className="text-sm text-cream-faint mb-4">No active Midnight testnet market matches ID: "{id}"</p>
          <Link to="/markets" className="btn-primary text-xs px-4 py-2">Browse Active Markets</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-6 lg:pt-8">
      <Link to="/markets" className="inline-flex items-center gap-1 text-xs text-cream-faint hover:text-cream mb-5"><ChevronLeft size={14} /> All markets</Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono tracking-widest text-cream-faint uppercase px-2 py-1 border hairline rounded-full">{activeMarket.category}</span>
            {activeMarket.source === "Polymarket" && (
              <a
                href={activeMarket.polymarketUrl || "https://polymarket.com"}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-blue-500/20 transition-colors"
              >
                ⚡ VERIFIED POLYMARKET FEED ↗
              </a>
            )}
            <StatusDot status={activeMarket.status} />
          </div>

          <div className="flex items-start gap-4 mb-6">
            {activeMarket.image && (
              <img src={activeMarket.image} alt={activeMarket.question} className="w-14 h-14 shrink-0 rounded-xl object-cover border hairline bg-ink-800" />
            )}
            <h1 className="font-display font-bold text-2xl lg:text-3xl leading-tight">{activeMarket.question}</h1>
          </div>

          <div className="flex items-end gap-4 mb-2">
            <span className="font-mono font-bold text-5xl lg:text-6xl text-yes">{activeMarket.yes}%</span>
            <div className="mb-2">
              <div className="text-sm text-cream-faint">YES</div>
              <div className={`text-xs font-mono ${(activeMarket.change24h || 0) >= 0 ? "text-yes" : "text-no"}`}>
                {(activeMarket.change24h || 0) >= 0 ? "+" : ""}{activeMarket.change24h || 0}% today
              </div>
            </div>
          </div>

          <div className="card p-4 lg:p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-cream-faint font-mono">PROBABILITY</span>
              <div className="flex gap-1">
                {timeFilters.map((t) => (
                  <button key={t} onClick={() => setTf(t)} className={`text-[11px] font-mono px-2 py-1 rounded-md ${tf === t ? "bg-volt/20 text-cream" : "text-cream-faint hover:text-cream"}`}>{t}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillVolt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0047FF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#101016" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,248,231,0.06)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: "#B8B29E", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#B8B29E", fontSize: 10 }} axisLine={false} tickLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip contentStyle={{ background: "#101016", border: "1px solid rgba(255,248,231,0.1)", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "#B8B29E" }} />
                <Area type="monotone" dataKey="v" stroke="#3B6BFF" strokeWidth={2} fill="url(#fillVolt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <StatBlock value={fmtFull(activeMarket.volume || 0)} label="Volume" />
            <StatBlock value={fmtFull(activeMarket.liquidity || 0)} label="Liquidity" />
            <StatBlock value={(activeMarket.traders || 0).toLocaleString()} label="Traders" />
            <StatBlock value={`${activeMarket.endsInDays || 30}d`} label="Remaining" />
          </div>

          <div className="card p-5 lg:p-6 mt-6">
            <h3 className="font-display font-semibold mb-3">Resolution</h3>
            <p className="text-sm text-cream-faint leading-relaxed mb-4">
              Resolves via <span className="text-cream">Bitcoin price oracle (Chainlink)</span>. Outcome verified and settled on Midnight.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="border hairline rounded-xl p-3">
                <div className="text-yes font-mono font-semibold mb-1">YES</div>
                <p className="text-cream-faint text-xs leading-relaxed">Resolves YES if the market condition is met before the deadline.</p>
              </div>
              <div className="border hairline rounded-xl p-3">
                <div className="text-no font-mono font-semibold mb-1">NO</div>
                <p className="text-cream-faint text-xs leading-relaxed">Resolves NO if the condition is never met before the deadline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trading panel */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="card p-5 lg:p-6">
            <h3 className="font-display font-semibold mb-5">Make your prediction</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => setSide("YES")} className={`rounded-xl py-4 border transition-colors ${side === "YES" ? "border-yes bg-yes/10" : "border-cream/10 hover:border-cream/25"}`}>
                <div className="text-xs text-cream-faint mb-1">YES</div>
                <div className="font-mono font-bold text-xl text-yes">{activeMarket.yes}%</div>
              </button>
              <button onClick={() => setSide("NO")} className={`rounded-xl py-4 border transition-colors ${side === "NO" ? "border-no bg-no/10" : "border-cream/10 hover:border-cream/25"}`}>
                <div className="text-xs text-cream-faint mb-1">NO</div>
                <div className="font-mono font-bold text-xl text-no">{(100 - activeMarket.yes).toFixed(1)}%</div>
              </button>
            </div>

            <label className="text-xs text-cream-faint block mb-2">Amount (tDUST)</label>
            <div className="flex items-center bg-ink-850 border hairline rounded-xl px-4 py-3 mb-2">
              <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} className="bg-transparent outline-none w-full font-mono text-lg" />
              <span className="text-xs text-volt-glow font-mono font-semibold">tDUST</span>
            </div>
            <div className="flex gap-2 mb-5">
              {[25, 50, 100, 500].map((v) => (
                <button key={v} onClick={() => setAmount(v)} className="chip px-2.5 py-1 text-[11px] flex-1">{v}</button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-cream-faint">Potential Return</span>
              <span className="font-mono text-yes font-semibold">+{potentialReturn} tDUST</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-volt-glow mb-5">
              <Lock size={11} /> Your position will remain private
            </div>

            {activeMarket.isResolved ? (
              <div className="card p-5 bg-volt/5 border-volt/30 text-center">
                <div className="text-xs font-mono text-volt-glow mb-1">MARKET SETTLED</div>
                <div className="font-display font-bold text-xl mb-3">Winning Outcome: <span className="text-yes">{activeMarket.winningOutcome || "YES"}</span></div>
                <button
                  onClick={async () => {
                    if (!isSessionValid()) {
                      navigate("/login");
                      return;
                    }
                    try {
                      const res = await claimPayout(activeMarket.id);
                      alert(`Successfully claimed ${res.payout} tDUST payout!`);
                      window.location.reload();
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                  className="btn-primary w-full py-3 text-sm"
                >
                  Claim Winnings (ZK Proof)
                </button>
              </div>
            ) : isSessionValid() ? (
              <button onClick={() => setModalOpen(true)} className="btn-primary w-full py-3.5 text-sm">
                Confirm Prediction
              </button>
            ) : (
              <button onClick={() => navigate("/login")} className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2">
                <LogIn size={16} /> Sign in to Predict
              </button>
            )}
          </div>
        </div>
      </div>

      <ProofModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        side={side}
        amount={amount}
        market={activeMarket.question}
        potentialReturn={potentialReturn}
        marketId={activeMarket.id}
      />
    </div>
  );
}

function StatBlock({ value, label }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-mono font-bold text-lg">{value}</div>
      <div className="text-[11px] text-cream-faint mt-1">{label}</div>
    </div>
  );
}
