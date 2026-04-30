import {formatAlarmTime} from './time';

function msAt(hours: number, minutes: number, daysOffset = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

describe('formatAlarmTime', () => {
  it('should return No Bells Scheduled when ms is 0', () => {
    expect(formatAlarmTime(0)).toBe('No Bells Scheduled');
  });

  it('should prefix Today for a timestamp on the current date', () => {
    expect(formatAlarmTime(msAt(8, 0))).toBe('Today at 8:00 AM');
  });

  it('should prefix Tomorrow for a timestamp on the next date', () => {
    expect(formatAlarmTime(msAt(8, 0, 1))).toBe('Tomorrow at 8:00 AM');
  });

  it('should prefix Start Day for a timestamp beyond tomorrow', () => {
    expect(formatAlarmTime(msAt(8, 0, 2))).toBe('Start Day at 8:00 AM');
  });

  it('should format noon as 12:00 PM', () => {
    expect(formatAlarmTime(msAt(12, 0))).toBe('Today at 12:00 PM');
  });

  it('should format 2:00 PM correctly', () => {
    expect(formatAlarmTime(msAt(14, 0))).toBe('Today at 2:00 PM');
  });

  it('should format 10:00 PM correctly', () => {
    expect(formatAlarmTime(msAt(22, 0))).toBe('Today at 10:00 PM');
  });

  it('should zero-pad minutes', () => {
    expect(formatAlarmTime(msAt(9, 5))).toBe('Today at 9:05 AM');
  });
});
