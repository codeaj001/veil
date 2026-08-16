import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Locked from "../components/Locked";
import { Copy, Check } from "lucide-react";
import { fetchWallet } from "../lib/api";

export default function Wallet() {
  const [copied, setCopied] = useState(false);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    fetchWallet().then(setWallet).catch(console.error);
  }, []);

  const address = wallet?.unshieldedAddress || wallet?.address || "mn_17a3f9c2b1e4d8a6f0c5b3d9e7a1f2c4b6d8e0f91";
  const dustAddress = wallet?.dustAddress || "mn_dust_10c5b3d9e7a1f2c4b6d8e0f91";
  const dustBalance = wallet ? wallet.balance.toLocaleString('en-US') : "10,420";
  const nightBalance = wallet?.tNIGHT || 100;

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="YOUR VEIL" title="Your Midnight Wallet" />

      <div className="card p-6 lg:p-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs text-cream-faint mb-1">Shielded Asset Balance</div>
            <div className="font-mono font-bold text-3xl">{dustBalance} <span className="text-base text-volt-glow">tDUST</span></div>
            <div className="text-xs text-cream-faint mt-1 font-mono">Governance: {nightBalance} tNIGHT</div>
          </div>
          <span className="chip active px-3 py-1.5 text-xs">Midnight Network · PREPROD</span>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-mono text-cream-faint tracking-wider">UNSHIELDED ADDRESS (PREPROD)</span>
            <div className="flex items-center gap-2 bg-ink-850 border hairline rounded-xl px-4 py-3 mt-1">
              <span className="font-mono text-xs text-cream-faint flex-1 truncate">{address}</span>
              <button onClick={() => { navigator.clipboard?.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-cream-faint hover:text-cream">
                {copied ? <Check size={15} className="text-yes" /> : <Copy size={15} />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-cream-faint tracking-wider">DUST RECEIVER ADDRESS</span>
            <div className="flex items-center gap-2 bg-ink-850 border hairline rounded-xl px-4 py-3 mt-1">
              <span className="font-mono text-xs text-cream-faint flex-1 truncate">{dustAddress}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <span className="text-xs font-mono tracking-widest text-cream-faint">SHIELDED (PRIVATE)</span>
          <Locked label="ONLY YOU" />
          <div className="mt-4 space-y-3 text-sm">
            <Row label="tDUST Balance" value={`${dustBalance} tDUST`} />
            <Row label="Available" value={`${wallet?.available ? wallet.available.toLocaleString() : '7,820'} tDUST`} />
            <Row label="Locked positions" value={`${wallet?.locked ? wallet.locked.toLocaleString() : '2,600'} tDUST`} />
          </div>
        </div>
        <div className="card p-6">
          <span className="text-xs font-mono tracking-widest text-volt-glow">ON-CHAIN (PUBLIC)</span>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="UTXO Status" value="Registered for DUST" />
            <Row label="Governance" value={`${nightBalance} tNIGHT`} />
            <Row label="Network" value="Midnight PreProd" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b hairline last:border-0 pb-3 last:pb-0">
      <span className="text-cream-faint">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
