import {ChallengeDefinition, MoodGroup} from '../types';

const CHALLENGE_1: ChallengeDefinition = {
  config: {
    title: 'Vinaya goals for 21 days',
    startDate: '2026-04-04',
    totalDays: 21,
  },
  habits: [
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
    {id: 'entertainment',  name: 'Entertainment ≤ 1 hr',              maxCount: 21},
    {id: 'write',          name: 'Write',                                  maxCount: 10},
    {id: 'wakeup',         name: 'Wake before 8',                          maxCount: 21},
    {id: 'no_mobile',      name: 'No mobile on bed',                       maxCount: 21},
    {id: 'run',            name: 'Run',                                    maxCount:  6},
  ],
};

const C2_DAYS = 31;

const CHALLENGE_2: ChallengeDefinition = {
  config: {
    title: 'Observe Noble Eightfold Path - May Buddha Purnima Challenge',
    startDate: '2026-05-01',
    totalDays: C2_DAYS,
  },
  habits: [
    {
      id: 'eight_precepts',
      name: '8 Precepts',
      maxCount: C2_DAYS,
      isKeystone: true,
      subHabits: [
        {id: 'eight_precepts.nk', name: 'No Killing'},
        {id: 'eight_precepts.ns', name: 'No Stealing'},
        {id: 'eight_precepts.c',  name: 'Celibacy'},
        {id: 'eight_precepts.nl', name: 'Right Speech'},
        {id: 'eight_precepts.ni', name: 'No Intoxication'},
        {id: 'eight_precepts.nd', name: 'No Dinner'},
        {id: 'eight_precepts.ne', name: 'No Entertainment'},
        {id: 'eight_precepts.sf', name: 'Sleep On Floor'},
      ],
      compositeRule: {
        type: 'required',
        ids: [
          'eight_precepts.nk',
          'eight_precepts.ns',
          'eight_precepts.c',
          'eight_precepts.ni',
          'eight_precepts.nd',
          'eight_precepts.sf',
        ],
      },
    },
    {
      id: 'eat_healthy',
      name: 'Eat Healthy',
      maxCount: C2_DAYS,
      subHabits: [
        {id: 'eat_healthy.cook',       name: 'Cook'},
        {id: 'eat_healthy.restaurant', name: 'Eat healthy at restaurant'},
      ],
      compositeRule: {type: 'any'},
    },
    {
      id: 'stay_productive',
      name: 'Stay Productive for at least 8 hrs',
      maxCount: C2_DAYS,
      subHabits: [
        {id: 'stay_productive.job_hunt', name: 'Job Hunt'},
        {id: 'stay_productive.study',    name: 'Study'},
        {id: 'stay_productive.build',    name: 'Build'},
        {id: 'stay_productive.write',    name: 'Write'},
        {id: 'stay_productive.sit',      name: 'Sit'},
        {id: 'stay_productive.errands',  name: 'Errands'},
        {id: 'stay_productive.read',     name: 'Read'},
        {id: 'stay_productive.get_creative',     name: 'Get Creative'},
      ],
      compositeRule: {type: 'any'},
    },
    {
      id: 'meditate_twice',
      name: 'Meditate twice for 1 hr',
      maxCount: C2_DAYS,
      subHabits: [
        {id: 'meditate_twice.morning', name: 'Morning Sitting'},
        {id: 'meditate_twice.evening', name: 'Evening Sitting'},
      ],
      compositeRule: {type: 'all'},
    },
    {
      id: 'yoga',
      name: 'Yoga',
      maxCount: C2_DAYS,
      subHabits: [
        {id: 'yoga.51_suryanamaskaras', name: '51 Suryanamaskaras'},
        {id: 'yoga.21_suryanamaskaras', name: '21 Suryanamaskaras'},
        {id: 'yoga.11_suryanamaskaras', name: '11 Suryanamaskaras'},
      ],
      compositeRule: {type: 'any'},
    },
    {
      id: 'sleep_discipline',
      name: 'Sleep Discipline',
      maxCount: C2_DAYS,
      subHabits: [
        {id: 'sleep_discipline.wakeup_early', name: 'Up Before 7'},
        {id: 'sleep_discipline.sleep_on_tim', name: 'Lights Out By 11'},
      ],
      compositeRule: {type: 'any'},
    }
  ],
};

export const CHALLENGES: ChallengeDefinition[] = [CHALLENGE_1, CHALLENGE_2];

// Backward-compat exports used by existing code before full migration
export const CHALLENGE_CONFIG = CHALLENGE_1.config;
export const HABIT_LIST = CHALLENGE_1.habits;

export const MOOD_OPTIONS: Record<MoodGroup, string[]> = {
  viriya:     ['Charged', 'Steady', 'Low', 'Drained'],
  samadhi:    ['Laser', 'Clear', 'Wandering', 'Scattered'],
  vedana:     ['Equanimous', 'Content', 'Restless', 'Irritable'],
  sampajanna: ['Unbroken', 'Sustained', 'Sporadic', 'Lost'],
};

export const MOOD_LABELS: Record<MoodGroup, string> = {
  viriya:     'Viriya',
  samadhi:    'Samādhi',
  vedana:     'Vedanā',
  sampajanna: 'Sampajañña',
};
