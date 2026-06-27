"use client";

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeEditorModal from "../../components/CodeEditorModal";
import FeedColumn from "../../components/dashboard/FeedColumn";
import LeftSidebar from "../../components/dashboard/LeftSidebar";
import MobileView from "../../components/dashboard/MobileView";
import ProfilePopup from "../../components/dashboard/ProfilePopup";
import RightSidebar from "../../components/dashboard/RightSidebar";
import FeatureTour from "../../components/FeatureTour";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import SavedPosts from "../../components/SavedPosts";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { createNotification } from "../../lib/notifications";
import { EVENTS } from "../../lib/posthog/events";
import { captureEvent } from "../../lib/posthog/helpers";

const FEATURE_TOUR_KEY = "devconnect_feature_tour_seen";

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

// ── Streak helper ─────────────────────────────────────────────────────────────
async function updateStreak(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const data = snap.exists() ? snap.data() : {};

  const todayStr = new Date().toISOString().slice(0, 10);
  const lastActiveStr = data.lastActiveDate || "";
  const currentStreak = data.streak || 0;

  if (lastActiveStr === todayStr) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const newStreak = lastActiveStr === yesterdayStr ? currentStreak + 1 : 1;

  await setDoc(
    userRef,
    { streak: newStreak, lastActiveDate: todayStr },
    { merge: true },
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // ── Composer state ───────────────────────────────────────────────────────
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("discussion");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  const [error, setError] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [imageURL, setImageURL] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // ── Feed / UI state ──────────────────────────────────────────────────────
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("latest");
  const [activeTag, setActiveTag] = useState(null);
  const [activeMembers, setActiveMembers] = useState([]);
  const [usersCache, setUsersCache] = useState({});
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [profilePopup, setProfilePopup] = useState(null);
  const [following, setFollowing] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [streak, setStreak] = useState(0);

  // ── Post editing state ───────────────────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // ── Comment state ────────────────────────────────────────────────────────
  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");

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
    try {
      const seen = localStorage.getItem(FEATURE_TOUR_KEY);
      if (!seen) setShowFeatureTour(true);
    } catch {}
  }, []);

  const closeFeatureTour = () => {
    setShowFeatureTour(false);
    try {
      localStorage.setItem(FEATURE_TOUR_KEY, "true");
    } catch {}
  };

  // ── Firebase: posts ───────────────────────────────────────────────────────
  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("timestamp", "desc"),
    );
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error(err);
        setError("Failed to load posts.");
      },
    );
    return () => unsubscribe();
  }, []);

  // ── Firebase: users cache ─────────────────────────────────────────────────
  useEffect(() => {
    const uids = new Set();
    posts.forEach((p) => {
      if (p.uid) uids.add(p.uid);
      (p.comments || []).forEach((c) => {
        if (c.uid) uids.add(c.uid);
      });
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

  // ── Firebase: current user's saved posts + following + streak ─────────────
  useEffect(() => {
    if (!user) {
      setSavedPostIds([]);
      setFollowing([]);
      setStreak(0);
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = snap.data() || {};
        setSavedPostIds(data.savedPosts || []);
        setFollowing(data.following || []);
        setStreak(data.streak || 0);
      },
      (err) => console.error(err),
    );
    return () => unsubscribe();
  }, [user]);

  // ── Firebase: active members ──────────────────────────────────────────────
  useEffect(() => {
    const membersQuery = query(
      collection(db, "users"),
      where("isOnline", "==", true),
    );
    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        setActiveMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error(err),
    );
    return () => unsubscribe();
  }, []);

  // ── Close popup on scroll ─────────────────────────────────────────────────
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
        if (highlightTimeoutRef.current)
          clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(
          () => setHighlightedPostId(null),
          2600,
        );
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
    const handler = () => {
      scrolledRef.current = false;
      scrollToHashPost();
    };
    window.addEventListener("hashchange", handler);
    window.addEventListener("dashboard-scroll-request", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("dashboard-scroll-request", handler);
    };
  }, [scrollToHashPost]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current)
        clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  // ── Live name / photo helpers ─────────────────────────────────────────────
  const getLiveName = useCallback(
    (uid, fallback) =>
      usersCache[uid]?.displayName || fallback || "Anonymous User",
    [usersCache],
  );
  const getLivePhoto = useCallback(
    (uid, fallback) => usersCache[uid]?.photoURL ?? fallback ?? "",
    [usersCache],
  );

  // ── Profile popup ─────────────────────────────────────────────────────────
  const handleViewProfile = useCallback(
    (uid) => {
      router.push(`/user/${uid}`);
    },
    [router],
  );

  const openProfile = useCallback(
    (e, uid, storedName, storedPhoto) => {
      e.stopPropagation();
      if (isMobileRef.current) {
        router.push(`/user/${uid}`);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const popupWidth = 224,
        popupHeight = 300,
        margin = 12;
      let x = rect.right + margin,
        y = rect.top + rect.height / 2;
      if (x + popupWidth > window.innerWidth - 16)
        x = rect.left - popupWidth - margin;
      const halfPopup = popupHeight / 2;
      if (y - halfPopup < 8) y = halfPopup + 8;
      if (y + halfPopup > window.innerHeight - 8)
        y = window.innerHeight - halfPopup - 8;
      setProfilePopup({
        uid,
        displayName:
          usersCache[uid]?.displayName || storedName || "Anonymous User",
        photoURL: usersCache[uid]?.photoURL ?? storedPhoto ?? "",
        followersCount: usersCache[uid]?.followersCount ?? 0,
        followingCount: usersCache[uid]?.followingCount ?? 0,
        x,
        y,
        flipped: rect.right + margin + popupWidth > window.innerWidth - 16,
      });
    },
    [usersCache, router],
  );

  // ── Follow / Unfollow ─────────────────────────────────────────────────────
  // ── Comment reactions ────────────────────────────────────────────────────
  // ── Comment reactions (one emoji per user per comment) ──────────────────
  const handleToggleCommentReaction = async (post, comment, emoji) => {
    if (!user) return;
    const reactions = comment.reactions || {};

    // Find which emoji (if any) this user currently has on this comment
    const currentEmoji = Object.keys(reactions).find((e) =>
      (reactions[e] || []).includes(user.uid),
    );

    // Strip the user out of every emoji's reactor list first
    const updatedReactions = {};
    Object.keys(reactions).forEach((e) => {
      const filtered = (reactions[e] || []).filter((uid) => uid !== user.uid);
      if (filtered.length > 0) updatedReactions[e] = filtered;
    });

    // If they clicked the emoji they already had, this is a toggle-off → leave removed.
    // Otherwise, add them to the newly clicked emoji.
    if (currentEmoji !== emoji) {
      updatedReactions[emoji] = [...(updatedReactions[emoji] || []), user.uid];
    }

    const updatedComments = (post.comments || []).map((c) =>
      c.createdAt === comment.createdAt && c.uid === comment.uid
        ? { ...c, reactions: updatedReactions }
        : c,
    );

    try {
      await updateDoc(doc(db, "posts", post.id), { comments: updatedComments });
    } catch (err) {
      console.error(err);
      setError("Failed to update reaction.");
    }
  };
  const handleFollowToggle = useCallback(
    async (targetUid, isCurrentlyFollowing) => {
      if (!user || !targetUid || targetUid === user.uid) return;
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            following: isCurrentlyFollowing
              ? arrayRemove(targetUid)
              : arrayUnion(targetUid),
          },
          { merge: true },
        );
        await setDoc(
          doc(db, "users", targetUid),
          {
            followers: isCurrentlyFollowing
              ? arrayRemove(user.uid)
              : arrayUnion(user.uid),
          },
          { merge: true },
        );
        if (!isCurrentlyFollowing) {
          await createNotification({
            toUid: targetUid,
            fromUser: user,
            type: "follow",
          });
        }
      } catch (err) {
        console.error("Follow toggle failed:", err);
        setError("Failed to update follow status.");
      }
    },
    [user],
  );

  // ── Memoized derived feed data ────────────────────────────────────────────
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeTab === "questions")
      result = posts.filter((p) => p.postType === "question");
    else if (activeTab === "collaboration")
      result = posts.filter((p) => p.postType === "collaboration");
    if (activeTag)
      result = result.filter((p) => (p.tags || []).includes(activeTag));
    return result;
  }, [posts, activeTab, activeTag]);

  const trendingPosts = useMemo(() => {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    return posts
      .filter((p) => {
        const ts = p.timestamp?.toDate ? p.timestamp.toDate().getTime() : 0;
        return ts >= cutoff;
      })
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 10);
  }, [posts]);

  const trendingTags = useMemo(() => {
    const counts = {},
      newToday = {};
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
        new: newToday[tag]
          ? `+${newToday[tag]} new today`
          : "No new posts today",
      }));
  }, [posts]);

  const handleCreatePost = async () => {
    if (!content.trim() || !user) return;
    // Poll validation
    if (postType === "poll") {
      const validOptions = pollOptions.filter((o) => o.trim());
      if (validOptions.length < 2) {
        setError("Please add at least 2 poll options.");
        return;
      }
    }
    try {
      setError("");
      const postData = {
        uid: user.uid,
        displayName: user.displayName || user.email || "Anonymous User",
        photoURL: user.photoURL || "",
        content: content.trim(),
        tags: selectedTags,
        postType,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: [],
        ...(imageURL ? { imageURL } : {}),
      };
      if (postType === "poll") {
        postData.pollOptions = pollOptions.filter((o) => o.trim());
        postData.pollVotes = {};
      }
      await addDoc(collection(db, "posts"), postData);
      try { captureEvent(EVENTS.POST_CREATED, { postType, tagCount: selectedTags.length }); } catch (_) {}
      try { await updateStreak(user.uid); } catch (_) {}
      // reset all composer fields on success
      setContent("");
      setSelectedTags([]);
      setCustomTag("");
      setPostType("discussion");
      setPollOptions(["", ""]);
      setImageURL("");
      setImageUploading(false);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to create post. Please try again.");
      throw err; // re-throw so PostComposer's local posting state can reset
    }
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
        await createNotification({
          toUid: post.uid,
          fromUser: user,
          type: "like",
          postId: post.id,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update like.");
    }
  };

  const handleToggleSave = async (postId) => {
    if (!user) return;
    const isSaved = savedPostIds.includes(postId);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          savedPosts: isSaved ? arrayRemove(postId) : arrayUnion(postId),
        },
        { merge: true },
      );

      const post = posts.find((p) => p.id === postId);
      const currentCount = post?.saveCount || 0;
      await updateDoc(doc(db, "posts", postId), {
        saveCount: isSaved ? Math.max(0, currentCount - 1) : currentCount + 1,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update saved posts.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete post.");
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
      setError("Failed to update post.");
    }
  };

  // ── Poll voting ───────────────────────────────────────────────────────────
  const handleVotePoll = async (post, optionIdx) => {
    if (!user) return;
    const votes = post.pollVotes || {};
    const options = post.pollOptions || [];

    // Find if user already voted for any option
    const prevVotedIdx = options.findIndex((_, idx) =>
      (votes[idx] || []).includes(user.uid),
    );

    // Build updated votes object
    const updatedVotes = { ...votes };

    // Remove previous vote if any
    if (prevVotedIdx !== -1 && prevVotedIdx !== optionIdx) {
      updatedVotes[prevVotedIdx] = (votes[prevVotedIdx] || []).filter(
        (uid) => uid !== user.uid,
      );
    }

    // Toggle: if clicking same option, remove vote; otherwise add
    if (prevVotedIdx === optionIdx) {
      updatedVotes[optionIdx] = (votes[optionIdx] || []).filter(
        (uid) => uid !== user.uid,
      );
    } else {
      updatedVotes[optionIdx] = [...(votes[optionIdx] || []), user.uid];
    }

    try {
      await updateDoc(doc(db, "posts", post.id), { pollVotes: updatedVotes });
    } catch (err) {
      console.error(err);
      setError("Failed to record vote.");
    }
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
      await updateDoc(doc(db, "posts", post.id), {
        comments: arrayUnion(newComment),
      });
      await updateStreak(user.uid);
      setCommentDraft("");
      await createNotification({
        toUid: post.uid,
        fromUser: user,
        type: "comment",
        postId: post.id,
        preview: trimmed,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to add comment.");
    }
  };

  const startEditComment = (comment) => {
    setEditingComment({
      postId: comment._postId,
      createdAt: comment.createdAt,
    });
    setEditingCommentDraft(comment.content);
  };
  const cancelEditComment = () => {
    setEditingComment(null);
    setEditingCommentDraft("");
  };

  const handleSaveCommentEdit = async (post, oldComment) => {
    if (!editingCommentDraft.trim()) return;
    const trimmed = editingCommentDraft.trim();
    const updatedComments = (post.comments || []).map((c) =>
      c.createdAt === oldComment.createdAt && c.uid === oldComment.uid
        ? { ...c, content: trimmed, edited: true }
        : c,
    );
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: updatedComments });
      setEditingComment(null);
      setEditingCommentDraft("");
      await createNotification({
        toUid: post.uid,
        fromUser: user,
        type: "comment_edit",
        postId: post.id,
        preview: trimmed,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to edit comment.");
    }
  };

  const handleDeleteComment = async (post, comment) => {
    if (!window.confirm("Delete this comment?")) return;
    const updatedComments = (post.comments || []).filter(
      (c) => !(c.createdAt === comment.createdAt && c.uid === comment.uid),
    );
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: updatedComments });
    } catch (err) {
      console.error(err);
      setError("Failed to delete comment.");
    }
  };

  // ── Shared props bundles ──────────────────────────────────────────────────
  const sharedPostProps = {
    user,
    isMobile,
    openCommentsFor,
    commentDraft,
    setCommentDraft,
    editingId,
    editContent,
    setEditContent,
    editingComment,
    editingCommentDraft,
    setEditingCommentDraft,
    savedPostIds,
    getLiveName,
    getLivePhoto,
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
    onVotePoll: handleVotePoll,
    onToggleCommentReaction: handleToggleCommentReaction,
  };

  const composerProps = {
    content,
    setContent,
    postType,
    setPostType,
    selectedTags,
    setSelectedTags,
    customTag,
    setCustomTag,
    showAiDraft,
    setShowAiDraft,
    error,
    onPost: handleCreatePost,
    onOpenCodeEditor: () => setShowCodeEditor(true),
    pollOptions,
    setPollOptions,
    imageURL,
    setImageURL,
    imageUploading,
    setImageUploading,
  };

  const feedColumnProps = {
    posts,
    filteredPosts,
    trendingPosts,
    activeTab,
    setActiveTab,
    highlightedPostId,
    ...sharedPostProps,
    ...composerProps,
  };

  return (
    <ProtectedRoute>
      <main
        style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}
      >
        <div style={S.appContainer}>
          <Navbar variant="dashboard" />

          {!isMobile && (
            <div style={S.mainLayout}>
              <LeftSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                savedPostIds={savedPostIds}
                onShowSavedPosts={() => setShowSavedPosts(true)}
                onShowFeatureTour={() => setShowFeatureTour(true)}
                streak={streak}
              />

              <FeedColumn {...feedColumnProps} />

              <RightSidebar
                trendingTags={trendingTags}
                activeMembers={activeMembers}
                activeTag={activeTag}
                onTagClick={(tag) =>
                  setActiveTag((prev) => (prev === tag ? null : tag))
                }
              />
            </div>
          )}

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
