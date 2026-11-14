import { filterItems, sortItems } from './sortFilter';
import { CadenceStatus } from './cadence';
import { HabitStatus } from '../types/habit';

interface Item {
  id: string;
  name: string;
  status: HabitStatus;
  createdAt: number;
  sortOrder: number;
  streak: number;
  complete: boolean;
}

function item(
  id: string,
  createdAt: number,
  overrides: Partial<Item> = {},
): Item {
  return {
    id,
    name: id,
    status: 'active',
    createdAt,
    sortOrder: 0,
    streak: 0,
    complete: false,
    ...overrides,
  };
}

const statusOf = (i: Item): CadenceStatus => ({
  markedToday: false,
  complete: i.complete,
  streak: i.streak,
  frozenToday: false,
  freezesLeft: 0,
});
const ids = (items: Item[]) => items.map(i => i.id);

describe('sortItems', () => {
  const items = [
    item('banana', 20, { streak: 3 }),
    item('Apple', 10, { streak: 3 }),
    item('cherry', 30, { streak: 9 }),
  ];

  it('should put the oldest first by default', () => {
    expect(ids(sortItems(items, undefined, statusOf))).toEqual([
      'Apple',
      'banana',
      'cherry',
    ]);
  });

  it('should break ties in creation time by sort order', () => {
    const same = [
      item('b', 5, { sortOrder: 2 }),
      item('a', 5, { sortOrder: 1 }),
    ];

    expect(ids(sortItems(same, undefined, statusOf))).toEqual(['a', 'b']);
  });

  it('should put the highest streak first, ties oldest first', () => {
    expect(ids(sortItems(items, 'Streak', statusOf))).toEqual([
      'cherry',
      'Apple',
      'banana',
    ]);
  });

  it('should sort A–Z ignoring case', () => {
    expect(ids(sortItems(items, 'A–Z', statusOf))).toEqual([
      'Apple',
      'banana',
      'cherry',
    ]);
  });

  it('should put the newest first for Recent', () => {
    expect(ids(sortItems(items, 'Recent', statusOf))).toEqual([
      'cherry',
      'banana',
      'Apple',
    ]);
  });

  it('should not change the input', () => {
    sortItems(items, 'Recent', statusOf);

    expect(ids(items)).toEqual(['banana', 'Apple', 'cherry']);
  });
});

describe('filterItems', () => {
  const items = [
    item('done', 1, { complete: true }),
    item('open', 2),
    item('paused', 3, { status: 'paused', complete: true }),
  ];

  it('should keep every active item when Completed is off', () => {
    expect(ids(filterItems(items, false, statusOf))).toEqual(['done', 'open']);
  });

  it('should keep only complete active items when Completed is on', () => {
    expect(ids(filterItems(items, true, statusOf))).toEqual(['done']);
  });
});
