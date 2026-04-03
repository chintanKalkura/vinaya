import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import {addDays} from '../utils/dates';

const CHANNEL_ID = 'vinaya_reminders';
const TEST_MODE = false; // set true to schedule 2-min-from-now for testing

async function ensureChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Daily Reminders',
    importance: AndroidImportance.HIGH,
  });
}

export async function requestPermission() {
  await notifee.requestPermission();
}

export async function scheduleAllReminders(eveDate: string, endDate: string) {
  await ensureChannel();

  const existing = new Set(await notifee.getTriggerNotificationIds());

  let dateKey = eveDate;
  while (dateKey <= endDate) {
    const id = `reminder_${dateKey}`;
    if (!existing.has(id)) {
      const fireAt = TEST_MODE
        ? new Date(Date.now() + 2 * 60 * 1000)
        : (() => {
            const [year, month, day] = dateKey.split('-').map(Number);
            return new Date(year, month - 1, day, 22, 0, 0, 0);
          })();

      // Skip dates whose scheduled time has already passed
      if (fireAt.getTime() > Date.now()) {
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: fireAt.getTime(),
        };
        await notifee.createTriggerNotification(
          {
            id,
            title: 'Log the day',
            body: 'Take a moment to record today.',
            android: {channelId: CHANNEL_ID},
          },
          trigger,
        );
      }
    }
    dateKey = addDays(dateKey, 1);
  }
}

export async function cancelDayReminder(dateKey: string) {
  await notifee.cancelTriggerNotification(`reminder_${dateKey}`);
}
