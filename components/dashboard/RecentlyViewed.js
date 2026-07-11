"use client";

import { useState } from "react";
import UserAvatar from "./UserAvatar";

const S = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: (isHovered) => ({
    backgroundColor: "var(--bg-secondary)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: isHovered ? "var(--accent-primary)" : "var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 16,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: isHovered ? "var(--shadow-md)" : "var(--shadow-sm)",
    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    transition: "all var(--transition-fast)",
  }),
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  authorInfo: { display: "flex", alignItems: "center", gap: 10 },
  authorMeta: { display: "flex", flexDirection: "column" },
  authorName: { color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" },
  postTimestamp: { color: "var(--text-muted)", fontSize: "0.75rem" },
  categoryTag: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    backgroundColor:
      type === "question"      ? "rgba(251,146,60,0.12)"
      : type === "collaboration" ? "rgba(52,211,153,0.12)"
      : type === "poll"          ? "rgba(99,102,241,0.12)"
      : "var(--bg-primary)",
    border: `1px solid ${
      type === "question"      ? "rgba(251,146,60,0.4)"
      : type === "collaboration" ? "rgba(52,211,153,0.4)"
      : type === "poll"          ? "rgba(99,102,241,0.4)"
      : "var(--border-color)"
    }`,
    color:
      type === "question"      ? "#fb923c"
      : type === "collaboration" ? "#34d399"
      : type === "poll"          ? "#818cf8"
      : "var(--text-secondary)",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  }),
  postSnippet: {
    fontSize: "0.88rem",
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.5,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: 8,
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  footerItem: {
    display: "flex",
    alignItems: "center",
    gap: 4,
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
};

function formatTimestamp(ts) {
  if (!ts) return "Just now";
  
  if (typeof ts.toDate === "function") {
    return ts.toDate().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  
  const seconds = ts.seconds ?? ts._seconds;
  if (typeof seconds === "number") {
    return new Date(seconds * 1000).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  
  const d = new Date(ts);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  
  return "Just now";
}

function RecentlyViewedCard({ post, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  
  const type = post.postType || "discussion";
  const typeLabel =
    type === "question"      ? "Question"
    : type === "collaboration" ? "Collaborate"
    : type === "poll"          ? "Poll"
    : "Discussion";

  return (
    <div
      style={S.card(hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(post.id)}
    >
      <div style={S.cardHeader}>
        <div style={S.authorInfo}>
          <UserAvatar
            photoURL={post.photoURL}
            displayName={post.displayName}
            size={32}
            fontSize="0.8rem"
          />
          <div style={S.authorMeta}>
            <span style={S.authorName}>{post.displayName || "Anonymous"}</span>
            <span style={S.postTimestamp}>{formatTimestamp(post.timestamp)}</span>
          </div>
        </div>
        <span style={S.categoryTag(type)}>{typeLabel}</span>
      </div>

      <p style={S.postSnippet}>
        {post.content || "Empty post content..."}
      </p>

      <div style={S.cardFooter}>
        <span style={S.footerItem}>
          ❤️ {post.likes || 0}
        </span>
        <span style={S.footerItem}>
          💬 {post.comments?.length || 0}
        </span>
        <span style={S.footerItem}>
          🔖 {post.saveCount || 0}
        </span>
      </div>
    </div>
  );
}

export default function RecentlyViewed({ posts = [], onNavigateToPost }) {
  if (posts.length === 0) {
    return (
      <div style={S.emptyState}>
        <div style={{ fontSize: "2rem" }}>🕒</div>
        <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No viewing history yet</div>
        <div style={{ fontSize: "0.85rem" }}>Posts you click to read comments on will appear here.</div>
      </div>
    );
  }

  return (
    <div style={S.container}>
      {posts.map((post) => (
        <RecentlyViewedCard
          key={post.id}
          post={post}
          onNavigate={onNavigateToPost}
        />
      ))}
    </div>
  );
}
