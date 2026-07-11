"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { doc, updateDoc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell" },
];

const S = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 12px",
    borderBottom: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    flexShrink: 0,
  },
  langSelect: {
    padding: "4px 8px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontSize: "0.78rem",
    cursor: "pointer",
    outline: "none",
  },
  label: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    marginRight: 6,
  },
};

const RoomEditor = ({ roomId, onContentChange }) => {
    const { user } = useAuth();
    const [language, setLanguage] = useState("javascript");
    const editorRef = useRef(null);
    const isRemoteUpdate = useRef(false);
    const saveTimer = useRef(null);
    const cursorTimer = useRef(null);
    const loadedCode = useRef(false);
    const latestCode = useRef("");

    // Initial load and real-time sync
    useEffect(() => {
        if (!roomId) return;
        const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
            const data = snap.data();
            if (data?.code !== undefined && data.code !== latestCode.current) {
                latestCode.current = data.code;
                const editor = editorRef.current;
                if (editor) {
                    isRemoteUpdate.current = true;
                    const pos = editor.getPosition();
                    editor.setValue(data.code);
                    if (pos) editor.setPosition(pos);
                }
            }
            if (data?.language) {
                const lang = data.language.toLowerCase();
                setLanguage((prev) => (prev !== lang ? lang : prev));
            }
        });
        return () => unsub();
    }, [roomId]);

    // Save to Firestore (debounced via ref)
    const persistCode = useCallback((value) => {
        latestCode.current = value;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            try {
                await updateDoc(doc(db, "rooms", roomId), { code: value });
                onContentChange?.();
            } catch (err) {
                console.error("Save failed:", err);
            }
        }, 800);
    }, [roomId, onContentChange]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
            if (cursorTimer.current) clearTimeout(cursorTimer.current);
        };
    }, []);

    // Write cursor position to presence (debounced)
    const persistCursor = useCallback((editor) => {
        if (!user?.uid) return;
        if (cursorTimer.current) clearTimeout(cursorTimer.current);
        cursorTimer.current = setTimeout(async () => {
            const pos = editor.getPosition();
            if (!pos) return;
            try {
                await setDoc(
                    doc(db, "rooms", roomId, "presence", user.uid),
                    {
                        cursorLine: pos.lineNumber,
                        cursorColumn: pos.column,
                        lastSeen: serverTimestamp(),
                    },
                    { merge: true }
                );
            } catch (err) {
                console.error("Cursor persist failed:", err);
            }
        }, 300);
    }, [roomId, user]);

    const handleEditorChange = (value) => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }
        latestCode.current = value;
        persistCode(value);
    };

    const handleLanguageChange = async (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        try {
            await updateDoc(doc(db, "rooms", roomId), { language: lang });
        } catch (err) {
            console.error("Language update failed:", err);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={S.toolbar}>
                <span style={S.label}>⌨️ Code Editor</span>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={S.label}>Language:</span>
                    <select
                        style={S.langSelect}
                        value={language}
                        onChange={handleLanguageChange}
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    defaultValue=""
                    onMount={(editor) => {
                        editorRef.current = editor;
                        editor.onDidChangeCursorPosition(() => {
                            persistCursor(editor);
                        });
                        // Load saved code if onSnapshot fired before mount
                        if (latestCode.current) {
                            isRemoteUpdate.current = true;
                            editor.setValue(latestCode.current);
                        }
                    }}
                    onChange={handleEditorChange}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        padding: { top: 10 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
};

export default RoomEditor;
