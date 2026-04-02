import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChallengeConfig, DayLog, IntentionResult, WinState} from '../types';
import {CHALLENGE_CONFIG} from '../config/challenge';

const LOGS_KEY = 'vinaya_logs';
const CONFIG_KEY = 'vinaya_challenge_config';

function emptyLog(): DayLog {
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

export function makeEmptyLog(): DayLog {
  return emptyLog();
}

export async function loadConfig(): Promise<ChallengeConfig> {
  try {
    const raw = await AsyncStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw) as ChallengeConfig;
  } catch {}
  return {...CHALLENGE_CONFIG};
}

export async function saveConfig(config: ChallengeConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {}
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
