import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { getUserProfile, saveUserProfile } from "../lib/authSession";
import { Check } from "lucide-react";

const tabs = ["Account", "Privacy", "Notifications", "Wallet", "Security", "Appearance"];

export default function Settings() {
  const [tab, setTab] = useState("Account");
  const [visibility, setVisibility] = useState("private");

  const profile = getUserProfile();
  const [email, setEmail] = useState(profile.email);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const current = getUserProfile();
    setEmail(current.email);
    setDisplayName(current.displayName);
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await saveUserProfile({ email: email.trim(), displayName: displayName.trim() });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-8">
      <PageHeader eyebrow="ACCOUNT" title="Settings" />

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`chip px-4 py-2 text-xs whitespace-nowrap ${tab === t ? "active" : ""}`}>{t}</button>
        ))}
      </div>

      {tab === "Account" && (
        <div className="card p-6 lg:p-8 max-w-md space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-yes/10 border border-yes/30 rounded-xl flex items-center gap-2 text-yes text-xs">
              <Check size={15} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-xs text-cream-faint block mb-1.5">Display Name (Unique)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-ink-850 border hairline rounded-xl px-4 py-2.5 text-sm outline-none focus:border-volt/60"
              />
            </div>

            <div>
              <label className="text-xs text-cream-faint block mb-1.5">Registered Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-ink-850 border hairline rounded-xl px-4 py-2.5 text-sm outline-none focus:border-volt/60"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-2.5 text-sm">Save Changes</button>
          </form>
        </div>
      )}

      {tab === "Privacy" && (
        <div className="card p-6 lg:p-8 max-w-md">
          <h3 className="font-display font-semibold mb-1">Default position visibility</h3>
          <p className="text-xs text-cream-faint mb-5">Applies to new positions across all markets.</p>
          <div className="space-y-3">
            <label className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer ${visibility === "private" ? "border-volt bg-volt/10" : "hairline"}`}>
              <input type="radio" checked={visibility === "private"} onChange={() => setVisibility("private")} className="accent-volt" />
              <div><div className="text-sm font-medium">Private</div><div className="text-xs text-cream-faint">Recommended</div></div>
            </label>
            <label className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer ${visibility === "public" ? "border-volt bg-volt/10" : "hairline"}`}>
              <input type="radio" checked={visibility === "public"} onChange={() => setVisibility("public")} className="accent-volt" />
              <div className="text-sm font-medium">Public</div>
            </label>
          </div>
        </div>
      )}

      {tab === "Notifications" && (
        <div className="card p-6 lg:p-8 max-w-md space-y-4">
          {["Market alerts", "Ending soon reminders", "Resolution results", "Leaderboard updates"].map((n) => (
            <label key={n} className="flex items-center justify-between text-sm py-2 border-b hairline last:border-0">
              {n}
              <input type="checkbox" defaultChecked className="accent-volt w-4 h-4" />
            </label>
          ))}
        </div>
      )}

      {(tab === "Wallet" || tab === "Security" || tab === "Appearance") && (
        <div className="card p-8 text-center text-cream-faint text-sm max-w-md">{tab} settings coming soon.</div>
      )}
    </div>
  );
}
