import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import SessionTimeoutGuard from "./components/SessionTimeoutGuard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import MarketResolve from "./pages/MarketResolve";
import Portfolio from "./pages/Portfolio";
import Positions from "./pages/Positions";
import Activity from "./pages/Activity";
import Leaderboard from "./pages/Leaderboard";
import ForecasterProfile from "./pages/ForecasterProfile";
import Reputation from "./pages/Reputation";
import AIForecast from "./pages/AIForecast";
import AIvsHuman from "./pages/AIvsHuman";
import CreateMarket from "./pages/CreateMarket";
import Wallet from "./pages/Wallet";
import PrivacyCenter from "./pages/PrivacyCenter";
import ProofExplorer from "./pages/ProofExplorer";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <SessionTimeoutGuard>
        <Routes>
          {/* Public, unauthenticated */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Authenticated shell */}
          <Route element={<AppShell />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/markets/:id" element={<MarketDetail />} />
            <Route path="/markets/:id/resolve" element={<MarketResolve />} />
            <Route path="/discover/ai-forecasts" element={<AIForecast />} />
            <Route path="/discover/ai-vs-human" element={<AIvsHuman />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/forecaster/:username" element={<ForecasterProfile />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/positions" element={<Positions />} />
            <Route path="/reputation" element={<Reputation />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/privacy" element={<PrivacyCenter />} />
            <Route path="/proofs" element={<ProofExplorer />} />
            <Route path="/create-market" element={<CreateMarket />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionTimeoutGuard>
    </BrowserRouter>
  );
}
