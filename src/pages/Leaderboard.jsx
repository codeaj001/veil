import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { fetchLeaderboard } from "../lib/api";

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    fetchLeaderboard().then((data) => {
      if (data) setBoard(data);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="RANKINGS" title="Top Forecasters" desc="Ranked by verifiable performance, not disclosed portfolio value." />
      <div className="card p-0 overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-[11px] font-mono text-cream-faint uppercase tracking-wider border-b hairline">
          <span className="col-span-1">Rank</span>
          <span className="col-span-5">User</span>
          <span className="col-span-3">Predictions</span>
          <span className="col-span-3 text-right">Accuracy</span>
        </div>
        {board.map((f) => (
          <Link to={`/forecaster/${f.user}`} key={f.user} className="grid grid-cols-3 sm:grid-cols-12 gap-3 sm:gap-4 px-5 py-4 text-sm items-center border-b hairline last:border-0 hover:bg-cream/[0.03] transition-colors">
            <span className="col-span-1 font-mono">{medals[f.rank - 1] || `#${f.rank}`}</span>
            <span className="col-span-2 sm:col-span-5 font-medium truncate">@{f.user}</span>
            <span className="hidden sm:block col-span-3 text-cream-faint font-mono text-xs">{f.predictions} predictions · {f.calibration}</span>
            <span className="col-span-1 sm:col-span-3 text-right font-mono text-yes font-semibold">{f.accuracy}%</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
