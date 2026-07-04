"use client";
import { useRouter } from "next/navigation";


const S = {
  rightSidebar: {
    position: "sticky",
    top: 88,
    height: "calc(100vh - 112px)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflowY: "auto",
    paddingRight: 4,
  },
  sidebarWidget: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    boxShadow: "var(--shadow-sm)",
  },
  aiPromoWidget: {
    background: "radial-gradient(circle at top right, rgba(168,85,247,0.15), transparent 60%), var(--bg-secondary)",
    border: "1px solid rgba(168,85,247,0.3)",
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
  aiPromoText: { fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 16px 0" },
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
  trendingList: { display: "flex", flexDirection: "column", gap: 12 },
  trendingItem: { display: "flex", flexDirection: "column", gap: 2 },
  trendingLink: {
    color: "var(--text-secondary)",
    fontWeight: 600,
    fontSize: "0.88rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textDecoration: "none",
  },
  trendingLinkActive: {
    color: "var(--accent-primary)",
    fontWeight: 700,
    fontSize: "0.88rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textDecoration: "none",
    cursor: "pointer",
  },
  trendingStats: { fontSize: "0.72rem", color: "var(--text-muted)" },
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
};

export default function RightSidebar({ trendingTags, activeMembers, activeTag, onTagClick }) {

  const router = useRouter();
  return (
    <aside style={S.rightSidebar}>
      {/* AI Copilot widget */}
      <div id="ai-copilot-widget" style={S.aiPromoWidget}>
        <h3 style={S.widgetTitleAi}>
          <span>Code Review Copilot</span>
          <span style={S.pulsePoint} />
        </h3>
        <p style={S.aiPromoText}>
          Let AI review your code changes, suggest performance improvements, and write documentation snippets.
        </p>
        <button
          style={S.btnAiCta}
          onClick={() => router.push("/code-review")}
        >
          Ask for AI Code Review
        </button>
      </div>

      {/* Rooms promo widget */}
      <div id="rooms-promo-widget" style={{
        background: "radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 60%), var(--bg-secondary)",
        border: "1px solid rgba(59,130,246,0.3)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        boxShadow: "var(--shadow-sm)",
      }}>
        <h3 style={{ ...S.widgetTitleAi, color: "#60a5fa" }}>
          <span>Coding Rooms</span>
          <span style={S.pulsePoint} />
        </h3>
        <p style={S.aiPromoText}>
          Collaborate in real-time — chat, share notes, co-edit code, and meet with voice/video.
        </p>
        <button
          style={{ ...S.btnAiCta, background: "rgba(59,130,246,0.9)" }}
          onClick={() => router.push("/rooms")}
        >
          Open Rooms
        </button>
      </div>

      {/* Trending Tags widget */}
      <div id="trending-tags-widget" style={S.sidebarWidget}>
        <h3 style={S.widgetTitle}>Trending Tags</h3>
        <div style={S.trendingList}>
          {trendingTags.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              No tags yet — be the first to tag a post!
            </p>
          ) : (
            trendingTags.map(({ tag, posts: p, new: newPosts }) => (
              <div key={tag} style={S.trendingItem}>
                <button
                  onClick={() => onTagClick(tag)}
                  style={activeTag === tag ? S.trendingLinkActive : S.trendingLink}
                >
                  <span>{tag}</span><span>{p}</span>
                </button>
                <span style={S.trendingStats}>{newPosts}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Members widget */}
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
    </aside>
  );
}