import PageHeader from "../components/PageHeader";
import { Check, Lock } from "lucide-react";

const rows = [
  { label: "Market activity", pub: true, priv: false },
  { label: "Market probability", pub: true, priv: false },
  { label: "Your position", pub: false, priv: true },
  { label: "Your balance", pub: false, priv: true },
  { label: "Your P&L", pub: false, priv: true },
  { label: "Your reputation", pub: true, priv: true, note: "verifiable claim only" },
  { label: "Your strategy", pub: false, priv: true },
];

export default function PrivacyCenter() {
  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="MIDNIGHT" title="Privacy Center" desc="VEIL uses Midnight's programmable privacy to separate what the market needs to know from what only you should know." />

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-3 gap-2 px-5 py-3 text-[11px] font-mono text-cream-faint uppercase tracking-wider border-b hairline">
          <span>Data</span><span className="text-center">Public</span><span className="text-center">Private</span>
        </div>
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-3 gap-2 px-5 py-4 text-sm items-center border-b hairline last:border-0">
            <span>{r.label}{r.note && <span className="block text-[11px] text-cream-faint">{r.note}</span>}</span>
            <span className="flex justify-center">{r.pub && <Check size={16} className="text-yes" />}</span>
            <span className="flex justify-center">{r.priv && <Lock size={14} className="text-volt-glow" />}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
