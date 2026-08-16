export default function Logo({ size = 22 }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="#0047FF" />
        <path d="M14 18L32 46L50 18" stroke="#FFF8E7" strokeWidth="5.5" strokeLinecap="square" />
      </svg>
      <span className="font-display font-bold tracking-[0.18em] text-cream text-lg">VEIL</span>
    </div>
  );
}
