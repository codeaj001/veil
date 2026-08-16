export function fmtUSD(n) {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

export function fmtFull(n) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function fmtSigned(n) {
  const s = n >= 0 ? "+" : "-";
  return `${s}$${Math.abs(n).toLocaleString()}`;
}

export function statusMeta(status) {
  switch (status) {
    case "live": return { label: "Live", dot: "bg-yes" };
    case "ending": return { label: "Ending Soon", dot: "bg-amber-400" };
    case "closed": return { label: "Closed", dot: "bg-no" };
    case "new": return { label: "New", dot: "bg-volt-glow" };
    default: return { label: status, dot: "bg-cream-faint" };
  }
}
