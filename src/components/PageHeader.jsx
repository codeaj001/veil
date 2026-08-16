export default function PageHeader({ eyebrow, title, desc, right }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8 fade-up">
      <div>
        {eyebrow && <div className="text-xs font-mono tracking-[0.2em] text-volt-glow mb-2">{eyebrow}</div>}
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-cream">{title}</h1>
        {desc && <p className="text-cream-faint mt-2 max-w-xl text-sm lg:text-base">{desc}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
