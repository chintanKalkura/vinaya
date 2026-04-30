/**
 * Formats an alarm timestamp (ms) as a 12-hour clock string, e.g. "8:00 AM".
 * Returns '—' when ms is 0 or falsy (no alarm scheduled).
 */
export function formatAlarmTime(ms: number): string {
  if (!ms) return '—';
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}
