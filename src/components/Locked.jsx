import { Lock } from "lucide-react";
export default function Locked({ label = "PRIVATE" }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-volt-glow bg-volt/10 border border-volt/30 px-2 py-0.5 rounded-full">
      <Lock size={10} /> {label}
    </span>
  );
}
