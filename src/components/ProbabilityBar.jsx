export default function ProbabilityBar({ yes, size = "md" }) {
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div className={`bar-track w-full ${h}`}>
      <div className={`bar-yes h-full transition-all duration-700`} style={{ width: `${yes}%` }} />
    </div>
  );
}
