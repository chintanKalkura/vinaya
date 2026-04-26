import {getEffectiveHabitState, getHabitsDoneCount} from './habits';
import {HabitDefinition} from '../types';

const simpleHabit: HabitDefinition = {id: 'celibacy', name: 'Celibacy', maxCount: 10};

const anyHabit: HabitDefinition = {
  id: 'no_ordering',
  name: 'No ordering food',
  maxCount: 10,
  subHabits: [
    {id: 'no_ordering.cook', name: 'Cook'},
    {id: 'no_ordering.restaurant', name: 'Restaurant'},
  ],
  compositeRule: {type: 'any'},
};

const allHabit: HabitDefinition = {
  id: 'meditate_twice',
  name: 'Meditate twice',
  maxCount: 10,
  subHabits: [
    {id: 'meditate_twice.morning', name: 'Morning'},
    {id: 'meditate_twice.evening', name: 'Evening'},
  ],
  compositeRule: {type: 'all'},
};

const requiredHabit: HabitDefinition = {
  id: 'eight_precepts',
  name: '8 Precepts',
  maxCount: 10,
  subHabits: [
    {id: 'eight_precepts.nk', name: 'NK'},
    {id: 'eight_precepts.ns', name: 'NS'},
    {id: 'eight_precepts.c',  name: 'C'},
    {id: 'eight_precepts.nl', name: 'NL'},
    {id: 'eight_precepts.ni', name: 'NI'},
    {id: 'eight_precepts.nd', name: 'ND'},
    {id: 'eight_precepts.ne', name: 'NE'},
    {id: 'eight_precepts.sf', name: 'SF'},
  ],
  compositeRule: {
    type: 'required',
    ids: ['eight_precepts.nk', 'eight_precepts.ns', 'eight_precepts.c', 'eight_precepts.ni', 'eight_precepts.nd', 'eight_precepts.sf'],
  },
};

describe('getEffectiveHabitState', () => {
  describe('simple habit', () => {
    it('should return done when state is done', () => {
      expect(getEffectiveHabitState(simpleHabit, {celibacy: 'done'})).toBe('done');
    });

    it('should return none when state is none', () => {
      expect(getEffectiveHabitState(simpleHabit, {celibacy: 'none'})).toBe('none');
    });

    it('should return none when habit missing from states', () => {
      expect(getEffectiveHabitState(simpleHabit, {})).toBe('none');
    });
  });

  describe('any rule (OR)', () => {
    it('should return done when any sub-habit is done', () => {
      expect(getEffectiveHabitState(anyHabit, {'no_ordering.cook': 'done'})).toBe('done');
    });

    it('should return done when both sub-habits are done', () => {
      expect(
        getEffectiveHabitState(anyHabit, {'no_ordering.cook': 'done', 'no_ordering.restaurant': 'done'}),
      ).toBe('done');
    });

    it('should return none when no sub-habit is done', () => {
      expect(getEffectiveHabitState(anyHabit, {})).toBe('none');
    });
  });

  describe('all rule (AND)', () => {
    it('should return done when all sub-habits are done', () => {
      expect(
        getEffectiveHabitState(allHabit, {'meditate_twice.morning': 'done', 'meditate_twice.evening': 'done'}),
      ).toBe('done');
    });

    it('should return none when only one sub-habit is done', () => {
      expect(getEffectiveHabitState(allHabit, {'meditate_twice.morning': 'done'})).toBe('none');
    });

    it('should return none when no sub-habit is done', () => {
      expect(getEffectiveHabitState(allHabit, {})).toBe('none');
    });
  });

  describe('required rule (threshold)', () => {
    const allRequired = {
      'eight_precepts.nk': 'done' as const,
      'eight_precepts.ns': 'done' as const,
      'eight_precepts.c':  'done' as const,
      'eight_precepts.ni': 'done' as const,
      'eight_precepts.nd': 'done' as const,
      'eight_precepts.sf': 'done' as const,
    };

    it('should return done when all required ids are done', () => {
      expect(getEffectiveHabitState(requiredHabit, allRequired)).toBe('done');
    });

    it('should return done even when optional sub-habits (NE, NL) are not done', () => {
      expect(getEffectiveHabitState(requiredHabit, allRequired)).toBe('done');
    });

    it('should return none when one required id is missing', () => {
      const missing = {...allRequired};
      delete (missing as Record<string, unknown>)['eight_precepts.sf'];
      expect(getEffectiveHabitState(requiredHabit, missing)).toBe('none');
    });

    it('should return none when all sub-habits are undone', () => {
      expect(getEffectiveHabitState(requiredHabit, {})).toBe('none');
    });
  });
});

describe('getHabitsDoneCount', () => {
  it('should count simple habits correctly', () => {
    expect(getHabitsDoneCount([simpleHabit], {celibacy: 'done'})).toBe(1);
    expect(getHabitsDoneCount([simpleHabit], {celibacy: 'none'})).toBe(0);
  });

  it('should count composite habits by their derived state', () => {
    expect(getHabitsDoneCount([anyHabit], {'no_ordering.cook': 'done'})).toBe(1);
    expect(getHabitsDoneCount([anyHabit], {})).toBe(0);
  });

  it('should count mixed simple and composite habits', () => {
    const states = {
      celibacy: 'done' as const,
      'meditate_twice.morning': 'done' as const,
      'meditate_twice.evening': 'done' as const,
    };
    expect(getHabitsDoneCount([simpleHabit, allHabit], states)).toBe(2);
  });
});
