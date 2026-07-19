"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import Notifications from "./Notifications";

const S = {
  // ── Landing navbar ──────────────────────────────────────────────────────────
  landingNav: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 100,
    backgroundColor: "var(--bg-secondary)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border-color)",
    transition: "all var(--transition-fast)",
  },
  landingNavInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 8%",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 10,
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
  },
  desktopLinks: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.95rem",
    transition: "color var(--transition-fast)",
    padding: "6px 12px",
    cursor: "pointer",
  },
  btnNavCta: {
    display: "inline-block",
    padding: "10px 20px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    fontWeight: 600,
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.2)",
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    transition: "transform var(--transition-fast)",
  },
  themeToggleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: "var(--bg-primary)",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1.2rem",
    fontWeight: 600,
    flexShrink: 0,
  },
  hamburgerBtn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    width: 40,
    height: 40,
    background: "var(--bg-primary)",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    padding: "8px",
    flexShrink: 0,
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    backgroundColor: "var(--text-primary)",
    borderRadius: 2,
    transition: "all 0.25s ease",
  },
  // Mobile drawer
  mobileDrawer: (open) => ({
    overflow: "hidden",
    maxHeight: open ? 600 : 0,
    transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    borderTop: open ? "1px solid var(--border-color)" : "none",
  }),
  mobileDrawerInner: {
    display: "flex",
    flexDirection: "column",
    padding: "16px 6%",
    gap: 4,
    backgroundColor: "var(--bg-secondary)",
  },
  mobileNavLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "1rem",
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "background 0.15s",
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    background: "transparent",
    fontFamily: "inherit",
    width: "100%",
    textAlign: "left",
  },
  mobileNavDivider: {
    height: 1,
    backgroundColor: "var(--border-color)",
    margin: "8px 0",
  },
  mobileCta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 20px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    fontWeight: 700,
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
    marginTop: 8,
    fontSize: "0.95rem",
  },
  mobileThemeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
  },

  // ── Dashboard navbar ─────────────────────────────────────────────────────────
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    padding: "0 24px",
    backgroundColor: "var(--bg-secondary)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border-color)",
    gap: 12,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "var(--text-primary)",
    textDecoration: "none",
    flexShrink: 0,
  },
  navSearch: {
    position: "relative",
    flex: 1,
    maxWidth: 420,
  },
  navSearchInput: {
    width: "100%",
    padding: "8px 36px 8px 40px",
    backgroundColor: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.9rem",
    transition: "all var(--transition-fast)",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  navSearchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
    fontSize: "0.9rem",
  },
  navSearchClear: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
  searchDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    width: "100%",
    minWidth: 320,
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
    zIndex: 60,
    overflow: "hidden",
    maxHeight: 420,
    overflowY: "auto",
  },
  searchResultItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    textDecoration: "none",
    color: "inherit",
  },
  searchResultItemActive: {
    backgroundColor: "var(--accent-primary-alpha)",
  },
  searchResultTitle: {
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  searchResultMeta: {
    fontSize: "0.74rem",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  searchResultTagPill: {
    color: "var(--accent-primary)",
    fontWeight: 500,
  },
  searchStateRow: {
    padding: "16px",
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  searchFooterRow: {
    padding: "10px 16px",
    fontSize: "0.78rem",
    color: "var(--text-muted)",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)",
  },
  // Mobile search
  mobileSearchBar: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
    zIndex: 59,
    boxSizing: "border-box",
  },
  mobileSearchInputWrap: {
    position: "relative",
    width: "100%",
  },
  mobileSearchInput: {
    width: "100%",
    padding: "9px 36px 9px 36px",
    backgroundColor: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.88rem",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
    position: "relative",
  },
  btnIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: "transparent",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1rem",
    flexShrink: 0,
  },
  btnIconActive: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: "var(--accent-primary-alpha)",
    border: "1.5px solid var(--accent-primary)",
    borderRadius: "var(--radius-md)",
    color: "var(--accent-primary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1rem",
    flexShrink: 0,
  },
  userProfileMenu: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    textDecoration: "none",
  },
  avatar: {
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
    fontSize: "0.9rem",
    border: "2px solid var(--border-color)",
    flexShrink: 0,
  },
};

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "var(--accent-primary-alpha)", color: "var(--accent-primary)", borderRadius: 2 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Shared search logic ──────────────────────────────────────────────────────
function useSearch() {
  const [allPosts, setAllPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(200));
        const snap = await getDocs(postsQuery);
        if (cancelled) return;
        setAllPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoaded(true);
      } catch (err) {
        console.error("Search index load failed:", err);
        if (!cancelled) {
          setLoadError(true);
          setLoaded(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const search = useCallback((rawTerm) => {
    const term = rawTerm.trim().toLowerCase();
    if (!term) return [];
    return allPosts
      .filter((post) => {
        const inContent = post.content?.toLowerCase().includes(term);
        const inTags = (post.tags || []).some((t) => t.toLowerCase().includes(term));
        const inAuthor = post.displayName?.toLowerCase().includes(term);
        return inContent || inTags || inAuthor;
      })
      .slice(0, 8);
  }, [allPosts]);

  return { search, loaded, loadError };
}

function SearchResultRow({ post, term, activeIndex, index, onSelect }) {
  const snippetSource = post.content || "";
  const lowerSnippet = snippetSource.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const matchIdx = lowerSnippet.indexOf(lowerTerm);
  let snippet = snippetSource;
  if (matchIdx > 40) {
    snippet = "…" + snippetSource.slice(Math.max(0, matchIdx - 30));
  }
  if (snippet.length > 110) snippet = snippet.slice(0, 110) + "…";

  return (
    <div
      role="option"
      aria-selected={activeIndex === index}
      style={{ ...S.searchResultItem, ...(activeIndex === index ? S.searchResultItemActive : {}) }}
      onMouseDown={(e) => { e.preventDefault(); onSelect(post); }}
    >
      <div style={S.searchResultTitle}>{highlightMatch(snippet || "(no content)", term)}</div>
      <div style={S.searchResultMeta}>
        <span>{post.displayName || "Anonymous User"}</span>
        {(post.tags || []).slice(0, 2).map((t) => (
          <span key={t} style={S.searchResultTagPill}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function Navbar({ variant = "landing" }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ── Search state (shared shape for desktop + mobile) ──────────────────────
  const { search, loaded, loadError } = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  // Re-run the filter whenever the term changes
  useEffect(() => {
    setResults(search(searchTerm));
    setActiveIndex(-1);
  }, [searchTerm, search]);

  // Close the dropdown / mobile bar when clicking outside it
  useEffect(() => {
    const handleClick = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchFocused(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

const goToPost = useCallback((post) => {
  setSearchFocused(false);
  setMobileSearchOpen(false);
  setSearchTerm("");

  const targetHash = `#post-${post.id}`;
  const isOnDashboard = window.location.pathname === "/dashboard";

  if (isOnDashboard) {
    // Already on dashboard — directly set the hash so the dashboard
    // scroll effect picks it up, then fire a custom event to wake it.
    window.location.hash = targetHash;
    window.dispatchEvent(new Event("dashboard-scroll-request"));
  } else {
    router.push(`/dashboard${targetHash}`);
  }
}, [router]);

  const handleSearchKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = results[activeIndex] ?? results[0];
      if (chosen) goToPost(chosen);
    } else if (e.key === "Escape") {
      setSearchFocused(false);
      setMobileSearchOpen(false);
      e.currentTarget.blur();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveIndex(-1);
    desktopInputRef.current?.focus();
    mobileInputRef.current?.focus();
  };

  const showDropdown = (searchFocused || mobileSearchOpen) && searchTerm.trim().length > 0;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Shared dropdown content (used for both desktop dropdown and mobile panel)
  const renderResultsPanel = () => {
    if (!loaded) {
      return <div style={S.searchStateRow}>Searching…</div>;
    }
    if (loadError) {
      return <div style={S.searchStateRow}>Couldn't load search results. Try again.</div>;
    }
    if (results.length === 0) {
      return <div style={S.searchStateRow}>No discussions match "{searchTerm.trim()}"</div>;
    }
    return (
      <>
        {results.map((post, i) => (
          <SearchResultRow
            key={post.id}
            post={post}
            term={searchTerm.trim()}
            activeIndex={activeIndex}
            index={i}
            onSelect={goToPost}
          />
        ))}
        <div style={S.searchFooterRow}>
          {results.length >= 8 ? "Showing top 8 matches" : `${results.length} match${results.length === 1 ? "" : "es"}`}
        </div>
      </>
    );
  };

  // ─── Landing Page Navbar ────────────────────────────────────────────────────
  if (variant === "landing") {
    return (
      <nav style={S.landingNav}>
        <div style={S.landingNavInner}>
          <Link href="/" style={S.logo}>
            <div style={S.logoIcon}>🧠</div>
            {!isMobile && <span>DevConnect AI</span>}
            {isMobile && <span style={{ fontSize: "1.1rem" }}>DevConnect AI</span>}
          </Link>

          {/* Desktop links */}
          {!isMobile && (
            <div style={S.desktopLinks}>
              <a href="#features" style={S.navLink}>AI Showcase</a>
              <a href="#workflow" style={S.navLink}>How It Works</a>
              <a href="#stats" style={S.navLink}>Dashboard</a>
              <a href="#waitlist" style={S.navLink}>Waitlist</a>

              {user ? (
                <>
                  <Link href="/developers" style={S.navLink}>Developers</Link>
                  <Notifications />
                  <Link href="/dashboard" style={S.btnNavCta}>Open Community App</Link>
                  <Link
                    href="/profile"
                    style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.95rem", textDecoration: "none" }}
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
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.color = "var(--accent-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-primary)"; e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
            </div>
          )}

          {/* Mobile right side */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user && <Notifications isMobile />}
              <button onClick={toggleTheme} style={S.themeToggleBtn} title="Toggle theme">
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              <button
                style={S.hamburgerBtn}
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <span style={{ ...S.hamburgerLine, transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
                <span style={{ ...S.hamburgerLine, opacity: mobileOpen ? 0 : 1 }} />
                <span style={{ ...S.hamburgerLine, transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        {isMobile && (
          <div style={S.mobileDrawer(mobileOpen)}>
            <div style={S.mobileDrawerInner}>
              <a href="#features" style={S.mobileNavLink} onClick={() => setMobileOpen(false)}>
                <span>✨</span> AI Showcase
              </a>
              <a href="#workflow" style={S.mobileNavLink} onClick={() => setMobileOpen(false)}>
                <span>⚙️</span> How It Works
              </a>
              <a href="#stats" style={S.mobileNavLink} onClick={() => setMobileOpen(false)}>
                <span>📊</span> Dashboard
              </a>
              <a href="#waitlist" style={S.mobileNavLink} onClick={() => setMobileOpen(false)}>
                <span>📬</span> Waitlist
              </a>

              <div style={S.mobileNavDivider} />

              {user ? (
                <>
                  <Link href="/developers" style={{ ...S.mobileNavLink, textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
                    <span>👥</span> Developers
                  </Link>
                  <Link href="/profile" style={{ ...S.mobileNavLink, textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
                    <span>👤</span> {user.displayName?.split(" ")[0] || "Profile"}
                  </Link>
                  <Link href="/dashboard" style={S.mobileCta} onClick={() => setMobileOpen(false)}>
                    Open Community App →
                  </Link>
                </>
              ) : (
                <Link href="/login" style={S.mobileCta} onClick={() => setMobileOpen(false)}>
                  Sign In →
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  }

  // ─── Dashboard / App Navbar ─────────────────────────────────────────────────
  return (
    <header style={S.navbar}>
      <Link href="/" style={S.navBrand} title="Back to Home">
        <span style={{ fontSize: isMobile ? "1.3rem" : "1.1rem" }}>🧠</span>
        {!isMobile && <span>DevConnect AI</span>}
      </Link>

      {/* Search — full bar on md+, icon-triggered short bar on mobile */}
      {!isMobile && (
        <div style={S.navSearch} ref={searchWrapRef}>
          <span style={S.navSearchIcon}>🔍</span>
          <input
            ref={desktopInputRef}
            type="text"
            placeholder="Search discussions, tags, error codes..."
            style={S.navSearchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
          />
          {searchTerm && (
            <button style={S.navSearchClear} onClick={clearSearch} aria-label="Clear search" type="button">
              ✕
            </button>
          )}

          {showDropdown && (
            <div style={S.searchDropdown} role="listbox">
              {renderResultsPanel()}
            </div>
          )}
        </div>
      )}

      <div style={S.navActions} ref={isMobile ? searchWrapRef : null}>
        {/* Short, expandable search bar on mobile */}
        {isMobile && (
          <>
            <button
              style={mobileSearchOpen ? S.btnIconActive : S.btnIcon}
              title="Search"
              type="button"
              onClick={() => {
                setMobileSearchOpen((open) => {
                  const next = !open;
                  if (next) setTimeout(() => mobileInputRef.current?.focus(), 0);
                  return next;
                });
              }}
            >
              🔍
            </button>

            {mobileSearchOpen && (
              <div style={S.mobileSearchBar}>
                <div style={S.mobileSearchInputWrap}>
                  <span style={{ ...S.navSearchIcon, left: 12 }}>🔍</span>
                  <input
                    ref={mobileInputRef}
                    type="text"
                    placeholder="Search discussions..."
                    style={S.mobileSearchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-autocomplete="list"
                  />
                  {searchTerm && (
                    <button style={S.navSearchClear} onClick={clearSearch} aria-label="Clear search" type="button">
                      ✕
                    </button>
                  )}
                </div>

                {showDropdown && (
                  <div style={{ ...S.searchDropdown, position: "static", marginTop: 8, width: "100%", minWidth: 0 }} role="listbox">
                    {renderResultsPanel()}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!isMobile && (
          <button style={S.btnIcon} title="AI Code Review Alerts">✨</button>
        )}

        <Link href="/developers" style={S.btnIcon} title="Discover Developers">
          👥
        </Link>

        <Link href="/hackathons" style={S.btnIcon} title="Hackathon Hub">
          🏆
        </Link>

        {/* Notifications bell — shows a blue dot when there are unread items */}
        <Notifications isMobile={isMobile} />

        <button
          onClick={toggleTheme}
          style={S.btnIcon}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.color = "var(--accent-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/profile" style={S.userProfileMenu} title="View Profile">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} style={{ width: 36, height: 36, borderRadius: "var(--radius-full)", border: "2px solid var(--border-color)", objectFit: "cover" }} />
              ) : (
                <div style={S.avatar}>{user.displayName?.charAt(0).toUpperCase() || "U"}</div>
              )}
              {!isMobile && (
                <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                  {user.displayName?.split(" ")[0] || "Profile"}
                </span>
              )}
            </Link>
            {!isMobile && (
              <button onClick={handleLogout} style={{ ...S.btnIcon, fontSize: "1rem" }} title="Logout">
                🚪
              </button>
            )}
          </div>
        ) : (
          <Link href="/login" style={{ padding: "8px 16px", background: "var(--accent-primary)", color: "#000", borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", border: "none" }}>
            {isMobile ? "In" : "Sign In"}
          </Link>
        )}
      </div>
    </header>
  );
}