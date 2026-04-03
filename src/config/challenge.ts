import {ChallengeConfig, HabitDefinition, MoodGroup} from '../types';

export const CHALLENGE_CONFIG: ChallengeConfig = {
  title: 'Vinaya goals for 21 days',
  startDate: '2026-04-04',
  totalDays: 21,
};

export const HABIT_LIST: HabitDefinition[] = [
  {id: 'celibacy',       name: 'Celibacy',             isKeystone: true, maxCount: 21},
  {id: 'meditation',     name: '1 hr Meditation',                        maxCount: 15},
  {id: 'sutta',          name: 'Sutta a day',                            maxCount: 21},
  {id: 'right_speech',   name: 'Right Speech',                           maxCount: 21},
  {id: 'no_smoking',     name: 'No smoking',                             maxCount: 21},
  {id: 'no_junk',        name: 'No junk food',                           maxCount: 21},
  {id: 'suryanamaskara', name: '21 Suryanamaskara',                      maxCount: 10},
  {id: 'cook_chores',    name: 'Cook or Chores',                         maxCount: 21},
  {id: 'read',           name: 'Read',                                   maxCount: 15},
  {id: 'job_hunt',       name: 'Job hunt',                               maxCount: 15},
  {id: 'entertainment',  name: 'Entertainment \u2264 1 hr',              maxCount: 21},
  {id: 'write',          name: 'Write',                                  maxCount: 10},
  {id: 'wakeup',         name: 'Wake before 8',                          maxCount: 21},
  {id: 'no_mobile',      name: 'No mobile on bed',                       maxCount: 21},
  {id: 'run',            name: 'Run',                                    maxCount:  6},
];

export const MOOD_OPTIONS: Record<MoodGroup, string[]> = {
  viriya:     ['Charged', 'Steady', 'Low', 'Drained'],
  samadhi:    ['Laser', 'Clear', 'Wandering', 'Scattered'],
  vedana:     ['Equanimous', 'Content', 'Restless', 'Irritable'],
  sampajanna: ['Unbroken', 'Sustained', 'Sporadic', 'Lost'],
};

export const MOOD_LABELS: Record<MoodGroup, string> = {
  viriya:     'Viriya',
  samadhi:    'Sam\u0101dhi',
  vedana:     'Vedan\u0101',
  sampajanna: 'Sampaja\u00f1\u00f1a',
};
