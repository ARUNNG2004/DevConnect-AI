"use client";

import AIDraftAssistant from "../AIDraftAssistant";
import UserAvatar from "./UserAvatar";

const S = {
  composerCard: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "var(--shadow-sm)",
  },
  composerHeader: { display: "flex", gap: 12 },
  composerInputWrapper: { flex: 1 },
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
  postTypeRow: {
    display: "flex",
    gap: 8,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  postTypeBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 14px",
    borderRadius: "var(--radius-full)",
    fontSize: "0.8rem",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
    backgroundColor: active ? "var(--accent-primary-alpha)" : "transparent",
    color: active ? "var(--accent-primary)" : "var(--text-muted)",
  }),
  composerTagsInput: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
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
    fontSize: "0.78rem",
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
    fontSize: "0.78rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  composerActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTop: "1px solid var(--border-color)",
    gap: 8,
    flexWrap: "wrap",
  },
  composerTools: { display: "flex", gap: 6 },
  composerToolBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    background: "transparent",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  aiHelperToggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "var(--text-muted)",
    userSelect: "none",
  },
  pulsePoint: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--accent-ai)",
    animation: "pulse-glow 2s infinite",
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
};

const AVAILABLE_TAGS = [
  "#react", "#nextjs", "#javascript", "#typescript",
  "#frontend", "#backend", "#nodejs", "#python",
  "#rust", "#go", "#ai-agents", "#machine-learning",
  "#css", "#devops", "#docker", "#database",
];

const POST_TYPES = [
  { id: "discussion", label: "💬 Discussion" },
  { id: "question", label: "❔ Question" },
  { id: "collaboration", label: "🤝 Collaborate" },
];

export default function PostComposer({
  user,
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
  posting,
  error,
  isMobile,
  onPost,
  onOpenCodeEditor,
  getLivePhoto,
  getLiveName,
}) {
  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const addCustomTag = () => {
    let tag = customTag.trim();
    if (!tag) return;
    if (!tag.startsWith("#")) tag = "#" + tag;
    tag = tag.toLowerCase().replace(/\s+/g, "-");
    if (!selectedTags.includes(tag)) setSelectedTags((prev) => [...prev, tag]);
    setCustomTag("");
  };

  return (
    <div id="composer-card" style={S.composerCard}>
      <div style={S.composerHeader}>
        <UserAvatar
          photoURL={getLivePhoto(user?.uid, user?.photoURL)}
          displayName={getLiveName(user?.uid, user?.displayName)}
          size={36}
        />
        <div style={S.composerInputWrapper}>
          <textarea
            style={S.composerTextarea}
            placeholder="Share a coding question, project idea, or debugging help..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>

      <div style={S.postTypeRow}>
        {POST_TYPES.map(({ id, label }) => (
          <button key={id} style={S.postTypeBtn(postType === id)} onClick={() => setPostType(id)} type="button">
            {label}
          </button>
        ))}
      </div>

      <div id="composer-tags" style={S.composerTagsInput}>
        {AVAILABLE_TAGS.map((tag) => (
          <span
            key={tag}
            onClick={() => toggleTag(tag)}
            style={{ ...(selectedTags.includes(tag) ? S.tagBadgeSelected : S.tagBadge), userSelect: "none" }}
          >
            {tag}
          </span>
        ))}
        {selectedTags.filter((tag) => !AVAILABLE_TAGS.includes(tag)).map((tag) => (
          <span key={tag} onClick={() => toggleTag(tag)} style={{ ...S.tagBadgeSelected, userSelect: "none" }}>
            {tag} ✕
          </span>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
            placeholder="Add tag..."
            style={{
              background: "transparent",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-full)",
              color: "var(--text-primary)",
              outline: "none",
              fontSize: "0.78rem",
              padding: "4px 10px",
              width: 80,
            }}
          />
          <button
            onClick={addCustomTag}
            type="button"
            style={{ ...S.tagBadge, cursor: "pointer", border: "1px solid var(--accent-primary)", color: "var(--accent-primary)" }}
          >
            + Add
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

      <div style={S.composerActions}>
        <div style={S.composerTools}>
          <button style={S.composerToolBtn} title="Add Image">🖼️</button>
          <button
            id="open-code-editor-btn"
            style={S.composerToolBtn}
            title="Insert Code Block"
            onClick={onOpenCodeEditor}
          >
            {"</>"}
          </button>
        </div>

        <label id="ai-draft-toggle" style={S.aiHelperToggle} onClick={() => setShowAiDraft((p) => !p)}>
          <span style={{
            position: "relative", display: "inline-block", width: 36, height: 20,
            backgroundColor: showAiDraft ? "var(--accent-ai)" : "var(--border-color)",
            borderRadius: "var(--radius-full)", transition: "background-color 0.2s",
          }}>
            <span style={{
              position: "absolute", top: 2, left: showAiDraft ? 18 : 2,
              width: 16, height: 16, backgroundColor: "#fff", borderRadius: "50%",
              transition: "left 0.2s",
            }} />
          </span>
          {!isMobile && <span>Draft with AI</span>}
          <span style={S.pulsePoint} />
        </label>

        <button
          style={posting || !content.trim() ? S.btnPostDisabled : S.btnPost}
          onClick={onPost}
          disabled={posting || !content.trim()}
        >
          {posting ? "Posting..." : "Post"}
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
  );
}