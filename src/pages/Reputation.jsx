import PageHeader from "../components/PageHeader";
import Locked from "../components/Locked";

const breakdown = [
  { label: "Accuracy", value: 94 },
  { label: "Calibration", value: 91 },
  { label: "Consistency", value: 89 },
  { label: "Market diversity", value: 95 },
];

export default function Reputation() {
  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="YOUR VEIL" title="Your Forecasting Reputation" right={<Locked />} />

      <div className="card p-8 flex flex-col items-center text-center mb-8">
        <span className="text-xs font-mono tracking-widest text-cream-faint mb-3">VEIL SCORE</span>
        <div className="relative w-40 h-40 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,248,231,0.08)" strokeWidth="8" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#0047FF" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44 * 0.92} ${2 * Math.PI * 44}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-4xl">92</span>
          </div>
        </div>
        <span className="text-yes font-medium">Excellent</span>
      </div>

      <div className="card p-6 mb-8">
        <h3 className="font-display font-semibold mb-5 text-sm">Breakdown</h3>
        <div className="space-y-4">
          {breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-sm mb-1.5"><span className="text-cream-faint">{b.label}</span><span className="font-mono">{b.value}</span></div>
              <div className="bar-track h-2"><div className="bar-yes h-full" style={{ width: `${b.value}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 border-volt/20">
        <p className="text-sm text-cream-faint leading-relaxed">
          Midnight can prove claims such as <span className="text-cream">"this user has an accuracy score greater than 90"</span> without revealing full prediction history — so your reputation stays verifiable without becoming a public ledger of your strategy.
        </p>
      </div>
    </div>
  );
}
