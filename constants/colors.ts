const Colors = {
  light: {
    text: "#1A1A2E",
    textSecondary: "#4A4A6A",
    textMuted: "#8E8EA0",
    background: "#F5F5FA",
    backgroundSecondary: "#ECEDF4",
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.06)",
    tint: "#B8860B",
    tintLight: "rgba(184, 134, 11, 0.10)",
    accent: "#1B1464",
    gold: "#B8860B",
    tabIconDefault: "#9B9BA8",
    tabIconSelected: "#B8860B",
    divider: "rgba(0,0,0,0.08)",
    overlay: "rgba(27, 20, 100, 0.55)",
  },
  dark: {
    text: "#F0EFF6",
    textSecondary: "#B5B3C4",
    textMuted: "#76748A",
    background: "#111028",
    backgroundSecondary: "#1A1840",
    card: "#201E48",
    cardBorder: "rgba(255,255,255,0.08)",
    tint: "#E2B93B",
    tintLight: "rgba(226, 185, 59, 0.14)",
    accent: "#F0EFF6",
    gold: "#E2B93B",
    tabIconDefault: "#4E4C6A",
    tabIconSelected: "#E2B93B",
    divider: "rgba(255,255,255,0.08)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export default Colors;

export function useThemeColors(colorScheme: "light" | "dark" | null | undefined) {
  return colorScheme === "dark" ? Colors.dark : Colors.light;
}
