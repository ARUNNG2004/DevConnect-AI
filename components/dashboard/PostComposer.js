"use client";

import { useRef, useState } from "react";
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
    flexWrap: "wrap",
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
  // Poll builder styles
  pollBuilder: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 12,
    background: "var(--bg-primary)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  pollOptionRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  pollInput: {
    flex: 1,
    padding: "7px 10px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    outline: "none",
  },
  btnAddOption: {
    padding: "6px 12px",
    background: "transparent",
    border: "1px dashed var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-muted)",
    fontSize: "0.8rem",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
  },
  btnRemoveOption: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    fontSize: "1rem",
    padding: "0 4px",
    lineHeight: 1,
    flexShrink: 0,
  },
  // ── Image attachment styles ───────────────────────────────────────────────
  imagePreviewWrapper: {
    position: "relative",
    display: "inline-block",
    marginTop: 4,
  },
  imagePreview: {
    display: "block",
    maxWidth: "100%",
    maxHeight: 240,
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    objectFit: "cover",
  },
  imageRemoveBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.7)",
    border: "none",
    color: "#fff",
    fontSize: "0.75rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  uploadingText: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    paddingTop: 4,
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
  { id: "question",   label: "❔ Question" },
  { id: "collaboration", label: "🤝 Collaborate" },
  { id: "poll",       label: "📊 Poll" },
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
  error,
  isMobile,
  onPost,
  onOpenCodeEditor,
  getLivePhoto,
  getLiveName,
  // Poll props
  pollOptions,
  setPollOptions,
  // Image attachment props
  imageURL,
  setImageURL,
  imageUploading,
  setImageUploading,
}) {
  const fileInputRef = useRef(null);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (posting || imageUploading) return;
    try {
      setPosting(true);
      await onPost();
      setPosting(false);
    } catch (_) {
      // error already set in page.js
    } finally {
      setPosting(false);
    }
  };
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

  const updatePollOption = (idx, val) =>
    setPollOptions((prev) => prev.map((o, i) => i === idx ? val : o));

  const removePollOption = (idx) =>
    setPollOptions((prev) => prev.filter((_, i) => i !== idx));

  const addPollOption = () => {
    if (pollOptions.length >= 6) return;
    setPollOptions((prev) => [...prev, ""]);
  };

  const handleImageClick = () => {
    if (imageUploading) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      formData.append("public_id", `post_images/${Date.now()}`);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      setImageURL(data.secure_url);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImageURL("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Poll is postable if question + at least 2 non-empty options
  const pollReady = postType === "poll"
    ? content.trim().length > 0 && pollOptions.filter((o) => o.trim()).length >= 2
    : content.trim().length > 0;

  // Button is only hard-disabled while an async operation is in flight.
  // When the composer is empty we keep it visually muted but NOT disabled,
  // so after a successful post it snaps back to the green "Post" style.
  const isInFlight   = posting || imageUploading;
  const isPostDisabled = isInFlight;

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
            placeholder={
              postType === "poll"
                ? "Ask a poll question… e.g. Which state management do you prefer?"
                : "Share a coding question, project idea, or debugging help..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>

      {/* ── Image preview ── */}
      {imageUploading && (
        <p style={S.uploadingText}>⏳ Uploading image...</p>
      )}
      {imageURL && !imageUploading && (
        <div style={S.imagePreviewWrapper}>
          <img src={imageURL} alt="Post attachment" style={S.imagePreview} />
          <button
            style={S.imageRemoveBtn}
            onClick={handleRemoveImage}
            title="Remove image"
            type="button"
          >✕</button>
        </div>
      )}

      <div style={S.postTypeRow}>
        {POST_TYPES.map(({ id, label }) => (
          <button
            key={id}
            style={S.postTypeBtn(postType === id)}
            onClick={() => setPostType(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Poll builder — only shown when poll type is active */}
      {postType === "poll" && (
        <div style={S.pollBuilder}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 2 }}>
            Poll options (min 2, max 6)
          </div>
          {pollOptions.map((opt, idx) => (
            <div key={idx} style={S.pollOptionRow}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: 16, flexShrink: 0 }}>
                {idx + 1}.
              </span>
              <input
                style={S.pollInput}
                value={opt}
                onChange={(e) => updatePollOption(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                maxLength={80}
              />
              {pollOptions.length > 2 && (
                <button
                  style={S.btnRemoveOption}
                  onClick={() => removePollOption(idx)}
                  title="Remove option"
                >✕</button>
              )}
            </div>
          ))}
          {pollOptions.length < 6 && (
            <button style={S.btnAddOption} onClick={addPollOption}>
              + Add option
            </button>
          )}
        </div>
      )}

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
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <button
            style={{
              ...S.composerToolBtn,
              color: imageURL ? "var(--accent-primary)" : "var(--text-muted)",
              opacity: imageUploading ? 0.5 : 1,
            }}
            title={imageURL ? "Image attached" : "Add Image"}
            onClick={handleImageClick}
            type="button"
          >🖼️</button>
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
          style={isInFlight || !pollReady ? S.btnPostDisabled : S.btnPost}
          onClick={handlePost}
          disabled={isPostDisabled}
        >
          {posting ? "Posting..." : imageUploading ? "Uploading..." : "Post"}
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