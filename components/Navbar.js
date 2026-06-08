"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Bell, LogOut } from "lucide-react";

export default function Navbar({ variant = "landing" }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ─── Landing Page Navbar ───────────────────────────────────────────────────
  if (variant === "landing") {
    return (
      <nav id="landing-nav">
        <Link href="/" className="logo">
          <div className="logo-icon">🧠</div>
          <span>DevConnect AI</span>
        </Link>

        <div className="nav-links" id="nav-menu">
          <a href="#features">AI Showcase</a>
          <a href="#workflow">How It Works</a>
          <a href="#stats">Dashboard</a>
          <a href="#waitlist">Waitlist</a>

          {user ? (
            // Logged in — show Dashboard + Profile
            <>
              <Link href="/dashboard" className="btn-nav-cta">
                Open Community App
              </Link>
              <Link
                href="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      border: "2px solid var(--border-color)",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      background:
                        "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#000",
                    }}
                  >
                    {user.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span>{user.displayName?.split(" ")[0]}</span>
              </Link>
            </>
          ) : (
            // Not logged in — show Login
            <Link href="/login" className="btn-nav-cta">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    );
  }

  // ─── Dashboard / App Navbar (Neo-Brutalist) ────────────────────────────────
  return (
    <header className="dashboard-nav">
      <Link href="/" className="nav-brand" title="Back to Home">
        <span>🧠 DevConnect AI</span>
      </Link>

      <div className="nav-search">
        <span className="nav-search-icon"><Search size={16} /></span>
        <input
          type="text"
          placeholder="Search discussions, tags, error codes..."
        />
      </div>

      <div className="nav-actions">
        <button className="btn-icon" title="AI Code Review Alerts">
          <Sparkles size={18} />
        </button>
        <button className="btn-icon" title="Notifications">
          <Bell size={18} />
        </button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/profile"
              className="user-profile-menu"
              title="View Profile"
            >
              {user.photoURL ? (
                <div className="avatar" style={{ overflow: "hidden" }}>
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 0 }}
                  />
                </div>
              ) : (
                <div className="avatar">
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span className="user-profile-name">
                {user.displayName?.split(" ")[0] || "Profile"}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="btn-icon"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-signin">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}