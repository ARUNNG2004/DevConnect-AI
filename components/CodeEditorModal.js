"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/*language definitions*/
const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python",     label: "Python"     },
  { value: "java",       label: "Java"       },
  { value: "cpp",        label: "C++"        },
];

/*very-light token-level syntax colouring (no deps)*/
const KEYWORD_MAP = {
  javascript: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|new|this|typeof|instanceof|true|false|null|undefined|switch|case|break|continue|try|catch|finally|throw|of|in|from)\b/g,
  typescript: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|new|this|typeof|instanceof|true|false|null|undefined|switch|case|break|continue|try|catch|finally|throw|of|in|from|interface|type|enum|implements|extends|declare|abstract|readonly|public|private|protected)\b/g,
  python:     /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|True|False|None|lambda|with|as|try|except|finally|raise|pass|break|continue|yield|global|nonlocal|del|assert|is)\b/g,
  java:       /\b(public|private|protected|static|void|int|boolean|String|class|interface|extends|implements|import|return|if|else|for|while|new|this|super|try|catch|finally|throw|throws|null|true|false|final|abstract|override)\b/g,
  cpp:        /\b(int|void|bool|char|double|float|long|short|unsigned|class|struct|namespace|using|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|delete|nullptr|true|false|public|private|protected|virtual|const|static|auto|template|typename)\b/g,
};

function tokenise(code, lang) {
  if (!code) return [];

  const kwRegex = KEYWORD_MAP[lang] || KEYWORD_MAP.javascript;
  kwRegex.lastIndex = 0;

  // Split into segments: keywords vs rest
  const segments = [];
  let last = 0;
  let m;

  while ((m = kwRegex.exec(code)) !== null) {
    if (m.index > last) segments.push({ text: code.slice(last, m.index), type: "plain" });
    segments.push({ text: m[0], type: "keyword" });
    last = m.index + m[0].length;
  }
  if (last < code.length) segments.push({ text: code.slice(last), type: "plain" });

  // Further colour strings and comments inside "plain" segments
  const COLORS = {
    keyword: "#c084fc",   // purple
    string:  "#34d399",   // green
    comment: "#64748b",   // muted
    number:  "#38bdf8",   // blue
    plain:   "#e2e8f0",   // off-white
  };

  const result = [];
  for (const seg of segments) {
    if (seg.type !== "plain") {
      result.push({ text: seg.text, color: COLORS.keyword });
      continue;
    }
    // tokenise strings (single/double/template), line-comments, numbers
    const innerRe = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/|\b\d+(?:\.\d+)?\b)/g;
    let iLast = 0;
    let im;
    innerRe.lastIndex = 0;
    const text = seg.text;
    while ((im = innerRe.exec(text)) !== null) {
      if (im.index > iLast) result.push({ text: text.slice(iLast, im.index), color: COLORS.plain });
      const t = im[0];
      let color = COLORS.plain;
      if (t.startsWith("//") || t.startsWith("/*")) color = COLORS.comment;
      else if (t.startsWith('"') || t.startsWith("'") || t.startsWith("`")) color = COLORS.string;
      else if (/^\d/.test(t)) color = COLORS.number;
      result.push({ text: t, color });
      iLast = im.index + t.length;
    }
    if (iLast < text.length) result.push({ text: text.slice(iLast), color: COLORS.plain });
  }
  return result;
}

/*styles*/
const ST = {
  overlay: (open) => ({
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    backgroundColor: "rgba(3,7,18,0.75)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: "opacity 0.25s cubic-bezier(0.4,0,0.2,1)",
  }),
  modal: (open) => ({
    position: "relative",
    width: "100%",
    maxWidth: 780,
    maxHeight: "90vh",
    backgroundColor: "#0f172a",
    border: "1px solid rgba(56,189,248,0.2)",
    borderRadius: 18,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(56,189,248,0.08)",
    transform: open ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
    opacity: open ? 1 : 0,
    transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.25s cubic-bezier(0.4,0,0.2,1)",
  }),
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(9,13,22,0.95)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "linear-gradient(135deg, #38bdf8, #c084fc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: 800,
    color: "#000",
    flexShrink: 0,
    fontFamily: "'JetBrains Mono', monospace",
  },
  headerTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
  },
  headerSub: {
    fontSize: "0.75rem",
    color: "#64748b",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "1.2rem",
    cursor: "pointer",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    padding: 0,
    transition: "color 0.15s, background 0.15s",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    background: "rgba(9,13,22,0.6)",
    flexShrink: 0,
  },
  langLabel: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    flexShrink: 0,
  },
  langSelect: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#cbd5e1",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  dotRow: {
    display: "flex",
    gap: 5,
    marginLeft: "auto",
  },
  dot: (color) => ({
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: color,
  }),
  editorArea: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "40px 1fr",
    position: "relative",
    overflow: "hidden",
    minHeight: 0,
  },
  lineNumbers: {
    background: "rgba(9,13,22,0.7)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    padding: "16px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    paddingRight: 8,
    overflowY: "hidden",
    userSelect: "none",
    flexShrink: 0,
  },
  lineNum: {
    height: "1.6em",
    fontSize: "0.78rem",
    color: "#334155",
    lineHeight: "1.6",
    fontFamily: "'JetBrains Mono', monospace",
  },
  editorInner: {
    position: "relative",
    overflow: "auto",
    flex: 1,
  },
  highlight: {
    position: "absolute",
    inset: 0,
    padding: "16px",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: "0.875rem",
    lineHeight: "1.6",
    whiteSpace: "pre",
    pointerEvents: "none",
    color: "transparent",
    overflowX: "auto",
    overflowY: "auto",
    wordBreak: "keep-all",
  },
  textarea: {
    position: "absolute",
    inset: 0,
    padding: "16px",
    background: "transparent",
    border: "none",
    outline: "none",
    resize: "none",
    color: "#e2e8f0",
    caretColor: "#38bdf8",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: "0.875rem",
    lineHeight: "1.6",
    whiteSpace: "pre",
    overflowWrap: "normal",
    overflowX: "auto",
    overflowY: "auto",
    spellCheck: false,
    width: "100%",
    height: "100%",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    background: "rgba(239,68,68,0.12)",
    borderTop: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(9,13,22,0.95)",
    gap: 12,
    flexShrink: 0,
    flexWrap: "wrap",
  },
  footerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  charCount: {
    fontSize: "0.78rem",
    color: "#475569",
    fontFamily: "'JetBrains Mono', monospace",
  },
  btnCopy: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#cbd5e1",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  btnCancel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#64748b",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  btnInsert: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 18px",
    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
    border: "none",
    borderRadius: 8,
    color: "#000",
    fontSize: "0.875rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s, transform 0.1s",
    boxShadow: "0 4px 14px rgba(56,189,248,0.25)",
  },
};

/*Component */
export default function CodeEditorModal({ isOpen, onClose, onInsert }) {
  const [lang, setLang]         = useState("javascript");
  const [code, setCode]         = useState("");
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState("");
  const [mounted, setMounted]   = useState(false);

  const textareaRef = useRef(null);
  const overlayRef  = useRef(null);

  // Delay mount flag so CSS transition plays on open
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
    if (!isOpen) {
      setError("");
    }
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Sync textarea & highlight scroll
  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const hlEl = ta.previousSibling;
    if (hlEl) { hlEl.scrollTop = ta.scrollTop; hlEl.scrollLeft = ta.scrollLeft; }
  }, []);

  // Tab key support
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const next  = code.slice(0, start) + "  " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleCopy = async () => {
    if (!code.trim()) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  const handleInsert = () => {
    if (!code.trim()) {
      setError("Please enter some code before inserting.");
      return;
    }
    setError("");
    const block = `\`\`\`${lang}\n${code}\n\`\`\``;
    onInsert(block);
    onClose();
  };

  // Highlight tokens
  const tokens = tokenise(code, lang);
  const lineCount = Math.max((code.match(/\n/g) || []).length + 1, 10);

  if (!mounted && !isOpen) return null;

  return (
    <div
      ref={overlayRef}
      style={ST.overlay(isOpen)}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Code Editor"
    >
      <div style={ST.modal(isOpen)}>

        {/*Header*/}
        <div style={ST.header}>
          <div style={ST.headerLeft}>
            <div style={ST.headerIcon}>&lt;/&gt;</div>
            <div>
              <p style={ST.headerTitle}>Code Editor</p>
              <p style={ST.headerSub}>Write, preview, and insert code snippets</p>
            </div>
          </div>
          <button
            style={ST.closeBtn}
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/*Toolbar*/}
        <div style={ST.toolbar}>
          <span style={ST.langLabel}>Language</span>
          <select
            id="code-editor-lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={ST.langSelect}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <div style={ST.dotRow}>
            <span style={ST.dot("#ef4444")} />
            <span style={ST.dot("#f59e0b")} />
            <span style={ST.dot("#10b981")} />
          </div>
        </div>

        {/*Editor*/}
        <div style={ST.editorArea}>
          {/* line numbers */}
          <div style={ST.lineNumbers} aria-hidden="true">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} style={ST.lineNum}>{i + 1}</div>
            ))}
          </div>

          {/* editor inner */}
          <div style={ST.editorInner}>
            {/* syntax highlight layer */}
            <div style={ST.highlight} aria-hidden="true">
              {tokens.map((tok, i) => (
                <span key={i} style={{ color: tok.color }}>{tok.text}</span>
              ))}
            </div>
            {/* real textarea */}
            <textarea
              id="code-editor-textarea"
              ref={textareaRef}
              style={ST.textarea}
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); syncScroll(); }}
              onScroll={syncScroll}
              onKeyDown={handleKeyDown}
              placeholder={`// Write your ${LANGUAGES.find(l => l.value === lang)?.label || ""} code here…`}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>

        {/*Error banner*/}
        {error && (
          <div style={ST.errorBanner} role="alert">
            ⚠ {error}
          </div>
        )}

        {/*Footer*/}
        <div style={ST.footer}>
          <div style={ST.footerLeft}>
            <span style={ST.charCount}>
              {code.length} chars · {lineCount} lines
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              id="code-editor-copy-btn"
              style={ST.btnCopy}
              onClick={handleCopy}
            >
              {copied ? "✓ Copied!" : "⧉ Copy Code"}
            </button>
            <button
              id="code-editor-cancel-btn"
              style={ST.btnCancel}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              id="code-editor-insert-btn"
              style={ST.btnInsert}
              onClick={handleInsert}
            >
              ↵ Insert Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
