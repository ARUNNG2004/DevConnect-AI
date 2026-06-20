"use client";

const FEED_TABS = [
  { id: "latest", label: "Latest Feed", icon: "▦" },
  { id: "trending", label: "Trending", icon: "📈" },
  { id: "questions", label: "Questions", icon: "❔" },
  { id: "collaboration", label: "Collaborate", icon: "👥" },
];

const S = {
  leftSidebar: {
    position: "sticky",
    top: 88,
    height: "calc(100vh - 112px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  sidebarNavList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    margin: 0,
    padding: 0,
  },
  sidebarNavItemLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius-md)",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all var(--transition-fast)",
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
    fontSize: "inherit",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  sidebarNavItemLinkActive: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    color: "var(--accent-primary)",
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    textDecoration: "none",
    backgroundColor: "var(--accent-primary-alpha)",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontSize: "inherit",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  sidebarFooterCard: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    padding: 16,
    borderRadius: "var(--radius-lg)",
    fontSize: "0.85rem",
  },
  sidebarFooterCardP: {
    color: "var(--text-muted)",
    marginBottom: 12,
    margin: "0 0 12px 0",
  },
  btnSidebarCta: {
    display: "block",
    textAlign: "center",
    padding: "8px 12px",
    backgroundColor: "var(--accent-primary-alpha)",
    color: "var(--accent-primary)",
    fontWeight: 600,
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
  },
};

export default function LeftSidebar({ activeTab, setActiveTab, savedPostIds, onShowSavedPosts, onShowFeatureTour }) {
  return (
    <aside style={S.leftSidebar}>
      <ul style={S.sidebarNavList}>
        {FEED_TABS.map(({ id, label, icon }) => (
          <li key={id}>
            <button
              style={activeTab === id ? S.sidebarNavItemLinkActive : S.sidebarNavItemLink}
              onClick={() => setActiveTab(id)}
            >
              <span>{icon}</span><span>{label}</span>
            </button>
          </li>
        ))}
        <li>
          <button id="saved-posts-nav" style={S.sidebarNavItemLink} onClick={onShowSavedPosts}>
            <span>🔖</span><span>Saved Posts</span>
            {savedPostIds.length > 0 && (
              <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {savedPostIds.length}
              </span>
            )}
          </button>
        </li>
        <li>
          <button style={S.sidebarNavItemLink} onClick={onShowFeatureTour}>
            <span>ℹ️</span><span>Features Tour</span>
          </button>
        </li>
      </ul>
      <div style={S.sidebarFooterCard}>
        <p style={S.sidebarFooterCardP}>Get instant AI reviews of your code repositories directly from GitHub.</p>
        <a href="/#features" style={S.btnSidebarCta}>Activate AI Copilot</a>
      </div>
    </aside>
  );
}