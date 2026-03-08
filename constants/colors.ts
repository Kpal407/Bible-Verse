const Colors = {
  light: {
    text: "#1C1C2E",
    textSecondary: "#5A5A7A",
    textMuted: "#9494AC",
    background: "#FFFFFF",
    backgroundSecondary: "#F2F3F8",
    card: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.06)",
    tint: "#E8615A",
    tintLight: "rgba(232, 97, 90, 0.10)",
    accent: "#2D2B55",
    gold: "#E8615A",
    tabIconDefault: "#B0B0C4",
    tabIconSelected: "#E8615A",
    divider: "rgba(0,0,0,0.07)",
    overlay: "rgba(44, 43, 85, 0.55)",
  },
  dark: {
    text: "#F2F1FA",
    textSecondary: "#B5B3CC",
    textMuted: "#7472A0",
    background: "#18163A",
    backgroundSecondary: "#221F50",
    card: "#2A2760",
    cardBorder: "rgba(255,255,255,0.08)",
    tint: "#FF7A73",
    tintLight: "rgba(255, 122, 115, 0.14)",
    accent: "#F2F1FA",
    gold: "#FF7A73",
    tabIconDefault: "#55537A",
    tabIconSelected: "#FF7A73",
    divider: "rgba(255,255,255,0.08)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export default Colors;

export function useThemeColors(colorScheme: "light" | "dark" | null | undefined) {
  return colorScheme === "dark" ? Colors.dark : Colors.light;
}
