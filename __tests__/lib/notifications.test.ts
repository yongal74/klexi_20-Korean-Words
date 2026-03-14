/**
 * Notifications Tests
 * Agent: NOTIFY
 */

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('test-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('expo-device', () => ({ isDevice: true }));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

import {
  buildDailyReminderContent,
  buildStreakWarningContent,
  buildSRSReminderContent,
  calcNextTriggerDate,
  requestNotificationPermission,
  scheduleDailyReminder,
  scheduleStreakWarning,
  scheduleSRSReminder,
  cancelAllNotifications,
} from '../../lib/notifications';

describe('buildDailyReminderContent', () => {
  it('title과 body가 있음', () => {
    const content = buildDailyReminderContent(0);
    expect(content.title).toBeTruthy();
    expect(content.body).toBeTruthy();
  });

  it('스트릭 값에 따라 같은 인덱스의 메시지 제목이 순환', () => {
    const msg0 = buildDailyReminderContent(0);
    const msg3 = buildDailyReminderContent(3);
    // 인덱스(0 % 3 === 3 % 3 === 0)가 같으므로 title은 동일
    expect(msg3.title).toBe(msg0.title);
  });

  it('스트릭 1, 2는 서로 다른 메시지', () => {
    const msg1 = buildDailyReminderContent(1);
    const msg2 = buildDailyReminderContent(2);
    expect(msg1.body).not.toBe(msg2.body);
  });
});

describe('buildStreakWarningContent', () => {
  it('스트릭 일수를 body에 포함', () => {
    const content = buildStreakWarningContent(7);
    expect(content.body).toContain('7');
  });

  it('title이 있음', () => {
    const content = buildStreakWarningContent(3);
    expect(content.title).toBeTruthy();
  });
});

describe('buildSRSReminderContent', () => {
  it('복습 단어 수를 body에 포함', () => {
    const content = buildSRSReminderContent(12);
    expect(content.body).toContain('12');
  });
});

describe('calcNextTriggerDate', () => {
  it('hour 23은 오늘 또는 내일 23시 반환', () => {
    const result = calcNextTriggerDate(23);
    expect(result).toBeInstanceOf(Date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(0);
  });

  it('hour 0은 내일 0시 반환 (이미 지났으므로)', () => {
    const result = calcNextTriggerDate(0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(result.getDate()).toBe(tomorrow.getDate());
  });

  it('반환값은 Date 객체', () => {
    expect(calcNextTriggerDate(8)).toBeInstanceOf(Date);
  });
});

describe('requestNotificationPermission', () => {
  it('이미 granted → true 반환', async () => {
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });

  it('undetermined → 허용하면 true 반환', async () => {
    const Notifications = require('expo-notifications');
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });
});

describe('scheduleDailyReminder', () => {
  it('identifier가 반환됨', async () => {
    const id = await scheduleDailyReminder(20, 5);
    expect(id).toBeTruthy();
  });
});

describe('scheduleStreakWarning', () => {
  it('streakDays 0이면 스케줄 안 함', async () => {
    const Notifications = require('expo-notifications');
    Notifications.scheduleNotificationAsync.mockClear();
    await scheduleStreakWarning(0);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('scheduleSRSReminder', () => {
  it('dueCount 0이면 취소만 함', async () => {
    const Notifications = require('expo-notifications');
    Notifications.scheduleNotificationAsync.mockClear();
    Notifications.cancelScheduledNotificationAsync.mockClear();
    await scheduleSRSReminder(0);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
  });
});

describe('cancelAllNotifications', () => {
  it('에러 없이 완료됨', async () => {
    await expect(cancelAllNotifications()).resolves.not.toThrow();
  });
});
