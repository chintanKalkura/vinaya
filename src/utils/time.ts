import {toDateKey} from './dates';

/**
 * Formats an alarm timestamp (ms) as a contextual string, e.g. "Today at 8:00 AM".
 * Returns 'No Bells Scheduled' when ms is 0 or falsy.
 */
export function formatAlarmTime(ms: number): string {
  if (!ms) return 'No Bells Scheduled';
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  const todayKey = toDateKey(new Date());
  const tomorrowKey = toDateKey(new Date(Date.now() + 86_400_000));
  const alarmKey = toDateKey(d);
  const day =
    alarmKey === todayKey ? 'Today' : alarmKey === tomorrowKey ? 'Tomorrow' : 'Start Day';
  return `${day} at ${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
