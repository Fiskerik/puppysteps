import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { Dog, ReminderPlan } from "../domain/models";
import { i18n } from "../i18n";

const scheduledIds = new Map<string, string>();
export const REMINDER_CATEGORY = "puppysteps-toilet-reminder";
let categoriesReady: Promise<void> | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestReminderPermission = async (): Promise<boolean> => {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") { await registerReminderActions(); return true; }
  const result = await Notifications.requestPermissionsAsync();
  if (result.status === "granted") await registerReminderActions();
  return result.status === "granted";
};

export const registerReminderActions = async (): Promise<void> => {
  if (Platform.OS === "web") return;
  if (!categoriesReady) {
    categoriesReady = Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY, [
      { identifier: "pee_outside", buttonTitle: i18n.t("notifications.actionPeeOutside"), options: { opensAppToForeground: false } },
      { identifier: "poo_outside", buttonTitle: i18n.t("notifications.actionPooOutside"), options: { opensAppToForeground: false } },
      { identifier: "accident", buttonTitle: i18n.t("notifications.actionAccident"), options: { opensAppToForeground: false } },
      { identifier: "nothing", buttonTitle: i18n.t("notifications.actionNothing"), options: { opensAppToForeground: false } },
    ]).then(() => undefined).catch((error) => { console.warn("Could not register notification actions", error); });
  }
  await categoriesReady;
};

export const scheduleReminder = async (dog: Dog, plan: ReminderPlan, enabled: boolean): Promise<void> => {
  if (Platform.OS === "web" || !enabled) return;
  await registerReminderActions();
  const previousId = scheduledIds.get(dog.id);
  if (previousId) await Notifications.cancelScheduledNotificationAsync(previousId).catch(() => undefined);
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("notifications.reminderTitle", { name: dog.name }),
      body: i18n.t("notifications.reminderBody"),
      categoryIdentifier: REMINDER_CATEGORY,
      data: { dogId: dog.id, url: "/(tabs)/log" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(plan.at),
    },
  });
  scheduledIds.set(dog.id, id);
};

export const cancelReminder = async (dogId: string): Promise<void> => {
  const id = scheduledIds.get(dogId);
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  scheduledIds.delete(dogId);
};

export const cancelAllReminders = async (): Promise<void> => {
  if (Platform.OS !== "web") await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
  scheduledIds.clear();
};
