import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Switch,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/constants/colors";
import { useNotifications } from "@/contexts/NotificationContext";
import { getAllCategories } from "@/data/verses";
import { useLanguage } from "@/contexts/LanguageContext";

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = [0, 15, 30, 45];

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors(colorScheme);
  const insets = useSafeAreaInsets();
  const { prefs, updatePrefs, hasPermission, requestPermission } = useNotifications();
  const categories = getAllCategories();
  const { t } = useLanguage();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const selectedCategory = categories.find((c) => c.id === prefs.categoryId);
  const selectedCategoryName = selectedCategory ? t(`category.${selectedCategory.id}.name`) : t("category.daily-devotional.name");

  const handleToggle = async (value: boolean) => {
    if (value && !hasPermission && Platform.OS !== "web") {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          t("notifications.disabled"),
          t("notifications.enableMsg")
        );
        return;
      }
    }
    await updatePrefs({ enabled: value });
  };

  const handleSelectCategory = async (categoryId: string) => {
    await updatePrefs({ categoryId });
    setShowCategoryPicker(false);
  };

  const handleSelectTime = async (hour: number, minute: number) => {
    await updatePrefs({ hour, minute });
    setShowTimePicker(false);
  };

  const previewText = t("notifications.preview")
    .replace("{category}", selectedCategoryName)
    .replace("{time}", formatTime(prefs.hour, prefs.minute));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTopInset, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.tintLight, opacity: pressed ? 0.7 : 1 },
            ]}
            hitSlop={12}
            testID="back-button"
          >
            <Ionicons name="chevron-back" size={22} color={colors.gold} />
          </Pressable>
        </View>

        <View style={styles.titleSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tintLight }]}>
            <Ionicons name="notifications" size={28} color={colors.gold} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t("notifications.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("notifications.subtitle")}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Ionicons name="notifications-outline" size={20} color={colors.gold} />
              <Text style={[styles.settingText, { color: colors.text }]}>
                {t("notifications.dailyNotifications")}
              </Text>
            </View>
            <Switch
              value={prefs.enabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.divider, true: colors.gold }}
              thumbColor={Platform.OS === "ios" ? "#FFFFFF" : prefs.enabled ? "#FFFFFF" : colors.textMuted}
              testID="notification-toggle"
            />
          </View>
        </View>

        {prefs.enabled && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t("notifications.topic")}</Text>
            <Pressable
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.9 : 1 },
              ]}
              testID="category-picker-toggle"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLabel}>
                  <Ionicons name="pricetag-outline" size={20} color={colors.gold} />
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    {selectedCategoryName}
                  </Text>
                </View>
                <Ionicons
                  name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>

            {showCategoryPicker && (
              <View style={[styles.pickerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => handleSelectCategory(cat.id)}
                    style={({ pressed }) => [
                      styles.pickerItem,
                      {
                        backgroundColor: cat.id === prefs.categoryId ? colors.tintLight : "transparent",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    testID={`category-option-${cat.id}`}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: cat.id === prefs.categoryId ? colors.gold : colors.text },
                      ]}
                    >
                      {t(`category.${cat.id}.name`)}
                    </Text>
                    {cat.id === prefs.categoryId && (
                      <Ionicons name="checkmark" size={18} color={colors.gold} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t("notifications.time")}</Text>
            <Pressable
              onPress={() => setShowTimePicker(!showTimePicker)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.9 : 1 },
              ]}
              testID="time-picker-toggle"
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLabel}>
                  <Ionicons name="time-outline" size={20} color={colors.gold} />
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    {formatTime(prefs.hour, prefs.minute)}
                  </Text>
                </View>
                <Ionicons
                  name={showTimePicker ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>

            {showTimePicker && (
              <View style={[styles.pickerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <ScrollView style={styles.timePickerScroll} nestedScrollEnabled>
                  {hours.map((h) =>
                    minutes.map((m) => {
                      const isSelected = h === prefs.hour && m === prefs.minute;
                      return (
                        <Pressable
                          key={`${h}-${m}`}
                          onPress={() => handleSelectTime(h, m)}
                          style={({ pressed }) => [
                            styles.pickerItem,
                            {
                              backgroundColor: isSelected ? colors.tintLight : "transparent",
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                          testID={`time-option-${h}-${m}`}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              { color: isSelected ? colors.gold : colors.text },
                            ]}
                          >
                            {formatTime(h, m)}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.gold} />
                          )}
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            )}

            <View style={styles.previewSection}>
              <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
                {previewText}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  timePickerScroll: {
    maxHeight: 280,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerItemText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  previewSection: {
    marginTop: 16,
    alignItems: "center",
  },
  previewLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
