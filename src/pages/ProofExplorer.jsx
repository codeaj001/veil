import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { Lock, X, ShieldCheck } from "lucide-react";
import { fetchProofs } from "../lib/api";

export default function ProofExplorer() {
  const [selected, setSelected] = useState(null);
  const [proofs, setProofs] = useState([]);

  useEffect(() => {
    fetchProofs().then((data) => {
      if (data) setProofs(data);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="MIDNIGHT" title="Proof Explorer" desc="Latest network events. Private transactions never disclose sensitive information." />

      <div className="card p-0 overflow-hidden mb-8">
        {proofs.map((e) => (
          <button key={e.id} onClick={() => setSelected(e)} className="w-full flex items-center justify-between px-5 py-4 border-b hairline last:border-0 text-left hover:bg-cream/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-cream-faint w-16">{e.id}</span>
              <span className="text-sm">{e.type}</span>
            </div>
            {e.private && <Lock size={13} className="text-volt-glow" />}
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full sm:max-w-md card !rounded-t-3xl sm:!rounded-3xl p-6 sm:p-7 fade-up">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-mono tracking-widest text-volt-glow">MIDNIGHT PROOF</span>
              <button onClick={() => setSelected(null)} className="text-cream-faint hover:text-cream"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between"><span className="text-cream-faint">Transaction</span><span className="font-mono">0x7a…91</span></div>
              <div className="flex justify-between"><span className="text-cream-faint">Event</span><span className="font-mono">{selected.id}</span></div>
              <div className="flex justify-between items-center"><span className="text-cream-faint">Proof status</span><span className="flex items-center gap-1 text-yes font-mono"><ShieldCheck size={14} /> VALID</span></div>
            </div>

            <div className="text-xs font-mono tracking-widest text-cream-faint mb-2">VERIFIED CLAIMS</div>
            <div className="space-y-1.5 mb-6 text-sm">
              {["Wallet owns sufficient funds", "Market is active", "Position follows market rules", "Position has not been double-spent", "User is eligible"].map((c) => (
                <div key={c} className="flex items-center gap-2"><span className="text-yes">✓</span>{c}</div>
              ))}
            </div>

            {selected.private && (
              <>
                <div className="text-xs font-mono tracking-widest text-cream-faint mb-2">PRIVATE INFORMATION</div>
                <div className="space-y-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-3 rounded bg-cream/10 w-full blur-[2px]" />
                  ))}
                </div>
                <div className="text-[11px] text-cream-faint mt-2 font-mono">NOT DISCLOSED</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
