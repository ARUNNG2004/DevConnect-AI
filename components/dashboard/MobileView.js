"use client";

import FeedColumn from "./FeedColumn";
import PostCard from "./PostCard";

const S = {
  mainLayoutMobile: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: "16px 16px 80px",
    gap: 16,
    flex: 1,
  },
  aiPromoWidget: {
    background: "radial-gradient(circle at top right, rgba(168,85,247,0.15), transparent 60%), var(--bg-secondary)",
    border: "1px solid rgba(168,85,247,0.3)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    boxShadow: "var(--shadow-sm)",
  },
  widgetTitleAi: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#c084fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0 0 16px 0",
  },
  pulsePoint: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--accent-ai)",
    animation: "pulse-glow 2s infinite",
  },
  btnAiCta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: 10,
    backgroundColor: "var(--accent-ai)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  sidebarWidget: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    boxShadow: "var(--shadow-sm)",
  },
  widgetTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0 0 16px 0",
  },
  trendingPostCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "12px 14px",
    backgroundColor: "var(--bg-primary)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  collaborateCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "12px 14px",
    backgroundColor: "var(--bg-primary)",
    borderRadius: "var(--radius-md)",
    borderLeft: "3px solid #34d399",
    border: "1px solid rgba(52,211,153,0.25)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "48px 24px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  membersList: { display: "flex", flexDirection: "column", gap: 12 },
  memberItem: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  memberMeta: { display: "flex", alignItems: "center", gap: 10 },
  memberName: { fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" },
  memberRole: { fontSize: "0.7rem", color: "var(--text-muted)" },
  memberStatus: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" },
  statusDotOnline: {
    width: 8,
    height: 8,
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--accent-success)",
    boxShadow: "0 0 6px var(--accent-success)",
  },
  bottomTabBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: "flex",
    backgroundColor: "var(--bg-secondary)",
    borderTop: "1px solid var(--border-color)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  tabBarItem: (active) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 4px 8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    gap: 4,
    color: active ? "var(--accent-primary)" : "var(--text-muted)",
    fontFamily: "inherit",
    transition: "color 0.15s",
    fontSize: "0.6rem",
    fontWeight: active ? 700 : 500,
  }),
  tabBarIcon: { fontSize: "1.2rem", lineHeight: 1 },
  tabBarBadge: {
    position: "absolute",
    top: 8,
    right: "calc(50% - 16px)",
    backgroundColor: "var(--accent-primary)",
    color: "#000",
    borderRadius: 9999,
    width: 16,
    height: 16,
    fontSize: "0.6rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnActionActive: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "var(--accent-primary)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    fontFamily: "inherit",
  },
};

const MOBILE_TABS = [
  { id: "feed", icon: "▦", label: "Feed" },
  { id: "trending", icon: "🔥", label: "Trending" },
  { id: "questions", icon: "❔", label: "Questions" },
  { id: "collaboration", icon: "🤝", label: "Collab" },
  { id: "members", icon: "👥", label: "Members" },
  { id: "saved", icon: "🔖", label: "Saved" },
];

export default function MobileView({
  mobileTab,
  setMobileTab,
  savedPostIds,
  trendingPosts,
  activeMembers,
  posts,
  getLiveName,
  onToggleSave,
  onShowFeatureTour,
  feedColumnProps,
}) {
  const mobileTabs = MOBILE_TABS.map((tab) =>
    tab.id === "saved"
      ? { ...tab, badge: savedPostIds.length > 0 ? savedPostIds.length : null }
      : tab
  );

  const renderTabContent = () => {
    switch (mobileTab) {
      case "feed":
        return <FeedColumn {...feedColumnProps} />;

      case "trending":
        return (
          <div style={S.sidebarWidget}>
            <h3 style={S.widgetTitle}>🔥 Trending (48h)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {trendingPosts.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                  No trending posts in the last 48 hours.
                </p>
              ) : (
                trendingPosts.map((post) => {
                  const name = getLiveName(post.uid, post.displayName);
                  return (
                    <div key={post.id} style={S.trendingPostCard}>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {post.content}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>by {name}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--accent-primary)", fontWeight: 600 }}>❤️ {post.likes || 0}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case "questions":
        return (
          <div style={S.sidebarWidget}>
            <h3 style={S.widgetTitle}>❔ Questions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posts.filter((p) => p.postType === "question").length === 0 ? (
                <div style={S.emptyState}>
                  <div style={{ fontSize: "2rem" }}>🙋</div>
                  <div style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.9rem" }}>No questions yet</div>
                </div>
              ) : (
                posts.filter((p) => p.postType === "question").map((post) => {
                  const name = getLiveName(post.uid, post.displayName);
                  return (
                    <div key={post.id} style={S.trendingPostCard}>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {post.content}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>by {name}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>💬 {post.comments?.length || 0}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case "collaboration":
        return (
          <div style={S.sidebarWidget}>
            <h3 style={S.widgetTitle}>🤝 Collaborate</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posts.filter((p) => p.postType === "collaboration").length === 0 ? (
                <div style={S.emptyState}>
                  <div style={{ fontSize: "2rem" }}>🚀</div>
                  <div style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.9rem" }}>No collaboration posts yet</div>
                </div>
              ) : (
                posts.filter((p) => p.postType === "collaboration").map((post) => {
                  const name = getLiveName(post.uid, post.displayName);
                  return (
                    <div key={post.id} style={S.collaborateCard}>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {post.content}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>by {name}</span>
                        <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 600 }}>Open to collab</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case "members":
        return (
          <div style={S.sidebarWidget}>
            <h3 style={S.widgetTitle}>Active Members</h3>
            <div style={S.membersList}>
              {activeMembers.map((member) => {
                const name = member.displayName || member.email || "Anonymous";
                const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={member.id} style={S.memberItem}>
                    <div style={S.memberMeta}>
                      <div style={{
                        width: 28, height: 28, fontSize: "0.75rem",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        borderRadius: "var(--radius-full)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#000", fontWeight: 700,
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={S.memberName}>{name}</div>
                        <div style={S.memberRole}>{member.email}</div>
                      </div>
                    </div>
                    <div style={S.memberStatus}>
                      <span style={S.statusDotOnline} />
                      <span>Online</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "saved":
        return (
          <div style={S.sidebarWidget}>
            <h3 style={S.widgetTitle}>
              Saved Posts
              {savedPostIds.length > 0 && (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>
                  {savedPostIds.length} saved
                </span>
              )}
            </h3>
            {savedPostIds.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                No saved posts yet. Tap 🔖 on any post to save it.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {posts.filter((p) => savedPostIds.includes(p.id)).map((post) => (
                  <div key={post.id} style={{ padding: "10px 12px", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}>
                      {getLiveName(post.uid, post.displayName)}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {post.content}
                    </div>
                    <button
                      style={{ ...S.btnActionActive, padding: "4px 0", marginTop: 8, fontSize: "0.78rem" }}
                      onClick={() => onToggleSave(post.id)}
                    >
                      🔖 Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return <FeedColumn {...feedColumnProps} />;
    }
  };

  return (
    <>
      <div style={S.mainLayoutMobile}>
        {mobileTab === "feed" && (
          <div style={{ ...S.aiPromoWidget, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ ...S.widgetTitleAi, margin: 0, fontSize: "0.85rem" }}>
                  <span>Code Review Copilot</span>
                  <span style={{ ...S.pulsePoint, marginLeft: 8 }} />
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>AI-powered code review</div>
              </div>
              <button style={{ ...S.btnAiCta, width: "auto", padding: "8px 14px", fontSize: "0.8rem" }}>Try it</button>
            </div>
          </div>
        )}
        {renderTabContent()}
      </div>

      <nav style={S.bottomTabBar}>
        {mobileTabs.map(({ id, icon, label, badge }) => (
          <button key={id} style={S.tabBarItem(mobileTab === id)} onClick={() => setMobileTab(id)}>
            <span style={{ position: "relative", display: "inline-block" }}>
              <span style={S.tabBarIcon}>{icon}</span>
              {badge && (
                <span style={S.tabBarBadge}>{badge > 9 ? "9+" : badge}</span>
              )}
            </span>
            <span>{label}</span>
          </button>
        ))}
        <button style={S.tabBarItem(false)} onClick={onShowFeatureTour}>
          <span style={S.tabBarIcon}>ℹ️</span>
          <span>Tour</span>
        </button>
      </nav>
    </>
  );
}