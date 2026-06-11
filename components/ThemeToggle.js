"use client";

import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        color: "var(--text-secondary)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = "var(--accent-primary-alpha)";
        e.target.style.color = "var(--accent-primary)";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "var(--bg-secondary)";
        e.target.style.color = "var(--text-secondary)";
      }}
    >
      {isDarkMode ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}
