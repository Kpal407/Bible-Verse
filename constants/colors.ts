const Colors = {
  light: {
    text: "#1C1C2E",
    textSecondary: "#5A5A7A",
    textMuted: "#9494AC",
    background: "#F6F8FC",
    backgroundSecondary: "#EDF1F8",
    card: "#FFFFFF",
    cardBorder: "rgba(93, 156, 217, 0.12)",
    tint: "#D2319A",
    tintLight: "rgba(210, 49, 154, 0.10)",
    accent: "#2B3A5C",
    gold: "#D2319A",
    tabIconDefault: "#A9B8D0",
    tabIconSelected: "#D2319A",
    divider: "rgba(93, 156, 217, 0.12)",
    overlay: "rgba(43, 58, 92, 0.55)",
  },
  dark: {
    text: "#F2F1FA",
    textSecondary: "#B5B8CC",
    textMuted: "#7478A0",
    background: "#161A2E",
    backgroundSecondary: "#1E2340",
    card: "#242952",
    cardBorder: "rgba(169, 198, 235, 0.10)",
    tint: "#FF80C0",
    tintLight: "rgba(255, 128, 192, 0.14)",
    accent: "#F2F1FA",
    gold: "#FF80C0",
    tabIconDefault: "#4E527A",
    tabIconSelected: "#FF80C0",
    divider: "rgba(169, 198, 235, 0.08)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export default Colors;

export function useThemeColors(colorScheme: "light" | "dark" | null | undefined) {
  return colorScheme === "dark" ? Colors.dark : Colors.light;
}
