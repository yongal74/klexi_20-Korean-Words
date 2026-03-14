import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function buildDailyReminderContent(streakDays: number) {
  const messages = [
    { title: '📚 오늘의 한국어!', body: `${streakDays}일 연속 학습 중! 오늘도 20단어 해볼까요?` },
    { title: '🔥 스트릭 유지하자!', body: `어제도 했잖아요. 오늘도 5분이면 충분해요.` },
    { title: '🇰🇷 한국어 한 발자국!', body: '오늘의 단어가 기다리고 있어요.' },
  ];
  return messages[streakDays % messages.length];
}

export function buildStreakWarningContent(streakDays: number) {
  return {
    title: '⚠️ 스트릭이 끊길 위기!',
    body: `${streakDays}일 연속 학습이 오늘 자정에 사라져요. 지금 시작하세요!`,
  };
}

export function buildSRSReminderContent(dueCount: number) {
  return {
    title: '🧠 복습할 단어가 있어요',
    body: `${dueCount}개 단어가 오늘 복습을 기다리고 있어요.`,
  };
}

export function calcNextTriggerDate(hour: number, minute: number = 0): Date {
  const now = new Date();
  const trigger = new Date();
  trigger.setHours(hour, minute, 0, 0);

  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(
  hour: number,
  streakDays: number
): Promise<string> {
  await Notifications.cancelScheduledNotificationAsync('daily-reminder')
    .catch(() => {});

  const content = buildDailyReminderContent(streakDays);

  const id = await Notifications.scheduleNotificationAsync({
    identifier: 'daily-reminder',
    content: {
      title: content.title,
      body: content.body,
      sound: false,
    },
    trigger: {
      hour,
      minute: 0,
      repeats: true,
    } as any,
  });

  return id;
}

export async function scheduleStreakWarning(streakDays: number): Promise<void> {
  if (streakDays === 0) return;

  await Notifications.cancelScheduledNotificationAsync('streak-warning')
    .catch(() => {});

  const content = buildStreakWarningContent(streakDays);

  await Notifications.scheduleNotificationAsync({
    identifier: 'streak-warning',
    content: { title: content.title, body: content.body, sound: false },
    trigger: { hour: 22, minute: 0, repeats: true } as any,
  });
}

export async function scheduleSRSReminder(dueCount: number): Promise<void> {
  if (dueCount === 0) {
    await Notifications.cancelScheduledNotificationAsync('srs-reminder').catch(() => {});
    return;
  }

  const content = buildSRSReminderContent(dueCount);

  await Notifications.scheduleNotificationAsync({
    identifier: 'srs-reminder',
    content: { title: content.title, body: content.body, sound: false },
    trigger: { hour: 10, minute: 0, repeats: false } as any,
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
