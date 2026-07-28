import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  DAILY_NOTIFICATION_HOUR,
  DAILY_NOTIFICATION_MINUTE,
  NOTIFICATION_TITLE,
  getRandomNotificationMessage,
} from "./notification-messages";

const SCHEDULED_NOTIFICATION_IDS_STORAGE_KEY =
  "food-valley-scheduled-notification-ids";

const NOTIFICATION_CHANNEL_ID =
  "food-valley-daily-reminders";

const NUMBER_OF_DAYS_TO_SCHEDULE = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function hasNotificationPermission(
  permissions: Notifications.NotificationPermissionsStatus
): boolean {
  return (
    permissions.granted ||
    permissions.ios?.status ===
      Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function prepareAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    NOTIFICATION_CHANNEL_ID,
    {
      name: "Food Valley Daily Reminders",
      description: "Daily cute reminders from Food Valley.",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    }
  );
}

async function getScheduledNotificationIds(): Promise<string[]> {
  try {
    const storedIds = await AsyncStorage.getItem(
      SCHEDULED_NOTIFICATION_IDS_STORAGE_KEY
    );

    if (!storedIds) {
      return [];
    }

    const parsedIds: unknown = JSON.parse(storedIds);

    if (!Array.isArray(parsedIds)) {
      return [];
    }

    return parsedIds.filter(
      (id): id is string => typeof id === "string"
    );
  } catch (error) {
    console.error(
      "Unable to load scheduled notification IDs:",
      error
    );

    return [];
  }
}

async function saveScheduledNotificationIds(
  notificationIds: string[]
): Promise<void> {
  await AsyncStorage.setItem(
    SCHEDULED_NOTIFICATION_IDS_STORAGE_KEY,
    JSON.stringify(notificationIds)
  );
}

function getFirstNotificationDate(): Date {
  const now = new Date();
  const notificationDate = new Date();

  notificationDate.setHours(
    DAILY_NOTIFICATION_HOUR,
    DAILY_NOTIFICATION_MINUTE,
    0,
    0
  );

  // Begin tomorrow if today's 3:00 PM has already passed.
  if (notificationDate <= now) {
    notificationDate.setDate(
      notificationDate.getDate() + 1
    );
  }

  return notificationDate;
}

function createDateTrigger(
  date: Date
): Notifications.DateTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    ...(Platform.OS === "android"
      ? { channelId: NOTIFICATION_CHANNEL_ID }
      : {}),
  };
}

async function requestNotificationPermission(): Promise<boolean> {
  try {
    await prepareAndroidNotificationChannel();

    const currentPermissions =
      await Notifications.getPermissionsAsync();

    if (hasNotificationPermission(currentPermissions)) {
      return true;
    }

    // The user must use the phone's Settings when permission
    // has already been denied and cannot be requested again.
    if (!currentPermissions.canAskAgain) {
      return false;
    }

    const requestedPermissions =
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: true,
        },
      });

    return hasNotificationPermission(
      requestedPermissions
    );
  } catch (error) {
    console.error(
      "Unable to request notification permission:",
      error
    );

    return false;
  }
}

export async function cancelDailyCuteNotifications(): Promise<void> {
  try {
    const scheduledIds =
      await getScheduledNotificationIds();

    await Promise.all(
      scheduledIds.map(async (notificationId) => {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            notificationId
          );
        } catch (error) {
          console.warn(
            `Unable to cancel notification ${notificationId}:`,
            error
          );
        }
      })
    );

    await AsyncStorage.removeItem(
      SCHEDULED_NOTIFICATION_IDS_STORAGE_KEY
    );
  } catch (error) {
    console.error(
      "Unable to cancel daily notifications:",
      error
    );
  }
}

async function scheduleDailyCuteNotifications(): Promise<void> {
  // Replace the previous 30-day schedule with a fresh one.
  await cancelDailyCuteNotifications();

  const firstNotificationDate =
    getFirstNotificationDate();

  const scheduledIds: string[] = [];
  let previousMessage: string | undefined;

  try {
    for (
      let dayIndex = 0;
      dayIndex < NUMBER_OF_DAYS_TO_SCHEDULE;
      dayIndex += 1
    ) {
      const notificationDate = new Date(
        firstNotificationDate
      );

      notificationDate.setDate(
        firstNotificationDate.getDate() + dayIndex
      );

      const message =
        getRandomNotificationMessage(previousMessage);

      const notificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title: NOTIFICATION_TITLE,
            body: message,
            sound: "default",
            data: {
              source: "food-valley-daily-reminder",
            },
          },
          trigger: createDateTrigger(notificationDate),
        });

      scheduledIds.push(notificationId);
      previousMessage = message;
    }

    await saveScheduledNotificationIds(scheduledIds);
  } catch (error) {
    console.error(
      "Unable to schedule daily notifications:",
      error
    );

    await Promise.all(
      scheduledIds.map(async (notificationId) => {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            notificationId
          );
        } catch {
          // Ignore cleanup errors.
        }
      })
    );

    throw error;
  }
}

export async function initializeDailyCuteNotifications(): Promise<void> {
  try {
    const hasPermission =
      await requestNotificationPermission();

    if (!hasPermission) {
      await cancelDailyCuteNotifications();
      return;
    }

    await scheduleDailyCuteNotifications();
  } catch (error) {
    console.error(
      "Unable to initialize daily notifications:",
      error
    );
  }
}