import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { Tombstone } from '../types/backup';
import { withTombstone } from '../utils/tombstones';

const HABITS_KEY = 'habits_v2';
const HABIT_GROUPS_KEY = 'habit_groups_v2';
const TOMBSTONES_KEY = 'tombstones_v2';

export class StorageReadError extends Error {}
export class StorageWriteError extends Error {}

let queue: Promise<unknown> = Promise.resolve();

// Runs storage operations one at a time so read-modify-writes can't overlap.
// Not re-entrant: an op that enqueues another op waits on itself forever, so
// only public service entry points enqueue and their internals call unqueued
// helpers. A failed op doesn't block the ones after it.
export function withStorageQueue<T>(op: () => Promise<T>): Promise<T> {
  const run = queue.then(op);
  queue = run.catch(() => {});
  return run;
}

// A missing key is an empty store. A read that throws or doesn't parse is an
// error, so nothing gets saved over data that couldn't be read. Unparseable
// data is copied to a backup key first so it can be recovered.
async function readCollection<T>(key: string): Promise<Record<string, T>> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(key);
  } catch (e) {
    throw new StorageReadError(`Couldn't read ${key}: ${String(e)}`);
  }
  if (raw === null) return {};
  try {
    return JSON.parse(raw) as Record<string, T>;
  } catch (e) {
    try {
      await AsyncStorage.setItem(`${key}_corrupt_${Date.now()}`, raw);
    } catch {}
    throw new StorageReadError(`Couldn't parse ${key}: ${String(e)}`);
  }
}

async function writeCollection<T>(
  key: string,
  collection: Record<string, T>,
): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(collection));
  } catch (e) {
    throw new StorageWriteError(`Couldn't save ${key}: ${String(e)}`);
  }
}

export function loadHabits(): Promise<Record<string, Habit>> {
  return readCollection<Habit>(HABITS_KEY);
}

export function saveHabits(habits: Record<string, Habit>): Promise<void> {
  return writeCollection(HABITS_KEY, habits);
}

export function loadHabitGroups(): Promise<Record<string, HabitGroup>> {
  return readCollection<HabitGroup>(HABIT_GROUPS_KEY);
}

export function saveHabitGroups(
  groups: Record<string, HabitGroup>,
): Promise<void> {
  return writeCollection(HABIT_GROUPS_KEY, groups);
}

export function loadTombstones(): Promise<Record<string, Tombstone>> {
  return readCollection<Tombstone>(TOMBSTONES_KEY);
}

export function saveTombstones(
  tombstones: Record<string, Tombstone>,
): Promise<void> {
  return writeCollection(TOMBSTONES_KEY, tombstones);
}

// Queued read for the screen, so a reload never sees a half-finished save
export function loadHabitsAndGroups(): Promise<
  [Record<string, Habit>, Record<string, HabitGroup>]
> {
  return withStorageQueue(() => Promise.all([loadHabits(), loadHabitGroups()]));
}

export async function saveHabit(habit: Habit): Promise<void> {
  const habits = await loadHabits();
  habits[habit.id] = habit;
  await saveHabits(habits);
}

// Unqueued; called inside a queued delete
export async function recordTombstone(
  id: string,
  kind: Tombstone['kind'],
): Promise<void> {
  const tombstones = await loadTombstones();
  await saveTombstones(
    withTombstone(tombstones, { id, kind, deletedAt: Date.now() }),
  );
}

export async function saveHabitGroup(group: HabitGroup): Promise<void> {
  const groups = await loadHabitGroups();
  groups[group.id] = group;
  await saveHabitGroups(groups);
}
