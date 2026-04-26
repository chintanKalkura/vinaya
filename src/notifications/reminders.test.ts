import notifee from '@notifee/react-native';
import {scheduleAllReminders} from './reminders';

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue(undefined),
    getTriggerNotificationIds: jest.fn().mockResolvedValue([]),
    createTriggerNotification: jest.fn().mockResolvedValue(undefined),
    requestPermission: jest.fn().mockResolvedValue(undefined),
  },
  AndroidImportance: {HIGH: 4},
  TriggerType: {TIMESTAMP: 0},
}));

describe('scheduleAllReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T08:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should include pressAction in every scheduled notification', async () => {
    await scheduleAllReminders('2025-01-01', '2025-01-03');

    const calls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    calls.forEach(([notification]) => {
      expect(notification.android.pressAction).toEqual({id: 'default'});
    });
  });

  it('should schedule notifications only for future dates', async () => {
    jest.setSystemTime(new Date('2025-01-02T23:00:00'));
    await scheduleAllReminders('2025-01-01', '2025-01-03');

    const calls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    calls.forEach(([, trigger]) => {
      expect(trigger.timestamp).toBeGreaterThan(Date.now());
    });
  });

  it('should skip already-scheduled notification ids', async () => {
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      'reminder_2025-01-01',
    ]);

    await scheduleAllReminders('2025-01-01', '2025-01-02');

    const calls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    const scheduledIds = calls.map(([n]) => n.id);
    expect(scheduledIds).not.toContain('reminder_2025-01-01');
  });
});
