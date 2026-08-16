import { statusMeta } from "../lib/utils";
export default function StatusDot({ status }) {
  const m = statusMeta(status);
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-cream-faint">
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot} ${status === "live" ? "tick" : ""}`} />
      {m.label}
    </span>
  );
}
