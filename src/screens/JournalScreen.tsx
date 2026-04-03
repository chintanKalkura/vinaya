import React, {useEffect, useRef, useState} from 'react';
import {
  NativeModules,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChallengeConfig, DayLog, HabitState, IntentionResult, MoodGroup, WinState} from '../types';
import {CHALLENGE_CONFIG, HABIT_LIST} from '../config/challenge';
import {
  addDays,
  clampDateKey,
  formatDate,
  getDayNumber,
  getDaysLeft,
  getEndDate,
  getEveDate,
  isEveDay,
  toDateKey,
} from '../utils/dates';
import {loadAllLogs, loadConfig, makeEmptyLog, saveLog} from '../storage/storage';
import {
  cancelDayReminder,
  requestPermission,
  scheduleAllReminders,
} from '../notifications/reminders';
import ChallengeHeader from '../components/ChallengeHeader';
import DateNav from '../components/DateNav';
import StatsBar from '../components/StatsBar';
import EvePage from '../components/EvePage';
import YesterdayIntentions from '../components/YesterdayIntentions';
import HabitsSection from '../components/HabitsSection';
import MoodSection from '../components/MoodSection';
import JournalSection from '../components/JournalSection';
import WinSection from '../components/WinSection';
import IntentionsSection from '../components/IntentionsSection';
import {colors} from '../theme';
import {saveStyles} from '../styles/shared';

const {SharedPrefs} = NativeModules;

export default function JournalScreen() {
  const [config, setConfig] = useState<ChallengeConfig>(CHALLENGE_CONFIG);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [currentDateKey, setCurrentDateKey] = useState<string>(() => {
    const today = toDateKey(new Date());
    const eve = getEveDate(CHALLENGE_CONFIG.startDate);
    const end = getEndDate(CHALLENGE_CONFIG.startDate, CHALLENGE_CONFIG.totalDays);
    return clampDateKey(today, eve, end);
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([loadConfig(), loadAllLogs()]).then(([cfg, allLogs]) => {
      setConfig(cfg);
      setLogs(allLogs);

      const eve = getEveDate(cfg.startDate);
      const end = getEndDate(cfg.startDate, cfg.totalDays);
      setCurrentDateKey(prev => clampDateKey(prev, eve, end));

      // Push challenge dates to widget SharedPreferences
      SharedPrefs?.setString('start_date', cfg.startDate);
      SharedPrefs?.setInt('total_days', cfg.totalDays);

      // Schedule daily 10PM reminders for the full challenge
      requestPermission().then(() => scheduleAllReminders(eve, end));
    });
  }, []);

  const eveKey = getEveDate(config.startDate);
  const endKey = getEndDate(config.startDate, config.totalDays);
  const isEve = isEveDay(currentDateKey, config.startDate);
  const dayNum = getDayNumber(currentDateKey, config.startDate);
  const daysLeft = getDaysLeft(currentDateKey, config.startDate, config.totalDays);
  const todayKey = toDateKey(new Date());
  const isToday = currentDateKey === todayKey;

  const progress = isEve
    ? 0
    : Math.min(1, (dayNum - 1) / (config.totalDays - 1));

  const metaText = isEve
    ? 'The challenge begins tomorrow. Set your intentions.'
    : daysLeft === 0
    ? '🔥 Final day. Give everything.'
    : daysLeft === 1
    ? '1 day remaining.'
    : `${daysLeft} days remaining.`;

  const currentLog: DayLog = logs[currentDateKey] ?? makeEmptyLog();
  const yesterdayKey = addDays(currentDateKey, -1);
  const yesterdayLog: DayLog = logs[yesterdayKey] ?? makeEmptyLog();

  const habitsDoneCount = HABIT_LIST.filter(
    h => currentLog.habits[h.id] === 'done',
  ).length;

  const allHabitLogs: Record<string, Record<string, HabitState>> = {};
  Object.entries(logs).forEach(([date, log]) => {
    allHabitLogs[date] = log.habits;
  });

  function persistLog(dateKey: string, log: DayLog, updatedLogs: Record<string, DayLog>) {
    setLogs(updatedLogs);
    saveLog(dateKey, log, updatedLogs);
  }

  function updateCurrentLog(updater: (prev: DayLog) => DayLog) {
    const prev = logs[currentDateKey] ?? makeEmptyLog();
    const next = updater(prev);
    const updatedLogs = {...logs, [currentDateKey]: next};
    persistLog(currentDateKey, next, updatedLogs);
  }

  function handleDateChange(dir: -1 | 1) {
    const next = addDays(currentDateKey, dir);
    const clamped = clampDateKey(next, eveKey, endKey);
    setCurrentDateKey(clamped);
  }

  function handleHabitToggle(habitId: string) {
    updateCurrentLog(prev => {
      const current = prev.habits[habitId] ?? 'none';
      const next: HabitState = current === 'done' ? 'none' : 'done';
      return {...prev, habits: {...prev.habits, [habitId]: next}};
    });
  }

  function handleMoodChange(group: MoodGroup, value: string) {
    updateCurrentLog(prev => ({
      ...prev,
      moods: {...prev.moods, [group]: value},
    }));
  }

  function handleWinSelect(value: WinState) {
    updateCurrentLog(prev => ({...prev, win: value}));
  }

  function handleJournalChange(text: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateCurrentLog(prev => ({...prev, journal: text}));
    }, 500);
  }

  function handleIntentionChange(index: number, text: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateCurrentLog(prev => {
        const next: [string, string, string] = [...prev.intentions] as [string, string, string];
        next[index] = text;
        return {...prev, intentions: next};
      });
    }, 500);
  }

  function handleIntentionResultChange(index: number, result: IntentionResult) {
    updateCurrentLog(prev => {
      const next: [IntentionResult, IntentionResult, IntentionResult] = [
        ...prev.intentionResults,
      ] as [IntentionResult, IntentionResult, IntentionResult];
      next[index] = result;
      return {...prev, intentionResults: next};
    });
  }

  function handleSave() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }

  function handleLogged() {
    updateCurrentLog(prev => ({...prev, logged: true}));
    cancelDayReminder(currentDateKey);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ChallengeHeader
          title={config.title}
          metaText={metaText}
          progress={progress}
        />
        <DateNav
          dateLabel={formatDate(currentDateKey)}
          dayLabel={isEve ? 'Eve of Day 1' : `Day ${dayNum} of ${config.totalDays}`}
          onPrev={() => handleDateChange(-1)}
          onNext={() => handleDateChange(1)}
          canGoPrev={currentDateKey > eveKey}
          canGoNext={currentDateKey < endKey}
        />

        {isEve ? (
          <EvePage
            intentions={currentLog.intentions}
            onIntentionChange={handleIntentionChange}
            onSave={handleSave}
            onLogged={handleLogged}
            isToday={isToday}
            isLogged={!!currentLog.logged}
          />
        ) : (
          <>
            <StatsBar
              done={habitsDoneCount}
              total={HABIT_LIST.length}
              dayNum={dayNum}
            />
            <YesterdayIntentions
              intentions={yesterdayLog.intentions}
              results={currentLog.intentionResults}
              onResultChange={handleIntentionResultChange}
            />
            <HabitsSection
              habits={HABIT_LIST}
              habitStates={currentLog.habits}
              allLogs={allHabitLogs}
              onToggle={handleHabitToggle}
            />
            <MoodSection
              moods={currentLog.moods}
              onMoodChange={handleMoodChange}
            />
            <JournalSection
              value={currentLog.journal}
              onChange={handleJournalChange}
            />
            <WinSection win={currentLog.win} onSelect={handleWinSelect} />
            <IntentionsSection
              intentions={currentLog.intentions}
              onChange={handleIntentionChange}
            />
            <View style={styles.saveRow}>
              <Pressable style={saveStyles.saveBtn} onPress={handleSave}>
                <Text style={saveStyles.saveBtnText}>Save entry</Text>
              </Pressable>
              {isToday && (
                <Pressable
                  style={
                    currentLog.logged
                      ? saveStyles.saveBtnLogged
                      : saveStyles.saveBtn
                  }
                  onPress={handleLogged}>
                  <Text style={saveStyles.saveBtnText}>Logged</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.paper},
  scroll: {flex: 1},
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 80,
  },
  saveRow: {
    ...saveStyles.saveRow,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
