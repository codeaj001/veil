import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, LogOut } from "lucide-react";
import { touchActivityTimestamp, isSessionValid, clearSession } from "../lib/authSession";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export default function SessionTimeoutGuard({ children }) {
  const [timedOut, setTimedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let lastTouch = 0;

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle activity updates to once per 10 seconds
      if (now - lastTouch > 10000) {
        lastTouch = now;
        touchActivityTimestamp();
      }
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    // Periodic idle checker every 15 seconds
    const intervalId = setInterval(() => {
      const email = localStorage.getItem("veil_user_email");
      if (!email) return;

      const lastActivity = parseInt(localStorage.getItem("veil_last_activity") || "0", 10);
      const now = Date.now();

      if (lastActivity > 0 && now - lastActivity > IDLE_TIMEOUT_MS) {
        console.warn("[Session Guard] 30m idle timeout reached. Signing out user.");
        clearSession();
        setTimedOut(true);
      } else if (!isSessionValid()) {
        setTimedOut(true);
      }
    }, 15000);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      clearInterval(intervalId);
    };
  }, []);

  const handleCloseModal = () => {
    setTimedOut(false);
    navigate("/login");
  };

  return (
    <>
      {children}

      {/* Security Session Timeout Modal */}
      {timedOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
          <div className="card p-6 max-w-sm w-full border border-volt/30 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-volt/10 border border-volt/30 flex items-center justify-center mx-auto text-volt-glow">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-cream mb-1">Session Timed Out</h3>
              <p className="text-xs text-cream-faint leading-relaxed">
                For your security, you were automatically signed out due to 30 minutes of inactivity.
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="btn-primary w-full py-2.5 text-xs font-mono flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Log In Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
