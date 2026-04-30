import {formatAlarmTime} from './time';

function msAt(hours: number, minutes: number): number {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

describe('formatAlarmTime', () => {
  it('should return — when ms is 0', () => {
    expect(formatAlarmTime(0)).toBe('—');
  });

  it('should format 8:00 AM correctly', () => {
    expect(formatAlarmTime(msAt(8, 0))).toBe('8:00 AM');
  });

  it('should format 10:00 AM correctly', () => {
    expect(formatAlarmTime(msAt(10, 0))).toBe('10:00 AM');
  });

  it('should format noon as 12:00 PM', () => {
    expect(formatAlarmTime(msAt(12, 0))).toBe('12:00 PM');
  });

  it('should format 2:00 PM correctly', () => {
    expect(formatAlarmTime(msAt(14, 0))).toBe('2:00 PM');
  });

  it('should format 10:00 PM correctly', () => {
    expect(formatAlarmTime(msAt(22, 0))).toBe('10:00 PM');
  });

  it('should format midnight as 12:00 AM', () => {
    expect(formatAlarmTime(msAt(0, 0))).toBe('12:00 AM');
  });

  it('should zero-pad minutes', () => {
    expect(formatAlarmTime(msAt(9, 5))).toBe('9:05 AM');
  });
});
