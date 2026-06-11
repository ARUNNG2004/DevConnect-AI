"use client";

import Link from "next/link";
import CodeReview from "../components/CodeReview";
import { useTheme } from "../context/ThemeContext";

// ── Design tokens (mirroring landing CSS variables) ───────────────────────────
const C = {
  bgDark: "#030712",
  bgCard: "rgba(17,24,39,0.7)",
  bgCardHover: "rgba(31,41,55,0.8)",
  border: "rgba(255,255,255,0.08)",
  borderGlow: "rgba(56,189,248,0.3)",
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#64748b",
  blue: "#38bdf8",
  teal: "#2dd4bf",
  purple: "#c084fc",
  green: "#34d399",
  fontMono: "'JetBrains Mono', monospace",
};

const S = {
  // page wrapper
  main: {
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-secondary)",
    fontFamily: "'Inter', system-ui, sans-serif",
    overflowX: "hidden",
    position: "relative",
    WebkitFontSmoothing: "antialiased",
    minHeight: "100vh",
  },
  // glow blobs
  glowBlob: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 9999,
    pointerEvents: "none",
    zIndex: -1,
    opacity: 0.12,
    filter: "blur(120px)",
  },
  // nav
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 8%",
    background: "var(--bg-secondary)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: `1px solid var(--border-color)`,
  },
  navContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoIcon: {
    background: `linear-gradient(135deg, var(--accent-primary), var(--accent-ai))`,
    color: "#000",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    fontWeight: 900,
    borderRadius: 8,
    boxShadow: "0 0 15px rgba(56,189,248,0.3)",
  },
  navLinksContainer: {
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  navLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.95rem",
    padding: "6px 0",
    cursor: "pointer",
    transition: "color var(--transition-fast)",
  },
  navRightActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
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
  },
  btnNavCta: {
    display: "inline-block",
    padding: "10px 20px",
    background: `linear-gradient(135deg, var(--accent-primary), var(--accent-ai))`,
    color: "#000",
    fontWeight: 600,
    borderRadius: 8,
    textDecoration: "none",
    boxShadow: "0 4px 15px rgba(56,189,248,0.2)",
    cursor: "pointer",
    border: "none",
    transition: "transform var(--transition-fast)",
  },
  // hero
  hero: {
    minHeight: "95vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "120px 8% 60px",
    position: "relative",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "var(--accent-primary-alpha)",
    border: "1px solid rgba(56,189,248,0.2)",
    borderRadius: 9999,
    color: "var(--accent-primary)",
    fontWeight: 600,
    fontSize: "0.85rem",
    marginBottom: 24,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  badgeDot: {
    width: 8,
    height: 8,
    backgroundColor: "var(--accent-primary)",
    borderRadius: 9999,
  },
  heroH1: {
    fontSize: "4.2rem",
    fontWeight: 800,
    maxWidth: 950,
    lineHeight: 1.15,
    color: "var(--text-primary)",
    marginBottom: 24,
    letterSpacing: "-1px",
    margin: "0 0 24px 0",
  },
  heroH1Span: {
    background: `linear-gradient(90deg, var(--accent-primary), #2dd4bf 45%, var(--accent-ai))`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroP: {
    fontSize: "1.2rem",
    maxWidth: 760,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    margin: "0 0 40px 0",
  },
  heroCtas: {
    display: "flex",
    gap: 16,
    marginBottom: 60,
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: 14,
    textDecoration: "none",
    cursor: "pointer",
    background: `linear-gradient(135deg, var(--accent-primary), #2dd4bf)`,
    color: "#030712",
    boxShadow: "0 8px 25px rgba(56,189,248,0.25)",
    border: "none",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: 14,
    textDecoration: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-primary)",
    border: `1px solid var(--border-color)`,
  },
  // mockup
  heroMockupWrapper: {
    width: "100%",
    maxWidth: 980,
    background: "linear-gradient(135deg, rgba(56,189,248,0.1), rgba(192,132,252,0.1))",
    padding: 12,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
    marginTop: 10,
  },
  mockupWindow: {
    width: "100%",
    background: "var(--bg-secondary)",
    borderRadius: 18,
    overflow: "hidden",
    border: `1px solid var(--border-color)`,
    textAlign: "left",
  },
  mockupHeader: {
    height: 44,
    background: "var(--bg-primary)",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    borderBottom: `1px solid var(--border-color)`,
    justifyContent: "space-between",
  },
  mockupDots: { display: "flex", gap: 6 },
  mockupDot: { width: 10, height: 10, borderRadius: 9999 },
  mockupTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    background: "rgba(255,255,255,0.03)",
    padding: "4px 20px",
    borderRadius: 8,
    border: `1px solid var(--border-color)`,
  },
  mockupBody: {
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    height: 380,
  },
  mockupSidebar: {
    background: "var(--bg-primary)",
    borderRight: `1px solid var(--border-color)`,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mockupSidebarItem: {
    height: 36,
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    border: `1px solid var(--border-color)`,
  },
  mockupSidebarItemActive: {
    height: 36,
    borderRadius: 8,
    background: "var(--accent-primary-alpha)",
    border: `1px solid rgba(56,189,248,0.2)`,
  },
  mockupMain: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    overflowY: "auto",
  },
  mockupPost: { display: "flex", flexDirection: "column", gap: 12 },
  mockupPostHeader: { display: "flex", alignItems: "center", gap: 10 },
  mockupAvatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    background: `linear-gradient(135deg, var(--accent-primary), var(--accent-ai))`,
    flexShrink: 0,
  },
  mockupMeta: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  mockupLineSm: { height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 2 },
  mockupCodeCard: {
    fontFamily: "'JetBrains Mono', monospace",
    background: "var(--bg-primary)",
    border: `1px solid var(--border-color)`,
    borderRadius: 8,
    padding: 12,
    fontSize: "0.8rem",
    color: "#e2e8f0",
  },
  mockupAiCard: {
    border: `1px solid var(--accent-ai)`,
    background: "rgba(192,132,252,0.05)",
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  mockupAiBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(192,132,252,0.15)",
    border: "1px solid rgba(192,132,252,0.3)",
    padding: "2px 8px",
    borderRadius: 8,
    fontSize: "0.7rem",
    color: "#c084fc",
    fontWeight: 700,
    marginBottom: 8,
  },
  // sections
  section: { padding: "100px 8%", position: "relative" },
  sectionTitle: { textAlign: "center", marginBottom: 64 },
  sectionTitleH2: {
    fontSize: "2.8rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: 16,
    letterSpacing: "-0.5px",
    margin: "0 0 16px 0",
  },
  sectionTitleSpan: {
    background: `linear-gradient(90deg, var(--accent-primary), var(--accent-ai))`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  sectionTitleP: {
    fontSize: "1.1rem",
    color: "var(--text-secondary)",
    maxWidth: 600,
    margin: "0 auto",
  },
  // features grid
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 30,
    marginBottom: 60,
  },
  featureCard: {
    background: "var(--bg-secondary)",
    border: `1px solid var(--border-color)`,
    borderRadius: 14,
    padding: 40,
    backdropFilter: "blur(16px)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
  },
  featureIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    background: "var(--accent-primary-alpha)",
    border: "1px solid rgba(56,189,248,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  featureIconAi: {
    width: 54,
    height: 54,
    borderRadius: 8,
    background: "var(--accent-ai-alpha)",
    border: "1px solid rgba(192,132,252,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  featureCardH3: { fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 },
  featureCardP: { color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 },
  // workflow
  workflowContainer: {
    maxWidth: 900,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 30,
    position: "relative",
    paddingLeft: 8,
    borderLeft: `2px solid transparent`,
  },
  workflowStep: { display: "flex", gap: 32, position: "relative" },
  workflowNum: (active, color) => ({
    width: 82,
    height: 82,
    borderRadius: 9999,
    background: "var(--bg-primary)",
    border: `2px solid ${active ? color : "var(--border-color)"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    fontWeight: 800,
    color: active ? color : "var(--text-muted)",
    flexShrink: 0,
    boxShadow: active ? `0 0 20px ${color}4d, 0 0 0 8px var(--bg-primary)` : `0 0 0 8px var(--bg-primary)`,
  }),
  workflowCard: {
    background: "var(--bg-secondary)",
    border: `1px solid var(--border-color)`,
    padding: 30,
    borderRadius: 14,
    backdropFilter: "blur(16px)",
    flexGrow: 1,
  },
  workflowCardH3: { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px 0" },
  workflowCardP: { color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 },
  // stats
  statsDashboard: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 24,
    marginBottom: 50,
  },
  statMetricCard: (i) => ({
    background: "var(--bg-secondary)",
    border: `1px solid var(--border-color)`,
    padding: "32px 24px",
    borderRadius: 14,
    textAlign: "center",
    backdropFilter: "blur(16px)",
    position: "relative",
    overflow: "hidden",
    borderTop: `3px solid ${i % 2 === 0 ? "var(--accent-primary)" : "var(--accent-ai)"}`,
  }),
  statMetricVal: {
    fontSize: "2.8rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    lineHeight: 1,
    marginBottom: 12,
    letterSpacing: "-1px",
  },
  statMetricLabel: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: "1px",
  },
  // waitlist
  waitlistSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    background: "rgba(17,24,39,0.4)",
    border: `1px solid var(--border-color)`,
    padding: "50px 30px",
    borderRadius: 24,
    maxWidth: 760,
    margin: "60px auto 20px",
    backdropFilter: "blur(16px)",
    textAlign: "center",
  },
  waitlistH3: { fontSize: "1.8rem", color: "var(--text-primary)", fontWeight: 800, margin: 0 },
  waitlistH3Span: {
    background: `linear-gradient(90deg, var(--accent-primary), var(--accent-ai))`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  waitlistP: { fontSize: "1rem", color: "var(--text-secondary)", maxWidth: 500, margin: 0 },
  waitlistForm: { display: "flex", width: "100%", maxWidth: 540, gap: 12, marginTop: 10 },
  waitlistInput: {
    flexGrow: 1,
    padding: "14px 20px",
    background: "rgba(0,0,0,0.3)",
    border: `1px solid var(--border-color)`,
    borderRadius: 14,
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.95rem",
    fontFamily: "inherit",
  },
  // cta
  cta: {
    textAlign: "center",
    padding: "120px 8%",
    background: "radial-gradient(circle at center, rgba(56,189,248,0.08) 0%, transparent 60%)",
  },
  ctaH2: {
    fontSize: "3rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: 16,
    letterSpacing: "-1px",
    margin: "0 0 16px 0",
  },
  ctaP: { fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 32px" },
  // footer
  footer: {
    textAlign: "center",
    padding: "40px 8%",
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    borderTop: `1px solid var(--border-color)`,
    background: "var(--bg-primary)",
  },
};

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <main style={S.main}>
      {/* Glow blobs */}
      <div style={{ ...S.glowBlob, top: -100, left: -100, background: `radial-gradient(circle, var(--accent-primary) 0%, transparent 80%)` }} />
      <div style={{ ...S.glowBlob, top: "40%", right: -150, background: `radial-gradient(circle, var(--accent-ai) 0%, transparent 80%)` }} />
      <div style={{ ...S.glowBlob, bottom: "10%", left: -100, background: `radial-gradient(circle, #2dd4bf 0%, transparent 80%)` }} />

      {/* ── Navbar ── */}
      <nav style={S.nav}>
        <div style={S.navContent}>
          <Link href="/" style={S.logo}>
            <div style={S.logoIcon}>🧠</div>
            <span>DevConnect AI</span>
          </Link>

          <div style={S.navLinksContainer}>
            <div style={S.navLinks}>
              <a href="#features" style={S.navLink}>AI Showcase</a>
              <a href="#workflow" style={S.navLink}>How It Works</a>
              <a href="#stats" style={S.navLink}>Dashboard</a>
              <a href="#waitlist" style={S.navLink}>Waitlist</a>
            </div>

            <div style={S.navRightActions}>
              <button
                onClick={toggleTheme}
                style={S.themeToggleBtn}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)";
                  e.currentTarget.style.borderColor = "var(--accent-primary)";
                  e.currentTarget.style.color = "var(--accent-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-primary)";
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>

              <Link href="/dashboard" style={S.btnNavCta}>Open Community App</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header style={S.hero}>
        <div style={S.badge}>
          <span style={S.badgeDot} />
          🚀 AI-Powered Developer Community
        </div>

        <h1 style={S.heroH1}>
          Building the Future of <br />
          <span style={S.heroH1Span}>Developer Collaboration</span>
        </h1>

        <p style={S.heroP}>
          DevConnect AI is a next-generation social ecosystem where engineers share knowledge,
          collaborate on repositories, and leverage contextual AI agents to debug errors,
          review pull requests, and deploy code faster.
        </p>

        <div style={S.heroCtas}>
          <Link href="/dashboard" style={S.btnPrimary}>
            <span>Launch Community Feed</span>
          </Link>
          <a href="#features" style={S.btnSecondary}>Explore AI Showcase</a>
        </div>

        {/* Hero mockup */}
        <div style={S.heroMockupWrapper}>
          <div style={S.mockupWindow}>
            <div style={S.mockupHeader}>
              <div style={S.mockupDots}>
                <span style={{ ...S.mockupDot, background: "#ef4444" }} />
                <span style={{ ...S.mockupDot, background: "#f59e0b" }} />
                <span style={{ ...S.mockupDot, background: "#10b981" }} />
              </div>
              <div style={S.mockupTitle}>feed_app_controller.tsx</div>
              <div style={{ width: 32 }} />
            </div>

            <div style={S.mockupBody}>
              <aside style={S.mockupSidebar}>
                <div style={S.mockupSidebarItemActive} />
                <div style={S.mockupSidebarItem} />
                <div style={S.mockupSidebarItem} />
                <div style={{ marginTop: "auto", height: 32, borderRadius: "50%", width: 32, background: "rgba(255,255,255,0.05)" }} />
              </aside>

              <section style={S.mockupMain}>
                <div style={S.mockupPost}>
                  <div style={S.mockupPostHeader}>
                    <div style={S.mockupAvatar} />
                    <div style={S.mockupMeta}>
                      <div style={{ ...S.mockupLineSm, width: 120 }} />
                      <div style={{ ...S.mockupLineSm, width: 70, opacity: 0.5 }} />
                    </div>
                  </div>

                  <div style={S.mockupCodeCard}>
                    <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                      {"// App Router re-renders infinitely on state push"}
                    </span>
                    <br />
                    <span style={{ color: "#f43f5e" }}>const</span>
                    {" handleFilter = (filter) => {"}
                    <br />
                    &nbsp;&nbsp;{"router."}
                    <span style={{ color: "var(--accent-ai)", borderBottom: `2px dashed var(--accent-ai)`, paddingBottom: 1 }}>push</span>
                    {"(`?tab=${filter}`);"}
                    <br />
                    {"}"}
                  </div>

                  <div style={S.mockupAiCard}>
                    <div style={S.mockupAiBadge}>🤖 DevConnect Copilot</div>
                    <div style={{ ...S.mockupLineSm, width: "90%", background: "var(--accent-ai)", height: 6, marginBottom: 6 }} />
                    <div style={{ ...S.mockupLineSm, width: "75%", background: "var(--accent-ai)", height: 6, opacity: 0.7 }} />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </header>

      {/* ── Features ── */}
      <section style={S.section} id="features">
        <div style={S.sectionTitle}>
          <h2 style={S.sectionTitleH2}>
            AI Features <span style={S.sectionTitleSpan}>Showcase</span>
          </h2>
          <p style={S.sectionTitleP}>
            DevConnect features custom LLM orchestration running locally in your workspace
            to automate tedious code tasks.
          </p>
        </div>

        <div style={S.featuresGrid}>
          {[
            { icon: "🤖", title: "Auto Code Reviewer", desc: "Scans snippets posted in conversations, verifying memory safety, performance leaks, and logic regressions automatically.", ai: true },
            { icon: "⚡", title: "Intelligent Composer", desc: "Helps with formatting code blocks, picking hashtags, and polishing technical explanations." },
            { icon: "🔍", title: "Smart Query Classifier", desc: "Categorizes discussions and routes questions to relevant topic maintainers and collaborators." },
          ].map(({ icon, title, desc, ai }) => (
            <div key={title} style={S.featureCard}>
              <div style={ai ? S.featureIconAi : S.featureIcon}>{icon}</div>
              <h3 style={S.featureCardH3}>{title}</h3>
              <p style={S.featureCardP}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Code Review Component ── */}
      <section id="ai-code-review">
  <CodeReview />
</section>

      {/* ── Workflow ── */}
      <section style={S.section} id="workflow">
        <div style={S.sectionTitle}>
          <h2 style={S.sectionTitleH2}>
            How <span style={S.sectionTitleSpan}>DevConnect</span> Works
          </h2>
          <p style={S.sectionTitleP}>
            A step-by-step tour of building projects on our interactive collaboration timeline.
          </p>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 30 }}>
          {[
            { num: "01", color: "var(--accent-primary)", title: "Compose Your Discussion", desc: "Draft coding questions, share logs, or start a repository collaboration using markdown, tags, and code blocks.", active: true },
            { num: "02", color: "var(--accent-ai)", title: "AI Copilot Evaluates", desc: "DevConnect AI suggests corrections, hashtags, and code-review improvements before you post." },
            { num: "03", color: "#2dd4bf", title: "Community Code Verification", desc: "Get responses from developers, resolve comments, and improve your projects faster." },
          ].map(({ num, color, title, desc, active }) => (
            <div key={num} style={S.workflowStep}>
              <div style={S.workflowNum(active, color)}>{num}</div>
              <div style={S.workflowCard}>
                <h3 style={S.workflowCardH3}>{title}</h3>
                <p style={S.workflowCardP}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={S.section} id="stats">
        <div style={S.sectionTitle}>
          <h2 style={S.sectionTitleH2}>
            Community <span style={S.sectionTitleSpan}>Statistics</span> Dashboard
          </h2>
          <p style={S.sectionTitleP}>Review dashboard data tracking community health and AI performance.</p>
        </div>

        <div style={S.statsDashboard}>
          {[
            { val: "10,482", label: "Active Engineers" },
            { val: "52,192", label: "AI Code Reviews" },
            { val: "4.2s", label: "Avg Review Latency" },
            { val: "99.8%", label: "System Uptime" },
          ].map(({ val, label }, i) => (
            <div key={label} style={S.statMetricCard(i)}>
              <div style={S.statMetricVal}>{val}</div>
              <div style={S.statMetricLabel}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section style={S.waitlistSection} id="waitlist">
        <h3 style={S.waitlistH3}>
          Join the <span style={S.waitlistH3Span}>DevConnect Waitlist</span>
        </h3>
        <p style={S.waitlistP}>
          Be the first to know when registration opens for public access and early beta features.
        </p>
        <div style={S.waitlistForm}>
          <input
            type="email"
            style={S.waitlistInput}
            placeholder="Enter your developer email..."
          />
          <button style={S.btnPrimary}>Get Early Access</button>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={S.cta}>
        <h2 style={S.ctaH2}>Ready to Accelerate Your Journey?</h2>
        <p style={S.ctaP}>
          Join the next generation of developer workspaces powered by local code reviews.
        </p>
        <Link href="/dashboard" style={S.btnPrimary}>Launch Community Feed</Link>
      </section>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        <p style={{ margin: 0 }}>© 2026 DevConnect AI • Built for Modern Engineering Teams</p>
      </footer>
    </main>
  );
}
