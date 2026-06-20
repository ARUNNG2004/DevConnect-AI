"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import CodeEditorModal from "../../components/CodeEditorModal";
import SavedPosts from "../../components/SavedPosts";
import FeatureTour from "../../components/FeatureTour";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { createNotification } from "../../lib/notifications";
import ProfilePopup from "../../components/dashboard/ProfilePopup";
import LeftSidebar from "../../components/dashboard/LeftSidebar";
import RightSidebar from "../../components/dashboard/RightSidebar";
import FeedColumn from "../../components/dashboard/FeedColumn";
import MobileView from "../../components/dashboard/MobileView";
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
} from "firebase/firestore";

const FEATURE_TOUR_KEY = "devconnect_feature_tour_seen";

const DEFAULT_EMOJIS = ["👍", "✅", "💡", "❤️"];
const EXTRA_EMOJIS   = ["🔥", "😂", "😮", "🎉", "🙌", "💯", "🚀", "😢", "😡", "👀", "🤔", "⭐"];

const S = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--bg-primary)",
  },
  mainLayout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr 340px",
    gap: 24,
    maxWidth: 1440,
    width: "100%",
    margin: "0 auto",
    padding: "24px 24px 24px",
    flex: 1,
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // ── Composer state ───────────────────────────────────────────────────────
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postType, setPostType] = useState("discussion");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [error, setError] = useState("");

  // ── Feed / UI state ──────────────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("latest");
  const [activeMembers, setActiveMembers] = useState([]);
  const [usersCache, setUsersCache] = useState({});
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [profilePopup, setProfilePopup] = useState(null);
  const [following, setFollowing] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);

  // ── Post editing state ───────────────────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // ── Comment state ────────────────────────────────────────────────────────
  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");

  // ── Emoji reaction picker state ──────────────────────────────────────────
  const [openPickerFor, setOpenPickerFor] = useState(null);

  // ── Mobile state ─────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState("feed");

  const highlightTimeoutRef = useRef(null);
  const isMobileRef = useRef(false);
  const scrolledRef = useRef(false);

  // ── Responsive detection ─────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      isMobileRef.current = mobile;
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Feature tour ─────────────────────────────────────────────────────────
  useEffect(() => {
    try { const seen = localStorage.getItem(FEATURE_TOUR_KEY); if (!seen) setShowFeatureTour(true); } catch { }
  }, []);

  const closeFeatureTour = () => {
    setShowFeatureTour(false);
    try { localStorage.setItem(FEATURE_TOUR_KEY, "true"); } catch { }
  };

  // ── Close emoji picker on outside click ──────────────────────────────────
  useEffect(() => {
    if (!openPickerFor) return;
    const close = () => setOpenPickerFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [openPickerFor]);

  // ── Firebase: posts ───────────────────────────────────────────────────────
  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => { console.error(err); setError("Failed to load posts."); });
    return () => unsubscribe();
  }, []);

  // ── Firebase: users cache ────────────────────────────────────────────────
  useEffect(() => {
    const uids = new Set();
    posts.forEach((p) => {
      if (p.uid) uids.add(p.uid);
      (p.comments || []).forEach((c) => { if (c.uid) uids.add(c.uid); });
    });
    const unsubs = [];
    uids.forEach((uid) => {
      const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUsersCache((prev) => ({
            ...prev,
            [uid]: {
              photoURL: data.photoURL || "",
              displayName: data.displayName || "",
              followersCount: (data.followers || []).length,
              followingCount: (data.following || []).length,
            },
          }));
        }
      });
      unsubs.push(unsub);
    });
    return () => unsubs.forEach((u) => u());
  }, [posts]);

  // ── Firebase: current user's saved posts + following ──────────────────────
  useEffect(() => {
    if (!user) { setSavedPostIds([]); setFollowing([]); return; }
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const data = snap.data() || {};
      setSavedPostIds(data.savedPosts || []);
      setFollowing(data.following || []);
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [user]);

  // ── Firebase: active members ──────────────────────────────────────────────
  useEffect(() => {
    const membersQuery = query(collection(db, "users"), where("isOnline", "==", true));
    const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
      setActiveMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, []);

  // ── Close profile popup on scroll ─────────────────────────────────────────
  useEffect(() => {
    if (!profilePopup) return;
    const handleScroll = () => setProfilePopup(null);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [profilePopup]);

  // ── Deep-link scroll to post via hash ────────────────────────────────────
  const scrollToHashPost = useCallback(() => {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith("#post-")) return;
    const targetId = hash.replace("#post-", "");
    if (!posts.some((p) => p.id === targetId)) return;
    setMobileTab("feed");
    setActiveTab("latest");
    setTimeout(() => {
      const el = document.getElementById(`post-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedPostId(targetId);
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => setHighlightedPostId(null), 2600);
      }
    }, 150);
  }, [posts]);

  useEffect(() => {
    if (scrolledRef.current) return;
    const hash = window.location.hash;
    if (!hash || !hash.startsWith("#post-")) return;
    const targetId = hash.replace("#post-", "");
    if (!posts.some((p) => p.id === targetId)) return;
    scrolledRef.current = true;
    scrollToHashPost();
  }, [posts, scrollToHashPost]);

  useEffect(() => {
    const handler = () => { scrolledRef.current = false; scrollToHashPost(); };
    window.addEventListener("hashchange", handler);
    window.addEventListener("dashboard-scroll-request", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("dashboard-scroll-request", handler);
    };
  }, [scrollToHashPost]);

  useEffect(() => {
    return () => { if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current); };
  }, []);

  // ── Live name / photo helpers ─────────────────────────────────────────────
  const getLiveName = useCallback(
    (uid, fallback) => usersCache[uid]?.displayName || fallback || "Anonymous User",
    [usersCache]
  );
  const getLivePhoto = useCallback(
    (uid, fallback) => usersCache[uid]?.photoURL ?? fallback ?? "",
    [usersCache]
  );

  // ── Profile popup (desktop) / direct navigation (mobile) ─────────────────
  const handleViewProfile = useCallback((uid) => { router.push(`/user/${uid}`); }, [router]);

  const openProfile = useCallback((e, uid, storedName, storedPhoto) => {
    e.stopPropagation();
    if (isMobileRef.current) {
      router.push(`/user/${uid}`);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const popupWidth = 224, popupHeight = 300, margin = 12;
    let x = rect.right + margin, y = rect.top + rect.height / 2;
    if (x + popupWidth > window.innerWidth - 16) x = rect.left - popupWidth - margin;
    const halfPopup = popupHeight / 2;
    if (y - halfPopup < 8) y = halfPopup + 8;
    if (y + halfPopup > window.innerHeight - 8) y = window.innerHeight - halfPopup - 8;
    setProfilePopup({
      uid,
      displayName: usersCache[uid]?.displayName || storedName || "Anonymous User",
      photoURL: usersCache[uid]?.photoURL ?? storedPhoto ?? "",
      followersCount: usersCache[uid]?.followersCount ?? 0,
      followingCount: usersCache[uid]?.followingCount ?? 0,
      x, y,
      flipped: rect.right + margin + popupWidth > window.innerWidth - 16,
    });
  }, [usersCache, router]);

  // ── Follow / Unfollow ─────────────────────────────────────────────────────
  const handleFollowToggle = useCallback(async (targetUid, isCurrentlyFollowing) => {
    if (!user || !targetUid || targetUid === user.uid) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        following: isCurrentlyFollowing ? arrayRemove(targetUid) : arrayUnion(targetUid),
      }, { merge: true });
      await setDoc(doc(db, "users", targetUid), {
        followers: isCurrentlyFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid),
      }, { merge: true });
      if (!isCurrentlyFollowing) {
        await createNotification({ toUid: targetUid, fromUser: user, type: "follow" });
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
      setError("Failed to update follow status.");
    }
  }, [user]);

  // ── Memoized derived feed data ────────────────────────────────────────────
  const filteredPosts = useMemo(() => {
    if (activeTab === "questions") return posts.filter((p) => p.postType === "question");
    if (activeTab === "collaboration") return posts.filter((p) => p.postType === "collaboration");
    return posts;
  }, [posts, activeTab]);

  const trendingPosts = useMemo(() => {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    return posts
      .filter((p) => { const ts = p.timestamp?.toDate ? p.timestamp.toDate().getTime() : 0; return ts >= cutoff; })
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 10);
  }, [posts]);

  const trendingTags = useMemo(() => {
    const counts = {}, newToday = {};
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    posts.forEach((post) => {
      const postDate = post.timestamp?.toDate ? post.timestamp.toDate() : null;
      const isToday = postDate && postDate >= startOfToday;
      (post.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
        if (isToday) newToday[tag] = (newToday[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({
      tag, posts: `${count} post${count === 1 ? "" : "s"}`,
      new: newToday[tag] ? `+${newToday[tag]} new today` : "No new posts today",
    }));
  }, [posts]);

  // ── Post CRUD ─────────────────────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (!content.trim() || !user) return;
    try {
      setPosting(true); setError("");
      await addDoc(collection(db, "posts"), {
        uid: user.uid,
        displayName: user.displayName || user.email || "Anonymous User",
        photoURL: user.photoURL || "",
        content: content.trim(),
        tags: selectedTags,
        postType,
        timestamp: serverTimestamp(),
        likes: 0, likedBy: [], comments: [],
      });
      setContent(""); setSelectedTags([]); setPostType("discussion");
    } catch (err) { console.error(err); setError("Failed to create post. Please try again."); }
    finally { setPosting(false); }
  };

  const handleInsertCode = (codeBlock) => {
    setContent((prev) => prev + (prev ? "\n\n" : "") + codeBlock);
    setShowCodeEditor(false);
  };

  const handleToggleLike = async (post) => {
    if (!user) return;
    const liked = (post.likedBy || []).includes(user.uid);
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes: (post.likedBy || []).length + (liked ? -1 : 1),
      });
      if (!liked) {
        await createNotification({ toUid: post.uid, fromUser: user, type: "like", postId: post.id });
      }
    } catch (err) { console.error(err); setError("Failed to update like."); }
  };

  const handleToggleSave = async (postId) => {
    if (!user) return;
    const isSaved = savedPostIds.includes(postId);
    try {
      await setDoc(doc(db, "users", user.uid), {
        savedPosts: isSaved ? arrayRemove(postId) : arrayUnion(postId),
      }, { merge: true });
    } catch (err) { console.error(err); setError("Failed to update saved posts."); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try { await deleteDoc(doc(db, "posts", postId)); }
    catch (err) { console.error(err); setError("Failed to delete post."); }
  };

  const startEdit = (post) => { setEditingId(post.id); setEditContent(post.content); };
  const cancelEdit = () => { setEditingId(null); setEditContent(""); };
  const handleSaveEdit = async (postId) => {
    if (!editContent.trim()) return;
    try {
      await updateDoc(doc(db, "posts", postId), { content: editContent.trim(), edited: true });
      setEditingId(null); setEditContent("");
    } catch (err) { console.error(err); setError("Failed to update post."); }
  };

  // ── Comment CRUD ──────────────────────────────────────────────────────────
  const toggleComments = (postId) => {
    setOpenCommentsFor((prev) => (prev === postId ? null : postId));
    setCommentDraft("");
    setEditingComment(null);
  };

  const handleAddComment = async (post) => {
    if (!commentDraft.trim() || !user) return;
    const trimmed = commentDraft.trim();
    const newComment = {
      uid: user.uid,
      displayName: user.displayName || user.email || "Anonymous User",
      photoURL: user.photoURL || "",
      content: trimmed,
      createdAt: Date.now(),
      edited: false,
    };
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: arrayUnion(newComment) });
      setCommentDraft("");
      await createNotification({ toUid: post.uid, fromUser: user, type: "comment", postId: post.id, preview: trimmed });
    } catch (err) { console.error(err); setError("Failed to add comment."); }
  };

  const startEditComment = (comment) => {
    setEditingComment({ postId: comment._postId, createdAt: comment.createdAt });
    setEditingCommentDraft(comment.content);
  };
  const cancelEditComment = () => { setEditingComment(null); setEditingCommentDraft(""); };

  const handleSaveCommentEdit = async (post, oldComment) => {
    if (!editingCommentDraft.trim()) return;
    const trimmed = editingCommentDraft.trim();
    const updatedComments = (post.comments || []).map((c) =>
      c.createdAt === oldComment.createdAt && c.uid === oldComment.uid
        ? { ...c, content: trimmed, edited: true }
        : c
    );
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: updatedComments });
      setEditingComment(null); setEditingCommentDraft("");
      await createNotification({ toUid: post.uid, fromUser: user, type: "comment_edit", postId: post.id, preview: trimmed });
    } catch (err) { console.error(err); setError("Failed to edit comment."); }
  };

  const handleDeleteComment = async (post, comment) => {
    if (!window.confirm("Delete this comment?")) return;
    const updatedComments = (post.comments || []).filter(
      (c) => !(c.createdAt === comment.createdAt && c.uid === comment.uid)
    );
    try { await updateDoc(doc(db, "posts", post.id), { comments: updatedComments }); }
    catch (err) { console.error(err); setError("Failed to delete comment."); }
  };

  // ── Emoji reaction toggle ─────────────────────────────────────────────────
  const handleToggleCommentReaction = async (post, comment, emoji) => {
    if (!user) return;
    const postRef = doc(db, "posts", post.id);
    const updatedComments = (post.comments || []).map((c) => {
      if (c.uid === comment.uid && c.createdAt === comment.createdAt) {
        const allEmojis = [...DEFAULT_EMOJIS, ...EXTRA_EMOJIS];
        const currentEmoji = allEmojis.find((e) => (c.reactions?.[e] || []).includes(user.uid));
        if (currentEmoji === emoji) {
          return {
            ...c,
            reactions: {
              ...c.reactions,
              [emoji]: (c.reactions[emoji] || []).filter((id) => id !== user.uid),
            },
          };
        }
        const updatedReactions = { ...c.reactions };
        if (currentEmoji) {
          updatedReactions[currentEmoji] = (updatedReactions[currentEmoji] || []).filter((id) => id !== user.uid);
        }
        updatedReactions[emoji] = [...(updatedReactions[emoji] || []), user.uid];
        return { ...c, reactions: updatedReactions };
      }
      return c;
    });
    await updateDoc(postRef, { comments: updatedComments });
  };

  // ── Shared props bundle for FeedColumn / PostCard ─────────────────────────
  const sharedPostProps = {
    user, isMobile, openCommentsFor, commentDraft, setCommentDraft,
    editingId, editContent, setEditContent, editingComment,
    editingCommentDraft, setEditingCommentDraft, savedPostIds,
    getLiveName, getLivePhoto,
    openPickerFor, setOpenPickerFor,
    onOpenProfile: openProfile,
    onToggleLike: handleToggleLike,
    onToggleSave: handleToggleSave,
    onDeletePost: handleDeletePost,
    onStartEdit: startEdit,
    onCancelEdit: cancelEdit,
    onSaveEdit: handleSaveEdit,
    onToggleComments: toggleComments,
    onAddComment: handleAddComment,
    onStartEditComment: startEditComment,
    onCancelEditComment: cancelEditComment,
    onSaveCommentEdit: handleSaveCommentEdit,
    onDeleteComment: handleDeleteComment,
    onToggleCommentReaction: handleToggleCommentReaction,
  };

  const composerProps = {
    content, setContent, postType, setPostType,
    selectedTags, setSelectedTags, customTag, setCustomTag,
    showAiDraft, setShowAiDraft, posting, error,
    onPost: handleCreatePost,
    onOpenCodeEditor: () => setShowCodeEditor(true),
  };

  const feedColumnProps = {
    posts, filteredPosts, trendingPosts,
    activeTab, setActiveTab,
    highlightedPostId,
    ...sharedPostProps,
    ...composerProps,
  };

  return (
    <ProtectedRoute>
      <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <div style={S.appContainer}>
          <Navbar variant="dashboard" />

          {/* ── Desktop layout ── */}
          {!isMobile && (
            <div style={S.mainLayout}>
              <LeftSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                savedPostIds={savedPostIds}
                onShowSavedPosts={() => setShowSavedPosts(true)}
                onShowFeatureTour={() => setShowFeatureTour(true)}
              />

              <FeedColumn {...feedColumnProps} />

              <RightSidebar trendingTags={trendingTags} activeMembers={activeMembers} />
            </div>
          )}

          {/* ── Mobile layout — fully delegated to MobileView ── */}
          {isMobile && (
            <MobileView
              mobileTab={mobileTab}
              setMobileTab={setMobileTab}
              savedPostIds={savedPostIds}
              trendingPosts={trendingPosts}
              activeMembers={activeMembers}
              posts={posts}
              getLiveName={getLiveName}
              onToggleSave={handleToggleSave}
              onShowFeatureTour={() => setShowFeatureTour(true)}
              feedColumnProps={feedColumnProps}
            />
          )}
        </div>

        <CodeEditorModal
          isOpen={showCodeEditor}
          onClose={() => setShowCodeEditor(false)}
          onInsert={handleInsertCode}
        />

        {showSavedPosts && !isMobile && (
          <SavedPosts
            onClose={() => setShowSavedPosts(false)}
            onUnsave={(postId) => handleToggleSave(postId)}
          />
        )}

        {showFeatureTour && <FeatureTour onClose={closeFeatureTour} />}

        <ProfilePopup
          data={profilePopup}
          posts={posts}
          currentUser={user}
          following={following}
          onClose={() => setProfilePopup(null)}
          onFollowToggle={handleFollowToggle}
          onViewProfile={handleViewProfile}
        />
      </main>
    </ProtectedRoute>
  );
}