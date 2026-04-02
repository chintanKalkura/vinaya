import {ChallengeConfig, HabitDefinition, MoodGroup} from '../types';

// Change startDate to your actual Day 1.
// The eve page (Day 0) is derived as startDate - 1 day.
export const CHALLENGE_CONFIG: ChallengeConfig = {
  title: 'The Grind',
  startDate: '2026-04-03',
  totalDays: 21,
};

export const FREEZE_UNLOCK_DAY = 15;

export const HABIT_LIST: HabitDefinition[] = [
  {id: 'celibacy', name: 'Celibacy', isKeystone: true},
  {id: 'meditation_eve', name: 'Evening Meditation \u00b7 1 hr min \u00b7 daily'},
  {id: 'meditation_morn', name: 'Morning Meditation \u00b7 1 hr min \u00b7 3\u00d7/wk'},
  {id: 'yoga', name: 'Yoga \u00b7 10 min min \u00b7 4\u00d7/wk'},
  {id: 'cooking', name: 'Cook or order healthy'},
  {id: 'nojunk', name: 'No junk food'},
  {id: 'dhamma', name: 'Dhamma study'},
  {id: 'reading', name: 'Read \u00b7 1 page min'},
  {id: 'speech', name: 'Right speech'},
  {id: 'job', name: 'Job change action'},
  {id: 'nomobile', name: 'No mobile on bed'},
  {id: 'entertainment', name: 'Entertainment \u2264 1 hr'},
  {id: 'nosmoking', name: 'No smoking'},
  {id: 'wakeup', name: 'Wake before 7am'},
  {id: 'run', name: 'Run \u00b7 1 km min \u00b7 4\u00d7/wk'},
  {id: 'writing', name: 'Write \u00b7 1 para min \u00b7 3\u00d7/wk'},
];

export const MOOD_OPTIONS: Record<MoodGroup, string[]> = {
  viriya: ['Charged', 'Steady', 'Low', 'Drained'],
  samadhi: ['Laser', 'Clear', 'Wandering', 'Scattered'],
  vedana: ['Equanimous', 'Content', 'Restless', 'Irritable'],
  sampajanna: ['Unbroken', 'Sustained', 'Sporadic', 'Lost'],
};

export const MOOD_LABELS: Record<MoodGroup, string> = {
  viriya: 'Viriya',
  samadhi: 'Sam\u0101dhi',
  vedana: 'Vedan\u0101',
  sampajanna: 'Sampaja\u00f1\u00f1a',
};
