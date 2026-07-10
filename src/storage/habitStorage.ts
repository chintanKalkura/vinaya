import AsyncStorage from '@react-native-async-storage/async-storage';
import {Habit} from '../types/habit';
import {HabitGroup} from '../types/habitGroup';

const HABITS_KEY = 'habits_v2';
const HABIT_GROUPS_KEY = 'habit_groups_v2';

export async function loadHabits(): Promise<Record<string, Habit>> {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, Habit>;
  } catch {}
  return {};
}

export async function saveHabits(
  habits: Record<string, Habit>,
): Promise<void> {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch {}
}

export async function loadHabitGroups(): Promise<Record<string, HabitGroup>> {
  try {
    const raw = await AsyncStorage.getItem(HABIT_GROUPS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, HabitGroup>;
  } catch {}
  return {};
}

export async function saveHabitGroups(
  groups: Record<string, HabitGroup>,
): Promise<void> {
  try {
    await AsyncStorage.setItem(HABIT_GROUPS_KEY, JSON.stringify(groups));
  } catch {}
}

export async function saveHabit(habit: Habit): Promise<void> {
  const habits = await loadHabits();
  habits[habit.id] = habit;
  await saveHabits(habits);
}

export async function saveHabitGroup(group: HabitGroup): Promise<void> {
  const groups = await loadHabitGroups();
  groups[group.id] = group;
  await saveHabitGroups(groups);
}
