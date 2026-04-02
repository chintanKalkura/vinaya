export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const date = parseDate(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function getEveDate(startDate: string): string {
  return addDays(startDate, -1);
}

export function getEndDate(startDate: string, totalDays: number): string {
  return addDays(startDate, totalDays - 1);
}

/**
 * Returns 0 for eve, 1–totalDays for challenge days.
 * Returns -1 if date is before eve.
 */
export function getDayNumber(dateKey: string, startDate: string): number {
  const eveDate = getEveDate(startDate);
  if (dateKey === eveDate) return 0;
  const start = parseDate(startDate);
  const current = parseDate(dateKey);
  return Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
}

export function isEveDay(dateKey: string, startDate: string): boolean {
  return dateKey === getEveDate(startDate);
}

export function getDaysLeft(
  dateKey: string,
  startDate: string,
  totalDays: number,
): number {
  const endDate = getEndDate(startDate, totalDays);
  const end = parseDate(endDate);
  const current = parseDate(dateKey);
  return Math.max(0, Math.floor((end.getTime() - current.getTime()) / 86400000));
}

export function clampDateKey(
  dateKey: string,
  minKey: string,
  maxKey: string,
): string {
  if (dateKey < minKey) return minKey;
  if (dateKey > maxKey) return maxKey;
  return dateKey;
}

export function formatDate(dateKey: string): string {
  const date = parseDate(dateKey);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
