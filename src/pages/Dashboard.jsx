import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Locked from "../components/Locked";
import { fmtSigned } from "../lib/utils";
import { fetchWallet, fetchMarkets, fetchPortfolio } from "../lib/api";

export default function Dashboard() {
  const [wallet, setWallet] = useState(null);
  const [marketList, setMarketList] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    fetchWallet().then(setWallet).catch(console.error);
    fetchMarkets().then((data) => { if (data) setMarketList(data); }).catch(console.error);
    fetchPortfolio().then((data) => { if (data?.positions) setPositions(data.positions); }).catch(console.error);
  }, []);

  const tokenSymbol = wallet?.token || "tDUST";
  const balance = wallet ? wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "1,000.00";
  const available = wallet ? wallet.available.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "1,000.00";
  const locked = wallet ? wallet.locked.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "0.00";
  const totalPnl = positions.reduce((acc, p) => acc + (Number(p.pnl) || 0), 0);
  const username = wallet?.username || "Trader";

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader
        eyebrow="YOUR VEIL"
        title={`Welcome back, ${username}`}
        desc="Here's your private overview — visible only to you."
        right={<Locked label="PRIVATE PORTFOLIO" />}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="card p-5">
          <div className="text-xs text-cream-faint mb-2">Balance ({tokenSymbol})</div>
          <div className="font-mono font-bold text-2xl">{balance} <span className="text-sm text-volt-glow">{tokenSymbol}</span></div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-cream-faint mb-2">Available ({tokenSymbol})</div>
          <div className="font-mono font-bold text-2xl">{available}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-cream-faint mb-2">Locked ({tokenSymbol})</div>
          <div className="font-mono font-bold text-2xl">{locked}</div>
        </div>
        <div className={`card p-5 ${totalPnl >= 0 ? "border-yes/30" : "border-no/30"}`}>
          <div className="text-xs text-cream-faint mb-2">P&L</div>
          <div className={`font-mono font-bold text-2xl flex items-center gap-1 ${totalPnl >= 0 ? "text-yes" : "text-no"}`}>
            {totalPnl >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />} {fmtSigned(totalPnl)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold">Your Markets</h2>
            <Link to="/portfolio/positions" className="text-xs text-volt-glow">View all</Link>
          </div>
          <div className="divide-y hairline">
            {positions.length === 0 ? (
              <div className="py-6 text-xs text-cream-faint text-center">No active positions yet.</div>
            ) : (
              positions.map((p) => (
                <div key={p.market} className="flex items-center justify-between py-3 text-sm">
                  <span className="truncate pr-3">{p.market}</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${p.side === "YES" ? "border-yes/40 text-yes" : "border-no/40 text-no"}`}>{p.side}</span>
                  <span className={`font-mono ml-3 flex items-center gap-1 ${p.pnl >= 0 ? "text-yes" : "text-no"}`}>
                    {p.pnl >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {fmtSigned(p.pnl)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-5 lg:p-6">
          <h2 className="font-display font-semibold mb-5 font-mono text-xs tracking-wider text-volt-glow">MIDNIGHT NETWORK</h2>
          <div className="space-y-4">
            <div className="text-sm">
              <div className="text-[10px] font-mono text-volt-glow tracking-widest mb-1">NETWORK STATUS</div>
              <div className="text-cream font-mono">Midnight Preprod Active</div>
              <div className="text-[11px] text-cream-faint mt-0.5">Proof Server Synced (:6300)</div>
            </div>
            <div className="text-sm border-t hairline pt-3">
              <div className="text-[10px] font-mono text-yes tracking-widest mb-1">NATIVE ASSET</div>
              <div className="text-cream font-mono">tDUST / tNIGHT Token</div>
              <div className="text-[11px] text-cream-faint mt-0.5">Privacy-preserving ZK circuit positions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg">Trending right now</h2>
          <Link to="/markets" className="text-xs text-volt-glow">Explore markets →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketList.slice(0, 3).map((m) => (
            <Link key={m.id} to={`/markets/${m.id}`} className="card card-hover p-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-cream-faint uppercase">{m.category}</span>
              <div className="text-sm font-display font-medium leading-snug">{m.question}</div>
              <div className="font-mono text-yes font-bold">{m.yes}% YES</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
