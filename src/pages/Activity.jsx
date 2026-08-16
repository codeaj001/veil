import { useEffect, useState, useCallback } from "react";
import PageHeader from "../components/PageHeader";
import { Lock, Activity as ActivityIcon, Radio } from "lucide-react";
import { fetchActivity } from "../lib/api";
import { useRealtimeSubscription } from "../lib/useRealtime";

export default function Activity() {
  const [feed, setFeed] = useState([]);
  const [isLive, setIsLive] = useState(false);

  const loadFeed = useCallback(() => {
    fetchActivity().then((data) => {
      if (data) setFeed(data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Realtime subscription for user_activity table changes
  useRealtimeSubscription("user_activity", (payload) => {
    console.log("[Activity Realtime Event]", payload);
    setIsLive(true);
    setTimeout(() => setIsLive(false), 3000);

    if (payload.eventType === "INSERT") {
      const newAct = payload.new;
      setFeed((prev) => [
        {
          time: "Just now",
          text: newAct.action_type || "Private bet executed via Midnight ZK",
          market: newAct.details?.market || "Midnight Preprod Market",
        },
        ...prev,
      ]);
    } else {
      loadFeed();
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-8">
      <div className="flex items-center justify-between mb-2">
        <PageHeader eyebrow="NETWORK" title="Market Activity" desc="Public activity across VEIL. Individual positions are never exposed." />
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${isLive ? "border-volt/60 bg-volt/15 text-volt-glow animate-pulse" : "border-cream/15 text-cream-faint"}`}>
          <Radio size={12} className={isLive ? "text-volt-glow animate-spin" : ""} />
          <span>{isLive ? "LIVE STREAMING" : "REALTIME ACTIVE"}</span>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        {feed.map((a, i) => (
          <div key={i} className="flex items-start gap-4 px-5 py-4 border-b hairline last:border-0">
            <span className="font-mono text-xs text-cream-faint w-12 shrink-0 pt-0.5">{a.time}</span>
            <div className="w-7 h-7 rounded-full bg-ink-800 border hairline flex items-center justify-center shrink-0">
              {a.text.includes("private") ? <Lock size={12} className="text-volt-glow" /> : <ActivityIcon size={12} className="text-cream-faint" />}
            </div>
            <div className="flex-1">
              <div className="text-sm">{a.text}</div>
              {a.market && <div className="text-xs text-cream-faint mt-0.5">{a.market}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
