import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import MarketCard from "../components/MarketCard";
import { categories } from "../data/mock";
import { fetchMarkets } from "../lib/api";

const sorts = ["Trending", "Volume", "Ending Soon", "Newest", "Probability"];

export default function Markets() {
  const [params] = useSearchParams();
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState(params.get("sort") === "ending" ? "Ending Soon" : "Trending");
  const [q, setQ] = useState("");
  const [marketList, setMarketList] = useState([]);

  useEffect(() => {
    fetchMarkets().then((data) => {
      if (data) setMarketList(data);
    }).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let list = marketList.filter((m) => (cat === "All" || cat === "Trending" ? true : m.category === cat));
    if (q.trim()) list = list.filter((m) => m.question.toLowerCase().includes(q.toLowerCase()));
    if (sort === "Volume") list = [...list].sort((a, b) => b.volume - a.volume);
    if (sort === "Ending Soon") list = [...list].sort((a, b) => a.endsInDays - b.endsInDays);
    if (sort === "Newest") list = [...list].sort((a, b) => (a.status === "new" ? -1 : 1));
    if (sort === "Probability") list = [...list].sort((a, b) => b.yes - a.yes);
    return list;
  }, [cat, sort, q, marketList]);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="MARKETS" title="Explore Markets" desc="Public probabilities. Private positions." />

      <div className="flex items-center gap-2 bg-ink-850 border hairline rounded-full px-4 py-3 mb-5 max-w-lg">
        <Search size={16} className="text-cream-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search markets..." className="bg-transparent outline-none w-full text-sm placeholder:text-cream-faint" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`chip px-3.5 py-1.5 text-xs ${cat === c ? "active" : ""}`}>{c}</button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 text-xs">
        <span className="text-cream-faint mr-1">Sort:</span>
        {sorts.map((s) => (
          <button key={s} onClick={() => setSort(s)} className={`px-3 py-1.5 rounded-full border ${sort === s ? "border-volt text-cream bg-volt/10" : "border-transparent text-cream-faint hover:text-cream"}`}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-cream-faint py-20">No markets match your search.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filtered.map((m) => <MarketCard key={m.id} m={m} />)}
        </div>
      )}
    </div>
  );
}
