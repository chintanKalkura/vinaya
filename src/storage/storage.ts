import AsyncStorage from '@react-native-async-storage/async-storage';
import {DayLog, IntentionResult, WinState} from '../types';

const LOGS_KEY = 'vinaya_logs';

export function makeEmptyLog(): DayLog {
  return {
    habits: {},
    moods: {},
    journal: '',
    win: null as WinState,
    intentions: ['', '', ''],
    intentionResults: ['no', 'no', 'no'] as [
      IntentionResult,
      IntentionResult,
      IntentionResult,
    ],
  };
}

export async function loadAllLogs(): Promise<Record<string, DayLog>> {
  try {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, DayLog>;
  } catch {}
  return {};
}

export async function saveLog(
  dateKey: string,
  log: DayLog,
  allLogs: Record<string, DayLog>,
): Promise<void> {
  try {
    const updated = {...allLogs, [dateKey]: log};
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  } catch {}
}
