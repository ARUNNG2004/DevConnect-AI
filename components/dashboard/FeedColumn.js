"use client";

import PostCard from "./PostCard";
import PostComposer from "./PostComposer";

const FEED_TABS = [
  { id: "latest", label: "Latest Feed", icon: "▦" },
  { id: "trending", label: "Trending", icon: "📈" },
  { id: "questions", label: "Questions", icon: "❔" },
  { id: "collaboration", label: "Collaborate", icon: "👥" },
];

const S = {
  feedColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minWidth: 0,
  },
  feedFiltersBar: {
    display: "flex",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: 2,
    gap: 4,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
  },
  filterTab: {
    padding: "8px 14px",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "transparent",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    background: "transparent",
    color: "var(--text-muted)",
    fontWeight: 500,
    fontSize: "0.85rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
  filterTabActive: {
    padding: "8px 14px",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "transparent",
    borderBottomWidth: 2,
    borderBottomColor: "var(--accent-primary)",
    background: "transparent",
    color: "var(--accent-primary)",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
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

export default function FeedColumn({
  user,
  posts,
  filteredPosts,
  trendingPosts,
  activeTab,
  setActiveTab,
  isMobile,
  highlightedPostId,
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
  // Composer props
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
  onPost,
  onOpenCodeEditor,
  pollOptions,
  setPollOptions,
  imageURL,
  setImageURL,
  imageUploading,
  setImageUploading,
}) {
  const postCardProps = {
    user, isMobile, openCommentsFor, commentDraft, setCommentDraft,
    editingId, editContent, setEditContent, editingComment,
    editingCommentDraft, setEditingCommentDraft, savedPostIds,
    getLiveName, getLivePhoto, onOpenProfile, onToggleLike, onToggleSave,
    onDeletePost, onStartEdit, onCancelEdit, onSaveEdit, onToggleComments,
    onAddComment, onStartEditComment, onCancelEditComment, onSaveCommentEdit,
    onDeleteComment,
    onVotePoll,
    onToggleCommentReaction,
    onMarkSolved,
  };

  return (
    <section style={S.feedColumn}>
      <PostComposer
        user={user}
        content={content}
        setContent={setContent}
        postType={postType}
        setPostType={setPostType}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        customTag={customTag}
        setCustomTag={setCustomTag}
        showAiDraft={showAiDraft}
        setShowAiDraft={setShowAiDraft}
        error={error}
        isMobile={isMobile}
        onPost={onPost}
        onOpenCodeEditor={onOpenCodeEditor}
        getLivePhoto={getLivePhoto}
        getLiveName={getLiveName}
        pollOptions={pollOptions}
        setPollOptions={setPollOptions}
        imageURL={imageURL}
        setImageURL={setImageURL}
        imageUploading={imageUploading}
        setImageUploading={setImageUploading}
      />

      <div style={S.feedFiltersBar}>
        {FEED_TABS.map(({ id, label }) => (
          <button
            key={id}
            style={activeTab === id ? S.filterTabActive : S.filterTab}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "trending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "0 2px" }}>
            🔥 Most liked posts in the last 48 hours
          </div>
          {trendingPosts.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: "2rem" }}>📭</div>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No trending posts yet</div>
              <div style={{ fontSize: "0.85rem" }}>Posts liked in the last 48 hours will appear here.</div>
            </div>
          ) : (
            trendingPosts.map((post, i) => (
              <PostCard key={post.id} post={post} postIndex={i} isHighlighted={highlightedPostId === post.id} {...postCardProps} />
            ))
          )}
        </div>
      )}

      {activeTab === "questions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "0 2px" }}>
            ❔ Questions from the community — help someone out!
          </div>
          {filteredPosts.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: "2rem" }}>🙋</div>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No questions yet</div>
              <div style={{ fontSize: "0.85rem" }}>Post a question using the composer above.</div>
            </div>
          ) : (
            filteredPosts.map((post, i) => (
              <PostCard key={post.id} post={post} postIndex={i} isHighlighted={highlightedPostId === post.id} {...postCardProps} />
            ))
          )}
        </div>
      )}

      {activeTab === "collaboration" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "0 2px" }}>
            🤝 Find developers to build something together
          </div>
          {filteredPosts.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: "2rem" }}>🚀</div>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>No collaboration posts yet</div>
              <div style={{ fontSize: "0.85rem" }}>Post a collaboration request using the composer above.</div>
            </div>
          ) : (
            filteredPosts.map((post, i) => (
              <PostCard key={post.id} post={post} postIndex={i} isHighlighted={highlightedPostId === post.id} {...postCardProps} />
            ))
          )}
        </div>
      )}

      {activeTab === "latest" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredPosts.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No posts found for this tag.</p>
            ) : (
              filteredPosts.map((post, i) => (
                <PostCard key={post.id} post={post} postIndex={i} isHighlighted={highlightedPostId === post.id} {...postCardProps} />
              ))
            )}
          </div>
        )}
    </section>
  );
}