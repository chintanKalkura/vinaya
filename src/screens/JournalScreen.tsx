import React, {useEffect, useRef, useState} from 'react';
import {
  AppState,
  Keyboard,
  Modal,
  NativeModules,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DayLog, HabitState, IntentionResult, MoodGroup, WinState} from '../types';
import {CHALLENGES} from '../config/challenge';
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
import {getHabitsDoneCount} from '../utils/habits';
import {loadAllLogs, makeEmptyLog, saveLog} from '../storage/storage';
import {
  cancelDayReminder,
  requestPermission,
  scheduleAllReminders,
} from '../notifications/reminders';
import {
  BellState,
  BELL_STATE_LABELS,
  getBellState,
  getNextAlarmMs,
  initMindfulnessBell,
  setBellState,
} from '../notifications/mindfulnessBell';
import ChallengeHeader from '../components/ChallengeHeader';
import ChallengeNav from '../components/ChallengeNav';
import DateNav from '../components/DateNav';
import StatsBar from '../components/StatsBar';
import EvePage from '../components/EvePage';
import YesterdayIntentions from '../components/YesterdayIntentions';
import HabitsSection from '../components/HabitsSection';
import MoodSection from '../components/MoodSection';
import JournalSection from '../components/JournalSection';
import WinSection from '../components/WinSection';
import IntentionsSection from '../components/IntentionsSection';
import {colors, fonts} from '../theme';
import {remindersStyles} from '../styles/shared';
import {formatAlarmTime} from '../utils/time';

const {SharedPrefs} = NativeModules;

function getInitialChallengeIdx(): number {
  const today = toDateKey(new Date());
  const idx = CHALLENGES.findIndex(ch => {
    const eve = getEveDate(ch.config.startDate);
    const end = getEndDate(ch.config.startDate, ch.config.totalDays);
    return today >= eve && today <= end;
  });
  return idx >= 0 ? idx : CHALLENGES.length - 1;
}

export default function JournalScreen() {
  const [challengeIdx, setChallengeIdx] = useState(getInitialChallengeIdx);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [bellState, setBellStateLocal] = useState<BellState>('active');
  const [nextAlarmMs, setNextAlarmMs] = useState(0);
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);

  const challenge = CHALLENGES[challengeIdx];
  const config = challenge.config;
  const habitList = challenge.habits;

  const eveKey = getEveDate(config.startDate);
  const endKey = getEndDate(config.startDate, config.totalDays);

  const [currentDateKey, setCurrentDateKey] = useState<string>(() =>
    clampDateKey(toDateKey(new Date()), eveKey, endKey),
  );

  const scrollRef = useRef<ScrollView>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionFocused = useRef(false);
  const journalFocused = useRef(false);
  const journalY = useRef(0);
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      const kbHeight = e.endCoordinates.height;
      setKeyboardPadding(kbHeight);
      requestAnimationFrame(() => {
        if (intentionFocused.current) {
          scrollRef.current?.scrollToEnd({animated: true});
        } else if (journalFocused.current) {
          scrollRef.current?.scrollTo({y: journalY.current, animated: true});
        }
      });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardPadding(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function handleIntentionFocus() {
    intentionFocused.current = true;
  }

  function handleJournalFocus() {
    journalFocused.current = true;
  }

  useEffect(() => {
    loadAllLogs().then(allLogs => {
      setLogs(allLogs);
    });
  }, []);

  // Clamp date to the selected challenge's range when challenge changes
  useEffect(() => {
    setCurrentDateKey(prev => clampDateKey(prev, eveKey, endKey));
  }, [challengeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Widget and reminders always use the active (non-past) challenge
  useEffect(() => {
    const today = toDateKey(new Date());
    const active = CHALLENGES.find(ch => {
      const eve = getEveDate(ch.config.startDate);
      const end = getEndDate(ch.config.startDate, ch.config.totalDays);
      return today >= eve && today <= end;
    }) ?? CHALLENGES[CHALLENGES.length - 1];

    SharedPrefs?.setString('start_date', active.config.startDate);
    SharedPrefs?.setInt('total_days', active.config.totalDays);

    const activeEve = getEveDate(active.config.startDate);
    const activeEnd = getEndDate(active.config.startDate, active.config.totalDays);
    if (today <= activeEnd) {
      requestPermission().then(() => scheduleAllReminders(activeEve, activeEnd));
      initMindfulnessBell(active.config.startDate, activeEnd);
    }
  }, []);

  function refreshBellStatus() {
    getBellState().then(setBellStateLocal);
    getNextAlarmMs().then(setNextAlarmMs);
  }

  useEffect(() => {
    refreshBellStatus();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refreshBellStatus();
    });
    return () => sub.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = toDateKey(new Date());
  const isReadOnly = today > endKey;
  const isEve = isEveDay(currentDateKey, config.startDate);
  const dayNum = getDayNumber(currentDateKey, config.startDate);
  const daysLeft = getDaysLeft(currentDateKey, config.startDate, config.totalDays);

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

  const habitsDoneCount = getHabitsDoneCount(habitList, currentLog.habits);

  const allHabitLogs: Record<string, Record<string, HabitState>> = {};
  Object.entries(logs).forEach(([date, log]) => {
    if (date >= eveKey && date <= endKey) {
      allHabitLogs[date] = log.habits;
    }
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

  function handleChallengeChange(dir: -1 | 1) {
    const next = challengeIdx + dir;
    if (next >= 0 && next < CHALLENGES.length) {
      setChallengeIdx(next);
    }
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
    }, 1500);
  }

  function handleIntentionChange(index: number, text: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateCurrentLog(prev => {
        const next: [string, string, string] = [...prev.intentions] as [string, string, string];
        next[index] = text;
        return {...prev, intentions: next};
      });
    }, 1500);
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

  function handleBellSelect(state: BellState) {
    setBellStateLocal(state);
    setBellState(state);
    setBellDropdownOpen(false);
    getNextAlarmMs().then(setNextAlarmMs);
  }

  function handleLogged() {
    updateCurrentLog(prev => ({...prev, logged: true}));
    cancelDayReminder(currentDateKey);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.content, {paddingBottom: 80 + keyboardPadding}]}
        keyboardShouldPersistTaps="handled">
        <ChallengeNav
          challenges={CHALLENGES}
          currentIndex={challengeIdx}
          onPrev={() => handleChallengeChange(-1)}
          onNext={() => handleChallengeChange(1)}
        />
        <ChallengeHeader
          title={config.title}
          metaText={isReadOnly ? 'Past challenge — read only' : metaText}
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
            onIntentionFocus={handleIntentionFocus}
            onLogged={handleLogged}
            isLogged={!!currentLog.logged}
            totalDays={config.totalDays}
          />
        ) : (
          <>
            <StatsBar
              done={habitsDoneCount}
              total={habitList.length}
              dayNum={dayNum}
            />
            <YesterdayIntentions
              intentions={yesterdayLog.intentions}
              results={currentLog.intentionResults}
              onResultChange={handleIntentionResultChange}
              readOnly={isReadOnly}
            />
            <HabitsSection
              habits={habitList}
              habitStates={currentLog.habits}
              allLogs={allHabitLogs}
              onToggle={handleHabitToggle}
              readOnly={isReadOnly}
            />
            <MoodSection
              moods={currentLog.moods}
              onMoodChange={handleMoodChange}
              readOnly={isReadOnly}
            />
            <View onLayout={e => { journalY.current = e.nativeEvent.layout.y; }}>
              <JournalSection
                value={currentLog.journal}
                onChange={handleJournalChange}
                onFocus={handleJournalFocus}
                readOnly={isReadOnly}
              />
            </View>
            <WinSection win={currentLog.win} onSelect={handleWinSelect} readOnly={isReadOnly} />
            <IntentionsSection
              intentions={currentLog.intentions}
              onChange={handleIntentionChange}
              onFocus={handleIntentionFocus}
              readOnly={isReadOnly}
            />
            {!isReadOnly && (
              <>
                <View style={styles.remindersRow}>
                  <Pressable
                    style={currentLog.logged ? remindersStyles.remindersBtnLogged : remindersStyles.remindersBtn}
                    onPress={handleLogged}>
                    <Text style={remindersStyles.remindersBtnText}>Logged</Text>
                  </Pressable>
                  <Pressable
                    style={remindersStyles.remindersBtn}
                    onPress={() => setBellDropdownOpen(true)}>
                    <Text style={remindersStyles.remindersBtnText}>Mindfulness Bell</Text>
                  </Pressable>
                </View>
                <Text style={styles.bellStatusText}>
                  {bellState === 'active'
                    ? 'Active'
                    : `Next bell at ${formatAlarmTime(nextAlarmMs)}`}
                </Text>
              </>
            )}

            <Modal
              visible={bellDropdownOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setBellDropdownOpen(false)}>
              <Pressable
                style={styles.dropdownOverlay}
                onPress={() => setBellDropdownOpen(false)}>
                <View style={styles.dropdownMenu}>
                  {(['active', 'snoozed_next', 'snoozed_day'] as BellState[]).map(state => (
                    <Pressable
                      key={state}
                      style={[
                        styles.dropdownItem,
                        bellState === state && styles.dropdownItemSelected,
                      ]}
                      onPress={() => handleBellSelect(state)}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          bellState === state && styles.dropdownItemTextSelected,
                        ]}>
                        {BELL_STATE_LABELS[state]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Modal>
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
  },
  remindersRow: {
    ...remindersStyles.remindersRow,
  },
  bellStatusText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'right',
    marginTop: 6,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  dropdownMenu: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemSelected: {
    backgroundColor: colors.ink,
  },
  dropdownItemText: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  dropdownItemTextSelected: {
    color: colors.paper,
  },
});
