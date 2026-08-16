import { useEffect, useState } from "react";
import { X, Lock, ShieldCheck, Loader2 } from "lucide-react";

const steps = [
  "Funds verified",
  "Market verified",
  "Position verified",
  "Proof generated",
];

import { submitPrivateBet } from "../lib/api";

export default function ProofModal({ open, onClose, side, amount, market, potentialReturn, marketId }) {
  const [stage, setStage] = useState("confirm"); // confirm -> generating -> done
  const [progress, setProgress] = useState(0);
  const [doneSteps, setDoneSteps] = useState(0);

  useEffect(() => {
    if (!open) { setStage("confirm"); setProgress(0); setDoneSteps(0); }
  }, [open]);

  useEffect(() => {
    if (stage !== "generating") return;
    const iv = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 4);
        if (next >= (doneSteps + 1) * 25 && doneSteps < 4) {
          setDoneSteps((d) => Math.min(4, d + 1));
        }
        if (next === 100) {
          clearInterval(iv);
          submitPrivateBet(marketId || "btc-150k", side, amount).catch(console.error);
          setTimeout(() => setStage("done"), 400);
        }
        return next;
      });
    }, 45);
    return () => clearInterval(iv);
  }, [stage, marketId, side, amount]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={stage === "confirm" ? onClose : undefined} />
      <div className="relative w-full sm:max-w-md card !rounded-t-3xl sm:!rounded-3xl p-6 sm:p-7 fade-up">
        {stage === "confirm" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-mono tracking-[0.2em] text-volt-glow">PRIVATE TRANSACTION</span>
              <button onClick={onClose} className="text-cream-faint hover:text-cream"><X size={18} /></button>
            </div>
            <div className="space-y-4 text-sm">
              <Row label="Your position" value={side} valueClass={side === "YES" ? "text-yes" : "text-no"} />
              <Row label="Amount" value={`${amount} tDUST`} />
              <Row label="Market" value={market} />
              <Row label="Potential return" value={`+${potentialReturn} tDUST`} valueClass="text-yes" />
              <Row label="Visibility" value={<span className="flex items-center gap-1 text-volt-glow"><Lock size={12} /> PRIVATE</span>} />
            </div>
            <p className="text-xs text-cream-faint mt-5 leading-relaxed">
              Midnight will generate a zero-knowledge proof to verify this transaction without revealing your position, balance, or strategy to the network.
            </p>
            <button onClick={() => setStage("generating")} className="btn-primary w-full py-3 mt-6 text-sm">
              Confirm Privately
            </button>
          </>
        )}

        {stage === "generating" && (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-6 justify-center text-cream-faint text-sm">
              <Loader2 size={16} className="animate-spin text-volt-glow" /> Generating proof…
            </div>
            <div className="bar-track h-2 mb-6">
              <div className="bar-yes h-full transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={s} className={`flex items-center gap-2 text-sm transition-opacity ${i < doneSteps ? "opacity-100" : "opacity-30"}`}>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${i < doneSteps ? "bg-yes/20 border-yes text-yes" : "border-cream-faint"}`}>
                    {i < doneSteps ? "✓" : ""}
                  </span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-yes/15 border border-yes/40 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={26} className="text-yes" />
            </div>
            <div className="font-display font-semibold text-lg mb-1">Transaction submitted</div>
            <p className="text-xs text-cream-faint mb-6">Your position is recorded privately. Only proof of validity is public.</p>
            <button onClick={onClose} className="btn-primary w-full py-3 text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cream-faint">{label}</span>
      <span className={`font-mono font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
