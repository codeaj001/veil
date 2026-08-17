import { useEffect, useState, useCallback } from "react";
import PageHeader from "../components/PageHeader";
import Locked from "../components/Locked";
import { fmtSigned } from "../lib/utils";
import { ArrowUpRight, ArrowDownRight, Radio } from "lucide-react";
import { fetchPortfolio } from "../lib/api";
import { useRealtimeSubscription } from "../lib/useRealtime";

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [isLive, setIsLive] = useState(false);

  const loadPositions = useCallback(() => {
    fetchPortfolio().then((data) => {
      if (data?.positions) setPositions(data.positions);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  // Realtime subscription for user_positions table changes
  useRealtimeSubscription("user_positions", (payload) => {
    console.log("[Positions Realtime Event]", payload);
    setIsLive(true);
    setTimeout(() => setIsLive(false), 3000);

    if (payload.eventType === "INSERT") {
      const newPos = payload.new;
      setPositions((prev) => [
        {
          market: newPos.market_id || "Live Position",
          side: newPos.outcome || "YES",
          pnl: newPos.amount || 0,
        },
        ...prev,
      ]);
    } else {
      loadPositions();
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="YOUR VEIL" title="Positions" desc="Entry price, amount and conviction are visible only to you." right={<Locked />} />
      <div className="card divide-y hairline overflow-hidden">
        <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 text-[11px] font-mono text-cream-faint uppercase tracking-wider">
          <span className="col-span-2">Market</span><span>Side</span><span>Entry</span><span className="text-right">P&L</span>
        </div>
        {positions.length === 0 ? (
          <div className="p-8 text-center text-cream-faint text-sm">
            No active positions found. Predict on any live market to record your private ZK position!
          </div>
        ) : (
          positions.map((p, idx) => (
            <div key={p.id || `${p.market}-${idx}`} className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 px-5 py-4 text-sm items-center">
              <span className="col-span-2 truncate">{p.market}</span>
              <span className={`font-mono text-xs px-2 py-0.5 rounded-full border w-fit ${p.side === "YES" ? "border-yes/40 text-yes" : "border-no/40 text-no"}`}>{p.side}</span>
              <span className="font-mono text-cream-faint blur-lock">{p.amount ? `${p.amount} tDUST` : "$••.••"}</span>
              <span className={`font-mono flex items-center gap-1 justify-end ${p.pnl >= 0 ? "text-yes" : "text-no"}`}>
                {p.pnl >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {fmtSigned(p.pnl)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
