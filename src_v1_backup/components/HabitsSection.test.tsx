import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import HabitsSection, {getParentIndicatorState} from './HabitsSection';
import {HabitDefinition, HabitState} from '../types';

const simpleHabit: HabitDefinition = {
  id: 'celibacy',
  name: 'Celibacy',
  maxCount: 21,
};

const keystoneHabit: HabitDefinition = {
  id: 'meditation',
  name: 'Meditation',
  isKeystone: true,
  maxCount: 15,
};

const anyHabit: HabitDefinition = {
  id: 'eat_healthy',
  name: 'Eat Healthy',
  maxCount: 31,
  subHabits: [
    {id: 'eat_healthy.cook', name: 'Cook'},
    {id: 'eat_healthy.restaurant', name: 'Restaurant'},
  ],
  compositeRule: {type: 'any'},
};

const allHabit: HabitDefinition = {
  id: 'meditate_twice',
  name: 'Meditate twice',
  maxCount: 31,
  subHabits: [
    {id: 'meditate_twice.morning', name: 'Morning'},
    {id: 'meditate_twice.evening', name: 'Evening'},
  ],
  compositeRule: {type: 'all'},
};

const requiredHabit: HabitDefinition = {
  id: 'eight_precepts',
  name: '8 Precepts',
  isKeystone: true,
  maxCount: 31,
  subHabits: [
    {id: 'eight_precepts.nk', name: 'No Killing'},
    {id: 'eight_precepts.ns', name: 'No Stealing'},
    {id: 'eight_precepts.ne', name: 'No Entertainment'},
    {id: 'eight_precepts.nl', name: 'Right Speech'},
  ],
  compositeRule: {
    type: 'required',
    ids: ['eight_precepts.nk', 'eight_precepts.ns'],
  },
};

const emptyLogs: Record<string, Record<string, HabitState>> = {};

describe('getParentIndicatorState', () => {
  describe('any rule', () => {
    it('should return none when no sub-habits are done', () => {
      expect(getParentIndicatorState(anyHabit, {})).toBe('none');
    });

    it('should return done when any sub-habit satisfies the rule', () => {
      expect(
        getParentIndicatorState(anyHabit, {'eat_healthy.cook': 'done'}),
      ).toBe('done');
    });
  });

  describe('all rule', () => {
    it('should return none when no sub-habits are done', () => {
      expect(getParentIndicatorState(allHabit, {})).toBe('none');
    });

    it('should return partial when some but not all sub-habits are done', () => {
      expect(
        getParentIndicatorState(allHabit, {'meditate_twice.morning': 'done'}),
      ).toBe('partial');
    });

    it('should return done when all sub-habits are done', () => {
      expect(
        getParentIndicatorState(allHabit, {
          'meditate_twice.morning': 'done',
          'meditate_twice.evening': 'done',
        }),
      ).toBe('done');
    });
  });

  describe('required rule', () => {
    it('should return none when no sub-habits are done', () => {
      expect(getParentIndicatorState(requiredHabit, {})).toBe('none');
    });

    it('should return partial when a required sub-habit is done but rule not satisfied', () => {
      expect(
        getParentIndicatorState(requiredHabit, {'eight_precepts.nk': 'done'}),
      ).toBe('partial');
    });

    it('should return partial when only optional sub-habits are done', () => {
      expect(
        getParentIndicatorState(requiredHabit, {'eight_precepts.ne': 'done'}),
      ).toBe('partial');
    });

    it('should return done when all required ids are satisfied', () => {
      expect(
        getParentIndicatorState(requiredHabit, {
          'eight_precepts.nk': 'done',
          'eight_precepts.ns': 'done',
        }),
      ).toBe('done');
    });

    it('should return done when required and optional sub-habits are all done', () => {
      expect(
        getParentIndicatorState(requiredHabit, {
          'eight_precepts.nk': 'done',
          'eight_precepts.ns': 'done',
          'eight_precepts.ne': 'done',
          'eight_precepts.nl': 'done',
        }),
      ).toBe('done');
    });
  });
});

describe('HabitsSection', () => {
  describe('standalone habit', () => {
    it('should render the habit name', () => {
      const {getByText} = render(
        <HabitsSection
          habits={[simpleHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={jest.fn()}
        />,
      );
      expect(getByText('Celibacy')).toBeTruthy();
    });

    it('should call onToggle when tapped', () => {
      const onToggle = jest.fn();
      const {getByText} = render(
        <HabitsSection
          habits={[simpleHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={onToggle}
        />,
      );
      fireEvent.press(getByText('Celibacy'));
      expect(onToggle).toHaveBeenCalledWith('celibacy');
    });

    it('should not call onToggle when readOnly', () => {
      const onToggle = jest.fn();
      const {getByText} = render(
        <HabitsSection
          habits={[simpleHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={onToggle}
          readOnly
        />,
      );
      fireEvent.press(getByText('Celibacy'));
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('keystone habit', () => {
    it('should render ★ prefix in the name', () => {
      const {getByText} = render(
        <HabitsSection
          habits={[keystoneHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={jest.fn()}
        />,
      );
      expect(getByText(/★/)).toBeTruthy();
    });
  });

  describe('composite habit — parent row', () => {
    it('should render the parent habit name', () => {
      const {getByText} = render(
        <HabitsSection
          habits={[anyHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={jest.fn()}
        />,
      );
      expect(getByText('Eat Healthy')).toBeTruthy();
    });

    it('should not call onToggle when the parent row area is pressed', () => {
      const onToggle = jest.fn();
      const {getByText} = render(
        <HabitsSection
          habits={[anyHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={onToggle}
        />,
      );
      fireEvent.press(getByText('Eat Healthy'));
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('composite habit — sub-habit chips', () => {
    it('should render all sub-habit names', () => {
      const {getByText} = render(
        <HabitsSection
          habits={[anyHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={jest.fn()}
        />,
      );
      expect(getByText('Cook')).toBeTruthy();
      expect(getByText('Restaurant')).toBeTruthy();
    });

    it('should call onToggle with sub-habit id when chip is tapped', () => {
      const onToggle = jest.fn();
      const {getByText} = render(
        <HabitsSection
          habits={[anyHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={onToggle}
        />,
      );
      fireEvent.press(getByText('Cook'));
      expect(onToggle).toHaveBeenCalledWith('eat_healthy.cook');
    });

    it('should not call onToggle when readOnly and chip is tapped', () => {
      const onToggle = jest.fn();
      const {getByText} = render(
        <HabitsSection
          habits={[anyHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={onToggle}
          readOnly
        />,
      );
      fireEvent.press(getByText('Cook'));
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('should render day count suffix for each chip', () => {
      const {getAllByText} = render(
        <HabitsSection
          habits={[anyHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={jest.fn()}
        />,
      );
      expect(getAllByText('0d')).toHaveLength(2);
    });
  });

  describe('required-type composite habit', () => {
    it('should show ★ only before required sub-habit names', () => {
      const {getAllByText, queryAllByText} = render(
        <HabitsSection
          habits={[requiredHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={jest.fn()}
        />,
      );
      // Two required sub-habits get ★
      expect(getAllByText(/★/).length).toBeGreaterThanOrEqual(2);
      // Optional sub-habits (ne, nl) should not have ★ before their names
      const neText = queryAllByText(/★.*No Entertainment/);
      expect(neText).toHaveLength(0);
    });
  });

  describe('challenge count display', () => {
    it('should render challenge count for standalone habits', () => {
      const {getByText} = render(
        <HabitsSection
          habits={[simpleHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={jest.fn()}
        />,
      );
      expect(getByText('0/21')).toBeTruthy();
    });

    it('should render challenge count for composite parent habits', () => {
      const {getByText} = render(
        <HabitsSection
          habits={[anyHabit]}
          habitStates={{}}
          allLogs={emptyLogs}
          onToggle={jest.fn()}
        />,
      );
      expect(getByText('0/31')).toBeTruthy();
    });
  });
});
