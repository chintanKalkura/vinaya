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

const CHALLENGE_2: ChallengeDefinition = {
  config: {
    title: 'Buddha Purnima Challenge - 10 Days',
    startDate: '2026-04-27',
    totalDays: 10,
  },
  habits: [
    {
      id: 'eight_precepts',
      name: '8 Precepts',
      maxCount: 10,
      isKeystone: true,
      subHabits: [
        {id: 'eight_precepts.nk', name: 'No Killing'},
        {id: 'eight_precepts.ns', name: 'No Stealing'},
        {id: 'eight_precepts.c',  name: 'Celibacy'},
        {id: 'eight_precepts.nl', name: 'No Lying'},
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
    {id: 'no_smoking',    name: 'No Smoking',                                       maxCount: 10},
    {
      id: 'no_ordering',
      name: 'No ordering food',
      maxCount: 10,
      subHabits: [
        {id: 'no_ordering.cook',       name: 'Cook'},
        {id: 'no_ordering.restaurant', name: 'Go out to restaurant'},
      ],
      compositeRule: {type: 'any'},
    },
    {id: 'job_hunt',      name: 'Work 6 hrs on job hunt',          maxCount: 10},
    {
      id: 'meditate_twice',
      name: 'Meditate twice for 1 hr',
      maxCount: 10,
      subHabits: [
        {id: 'meditate_twice.morning', name: 'Morning Sitting'},
        {id: 'meditate_twice.evening', name: 'Evening Sitting'},
      ],
      compositeRule: {type: 'all'},
    },
    {id: 'screen_time',   name: 'Restrict screen time to 2 hrs',                    maxCount: 10}
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
