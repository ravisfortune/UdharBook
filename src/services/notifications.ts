/**
 * Notifications Service
 *
 * Local notifications only — no server needed.
 * Use cases:
 *  - Daily morning reminder if outstanding balance exists
 *  - EMI due date reminders (auto-scheduled on loan creation)
 *  - Manual "remind me" for a specific contact
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { formatCurrency } from '@utils/currency';

// Show notification even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Permission ──────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Android channel setup ────────────────────────────────────

export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('udharbook-reminders', {
    name: 'UdharBook Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

// ─── Daily reminder ───────────────────────────────────────────

/**
 * Schedule a daily morning reminder at 10 AM.
 * Shows total outstanding amount.
 * Cancels any previous daily reminder before scheduling new one.
 */
export async function scheduleDailyReminder(totalDue: number) {
  // Cancel existing daily reminder
  await cancelNotificationsByTag('daily-reminder');

  if (totalDue <= 0) return;

  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-reminder',
    content: {
      title: '💰 UdharBook Reminder',
      body: `${formatCurrency(totalDue)} milna baaki hai aaj. Remind kar do!`,
      data: { tag: 'daily-reminder', screen: 'Home' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 10,
      minute: 0,
    },
  });
}

export async function cancelDailyReminder() {
  await cancelNotificationsByTag('daily-reminder');
}

// ─── Contact reminder ─────────────────────────────────────────

/**
 * Schedule a one-time reminder for a specific contact.
 * e.g. "Rahul se ₹5,000 lena hai" at chosen time.
 */
export async function scheduleContactReminder(
  contactId: string,
  contactName: string,
  amount: number,
  date: Date
) {
  const id = `contact-${contactId}`;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: `⏰ ${contactName} — Reminder`,
      body: `${contactName} se ${formatCurrency(amount)} lena baaki hai.`,
      data: { tag: 'contact-reminder', contactId, screen: 'ContactDetail' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

export async function cancelContactReminder(contactId: string) {
  await Notifications.cancelScheduledNotificationAsync(`contact-${contactId}`).catch(() => {});
}

// ─── EMI reminders ────────────────────────────────────────────

/**
 * Schedule notifications for each EMI due date.
 * Called after loan split is saved.
 */
export async function scheduleEmiReminders(
  splitId: string,
  contactName: string,
  emiAmount: number,
  dueDates: Date[]
) {
  for (let i = 0; i < dueDates.length; i++) {
    const date = dueDates[i];
    // Skip past dates
    if (date.getTime() <= Date.now()) continue;

    // Remind 1 day before
    const reminderDate = new Date(date);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(10, 0, 0, 0);
    if (reminderDate.getTime() <= Date.now()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `emi-${splitId}-${i}`,
      content: {
        title: '📅 EMI Due Tomorrow',
        body: `${contactName} ki EMI ${formatCurrency(emiAmount)} kal due hai.`,
        data: { tag: 'emi-reminder', splitId, screen: 'Split' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });
  }
}

export async function cancelEmiReminders(splitId: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const emiIds = scheduled
    .filter(n => n.identifier.startsWith(`emi-${splitId}-`))
    .map(n => n.identifier);
  await Promise.all(emiIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
}

// ─── Helper ───────────────────────────────────────────────────

async function cancelNotificationsByTag(tag: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(n => n.content.data?.tag === tag);
  await Promise.all(toCancel.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}
