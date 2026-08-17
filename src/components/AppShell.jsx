import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutGrid, Flame, Timer, Sparkles, Eye, Compass, BrainCircuit, Trophy,
  Wallet2, ListChecks, Activity as ActivityIcon, ShieldCheck, Settings as SettingsIcon,
  Search, Bell, Home, User, Menu, X, ChevronDown, LogOut
} from "lucide-react";
import Logo from "./Logo";
import { fetchWallet } from "../lib/api";
import { clearSession, isSessionValid } from "../lib/authSession";

const mainNav = [{ to: "/app", label: "Home", icon: Home, end: true }];
const marketsNav = [
  { to: "/markets", label: "All Markets", icon: LayoutGrid, end: true },
  { to: "/markets?sort=trending", label: "Trending", icon: Flame },
  { to: "/markets?sort=ending", label: "Ending Soon", icon: Timer },
  { to: "/markets?sort=new", label: "New", icon: Sparkles },
];
const discoverNav = [
  { to: "/discover/ai-forecasts", label: "AI Forecasts", icon: BrainCircuit },
  { to: "/leaderboard", label: "Top Forecasters", icon: Trophy },
];

const yourNav = [
  { to: "/portfolio", label: "Portfolio", icon: Wallet2, end: true },
  { to: "/portfolio/positions", label: "Positions", icon: ListChecks },
  { to: "/activity", label: "Activity", icon: ActivityIcon },
  { to: "/reputation", label: "Reputation", icon: ShieldCheck },
];

function NavGroup({ title, items }) {
  return (
    <div className="mb-6">
      {title && <div className="px-3 mb-2 text-[10px] tracking-[0.18em] text-cream-faint font-mono">{title}</div>}
      <div className="flex flex-col gap-0.5">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-volt/15 text-cream border border-volt/40" : "text-cream-faint hover:text-cream hover:bg-cream/5 border border-transparent"
              }`
            }
          >
            <it.icon size={16} strokeWidth={2} />
            {it.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [authenticated, setAuthenticated] = useState(isSessionValid());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const active = isSessionValid();
    setAuthenticated(active);
    if (active) {
      fetchWallet().then(setWallet).catch(console.error);
    }
  }, [location.pathname]);

  const formatAddr = (addr) => {
    if (!addr) return null;
    if (addr.length > 12) return `${addr.slice(0, 7)}…${addr.slice(-4)}`;
    return addr;
  };

  return (
    <div className="min-h-screen flex">
      <div className="grain" />
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r hairline px-4 py-6 overflow-y-auto">
        <div className="px-2 mb-8"><Logo /></div>
        <NavGroup items={mainNav} />
        <NavGroup title="MARKETS" items={marketsNav} />
        <NavGroup title="DISCOVER" items={discoverNav} />
        <NavGroup title="YOUR VEIL" items={yourNav} />
        <div className="mt-auto pt-4 border-t hairline flex flex-col gap-0.5">
          <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${isActive ? "text-cream" : "text-cream-faint hover:text-cream"}`}>
            <SettingsIcon size={16} /> Settings
          </NavLink>
          <NavLink to="/wallet" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${isActive ? "text-cream" : "text-cream-faint hover:text-cream"}`}>
            <Wallet2 size={16} /> Wallet
          </NavLink>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-ink-900 border-r hairline h-full px-4 py-6 overflow-y-auto fade-up">
            <div className="flex items-center justify-between mb-8 px-2">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="text-cream-faint"><X size={20} /></button>
            </div>
            <NavGroup items={mainNav} />
            <NavGroup title="MARKETS" items={marketsNav} />
            <NavGroup title="DISCOVER" items={discoverNav} />
            <NavGroup title="YOUR VEIL" items={yourNav} />
            <NavGroup items={[{ to: "/settings", label: "Settings", icon: SettingsIcon }, { to: "/wallet", label: "Wallet", icon: Wallet2 }]} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink-950/80 border-b hairline">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
            <button className="lg:hidden text-cream-faint" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
            <div className="lg:hidden"><Logo size={20} /></div>

            <nav className="hidden lg:flex items-center gap-1 text-sm">
              {[["Markets", "/markets"], ["Discover", "/discover/ai-forecasts"], ["Activity", "/activity"], ["Leaderboard", "/leaderboard"]].map(([label, to]) => (
                <NavLink key={to} to={to} className={({ isActive }) => `px-3 py-1.5 rounded-full ${isActive ? "text-cream bg-cream/5" : "text-cream-faint hover:text-cream"}`}>{label}</NavLink>
              ))}
            </nav>

            <div className="flex-1 flex justify-center px-2">
              <div className="hidden sm:flex items-center gap-2 w-full max-w-md bg-ink-850 border hairline rounded-full px-4 py-2 text-sm text-cream-faint">
                <Search size={15} />
                <input
                  placeholder="Search markets, traders, categories..."
                  className="bg-transparent outline-none w-full placeholder:text-cream-faint text-cream"
                  onKeyDown={(e) => { if (e.key === "Enter") navigate("/search?q=" + encodeURIComponent(e.currentTarget.value)); }}
                />
              </div>
            </div>

            {authenticated ? (
              <>
                <button className="relative text-cream-faint hover:text-cream" onClick={() => navigate("/notifications")}>
                  <Bell size={19} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-volt" />
                </button>

                {/* Wallet Address Button with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                    className="hidden sm:flex items-center gap-1.5 btn-primary text-xs px-4 py-2"
                  >
                    <span className="font-mono">{formatAddr(wallet?.unshieldedAddress || wallet?.address) || "mn_wallet"}</span>
                    <ChevronDown size={14} className={`transition-transform ${walletMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {walletMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setWalletMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-ink-900 border hairline rounded-2xl shadow-2xl z-50 p-3 fade-up">
                        <div className="px-3 py-2 border-b hairline mb-2">
                          <p className="text-[10px] font-mono tracking-widest text-cream-faint uppercase">Connected Account</p>
                          <p className="text-sm font-semibold text-cream truncate">
                            {localStorage.getItem("veil_user_email") || wallet?.email || "trader@veil.app"}
                          </p>
                          <div className="flex items-center justify-between mt-1.5 bg-ink-850 px-2.5 py-1.5 rounded-lg border hairline">
                            <span className="text-[11px] font-mono text-cream-faint truncate max-w-[140px]">
                              {wallet?.unshieldedAddress || "mn_17a3f9…c2"}
                            </span>
                            <span className="text-[10px] text-volt-glow font-mono font-bold">PREPROD</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <button
                            onClick={() => { setWalletMenuOpen(false); navigate("/wallet"); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-cream-faint hover:text-cream hover:bg-cream/5 transition-colors"
                          >
                            <Wallet2 size={15} /> Wallet & Balances
                          </button>

                          <button
                            onClick={() => { setWalletMenuOpen(false); navigate("/forecaster/trader"); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-cream-faint hover:text-cream hover:bg-cream/5 transition-colors"
                          >
                            <User size={15} /> Forecaster Profile
                          </button>

                          <button
                            onClick={() => { setWalletMenuOpen(false); navigate("/settings"); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-cream-faint hover:text-cream hover:bg-cream/5 transition-colors"
                          >
                            <SettingsIcon size={15} /> Settings
                          </button>
                        </div>

                        <div className="border-t hairline mt-2 pt-2">
                          <button
                            onClick={async () => {
                              setWalletMenuOpen(false);
                              await clearSession();
                              setAuthenticated(false);
                              navigate("/login");
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-no hover:bg-no/10 border border-no/20 transition-colors"
                          >
                            <LogOut size={15} /> Log Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs text-cream-faint hover:text-cream px-3 py-2 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Create Account
                </button>
              </div>
            )}

            {authenticated && (
              <NavLink to="/portfolio" className="w-8 h-8 rounded-full bg-volt/20 border border-volt/50 flex items-center justify-center text-cream">
                <User size={15} />
              </NavLink>
            )}
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-900/95 backdrop-blur-xl border-t hairline flex items-stretch h-16">
        {[
          { to: "/app", label: "Home", icon: Home, end: true },
          { to: "/markets", label: "Markets", icon: LayoutGrid },
          { to: "/activity", label: "Activity", icon: ActivityIcon },
          { to: "/portfolio", label: "Portfolio", icon: Wallet2 },
          { to: "/settings", label: "Profile", icon: User },
        ].map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] ${isActive ? "text-volt-glow" : "text-cream-faint"}`}>
            <it.icon size={19} />
            {it.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
