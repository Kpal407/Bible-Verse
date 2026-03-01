const Colors = {
  light: {
    text: "#1A1A2E",
    textSecondary: "#4A4A6A",
    textMuted: "#8E8EA0",
    background: "#F8F6F1",
    backgroundSecondary: "#EFECE4",
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.06)",
    tint: "#C8954C",
    tintLight: "rgba(200, 149, 76, 0.12)",
    accent: "#0F1B2D",
    tabIconDefault: "#9B9BA8",
    tabIconSelected: "#C8954C",
    divider: "rgba(0,0,0,0.08)",
    overlay: "rgba(15, 27, 45, 0.6)",
  },
  dark: {
    text: "#F0EDE6",
    textSecondary: "#B8B5AD",
    textMuted: "#7A7870",
    background: "#0F1B2D",
    backgroundSecondary: "#162236",
    card: "#1C2B40",
    cardBorder: "rgba(255,255,255,0.08)",
    tint: "#D4A95A",
    tintLight: "rgba(212, 169, 90, 0.15)",
    accent: "#F0EDE6",
    tabIconDefault: "#5A6678",
    tabIconSelected: "#D4A95A",
    divider: "rgba(255,255,255,0.08)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export default Colors;

export function useThemeColors(colorScheme: "light" | "dark" | null | undefined) {
  return colorScheme === "dark" ? Colors.dark : Colors.light;
}
