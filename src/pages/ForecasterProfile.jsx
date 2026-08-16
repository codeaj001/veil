import { useParams, useNavigate } from "react-router-dom";
import { Lock, LogOut } from "lucide-react";
import { clearSession, getUserProfile } from "../lib/authSession";

export default function ForecasterProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const userProfile = getUserProfile();
  const handle = username || userProfile.displayName || "Trader";
  
  const handleLogout = async () => {
    await clearSession();
    navigate("/login");
  };

  const p = {
    handle,
    rank: 1,
    accuracy: 0.0,
    predictions: 0,
    winRate: 0.0,
    calibration: "Unranked",
    categories: []
  };

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-8">
      <div className="flex items-center justify-between mb-8 fade-up">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-volt/15 border border-volt/40 flex items-center justify-center font-display font-bold text-2xl text-volt-glow">
            {p.handle[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">@{p.handle}</h1>
            <span className="text-xs font-mono tracking-widest text-cream-faint">FORECASTER</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-ghost text-xs px-4 py-2 text-no hover:bg-no/10 border border-no/20 rounded-xl flex items-center gap-2 transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 text-center"><div className="font-mono font-bold text-2xl text-yes">{p.accuracy}%</div><div className="text-xs text-cream-faint mt-1">Accuracy</div></div>
        <div className="card p-5 text-center"><div className="font-mono font-bold text-2xl">{p.predictions}</div><div className="text-xs text-cream-faint mt-1">Predictions</div></div>
        <div className="card p-5 text-center"><div className="font-mono font-bold text-2xl">{p.winRate}%</div><div className="text-xs text-cream-faint mt-1">Win Rate</div></div>
        <div className="card p-5 text-center"><div className="font-mono font-bold text-2xl">{p.calibration}</div><div className="text-xs text-cream-faint mt-1">Calibration</div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5 lg:p-6">
          <h3 className="font-display font-semibold mb-4 text-sm">Category performance</h3>
          <div className="space-y-4">
            {p.categories.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1.5"><span className="text-cream-faint">{c.label}</span><span className="font-mono">{c.value}%</span></div>
                <div className="bar-track h-1.5"><div className="bar-yes h-full" style={{ width: `${c.value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5 lg:p-6 border-volt/20">
          <h3 className="font-display font-semibold mb-4 text-sm">Not disclosed</h3>
          <div className="space-y-3">
            {["Total capital", "Current positions", "Portfolio"].map((x) => (
              <div key={x} className="flex items-center justify-between text-sm py-2 border-b hairline last:border-0">
                {x} <Lock size={13} className="text-volt-glow" />
              </div>
            ))}
          </div>
          <p className="text-xs text-cream-faint mt-4 leading-relaxed">
            Reputation is verifiable. Capital and strategy remain private, even on a public profile.
          </p>
        </div>
      </div>
    </div>
  );
}
