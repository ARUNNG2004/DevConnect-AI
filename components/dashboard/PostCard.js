"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";

const DEFAULT_EMOJIS = ["👍", "✅", "💡", "❤️"];
const EXTRA_EMOJIS   = ["🔥", "😂", "😮", "🎉", "🙌", "💯", "🚀", "😢", "😡", "👀", "🤔", "⭐"];

const S = {
  discussionCard: {
    backgroundColor: "var(--bg-secondary)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 16,
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "box-shadow 0.4s ease, border-color 0.4s ease",
  },
  discussionCardHighlighted: {
    boxShadow: "0 0 0 2px var(--accent-primary), var(--shadow-sm)",
    borderColor: "var(--accent-primary)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  authorInfo: { display: "flex", alignItems: "center", gap: 10 },
  authorMeta: { display: "flex", flexDirection: "column" },
  authorName: { color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" },
  authorTitle: { color: "var(--text-muted)", fontSize: "0.72rem" },
  postTimestamp: { color: "var(--text-muted)", fontSize: "0.75rem", textAlign: "right" },
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
  solvedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    backgroundColor: "rgba(52,211,153,0.12)",
    border: "1px solid rgba(52,211,153,0.4)",
    color: "#34d399",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  acceptedCommentWrapper: {
    border: "1px solid rgba(52,211,153,0.35)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(52,211,153,0.05)",
    padding: "8px 10px",
  },
  acceptedLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#34d399",
    marginBottom: 4,
  },
  btnAccept: (isAccepted) => ({
    display: "flex",
    alignItems: "center",
    gap: 3,
    padding: "2px 8px",
    fontSize: "0.72rem",
    fontWeight: 600,
    border: isAccepted ? "1px solid rgba(52,211,153,0.6)" : "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    backgroundColor: isAccepted ? "rgba(52,211,153,0.12)" : "transparent",
    color: isAccepted ? "#34d399" : "var(--text-muted)",
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  }),
  postBody: { fontSize: "0.9rem", color: "var(--text-secondary)" },
  pollQuestion: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  postImage: {
    display: "block",
    width: "100%",
    maxHeight: 360,
    objectFit: "cover",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    marginTop: 8,
  },
  postTags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 },
  postTag: { color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 500 },
  postActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "6px 2px",
    marginTop: 2,
    gap: 4,
    flexWrap: "wrap",
  },
  postActionsGroup: { display: "flex", gap: 6 },
  btnAction: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 500,
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    fontFamily: "inherit",
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
  btnActionDanger: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#f87171",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: 500,
    padding: "4px 6px",
    borderRadius: "var(--radius-sm)",
    fontFamily: "inherit",
  },
  composerTextarea: {
    width: "100%",
    minHeight: 72,
    background: "transparent",
    border: "none",
    resize: "vertical",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.95rem",
    fontFamily: "inherit",
  },
  btnPost: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    backgroundColor: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  btnPostDisabled: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    backgroundColor: "var(--border-color)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "var(--text-muted)",
    fontWeight: 600,
    cursor: "not-allowed",
    fontSize: "0.9rem",
  },
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
    gap: 8,
  },
  commentAuthor: { fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" },
  commentMeta: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    flexWrap: "wrap",
  },
  commentBody: { fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 },
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
    boxSizing: "border-box",
  },
  commentEditActions: { display: "flex", gap: 6, marginTop: 4 },
  btnSm: {
    padding: "4px 12px",
    backgroundColor: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "#000",
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "pointer",
    fontFamily: "inherit",
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
    fontFamily: "inherit",
  },
  // ── Poll styles ───────────────────────────────────────────────────────────
  pollContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  pollOptionBtn: (voted) => ({
    width: "100%",
    textAlign: "left",
    background: "none",
    border: `1px solid ${voted ? "var(--accent-primary)" : "var(--border-color)"}`,
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    padding: 0,
    overflow: "hidden",
    fontFamily: "inherit",
    position: "relative",
  }),
  pollBarFill: (pct, voted) => ({
    position: "absolute",
    inset: 0,
    width: `${pct}%`,
    background: voted ? "var(--accent-primary-alpha)" : "rgba(255,255,255,0.04)",
    borderRadius: "var(--radius-md)",
    transition: "width 0.4s ease",
  }),
  pollOptionLabel: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 12px",
    fontSize: "0.85rem",
    color: "var(--text-primary)",
    fontWeight: 500,
    zIndex: 1,
  },
  pollPct: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "var(--text-muted)",
    minWidth: 32,
    textAlign: "right",
  },
  pollMeta: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    marginTop: 2,
  },
  // ── Reaction styles ───────────────────────────────────────────────────────
  reactionBtn: (hasReacted) => ({
    display: "flex",
    alignItems: "center",
    gap: 3,
    padding: "2px 8px",
    borderRadius: 999,
    border: hasReacted ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
    background: hasReacted ? "rgba(99,102,241,0.12)" : "transparent",
    color: hasReacted ? "var(--accent-primary)" : "var(--text-muted)",
    fontSize: "0.78rem",
    fontWeight: hasReacted ? 600 : 400,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    lineHeight: 1.4,
  }),
  pickerToggleBtn: (isOpen) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 8px",
    height: 22,
    borderRadius: 999,
    border: "1px solid var(--border-color)",
    background: isOpen ? "var(--accent-primary-alpha)" : "transparent",
    color: isOpen ? "var(--accent-primary)" : "var(--text-muted)",
    fontSize: "0.72rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
    gap: 3,
  }),
  pickerGrid: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    zIndex: 50,
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 4,
    padding: 10,
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    minWidth: 210,
  },
  pickerEmojiBtn: (hasReacted) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: "var(--radius-sm)",
    border: "none",
    background: hasReacted ? "var(--accent-primary-alpha)" : "transparent",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "background 0.12s",
  }),
  pickerBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    fontSize: "0.52rem",
    fontWeight: 700,
    color: "var(--accent-primary)",
    backgroundColor: "var(--bg-secondary)",
    borderRadius: 999,
    padding: "0 2px",
    lineHeight: 1.4,
    pointerEvents: "none",
  },
};

// ── Poll block ────────────────────────────────────────────────────────────────
function PollBlock({ post, user, onVotePoll }) {
  const options    = post.pollOptions || [];
  const votes      = post.pollVotes  || {};
  const totalVotes = Object.values(votes).reduce((s, arr) => s + (arr?.length || 0), 0);

  const userVotedIdx = options.findIndex((_, idx) =>
    (votes[idx] || []).includes(user?.uid)
  );
  const hasVoted = userVotedIdx !== -1;

  return (
    <div style={S.pollContainer}>
      {/* Poll question */}
      {post.content && (
        <p style={S.pollQuestion}>{post.content}</p>
      )}

      {/* Options */}
      {options.map((opt, idx) => {
        const count    = (votes[idx] || []).length;
        const pct      = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isMyVote = userVotedIdx === idx;

        return (
          <button
            key={idx}
            style={S.pollOptionBtn(isMyVote)}
            onClick={() => onVotePoll && onVotePoll(post, idx)}
            disabled={!user}
            title={!user ? "Log in to vote" : ""}
          >
            <div style={S.pollBarFill(hasVoted ? pct : 0, isMyVote)} />
            <div style={S.pollOptionLabel}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {isMyVote && (
                  <span style={{ color: "var(--accent-primary)", fontSize: "0.7rem" }}>✓</span>
                )}
                {opt}
              </span>
              {hasVoted && <span style={S.pollPct}>{pct}%</span>}
            </div>
          </button>
        );
      })}

      <div style={S.pollMeta}>
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        {hasVoted && " · You voted"}
      </div>
    </div>
  );
}

// ── PostCard ──────────────────────────────────────────────────────────────────
export default function PostCard({
  post,
  postIndex,
  user,
  isMobile,
  isHighlighted,
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
  onOpenProfile,
  onToggleLike,
  onToggleSave,
  onDeletePost,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleComments,
  onAddComment,
  onStartEditComment,
  onCancelEditComment,
  onSaveCommentEdit,
  onDeleteComment,
  onVotePoll,
  onToggleCommentReaction,
  onMarkSolved,
}) {
  const [openPickerFor, setOpenPickerFor] = useState(null);

  useEffect(() => {
    if (!openPickerFor) return;
    const close = () => setOpenPickerFor(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [openPickerFor]);

  const postPhoto = getLivePhoto(post.uid, post.photoURL);
  const postName  = getLiveName(post.uid, post.displayName);
  const type      = post.postType || "discussion";
  const typeLabel =
    type === "question"      ? "Question"
    : type === "collaboration" ? "Collaborate"
    : type === "poll"          ? "Poll"
    : "Discussion";

  return (
    <article
      id={`post-${post.id}`}
      style={{ ...S.discussionCard, ...(isHighlighted ? S.discussionCardHighlighted : {}) }}
    >
      {/* ── Card Header ── */}
      <div style={S.cardHeader}>
        <div style={S.authorInfo}>
          <UserAvatar
            photoURL={postPhoto}
            displayName={postName}
            size={isMobile ? 34 : 40}
            fontSize={isMobile ? "0.85rem" : "1rem"}
            onClick={(e) => onOpenProfile(e, post.uid, post.displayName, post.photoURL)}
          />
          <div style={S.authorMeta}>
            <span
              style={{ ...S.authorName, cursor: "pointer" }}
              onClick={(e) => onOpenProfile(e, post.uid, post.displayName, post.photoURL)}
            >
              {postName}
            </span>
            <span style={S.authorTitle}>Community Member</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={S.categoryTag(type)}>{typeLabel}</span>
            {type === "question" && post.solved && (
              <span style={S.solvedBadge}>✓ Solved</span>
            )}
          </div>
          <span style={S.postTimestamp}>
            {post.timestamp?.toDate
              ? post.timestamp.toDate().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
              : "Just now"}
            {post.edited ? " (edited)" : ""}
          </span>
        </div>
      </div>

      {/* ── Post Body / Poll / Edit Mode ── */}
      {editingId === post.id ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            style={{ ...S.composerTextarea, border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 8, minHeight: 80 }}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btnPost} onClick={() => onSaveEdit(post.id)}>Save</button>
            <button style={S.btnAction} onClick={onCancelEdit}>Cancel</button>
          </div>
        </div>
      ) : type === "poll" ? (
        <PollBlock post={post} user={user} onVotePoll={onVotePoll} />
      ) : (
        <div style={S.postBody}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const isInline = !className;
                return isInline
                  ? <code style={{ background: "var(--bg-primary)", padding: "2px 6px", borderRadius: 4, fontSize: "0.82em" }} {...props}>{children}</code>
                  : <pre style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 12, overflowX: "auto", fontSize: "0.82em" }}><code className={className} {...props}>{children}</code></pre>;
              },
              p({ children }) { return <p style={{ margin: "0 0 10px 0", lineHeight: 1.6 }}>{children}</p>; },
              h1({ children }) { return <h3 style={{ margin: "12px 0 6px" }}>{children}</h3>; },
              h2({ children }) { return <h3 style={{ margin: "12px 0 6px" }}>{children}</h3>; },
              h3({ children }) { return <h4 style={{ margin: "10px 0 6px" }}>{children}</h4>; },
              ul({ children }) { return <ul style={{ paddingLeft: 20, margin: "0 0 10px 0" }}>{children}</ul>; },
              ol({ children }) { return <ol style={{ paddingLeft: 20, margin: "0 0 10px 0" }}>{children}</ol>; },
              li({ children }) { return <li style={{ marginBottom: 4 }}>{children}</li>; },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      )}

      {/* ── Attached image ── */}
      {post.imageURL && (
        <img
          src={post.imageURL}
          alt="Post attachment"
          style={S.postImage}
          loading="lazy"
        />
      )}

      {/* ── Tags ── */}
      <div style={S.postTags}>
        {post.tags && post.tags.length > 0
          ? post.tags.map((tag) => <a href="#" style={S.postTag} key={tag}>{tag}</a>)
          : <a href="#" style={S.postTag}>#community</a>}
      </div>

      {/* ── Post Actions ── */}
      <div id={postIndex === 0 ? "post-actions-0" : undefined} style={S.postActions}>
        <div style={S.postActionsGroup}>
          {type !== "poll" && (
            <button style={S.btnAction} onClick={() => onToggleLike(post)}>
              {(post.likedBy || []).includes(user?.uid) ? "❤️" : "♡"} {post.likes || 0}
            </button>
          )}
          <button style={S.btnAction} onClick={() => onToggleComments(post.id)}>
            💬 {post.comments?.length || 0}
          </button>
        </div>
        <button
          style={savedPostIds.includes(post.id) ? S.btnActionActive : S.btnAction}
          onClick={() => onToggleSave(post.id)}
        >
          🔖 {post.saveCount || 0}
        </button>
        {user?.uid === post.uid && (
          <div style={{ display: "flex", gap: 2 }}>
            {type !== "poll" && (
              <button style={S.btnAction} onClick={() => onStartEdit(post)}>✏️</button>
            )}
            <button style={S.btnAction} onClick={() => onDeletePost(post.id)}>🗑️</button>
          </div>
        )}
      </div>

      {/* ── Comments Section ── */}
      {openCommentsFor === post.id && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border-color)", paddingTop: 12 }}>
          {(post.comments || []).length === 0
            ? <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>No comments yet. Be the first!</p>
            : (post.comments || []).slice().sort((a, b) => a.createdAt - b.createdAt).map((c) => {
              const isEditingThis = editingComment?.postId === post.id && editingComment?.createdAt === c.createdAt;
              const isOwner       = user?.uid === c.uid;
              const commentPhoto  = getLivePhoto(c.uid, c.photoURL);
              const commentName   = getLiveName(c.uid, c.displayName);
              const commentKey    = `${c.uid}-${c.createdAt}`;
              const isPickerOpen  = openPickerFor === commentKey;
              const isAccepted    = post.solved && post.solvedCommentId === c.createdAt;
              const isPostAuthor  = user?.uid === post.uid;
              const isQuestion    = post.postType === "question";

              // extra emojis that already have at least one reaction (show inline)
              const activeExtra = Object.keys(c.reactions || {})
                .filter((e) => !DEFAULT_EMOJIS.includes(e) && (c.reactions[e]?.length || 0) > 0);

              return (
                <div
                  key={commentKey}
                  style={isAccepted ? { ...S.commentItem, ...S.acceptedCommentWrapper } : S.commentItem}
                >
                  {/* Accepted answer label */}
                  {isAccepted && (
                    <div style={S.acceptedLabel}>✓ Accepted Answer</div>
                  )}

                  {/* Comment header */}
                  <div style={S.commentHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <UserAvatar
                        photoURL={commentPhoto}
                        displayName={commentName}
                        size={24}
                        fontSize="0.7rem"
                        onClick={(e) => onOpenProfile(e, c.uid, c.displayName, c.photoURL)}
                      />
                      <span
                        style={{ ...S.commentAuthor, cursor: "pointer" }}
                        onClick={(e) => onOpenProfile(e, c.uid, c.displayName, c.photoURL)}
                      >
                        {commentName}
                      </span>
                    </div>
                    <div style={S.commentMeta}>
                      <span>{new Date(c.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {c.edited && <span style={{ fontStyle: "italic" }}>(edited)</span>}
                      {isQuestion && isPostAuthor && !isEditingThis && (
                        <button
                          style={S.btnAccept(isAccepted)}
                          onClick={() => onMarkSolved?.(post, c)}
                          title={isAccepted ? "Unmark accepted answer" : "Mark as accepted answer"}
                        >
                          {isAccepted ? "✓ Accepted" : "✓ Accept"}
                        </button>
                      )}
                      {isOwner && !isEditingThis && (
                        <>
                          <button style={S.btnActionDanger} onClick={() => onStartEditComment({ ...c, _postId: post.id })}>✏️</button>
                          <button style={S.btnActionDanger} onClick={() => onDeleteComment(post, c)}>🗑️</button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit mode or body + reactions */}
                  {isEditingThis ? (
                    <>
                      <textarea
                        style={S.commentEditTextarea}
                        value={editingCommentDraft}
                        onChange={(e) => setEditingCommentDraft(e.target.value)}
                        autoFocus
                      />
                      <div style={S.commentEditActions}>
                        <button style={S.btnSm} onClick={() => onSaveCommentEdit(post, c)}>Save</button>
                        <button style={S.btnSmGhost} onClick={onCancelEditComment}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ ...S.commentBody, margin: 0 }}>{c.content}</p>

                      {/* ── Reaction Bar ── */}
                      <div
                        style={{ position: "relative", marginTop: 6 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {/* Default 4 + any active extra emojis */}
                          {[...DEFAULT_EMOJIS, ...activeExtra].map((emoji) => {
                            const reactors   = c.reactions?.[emoji] || [];
                            const hasReacted = reactors.includes(user?.uid);
                            return (
                              <button
                                key={emoji}
                                style={S.reactionBtn(hasReacted)}
                                onClick={() => onToggleCommentReaction?.(post, c, emoji)}
                                title={reactors.length > 0 ? `${reactors.length} reaction${reactors.length !== 1 ? "s" : ""}` : "React"}
                              >
                                <span>{emoji}</span>
                                {reactors.length > 0 && (
                                  <span style={{ fontSize: "0.72rem", minWidth: 10 }}>{reactors.length}</span>
                                )}
                              </button>
                            );
                          })}

                          {/* Picker toggle */}
                          <button
                            style={S.pickerToggleBtn(isPickerOpen)}
                            onClick={() => setOpenPickerFor(isPickerOpen ? null : commentKey)}
                            title="More reactions"
                          >
                            {isPickerOpen ? "✕ Close" : "+ 😊"}
                          </button>
                        </div>

                        {/* Expanded emoji picker */}
                        {isPickerOpen && (
                          <div style={S.pickerGrid}>
                            {EXTRA_EMOJIS.map((emoji) => {
                              const reactors   = c.reactions?.[emoji] || [];
                              const hasReacted = reactors.includes(user?.uid);
                              return (
                                <button
                                  key={emoji}
                                  style={S.pickerEmojiBtn(hasReacted)}
                                  title={`${emoji}${reactors.length > 0 ? ` · ${reactors.length}` : ""}`}
                                  onClick={() => {
                                    onToggleCommentReaction?.(post, c, emoji);
                                    setOpenPickerFor(null);
                                  }}
                                >
                                  {emoji}
                                  {reactors.length > 0 && (
                                    <span style={S.pickerBadge}>{reactors.length}</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

          {/* Add comment input */}
          <div style={{ display: "flex", gap: 8 }}>
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
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAddComment(post); } }}
            />
            <button
              style={commentDraft.trim() ? S.btnPost : S.btnPostDisabled}
              disabled={!commentDraft.trim()}
              onClick={() => onAddComment(post)}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </article>
  );
}