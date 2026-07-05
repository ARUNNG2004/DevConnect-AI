// Theme color palette for both light and dark modes
export const themeConfig = {
  dark: {
    // Background colors
    bgPrimary: "#0f172a",
    bgSecondary: "#1e293b",
    bgTertiary: "#0f172a",
    
    // Border colors
    borderColor: "#334155",
    borderFocus: "#38bdf8",
    
    // Text colors
    textPrimary: "#ffffff",
    textSecondary: "#cbd5e1",
    textMuted: "#64748b",
    
    // Accent colors
    accentPrimary: "#38bdf8",
    accentPrimaryHover: "#0ea5e9",
    accentPrimaryAlpha: "rgba(56, 189, 248, 0.15)",
    
    accentSuccess: "#10b981",
    accentWarning: "#f59e0b",
    accentAI: "#a855f7",
    accentAIHover: "#9333ea",
    accentAIAlpha: "rgba(168, 85, 247, 0.15)",

    codeText: "#e2e8f0",
    codeComment: "#64748b",
    codeKeyword: "#c084fc",
    codeString: "#34d399",
    codeNumber: "#38bdf8",
    codePlaceholder: "#64748b",
    mockupLine: "rgba(255, 255, 255, 0.08)",
  },
  light: {
    // Background colors
    bgPrimary: "#f8fafc",
    bgSecondary: "#f1f5f9",
    bgTertiary: "#ffffff",
    
    // Border colors
    borderColor: "#e2e8f0",
    borderFocus: "#0ea5e9",
    
    // Text colors
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#64748b",
    
    // Accent colors
    accentPrimary: "#0284c7",
    accentPrimaryHover: "#0369a1",
    accentPrimaryAlpha: "rgba(2, 132, 199, 0.08)",
    
    accentSuccess: "#059669",
    accentWarning: "#d97706",
    accentAI: "#7c3aed",
    accentAIHover: "#6d28d9",
    accentAIAlpha: "rgba(124, 58, 237, 0.1)",

    codeText: "#0f172a",
    codeComment: "#475569",
    codeKeyword: "#7c3aed",
    codeString: "#047857",
    codeNumber: "#0369a1",
    codePlaceholder: "#64748b",
    mockupLine: "rgba(71, 85, 105, 0.18)",
  },
};

// Get theme colors based on current mode
export const getThemeColors = (isDarkMode) => {
  return isDarkMode ? themeConfig.dark : themeConfig.light;
};

// CSS variables generation
export const generateThemeCSS = (isDarkMode) => {
  const colors = getThemeColors(isDarkMode);
  return `
    :root[data-theme="${isDarkMode ? "dark" : "light"}"] {
      --bg-primary: ${colors.bgPrimary};
      --bg-secondary: ${colors.bgSecondary};
      --bg-tertiary: ${colors.bgTertiary};
      --border-color: ${colors.borderColor};
      --border-focus: ${colors.borderFocus};
      --text-primary: ${colors.textPrimary};
      --text-secondary: ${colors.textSecondary};
      --text-muted: ${colors.textMuted};
      --accent-primary: ${colors.accentPrimary};
      --accent-primary-hover: ${colors.accentPrimaryHover};
      --accent-primary-alpha: ${colors.accentPrimaryAlpha};
      --accent-success: ${colors.accentSuccess};
      --accent-warning: ${colors.accentWarning};
      --accent-ai: ${colors.accentAI};
      --accent-ai-hover: ${colors.accentAIHover};
      --accent-ai-alpha: ${colors.accentAIAlpha};
      --code-text: ${colors.codeText};
      --code-comment: ${colors.codeComment};
      --code-keyword: ${colors.codeKeyword};
      --code-string: ${colors.codeString};
      --code-number: ${colors.codeNumber};
      --code-placeholder: ${colors.codePlaceholder};
      --mockup-line: ${colors.mockupLine};
    }
  `;
};
