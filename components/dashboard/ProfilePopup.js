"use client";

import { useState } from "react";
import UserAvatar from "./UserAvatar";

export default function ProfilePopup({ data, posts, currentUser, following, onClose, onFollowToggle, onViewProfile }) {
  const [followLoading, setFollowLoading] = useState(false);
  if (!data) return null;

  const isSelf = currentUser?.uid === data.uid;
  const isFollowing = following.includes(data.uid);
  const userPostCount = posts.filter((p) => p.uid === data.uid).length;

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!currentUser || followLoading) return;
    setFollowLoading(true);
    try { await onFollowToggle(data.uid, isFollowing); }
    finally { setFollowLoading(false); }
  };

  const handleViewProfile = (e) => {
    e.stopPropagation();
    onClose();
    onViewProfile(data.uid);
  };

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={onClose} />

      <div
        style={{
          position: "fixed", top: data.y, left: data.x, zIndex: 999,
          width: 224,
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 14px",
          boxShadow: "0 4px 28px rgba(0,0,0,0.45)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          transform: "translateY(-50%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pointer arrow */}
        {!data.flipped ? (
          <>
            <div style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "8px solid var(--border-color)" }} />
            <div style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "7px solid var(--bg-secondary)" }} />
          </>
        ) : (
          <>
            <div style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "8px solid var(--border-color)" }} />
            <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "7px solid var(--bg-secondary)" }} />
          </>
        )}

        <UserAvatar photoURL={data.photoURL} displayName={data.displayName} size={52} fontSize="1.3rem" />

        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: 4 }}>
            {data.displayName || "Anonymous User"}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", backgroundColor: "var(--accent-primary-alpha)", color: "var(--accent-primary)", borderRadius: "var(--radius-full)", fontSize: "0.68rem", fontWeight: 600 }}>
            Community Member
          </div>
        </div>

        <div style={{ display: "flex", width: "100%", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "8px 0", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1rem" }}>{userPostCount}</div>
            <div style={{ fontSize: "0.63rem", color: "var(--text-muted)" }}>Posts</div>
          </div>
          <div style={{ width: 1, backgroundColor: "var(--border-color)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1rem" }}>{data.followersCount ?? 0}</div>
            <div style={{ fontSize: "0.63rem", color: "var(--text-muted)" }}>Followers</div>
          </div>
          <div style={{ width: 1, backgroundColor: "var(--border-color)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1rem" }}>{data.followingCount ?? 0}</div>
            <div style={{ fontSize: "0.63rem", color: "var(--text-muted)" }}>Following</div>
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
          {!isSelf && currentUser && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              style={{
                width: "100%", padding: "7px 0",
                borderRadius: "var(--radius-md)",
                border: isFollowing ? "1px solid var(--border-color)" : "none",
                backgroundColor: isFollowing ? "transparent" : "var(--accent-primary)",
                color: isFollowing ? "var(--text-secondary)" : "#000",
                fontWeight: 700, fontSize: "0.82rem",
                cursor: followLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: followLoading ? 0.7 : 1,
                transition: "all 0.15s",
              }}
            >
              {followLoading ? "…" : isFollowing ? "✓ Following" : "+ Follow"}
            </button>
          )}

          {!isSelf && (
            <button
              onClick={handleViewProfile}
              style={{
                width: "100%", padding: "7px 0",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--accent-primary)",
                backgroundColor: "var(--accent-primary-alpha)",
                color: "var(--accent-primary)",
                fontWeight: 600, fontSize: "0.82rem",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              👤 View Profile
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "6px 0",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-muted)",
              fontWeight: 500, fontSize: "0.78rem",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}