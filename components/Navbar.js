"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";

// Shared style tokens
const S = {
  // Landing navbar 
  landingNav: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 5%",
    background: "var(--bg-secondary)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border-color)",
    transition: "all var(--transition-fast)",
    boxSizing: "border-box",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoIcon: {
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    fontWeight: 900,
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 0 15px rgba(56, 189, 248, 0.3)",
    flexShrink: 0,
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.9rem",
    transition: "color var(--transition-fast)",
    padding: "6px 10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnNavCta: {
    display: "inline-block",
    padding: "9px 18px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    fontWeight: 600,
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.2)",
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
  themeToggleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    background: "var(--bg-primary)",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1.1rem",
    fontWeight: 600,
    flexShrink: 0,
  },
  hamburgerBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: "transparent",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    cursor: "pointer",
    fontSize: "1.2rem",
    flexShrink: 0,
    transition: "all var(--transition-fast)",
  },

  // Mobile Drawer 
  mobileOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 150,
    backdropFilter: "blur(4px)",
  },
  mobileDrawer: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100%",
    width: "min(85vw, 320px)",
    background: "var(--bg-secondary)",
    borderLeft: "1px solid var(--border-color)",
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    overflowY: "auto",
    boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid var(--border-color)",
  },
  drawerCloseBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  drawerNavLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "1rem",
    borderRadius: "var(--radius-md)",
    transition: "all var(--transition-fast)",
    marginBottom: 4,
  },
  drawerCta: {
    display: "block",
    textAlign: "center",
    padding: "14px 20px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    fontWeight: 700,
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
    marginTop: 16,
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
  drawerDivider: {
    borderTop: "1px solid var(--border-color)",
    marginTop: 16,
    marginBottom: 16,
  },

  // Dashboard navbar
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    padding: "0 20px",
    backgroundColor: "var(--bg-secondary)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border-color)",
    gap: 12,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 700,
    fontSize: "1.15rem",
    color: "var(--text-primary)",
    textDecoration: "none",
    flexShrink: 0,
  },
  navSearch: {
    position: "relative",
    width: "100%",
    maxWidth: 420,
    margin: "0 8px",
  },
  navSearchInput: {
    width: "100%",
    padding: "8px 16px 8px 40px",
    backgroundColor: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.875rem",
    transition: "all var(--transition-fast)",
  },
  navSearchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  btnIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    background: "transparent",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1rem",
  },
  userProfileMenu: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    textDecoration: "none",
  },
  avatar: {
    position: "relative",
    width: 34,
    height: 34,
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
    fontSize: "0.85rem",
    border: "2px solid var(--border-color)",
    flexShrink: 0,
  },
};

export default function Navbar({ variant = "landing" }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  // Landing Page Navbar
  if (variant === "landing") {
    const showHamburger = isMobile || isTablet;

    return (
      <>
        <nav style={S.landingNav}>
          {/* Logo */}
          <Link href="/" style={S.logo}>
            <div style={S.logoIcon}>🧠</div>
            {!isMobile && <span>DevConnect AI</span>}
            {isMobile && <span style={{ fontSize: "1.1rem" }}>DevConnect</span>}
          </Link>

          {/* Desktop nav links */}
          {!showHamburger && (
            <div style={S.navLinks}>
              <a href="#features" style={S.navLink}>AI Showcase</a>
              <a href="#workflow" style={S.navLink}>How It Works</a>
              <a href="#stats" style={S.navLink}>Dashboard</a>
              <a href="#waitlist" style={S.navLink}>Waitlist</a>

              {user ? (
                <>
                  <Link href="/dashboard" style={S.btnNavCta}>Open Community App</Link>
                  <Link
                    href="/profile"
                    style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none" }}
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "2px solid var(--border-color)", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#000" }}>
                        {user.displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span>{user.displayName?.split(" ")[0]}</span>
                  </Link>
                </>
              ) : (
                <Link href="/login" style={S.btnNavCta}>Sign In</Link>
              )}

              <button
                onClick={toggleTheme}
                style={S.themeToggleBtn}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-primary)"; e.currentTarget.style.borderColor = "var(--border-color)"; }}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
            </div>
          )}

          {/* Mobile/Tablet: theme + hamburger */}
          {showHamburger && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={toggleTheme} style={S.themeToggleBtn} title="Toggle theme">
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              <button onClick={() => setDrawerOpen(true)} style={S.hamburgerBtn} aria-label="Open menu">
                ☰
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Drawer */}
        {drawerOpen && (
          <>
            <div style={S.mobileOverlay} onClick={closeDrawer} />
            <div style={S.mobileDrawer} className="mobile-nav-drawer">
              {/* Drawer header */}
              <div style={S.drawerHeader}>
                <Link href="/" style={{ ...S.logo, fontSize: "1.1rem" }} onClick={closeDrawer}>
                  <div style={S.logoIcon}>🧠</div>
                  <span>DevConnect AI</span>
                </Link>
                <button onClick={closeDrawer} style={S.drawerCloseBtn} aria-label="Close menu">✕</button>
              </div>

              {/* Nav links */}
              <a href="#features" style={S.drawerNavLink} onClick={closeDrawer}>
                <span>✨</span> AI Showcase
              </a>
              <a href="#workflow" style={S.drawerNavLink} onClick={closeDrawer}>
                <span>⚡</span> How It Works
              </a>
              <a href="#stats" style={S.drawerNavLink} onClick={closeDrawer}>
                <span>📊</span> Dashboard
              </a>
              <a href="#waitlist" style={S.drawerNavLink} onClick={closeDrawer}>
                <span>🚀</span> Waitlist
              </a>

              <div style={S.drawerDivider} />

              {user ? (
                <>
                  <Link href="/profile" style={{ ...S.drawerNavLink, gap: 12 }} onClick={closeDrawer}>
                    <div style={{ width: 32, height: 32, borderRadius: "var(--radius-full)", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#000" }}>
                      {user.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span>{user.displayName || user.email}</span>
                  </Link>
                  <Link href="/dashboard" style={S.drawerCta} onClick={closeDrawer}>
                    Open Community App
                  </Link>
                  <button onClick={() => { handleLogout(); closeDrawer(); }} style={{ ...S.drawerCta, background: "rgba(239,68,68,0.1)", color: "#ef4444", marginTop: 8 }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ ...S.drawerNavLink }} onClick={closeDrawer}>
                    <span>🔐</span> Sign In
                  </Link>
                  <Link href="/signup" style={S.drawerCta} onClick={closeDrawer}>
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </>
    );
  }

  // Dashboard / App Navbar
  return (
    <header style={S.navbar}>
      <Link href="/" style={S.navBrand} title="Back to Home">
        <span>🧠</span>
        {!isMobile && <span>DevConnect AI</span>}
      </Link>

      {/* Search bar — hidden on mobile */}
      {!isMobile && (
        <div style={S.navSearch}>
          <span style={S.navSearchIcon}>🔍</span>
          <input
            type="text"
            placeholder={isTablet ? "Search..." : "Search discussions, tags, error codes..."}
            style={S.navSearchInput}
          />
        </div>
      )}

      <div style={S.navActions}>
        {/* Search icon on mobile */}
        {isMobile && (
          <button style={S.btnIcon} title="Search">🔍</button>
        )}

        {!isMobile && (
          <button style={S.btnIcon} title="AI Code Review Alerts">✨</button>
        )}
        <button style={S.btnIcon} title="Notifications">🔔</button>

        <button
          onClick={toggleTheme}
          style={S.btnIcon}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "var(--border-color)"; }}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/profile" style={S.userProfileMenu} title="View Profile">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} style={{ width: 34, height: 34, borderRadius: "var(--radius-full)", border: "2px solid var(--border-color)", objectFit: "cover" }} />
              ) : (
                <div style={S.avatar}>
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              {!isMobile && (
                <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.875rem" }}>
                  {user.displayName?.split(" ")[0] || "Profile"}
                </span>
              )}
            </Link>
            {!isMobile && (
              <button onClick={handleLogout} style={{ ...S.btnIcon, fontSize: "1rem" }} title="Logout">🚪</button>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            style={{ padding: isMobile ? "6px 12px" : "8px 16px", background: "var(--accent-primary)", color: "#000", borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", cursor: "pointer", border: "none", whiteSpace: "nowrap" }}
          >
            {isMobile ? "In" : "Sign In"}
          </Link>
        )}
      </div>
    </header>
  );
}
