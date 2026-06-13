"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  panel: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    width: "100%",
    maxWidth: 640,
    maxHeight: "85vh",
    overflowY: "auto",
    padding: 24,
    boxShadow: "var(--shadow-sm)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "1.2rem",
    padding: 4,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: {
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: 16,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  authorName: {
    color: "var(--text-primary)",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  timestamp: {
    color: "var(--text-muted)",
    fontSize: "0.75rem",
  },
  body: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
  },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: { color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: 500 },
  empty: {
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    textAlign: "center",
    padding: "30px 0",
  },
  unsaveBtn: {
    background: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "0.75rem",
    padding: "4px 10px",
  },
};

/**
 * SavedPosts modal/panel
 * Reads the current user's saved post IDs from `users/{uid}.savedPosts`
 * (an array of post IDs) and fetches + displays those posts.
 *
 * Props:
 *  - onClose: () => void
 *  - onUnsave: (postId) => void  (optional, lets parent toggle save state)
 */
export default function SavedPosts({ onClose, onUnsave }) {
  const { user } = useAuth();
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to the user's saved post IDs
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const data = snap.data();
      setSavedPostIds(data?.savedPosts || []);
    });
    return () => unsub();
  }, [user]);

  // Fetch the actual post documents for those IDs
  useEffect(() => {
    if (!user) return;
    if (savedPostIds.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const results = await Promise.all(
        savedPostIds.map(async (postId) => {
          try {
            const snap = await getDoc(doc(db, "posts", postId));
            if (!snap.exists()) return null;
            return { id: snap.id, ...snap.data() };
          } catch {
            return null;
          }
        })
      );
      if (!cancelled) {
        setPosts(results.filter(Boolean));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [savedPostIds, user]);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.panel} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <h2 style={S.title}>🔖 Saved Posts</h2>
          <button style={S.closeBtn} onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {loading ? (
          <p style={S.empty}>Loading saved posts...</p>
        ) : posts.length === 0 ? (
          <p style={S.empty}>You haven't saved any posts yet.</p>
        ) : (
          <div style={S.list}>
            {posts.map((post) => (
              <div key={post.id} style={S.card}>
                <div style={S.cardHeader}>
                  <div>
                    <div style={S.authorName}>
                      {post.displayName || "Anonymous User"}
                    </div>
                    <div style={S.timestamp}>
                      {post.timestamp?.toDate
                        ? post.timestamp.toDate().toLocaleString()
                        : ""}
                    </div>
                  </div>
                  {onUnsave && (
                    <button
                      style={S.unsaveBtn}
                      onClick={() => onUnsave(post.id)}
                      title="Remove from saved"
                    >
                      ✕ Unsave
                    </button>
                  )}
                </div>

                <div style={S.body}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                  </ReactMarkdown>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div style={S.tags}>
                    {post.tags.map((tag) => (
                      <span key={tag} style={S.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}