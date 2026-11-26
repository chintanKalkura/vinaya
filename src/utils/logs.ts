import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';

interface Logged {
  recentLog: LogEntry[];
  history: LogEntry[];
}

// Sets (or, with no entry, clears) one day of a habit's or group's log.
// History stays oldest first, and recentLog is rebuilt as its newest entries,
// so a past day lands in the right place.
export function withLogEntry<T extends Logged>(
  item: T,
  dateKey: string,
  entry: LogEntry | undefined,
): T {
  const history = item.history.filter(e => e.date !== dateKey);
  if (entry) history.push(entry);
  history.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return {
    ...item,
    history,
    recentLog: [...history]
      .reverse()
      .slice(0, DEFAULT_HABIT_LIMITS.recentLogSize),
  };
}
