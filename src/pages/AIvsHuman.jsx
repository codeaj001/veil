import PageHeader from "../components/PageHeader";

const rows = [
  { label: "Market", yes: 63, no: 37 },
  { label: "AI", yes: 68, no: 32 },
  { label: "Top Forecasters", yes: 74, no: 26 },
];

export default function AIvsHuman() {
  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="DISCOVER" title="Human vs AI" desc="Where does the crowd disagree with the machine?" />

      <div className="card p-6 mb-6">
        <div className="text-xs font-mono tracking-widest text-yes mb-4">YES</div>
        {rows.map((r) => (
          <div key={r.label} className="mb-4 last:mb-0">
            <div className="flex justify-between text-sm mb-1.5"><span className="text-cream-faint">{r.label}</span><span className="font-mono">{r.yes}%</span></div>
            <div className="bar-track h-2"><div className="bar-yes h-full" style={{ width: `${r.yes}%` }} /></div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="text-xs font-mono tracking-widest text-no mb-4">NO</div>
        {rows.map((r) => (
          <div key={r.label} className="mb-4 last:mb-0">
            <div className="flex justify-between text-sm mb-1.5"><span className="text-cream-faint">{r.label}</span><span className="font-mono">{r.no}%</span></div>
            <div className="bar-track h-2"><div className="h-full bg-no/70" style={{ width: `${r.no}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
