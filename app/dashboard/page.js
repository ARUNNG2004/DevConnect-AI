"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import CodeEditorModal from "../../components/CodeEditorModal";
import SavedPosts from "../../components/SavedPosts";
import FeatureTour from "../../components/FeatureTour";
import { useAuth } from "../../context/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";
import { db } from "../../lib/firebase";
import AIDraftAssistant from "../../components/AIDraftAssistant";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";          // imported 'where' for raeltime active member

const S = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--bg-primary)",
  },
  // mainLayout is now computed dynamically based on breakpoint (see render)
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
    transition: "all var(--transition-fast)",
  },
  feedColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minWidth: 0,
  },
  composerCard: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "var(--shadow-sm)",
  },
  composerHeader: {
    display: "flex",
    gap: 12,
  },
  avatar: {
    position: "relative",
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
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
  composerInputWrapper: { flex: 1 },
  composerTextarea: {
    width: "100%",
    minHeight: 80,
    background: "transparent",
    border: "none",
    resize: "vertical",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.95rem",
    fontFamily: "inherit",
  },
  composerTagsInput: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  tagBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  tagBadgeSelected: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    backgroundColor: "var(--accent-primary-alpha)",
    border: "1px solid var(--accent-primary)",
    color: "var(--accent-primary)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  composerActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    marginTop: 2,
    borderTop: "1px solid var(--border-color)",
  },
  composerTools: { display: "flex", gap: 8 },
  composerToolBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    background: "transparent",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  aiHelperToggle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: 500,
    color: "var(--text-muted)",
    userSelect: "none",
  },
  btnPost: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    backgroundColor: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#000",
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  },
  btnPostDisabled: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    backgroundColor: "var(--border-color)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "var(--text-muted)",
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "not-allowed",
  },
  feedFiltersBar: {
    display: "flex",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: 2,
    gap: 8,
    overflowX: "auto",
  },
  filterTab: {
    padding: "8px 16px",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    fontWeight: 500,
    fontSize: "0.9rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  filterTabActive: {
    padding: "8px 16px",
    border: "none",
    background: "transparent",
    color: "var(--accent-primary)",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    borderBottom: "2px solid var(--accent-primary)",
  },
  discussionCard: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  authorInfo: { display: "flex", alignItems: "center", gap: 12 },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
    border: "2px solid var(--border-color)",
    background: "var(--bg-primary)",
  },
  authorMeta: { display: "flex", flexDirection: "column" },
  authorName: { color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" },
  authorTitle: { color: "var(--text-muted)", fontSize: "0.75rem" },
  postTimestamp: { color: "var(--text-muted)", fontSize: "0.8rem" },
  categoryTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  postTitle: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.4,
    margin: 0,
  },
  postBody: { fontSize: "0.95rem", color: "var(--text-secondary)" },
  postTags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 },
  postTag: { color: "var(--accent-primary)", fontSize: "0.85rem", fontWeight: 500 },
  postActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    padding: "8px 4px",
    marginTop: 4,
  },
  postActionsGroup: { display: "flex", gap: 16 },
  btnAction: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
    padding: "6px 10px",
    borderRadius: "var(--radius-sm)",
  },
  btnActionActive: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: "var(--accent-primary)",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    padding: "6px 10px",
    borderRadius: "var(--radius-sm)",
  },
  btnActionDanger: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: "#f87171",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 500,
    padding: "4px 6px",
    borderRadius: "var(--radius-sm)",
  },
  // Comment styles
  commentItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "10px 12px",
    backgroundColor: "var(--bg-primary)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  commentHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentAuthor: {
    fontWeight: 600,
    fontSize: "0.85rem",
    color: "var(--text-primary)",
  },
  commentMeta: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  commentBody: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  commentEditTextarea: {
    width: "100%",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    padding: "6px 8px",
    resize: "vertical",
    minHeight: 60,
  },
  commentEditActions: {
    display: "flex",
    gap: 6,
    marginTop: 4,
  },
  btnSm: {
    padding: "4px 12px",
    backgroundColor: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "#000",
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  btnSmGhost: {
    padding: "4px 12px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-muted)",
    fontWeight: 500,
    fontSize: "0.8rem",
    cursor: "pointer",
  },
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
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0 0 16px 0",
  },
  widgetTitleAi: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#c084fc",
    marginBottom: 16,
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
  aiPromoText: { fontSize: "0.85rem", marginBottom: 16, color: "var(--text-secondary)", margin: "0 0 16px 0" },
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
  },
  trendingList: { display: "flex", flexDirection: "column", gap: 12 },
  trendingItem: { display: "flex", flexDirection: "column", gap: 2 },
  trendingLink: {
    color: "var(--text-secondary)",
    fontWeight: 600,
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textDecoration: "none",
  },
  trendingStats: { fontSize: "0.75rem", color: "var(--text-muted)" },
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

const FEATURE_TOUR_KEY = "devconnect_feature_tour_seen";

export default function Dashboard() {
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const[activeMembers, setActiveMembers] = useState([]);                      //for active members
  // Track which comment is being edited: { postId, createdAt }
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");

  // ── Saved posts ──────────────────────────────────────────────────────────
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [showSavedPosts, setShowSavedPosts] = useState(false);

  // ── Feature tour ─────────────────────────────────────────────────────────
  const [showFeatureTour, setShowFeatureTour] = useState(false);

  const availableTags = [
    "#react", "#nextjs", "#javascript", "#typescript",
    "#frontend", "#backend", "#nodejs", "#python",
    "#rust", "#go", "#ai-agents", "#machine-learning",
    "#css", "#devops", "#docker", "#database",
  ];

  // Show the feature tour automatically on a user's first visit
  useEffect(() => {
    try {
      const seen = localStorage.getItem(FEATURE_TOUR_KEY);
      if (!seen) {
        setShowFeatureTour(true);
      }
    } catch {
      // localStorage unavailable (e.g. SSR) - ignore
    }
  }, []);

  const closeFeatureTour = () => {
    setShowFeatureTour(false);
    try {
      localStorage.setItem(FEATURE_TOUR_KEY, "true");
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error(err);
        setError("Failed to load posts.");
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to the current user's saved post IDs (stored on users/{uid})
  useEffect(() => {
    if (!user) {
      setSavedPostIds([]);
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.data();
        setSavedPostIds(data?.savedPosts || []);
      },
      (err) => {
        console.error(err);
      }
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {                                                                               //Added new UseEffect
    const  membersQuery = query(
      collection(db, "users"),
      where("isOnline", "==", true)
    );

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        setActiveMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error(err);
      }
    );

    return () => unsubscribe();
  }, []);

  // ── Trending tags, computed live from posts ────────────────────────────────
  const trendingTags = useMemo(() => {
    const counts = {};
    const newToday = {};
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    posts.forEach((post) => {
      const postDate = post.timestamp?.toDate ? post.timestamp.toDate() : null;
      const isToday = postDate && postDate >= startOfToday;

      (post.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
        if (isToday) newToday[tag] = (newToday[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({
        tag,
        posts: `${count} post${count === 1 ? "" : "s"}`,
        new: newToday[tag] ? `+${newToday[tag]} new today` : "No new posts today",
      }));
  }, [posts]);

  // ── Mobile filter: All Posts | My Posts | Trending | Recent ───────────────
  // Desktop uses the existing sidebar nav — this is mobile-only.
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredPosts = useMemo(() => {
    switch (activeFilter) {
      case "mine":
        return posts.filter((p) => p.uid === user?.uid);
      case "trending":
        return [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "recent": {
        const since = Date.now() - 24 * 60 * 60 * 1000; // last 24 h
        const recent = posts.filter((p) => {
          const ts = p.timestamp?.toDate ? p.timestamp.toDate().getTime() : 0;
          return ts >= since;
        });
        return recent.length > 0 ? recent : posts.slice(0, 10);
      }
      default:
        return posts; // "all"
    }
  }, [posts, activeFilter, user?.uid]);

  const searchedPosts = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return filteredPosts;
  return filteredPosts.filter((post) => {
    const inContent = post.content?.toLowerCase().includes(q);
    const inAuthor  = post.displayName?.toLowerCase().includes(q);
    const inTags    = (post.tags || []).some((tag) => tag.toLowerCase().includes(q));
    return inContent || inAuthor || inTags;
  });
}, [filteredPosts, searchQuery]);

  // ── Post actions ────────────────────────────────────────────────────────────

  const addCustomTag = () => {
    let tag = customTag.trim();
    if (!tag) return;
    if (!tag.startsWith("#")) tag = "#" + tag;
    tag = tag.toLowerCase().replace(/\s+/g, "-");
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
    setCustomTag("");
  };

  const handleCreatePost = async () => {
    if (!content.trim() || !user) return;
    try {
      setPosting(true);
      setError("");
      await addDoc(collection(db, "posts"), {
        uid: user.uid,
        displayName: user.displayName || user.email || "Anonymous User",
        photoURL: user.photoURL || "",
        content: content.trim(),
        tags: selectedTags,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: [],
      });
      setContent("");
      setSelectedTags([]);
    } catch (err) {
      console.error(err);
      setError("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleInsertCode = (codeBlock) => {
    setContent((prev) => prev + (prev ? "\n\n" : "") + codeBlock);
    setShowCodeEditor(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleLike = async (post) => {
    if (!user) return;
    const liked = (post.likedBy || []).includes(user.uid);
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes: (post.likedBy || []).length + (liked ? -1 : 1),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update like. Please try again.");
    }
  };

  // Toggle save/unsave a post for the current user.
  // Saved post IDs are stored in users/{uid}.savedPosts (array of post IDs).
  const handleToggleSave = async (postId) => {
    if (!user) return;
    const isSaved = savedPostIds.includes(postId);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          savedPosts: isSaved ? arrayRemove(postId) : arrayUnion(postId),
        },
        { merge: true }
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update saved posts. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete post. Please try again.");
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (postId) => {
    if (!editContent.trim()) return;
    try {
      await updateDoc(doc(db, "posts", postId), {
        content: editContent.trim(),
        edited: true,
      });
      setEditingId(null);
      setEditContent("");
    } catch (err) {
      console.error(err);
      setError("Failed to update post. Please try again.");
    }
  };

  // ── Comment actions ─────────────────────────────────────────────────────────

  const toggleComments = (postId) => {
    setOpenCommentsFor((prev) => (prev === postId ? null : postId));
    setCommentDraft("");
    setEditingComment(null);
  };

  const handleAddComment = async (post) => {
    if (!commentDraft.trim() || !user) return;
    const newComment = {
      uid: user.uid,
      displayName: user.displayName || user.email || "Anonymous User",
      content: commentDraft.trim(),
      createdAt: Date.now(),
      edited: false,
    };
    try {
      await updateDoc(doc(db, "posts", post.id), {
        comments: arrayUnion(newComment),
      });
      setCommentDraft("");
    } catch (err) {
      console.error(err);
      setError("Failed to add comment. Please try again.");
    }
  };

  // Edit: replace the old comment object with an updated one via array replace
  const startEditComment = (comment) => {
    setEditingComment({ postId: comment._postId, createdAt: comment.createdAt });
    setEditingCommentDraft(comment.content);
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setEditingCommentDraft("");
  };

  const handleSaveCommentEdit = async (post, oldComment) => {
    if (!editingCommentDraft.trim()) return;
    const updatedComments = (post.comments || []).map((c) =>
      c.createdAt === oldComment.createdAt && c.uid === oldComment.uid
        ? { ...c, content: editingCommentDraft.trim(), edited: true }
        : c
    );
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: updatedComments });
      setEditingComment(null);
      setEditingCommentDraft("");
    } catch (err) {
      console.error(err);
      setError("Failed to edit comment. Please try again.");
    }
  };

  const handleDeleteComment = async (post, comment) => {
    if (!window.confirm("Delete this comment?")) return;
    const updatedComments = (post.comments || []).filter(
      (c) => !(c.createdAt === comment.createdAt && c.uid === comment.uid)
    );
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: updatedComments });
    } catch (err) {
      console.error(err);
      setError("Failed to delete comment. Please try again.");
    }
  };

  // ── Responsive layout grid ─────────────────────────────────────────────────

  const mainLayout = {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : isTablet
      ? "1fr 300px"
      : "240px 1fr 320px",
    gap: isMobile ? 16 : 20,
    maxWidth: 1440,
    width: "100%",
    margin: "0 auto",
    flex: 1,
    boxSizing: "border-box",
    paddingTop: isMobile ? 12 : isTablet ? 16 : 24,
    paddingRight: isMobile ? 12 : isTablet ? 16 : 24,
    paddingBottom: isMobile ? 80 : isTablet ? 24 : 24,
    paddingLeft: isMobile ? 12 : isTablet ? 16 : 24,
    alignItems: "start",
  };

  // Mobile bottom nav items
  const mobileNavItems = [
    { icon: "▦", label: "Feed", active: true },
    { icon: "📈", label: "Trending" },
    { icon: "❔", label: "Q&A" },
    { icon: "👥", label: "Collab" },
    { icon: "🔖", label: "Saved" },
  ];

  // ── Shared widget JSX — uses live trendingTags & activeMembers from Firebase ──
  const RightWidgets = ({ inline }) => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      ...(inline ? {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 12,
      } : {}),
    }}>
      {/* AI Copilot promo */}
      <div id="ai-copilot-widget" style={S.aiPromoWidget}>
        <h3 style={S.widgetTitleAi}>
          <span>Code Review Copilot</span>
          <span style={S.pulsePoint} />
        </h3>
        <p style={S.aiPromoText}>
          Let AI review your code changes, suggest performance improvements, and write documentation snippets.
        </p>
        <button style={S.btnAiCta}>
          <span>Ask for AI Code Review</span>
        </button>
      </div>

      {/* Trending Tags — live from Firebase posts */}
      <div id="trending-tags-widget" style={S.sidebarWidget}>
        <h3 style={S.widgetTitle}>Trending Tags</h3>
        <div style={S.trendingList}>
          {trendingTags.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              No tags yet — be the first to tag a post!
            </p>
          ) : (
            trendingTags.map(({ tag, posts, new: newPosts }) => (
              <div key={tag} style={S.trendingItem}>
                <a href="#" style={S.trendingLink}>
                  <span>{tag}</span>
                  <span>{posts}</span>
                </a>
                <span style={S.trendingStats}>{newPosts}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Members — real-time from Firebase */}
      <div style={S.sidebarWidget}>
        <h3 style={S.widgetTitle}>Active Members</h3>
        <div style={S.membersList}>
          {activeMembers.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>No members online.</p>
          ) : (
            activeMembers.map((member) => {
              const name = member.displayName || member.email || "Anonymous";
              const initials = name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
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
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <div style={S.appContainer}>
          <Navbar
  variant="dashboard"
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
/>

          <div style={mainLayout}>
            {/* ── Left Sidebar — desktop only (bottom nav used on mobile/tablet) ── */}
            {!isMobile && !isTablet && (
              <aside style={S.leftSidebar}>
                <ul style={S.sidebarNavList}>
                  {[
                    { icon: "▦", label: "Feed", active: true },
                    { icon: "📈", label: "Trending" },
                    { icon: "❔", label: "Questions" },
                    { icon: "👥", label: "Collaborations" },
                  ].map(({ icon, label, active }) => (
                    <li key={label}>
                      <button style={active ? S.sidebarNavItemLinkActive : S.sidebarNavItemLink}>
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      id="saved-posts-nav"
                      style={S.sidebarNavItemLink}
                      onClick={() => setShowSavedPosts(true)}
                    >
                      <span>🔖</span>
                      <span>Saved Posts</span>
                      {savedPostIds.length > 0 && (
                        <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {savedPostIds.length}
                        </span>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      style={S.sidebarNavItemLink}
                      onClick={() => setShowFeatureTour(true)}
                    >
                      <span>ℹ️</span>
                      <span>Features Tour</span>
                    </button>
                  </li>
                </ul>
                <div style={S.sidebarFooterCard}>
                  <p style={S.sidebarFooterCardP}>
                    Get instant AI reviews of your code repositories directly from GitHub.
                  </p>
                  <a href="/#features" style={S.btnSidebarCta}>
                    Activate AI Copilot
                  </a>
                </div>
              </aside>
            )}

            {/* ── Feed Column ──────────────────────────────────────────── */}
            <section style={S.feedColumn}>
              {/* Composer */}
              <div id="composer-card" style={S.composerCard}>
                <div style={S.composerHeader}>
                  <div style={S.avatar}>
                    {user?.displayName?.charAt(0)?.toUpperCase() || "ME"}
                  </div>
                  <div style={S.composerInputWrapper}>
                    <textarea
                      style={S.composerTextarea}
                      placeholder="Share a coding question, project idea, or debugging help..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                </div>

                <div id="composer-tags" style={S.composerTagsInput}>
                  {availableTags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        ...(selectedTags.includes(tag) ? S.tagBadgeSelected : S.tagBadge),
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      {tag}
                    </span>
                  ))}

                  {/* Show any custom tags the user has added that aren't in the default list */}
                  {selectedTags
                    .filter((tag) => !availableTags.includes(tag))
                    .map((tag) => (
                      <span
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{ ...S.tagBadgeSelected, cursor: "pointer", userSelect: "none" }}
                      >
                        {tag} ✕
                      </span>
                    ))}

                  {/* Custom tag input */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomTag();
                        }
                      }}
                      placeholder="Add tag..."
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-full)",
                        color: "var(--text-primary)",
                        outline: "none",
                        fontSize: "0.8rem",
                        padding: "4px 10px",
                        width: 90,
                      }}
                    />
                    <button
                      onClick={addCustomTag}
                      type="button"
                      style={{
                        ...S.tagBadge,
                        cursor: "pointer",
                        padding: "4px 10px",
                        border: "1px solid var(--accent-primary)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

                <div style={{ ...S.composerActions, gap: 8 }}>
                  {/* Icon tools */}
                  <button style={S.composerToolBtn} title="Add Image">🖼️</button>
                  <button
                    id="open-code-editor-btn"
                    style={S.composerToolBtn}
                    title="Insert Code Block"
                    onClick={() => setShowCodeEditor(true)}
                  >
                    {"</>"}
                  </button>

                  {/* Divider */}
                  <span style={{ width: 1, height: 18, background: "var(--border-color)", flexShrink: 0 }} />

                  {/* AI Draft toggle — marginRight:auto pushes Post button to far right */}
                  <label
                    id="ai-draft-toggle"
                    style={{ ...S.aiHelperToggle, marginRight: "auto" }}
                    onClick={() => setShowAiDraft((prev) => !prev)}
                  >
                    <span style={{
                      position: "relative",
                      display: "inline-block",
                      width: 30,
                      height: 16,
                      backgroundColor: showAiDraft ? "var(--accent-ai)" : "var(--border-color)",
                      borderRadius: "var(--radius-full)",
                      transition: "background-color 0.2s",
                      flexShrink: 0,
                    }}>
                      <span style={{
                        position: "absolute",
                        top: 3,
                        left: showAiDraft ? 17 : 3,
                        width: 10,
                        height: 10,
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        transition: "left 0.2s",
                      }} />
                    </span>
                    <span>AI Draft</span>
                  </label>

                  {/* Post button */}
                  <button
                    style={posting || !content.trim() ? S.btnPostDisabled : S.btnPost}
                    onClick={handleCreatePost}
                    disabled={posting || !content.trim()}
                  >
                    {posting ? "Posting..." : "Post Discussion"}
                  </button>
                </div>

                {showAiDraft && (
                  <AIDraftAssistant
                    onInsert={(draft) => {
                      setContent((prev) => (prev ? prev + "\n\n" + draft : draft));
                      setShowAiDraft(false);
                    }}
                  />
                )}
              </div>

              {/* ── Post filter pill bar — all devices ───────────────────── */}
              <div style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 4,
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}>
                {[
                  { key: "all",      label: "All Posts", icon: "▦"  },
                  { key: "mine",     label: "My Posts",  icon: "👤" },
                  { key: "trending", label: "Trending",  icon: "🔥" },
                  { key: "recent",   label: "Recent",    icon: "🕐" },
                ].map(({ key, label, icon }) => {
                  const isActive = activeFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveFilter(key)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        flexShrink: 0,
                        padding: "7px 14px",
                        borderRadius: "var(--radius-full)",
                        border: isActive
                          ? "1px solid var(--accent-primary)"
                          : "1px solid var(--border-color)",
                        backgroundColor: isActive
                          ? "var(--accent-primary-alpha)"
                          : "var(--bg-secondary)",
                        color: isActive
                          ? "var(--accent-primary)"
                          : "var(--text-secondary)",
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                      {isActive && (
  <span style={{
    marginLeft: 2,
    background: "var(--accent-primary)",
    color: "#000",
    borderRadius: "var(--radius-full)",
    fontSize: "0.65rem",
    fontWeight: 700,
    padding: "1px 6px",
  }}>
    {searchedPosts.length}
  </span>
)}
                    </button>
                  );
                })}
              </div>


              {/* ── Search results summary ── */}
{searchQuery.trim() && (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
  }}>
    <span style={{ color: "var(--text-secondary)" }}>
      🔍 <strong style={{ color: "var(--text-primary)" }}>{searchedPosts.length}</strong>
      {searchedPosts.length === 1 ? " result" : " results"} for{" "}
      <strong style={{ color: "var(--accent-primary)" }}>"{searchQuery}"</strong>
    </span>
    <button
      onClick={() => setSearchQuery("")}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--text-muted)",
        cursor: "pointer",
        fontSize: "0.8rem",
        padding: "2px 6px",
        borderRadius: "var(--radius-sm)",
      }}
    >
      ✕ Clear
    </button>
  </div>
)}

              {/* Posts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {searchedPosts.length === 0 ? (
  <p style={{ color: "var(--text-muted)" }}>
    {searchQuery.trim()
      ? `No posts found for "${searchQuery}".`
      : activeFilter === "mine"
      ? "You haven't posted anything yet."
      : activeFilter === "recent"
      ? "No posts in the last 24 hours."
      : "No posts yet. Create the first post!"}
  </p>
                ) : (
                  searchedPosts.map((post, postIndex) => {
                    const isSaved = savedPostIds.includes(post.id);
                    return (
                      <article style={S.discussionCard} key={post.id}>
                        <div style={S.cardHeader}>
                          <div style={S.authorInfo}>
                            <div style={S.authorAvatar}>
                              {post.displayName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div style={S.authorMeta}>
                              <span style={S.authorName}>{post.displayName || "Anonymous User"}</span>
                              <span style={S.authorTitle}>Community Member</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={S.categoryTag}>Discussion</span>
                            <span style={S.postTimestamp}>
                              {post.timestamp?.toDate
                                ? post.timestamp.toDate().toLocaleString()
                                : "Just now"}
                              {post.edited ? " (edited)" : ""}
                            </span>
                          </div>
                        </div>

                        <h2 style={S.postTitle}>Community Discussion</h2>

                        {editingId === post.id ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <textarea
                              style={S.composerTextarea}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button style={S.btnPost} onClick={() => handleSaveEdit(post.id)}>Save</button>
                              <button style={S.btnAction} onClick={cancelEdit}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div style={S.postBody}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ className, children, ...props }) {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code
                                      style={{
                                        background: "var(--bg-primary)",
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                        fontSize: "0.85em",
                                      }}
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <pre
                                      style={{
                                        background: "var(--bg-primary)",
                                        border: "1px solid var(--border-color)",
                                        borderRadius: "var(--radius-md)",
                                        padding: 12,
                                        overflowX: "auto",
                                        fontSize: "0.85em",
                                      }}
                                    >
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  );
                                },
                                p({ children }) {
                                  return <p style={{ margin: "0 0 10px 0", lineHeight: 1.6 }}>{children}</p>;
                                },
                                h1({ children }) {
                                  return <h3 style={{ margin: "12px 0 6px" }}>{children}</h3>;
                                },
                                h2({ children }) {
                                  return <h3 style={{ margin: "12px 0 6px" }}>{children}</h3>;
                                },
                                h3({ children }) {
                                  return <h4 style={{ margin: "10px 0 6px" }}>{children}</h4>;
                                },
                                ul({ children }) {
                                  return <ul style={{ paddingLeft: 20, margin: "0 0 10px 0" }}>{children}</ul>;
                                },
                                ol({ children }) {
                                  return <ol style={{ paddingLeft: 20, margin: "0 0 10px 0" }}>{children}</ol>;
                                },
                                li({ children }) {
                                  return <li style={{ marginBottom: 4 }}>{children}</li>;
                                },
                              }}
                            >
                              {post.content}
                            </ReactMarkdown>
                          </div>
                        )}

                        <div style={S.postTags}>
                          {post.tags && post.tags.length > 0 ? (
                            post.tags.map((tag) => (
                              <a href="#" style={S.postTag} key={tag}>{tag}</a>
                            ))
                          ) : (
                            <a href="#" style={S.postTag}>#community</a>
                          )}
                        </div>

                        <div id={postIndex === 0 ? "post-actions-0" : undefined} style={S.postActions}>
                          <div style={S.postActionsGroup}>
                            <button style={S.btnAction} onClick={() => handleToggleLike(post)}>
                              {(post.likedBy || []).includes(user?.uid) ? "❤️" : "♡"}{" "}
                              <span>{post.likes || 0}</span> Likes
                            </button>
                            <button style={S.btnAction} onClick={() => toggleComments(post.id)}>
                              💬 <span>{post.comments?.length || 0}</span> Comments
                            </button>
                          </div>
                          <button
                            style={isSaved ? S.btnActionActive : S.btnAction}
                            onClick={() => handleToggleSave(post.id)}
                            title={isSaved ? "Remove from saved" : "Save post"}
                          >
                            {isSaved ? "🔖 Saved" : "🔖 Save"}
                          </button>
                          {user?.uid === post.uid && (
                            <div style={{ display: "flex", gap: 4 }}>
                              <button style={S.btnAction} onClick={() => startEdit(post)}>✏️ Edit</button>
                              <button style={S.btnAction} onClick={() => handleDeletePost(post.id)}>🗑️ Delete</button>
                            </div>
                          )}
                        </div>

                        {/* ── Comments panel ──────────────────────────────── */}
                        {openCommentsFor === post.id && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4, borderTop: "1px solid var(--border-color)", paddingTop: 14 }}>

                            {/* Comment list */}
                            {(post.comments || []).length === 0 ? (
                              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                                No comments yet. Be the first!
                              </p>
                            ) : (
                              (post.comments || [])
                                .slice()
                                .sort((a, b) => a.createdAt - b.createdAt)
                                .map((c) => {
                                  const isEditingThis =
                                    editingComment?.postId === post.id &&
                                    editingComment?.createdAt === c.createdAt;
                                  const isOwner = user?.uid === c.uid;

                                  return (
                                    <div key={`${c.uid}-${c.createdAt}`} style={S.commentItem}>
                                      <div style={S.commentHeader}>
                                        <span style={S.commentAuthor}>{c.displayName}</span>
                                        <div style={S.commentMeta}>
                                          <span>
                                            {new Date(c.createdAt).toLocaleString(undefined, {
                                              month: "short", day: "numeric",
                                              hour: "2-digit", minute: "2-digit",
                                            })}
                                          </span>
                                          {c.edited && (
                                            <span style={{ fontStyle: "italic" }}>(edited)</span>
                                          )}
                                          {isOwner && !isEditingThis && (
                                            <>
                                              <button
                                                style={S.btnActionDanger}
                                                onClick={() => startEditComment({ ...c, _postId: post.id })}
                                                title="Edit comment"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                style={S.btnActionDanger}
                                                onClick={() => handleDeleteComment(post, c)}
                                                title="Delete comment"
                                              >
                                                🗑️
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {isEditingThis ? (
                                        <>
                                          <textarea
                                            style={S.commentEditTextarea}
                                            value={editingCommentDraft}
                                            onChange={(e) => setEditingCommentDraft(e.target.value)}
                                            autoFocus
                                          />
                                          <div style={S.commentEditActions}>
                                            <button
                                              style={S.btnSm}
                                              onClick={() => handleSaveCommentEdit(post, c)}
                                            >
                                              Save
                                            </button>
                                            <button style={S.btnSmGhost} onClick={cancelEditComment}>
                                              Cancel
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        <p style={{ ...S.commentBody, margin: 0 }}>{c.content}</p>
                                      )}
                                    </div>
                                  );
                                })
                            )}

                            {/* New comment input */}
                            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                              <input
                                style={{
                                  flex: 1,
                                  background: "var(--bg-primary)",
                                  border: "1px solid var(--border-color)",
                                  borderRadius: "var(--radius-md)",
                                  color: "var(--text-primary)",
                                  outline: "none",
                                  fontSize: "0.875rem",
                                  fontFamily: "inherit",
                                  padding: "8px 12px",
                                }}
                                placeholder="Write a comment…"
                                value={commentDraft}
                                onChange={(e) => setCommentDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post);
                                  }
                                }}
                              />
                              <button
                                style={commentDraft.trim() ? S.btnPost : S.btnPostDisabled}
                                disabled={!commentDraft.trim()}
                                onClick={() => handleAddComment(post)}
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
              {/* ── Mobile-only: widgets inline below the feed ─────────── */}
              {isMobile && (
                <div style={{ marginTop: 8 }}>
                  <RightWidgets inline />
                </div>
              )}
              
            </section>

            {/* ── Right Sidebar — tablet & desktop; widgets shown inline on mobile ── */}
            {!isMobile && (
              <aside style={{
                ...S.rightSidebar,
                ...(isTablet ? { position: "relative", top: "auto", height: "auto", overflowY: "visible" } : {}),
              }}>
                <RightWidgets />
              </aside>
            )}
          </div>
        </div>

        {/* ── Mobile Bottom Navigation Bar ────────────────────────────── */}
        <nav className="mobile-bottom-nav" style={{ justifyContent: "space-evenly", alignItems: "center" }}>
          {mobileNavItems.map(({ icon, label, active }) => (
            <button
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                flex: 1,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px 0",
                color: active ? "var(--accent-primary)" : "var(--text-muted)",
                fontSize: "0.65rem",
                fontWeight: active ? 700 : 500,
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/*Code Editor Modal*/}
      <CodeEditorModal
        isOpen={showCodeEditor}
        onClose={() => setShowCodeEditor(false)}
        onInsert={handleInsertCode}
      />

      {/* Saved Posts Modal */}
      {showSavedPosts && (
        <SavedPosts
          onClose={() => setShowSavedPosts(false)}
          onUnsave={(postId) => handleToggleSave(postId)}
        />
      )}

      {/* Feature Tour Overlay */}
      {showFeatureTour && <FeatureTour onClose={closeFeatureTour} />}
    </ProtectedRoute>
  );
}