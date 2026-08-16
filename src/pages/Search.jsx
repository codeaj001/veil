import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import MarketCard from "../components/MarketCard";
import PageHeader from "../components/PageHeader";
import { fetchMarkets, fetchLeaderboard } from "../lib/api";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [marketList, setMarketList] = useState([]);
  const [boardList, setBoardList] = useState([]);

  useEffect(() => {
    fetchMarkets().then((data) => { if (data) setMarketList(data); }).catch(console.error);
    fetchLeaderboard().then((data) => { if (data) setBoardList(data); }).catch(console.error);
  }, []);

  const marketResults = marketList.filter((m) => m.question.toLowerCase().includes(q.toLowerCase()));
  const forecasterResults = boardList.filter((f) => f.user.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="SEARCH" title={`Results for "${q}"`} />
      {marketResults.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xs font-mono tracking-widest text-cream-faint mb-4">MARKETS</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketResults.map((m) => <MarketCard key={m.id} m={m} />)}
          </div>
        </div>
      )}
      {forecasterResults.length > 0 && (
        <div>
          <h3 className="text-xs font-mono tracking-widest text-cream-faint mb-4">FORECASTERS</h3>
          <div className="flex flex-wrap gap-3">
            {forecasterResults.map((f) => (
              <Link key={f.user} to={`/forecaster/${f.user}`} className="card card-hover px-4 py-3 text-sm">@{f.user}</Link>
            ))}
          </div>
        </div>
      )}
      {marketResults.length === 0 && forecasterResults.length === 0 && (
        <div className="text-cream-faint text-sm">No results found.</div>
      )}
    </div>
  );
}
