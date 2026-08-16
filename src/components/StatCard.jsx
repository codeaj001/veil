export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card p-4 lg:p-5">
      <div className={`font-display font-bold text-xl lg:text-2xl ${accent ? "text-volt-glow" : "text-cream"}`}>{value}</div>
      <div className="text-xs text-cream-faint mt-1">{label}</div>
      {sub && <div className="text-[11px] text-cream-faint/70 mt-0.5">{sub}</div>}
    </div>
  );
}
