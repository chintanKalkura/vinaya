import { HabitStatus } from '../types/habit';
import { CadenceStatus } from './cadence';

// Sort & Filter rules: docs/feature-development/sort-filter-delete-habit.md
export type SortKey = 'Streak' | 'A–Z' | 'Recent';

export const SORT_KEYS: readonly SortKey[] = ['Streak', 'A–Z', 'Recent'];

export interface SortFilterState {
  sort?: SortKey; // none: oldest first
  completedOnly: boolean;
}

export const DEFAULT_SORT_FILTER: SortFilterState = { completedOnly: false };

interface Sortable {
  name: string;
  status: HabitStatus;
  createdAt: number;
  sortOrder: number;
}

type StatusOf<T> = (item: T) => CadenceStatus;

// Oldest first; sortOrder breaks ties between items made at the same time
function byAge<T extends Sortable>(a: T, b: T): number {
  return a.createdAt - b.createdAt || a.sortOrder - b.sortOrder;
}

export function sortItems<T extends Sortable>(
  items: T[],
  sort: SortKey | undefined,
  statusOf: StatusOf<T>,
): T[] {
  const sorted = [...items];
  switch (sort) {
    case 'Streak':
      return sorted.sort(
        (a, b) => statusOf(b).streak - statusOf(a).streak || byAge(a, b),
      );
    case 'A–Z':
      return sorted.sort(
        (a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) ||
          byAge(a, b),
      );
    case 'Recent':
      return sorted.sort((a, b) => byAge(b, a));
    default:
      return sorted.sort(byAge);
  }
}

// Only active items for now; Completed keeps those complete today
export function filterItems<T extends Sortable>(
  items: T[],
  completedOnly: boolean,
  statusOf: StatusOf<T>,
): T[] {
  return items.filter(
    item =>
      item.status === 'active' && (!completedOnly || statusOf(item).complete),
  );
}
