import PageHeader from "../components/PageHeader";

export default function Notifications() {
  const notifications = [
    { title: "WELCOME TO VEIL", text: "Your Midnight Preprod automated testnet wallet is active.", time: "Just now" }
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="ALERTS" title="Notifications" />
      <div className="card p-0 overflow-hidden">
        {notifications.map((n, i) => (
          <div key={i} className="px-5 py-4 border-b hairline last:border-0">
            <div className="text-[10px] font-mono text-volt-glow tracking-widest mb-1">{n.title}</div>
            <div className="text-sm">{n.text}</div>
            <div className="text-[11px] text-cream-faint mt-1">{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
