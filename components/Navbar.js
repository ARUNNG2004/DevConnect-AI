"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Bell, LogOut } from "lucide-react";

export default function Navbar({ variant = "landing" }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <Link href="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <span>DevConnect AI</span>
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${isMenuOpen ? "active" : ""}`} id="nav-menu">
          <a href="/#features" onClick={() => setIsMenuOpen(false)}>AI Showcase</a>
          <a href="/#workflow" onClick={() => setIsMenuOpen(false)}>How It Works</a>
          <a href="/#stats" onClick={() => setIsMenuOpen(false)}>Stats</a>
          <a href="/#waitlist" onClick={() => setIsMenuOpen(false)}>Waitlist</a>
          <Link href="/dashboard" className="btn-brutalist-nav" onClick={() => setIsMenuOpen(false)}>
            Open Community App
          </Link>
        </div>
      </nav>
    );
  }

  // ─── Dashboard / App Navbar (Neo-Brutalist) ────────────────────────────────
  return (
    <header className="dashboard-nav">
      <Link href="/" className="nav-brand" title="Back to Home">
        <span>DevConnect AI</span>
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