export default function Logo({ size = 24, showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <defs>
          <linearGradient id="veilLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2FF00" />
            <stop offset="50%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {/* Sleek VEIL V-Wing Logo Mark matching official design */}
        <g fill="url(#veilLogoGradient)">
          <path d="M 18 44 C 32 40, 48 54, 52 70 C 56 78, 64 68, 61 57 C 55 43, 39 37, 28 39 C 23 40, 19 43, 18 44 Z" />
          <path d="M 49 63 C 61 52, 78 30, 92 16 C 77 24, 59 49, 49 63 Z" />
        </g>
      </svg>
      {showText && (
        <span className="font-display font-extrabold tracking-[0.2em] text-cream text-lg">
          VEIL
        </span>
      )}
    </div>
  );
}
