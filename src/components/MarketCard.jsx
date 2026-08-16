import { Link } from "react-router-dom";
import { Flame, Users } from "lucide-react";
import ProbabilityBar from "./ProbabilityBar";
import StatusDot from "./StatusDot";
import { fmtUSD } from "../lib/utils";

export default function MarketCard({ m }) {
  return (
    <Link
      to={`/markets/${m.id}`}
      className="card card-hover p-5 flex flex-col gap-4 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.16em] text-cream-faint uppercase">{m.category}</span>
          {m.source === "Polymarket" && (
            <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              ⚡ POLYMARKET
            </span>
          )}
        </div>
        <StatusDot status={m.status} />
      </div>

      <div className="flex items-start gap-3">
        {m.image ? (
          <img src={m.image} alt={m.question} className="w-10 h-10 shrink-0 rounded-lg object-cover border hairline bg-ink-800" />
        ) : (
          <div className="w-10 h-10 shrink-0 rounded-lg bg-ink-800 border hairline flex items-center justify-center text-base">{m.flag}</div>
        )}
        <h3 className="font-display font-semibold text-cream leading-snug text-[15px] group-hover:text-volt-glow transition-colors line-clamp-2">
          {m.question}
        </h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-mono font-bold text-lg text-yes">{m.yes}%</span>
          <span className="text-[11px] text-cream-faint">YES</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono font-bold text-lg text-cream-faint">{(100 - m.yes).toFixed(1)}%</span>
          <span className="text-[11px] text-cream-faint">NO</span>
        </div>
      </div>

      <ProbabilityBar yes={m.yes} />

      <div className="flex items-center justify-between text-[11px] text-cream-faint font-mono pt-1">
        <span className="flex items-center gap-1"><Flame size={11} /> {fmtUSD(m.volume)} Vol</span>
        <span className="flex items-center gap-1"><Users size={11} /> {m.traders.toLocaleString()}</span>
        <span>{m.endsInDays}d left</span>
      </div>
    </Link>
  );
}
