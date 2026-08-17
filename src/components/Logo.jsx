export default function Logo({ size = 28, showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/logo.png"
        alt="VEIL Logo"
        style={{ width: size, height: size }}
        className="shrink-0 object-contain rounded-lg"
      />
      {showText && (
        <span className="font-display font-extrabold tracking-[0.2em] text-cream text-lg">
          VEIL
        </span>
      )}
    </div>
  );
}
