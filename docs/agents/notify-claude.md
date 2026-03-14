# CLAUDE.md — Agent NOTIFY
# Klexi: 20 Korean Words — 푸시 알림 에이전트

---

## 이 에이전트의 임무

**매일 학습 리마인더 푸시 알림 구현 (D+1 리텐션 핵심 기능)**

브랜치: `agent/notify`
머지 대상: `main`

---

## 절대 규칙

1. **TDD 필수**: 알림 스케줄러 로직은 순수 함수로 작성 → 테스트 가능하게
2. **권한 요청 타이밍**: 앱 시작 즉시 X, 첫 학습 완료 후 요청
3. **커밋 메시지**: `feat(notify): ...`

---

## 구현할 알림 종류

| 알림 | 트리거 | 기본 시간 |
|------|--------|---------|
| 일일 학습 리마인더 | 매일 (사용자 설정 시간) | 오후 8시 |
| 스트릭 위기 알림 | 당일 학습 안 했을 때 | 오후 10시 |
| SRS 복습 알림 | 복습 예정 단어 있을 때 | 오전 10시 |

---

## 작업 순서

### Phase 1: 테스트 작성 (RED)

```
__tests__/lib/notifications.test.ts
```

### Phase 2: 의존성 설치

```bash
npx expo install expo-notifications
npx expo install expo-device
```

### Phase 3: app.json 설정

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#B8D43C",
          "sounds": []
        }
      ]
    ],
    "android": {
      "permissions": ["NOTIFICATIONS", "SCHEDULE_EXACT_ALARM"]
    }
  }
}
```

### Phase 4: 구현

### Phase 5: 설정 화면 UI 추가

---

## 구현 스펙

### lib/notifications.ts

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// 알림 핸들러 설정 (앱 포그라운드에서도 표시)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ────────────────────────────────────
// 순수 함수들 (테스트 가능)
// ────────────────────────────────────

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

  // 이미 지났으면 다음 날
  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger;
}

// ────────────────────────────────────
// 권한 요청
// ────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('[Notify] 에뮬레이터에서는 알림 불가');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ────────────────────────────────────
// 알림 스케줄링
// ────────────────────────────────────

export async function scheduleDailyReminder(
  hour: number,
  streakDays: number
): Promise<string> {
  // 기존 알림 취소
  await Notifications.cancelScheduledNotificationAsync('daily-reminder')
    .catch(() => {}); // 없으면 무시

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
    },
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
    trigger: { hour: 22, minute: 0, repeats: true },
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
    trigger: { hour: 10, minute: 0, repeats: false },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

### app/(tabs)/settings.tsx — 알림 설정 UI 추가

```typescript
// settings.tsx에 알림 시간 설정 섹션 추가
import { scheduleDailyReminder, requestNotificationPermission } from '../../lib/notifications';

// 상태
const [notifyHour, setNotifyHour] = useState(20); // 기본 오후 8시
const [notifyEnabled, setNotifyEnabled] = useState(false);

// 알림 토글 핸들러
const handleNotifyToggle = async (value: boolean) => {
  if (value) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('알림 권한', '설정에서 알림 권한을 허용해주세요');
      return;
    }
    await scheduleDailyReminder(notifyHour, progress.streak);
  } else {
    await cancelAllNotifications();
  }
  setNotifyEnabled(value);
  // AsyncStorage에 저장
};

// JSX 추가
<View style={styles.settingRow}>
  <Text>학습 알림</Text>
  <Switch value={notifyEnabled} onValueChange={handleNotifyToggle} />
</View>

{notifyEnabled && (
  <View style={styles.settingRow}>
    <Text>알림 시간</Text>
    <TouchableOpacity onPress={() => showTimePicker()}>
      <Text>{notifyHour}:00</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## 테스트 스펙

### __tests__/lib/notifications.test.ts

```typescript
import {
  buildDailyReminderContent,
  buildStreakWarningContent,
  buildSRSReminderContent,
  calcNextTriggerDate,
} from '../../lib/notifications';

// expo-notifications 모킹
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('test-id'),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('expo-device', () => ({ isDevice: true }));

describe('buildDailyReminderContent', () => {
  it('스트릭 0일 → 첫 번째 메시지', () => {
    const content = buildDailyReminderContent(0);
    expect(content.title).toBeTruthy();
    expect(content.body).toBeTruthy();
  });

  it('스트릭 값에 따라 다른 메시지 반환', () => {
    const msg0 = buildDailyReminderContent(0);
    const msg1 = buildDailyReminderContent(1);
    const msg2 = buildDailyReminderContent(2);
    // 3개 메시지가 순환
    expect(buildDailyReminderContent(3)).toEqual(msg0);
  });
});

describe('buildStreakWarningContent', () => {
  it('스트릭 일수를 메시지에 포함', () => {
    const content = buildStreakWarningContent(7);
    expect(content.body).toContain('7');
  });
});

describe('buildSRSReminderContent', () => {
  it('복습 단어 수를 메시지에 포함', () => {
    const content = buildSRSReminderContent(12);
    expect(content.body).toContain('12');
  });
});

describe('calcNextTriggerDate', () => {
  it('미래 시간이면 오늘 날짜 반환', () => {
    const futureHour = 23;
    const result = calcNextTriggerDate(futureHour);
    expect(result.getHours()).toBe(futureHour);
  });

  it('지난 시간이면 내일 날짜 반환', () => {
    const pastHour = 0; // 자정은 이미 지남
    const result = calcNextTriggerDate(pastHour);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(result.getDate()).toBe(tomorrow.getDate());
  });
});

describe('requestNotificationPermission', () => {
  it('이미 granted 상태면 true 반환', async () => {
    const { requestNotificationPermission } = require('../../lib/notifications');
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });
});
```

---

## 완료 기준

```
□ npm test -- --testPathPattern="notifications" → 모든 테스트 통과
□ 에뮬레이터에서 알림 스케줄 확인
□ settings.tsx 알림 토글 UI 동작
□ 알림 시간 설정 저장/불러오기 (AsyncStorage)
□ 앱 포그라운드에서도 알림 표시 확인
□ git commit -m "feat(notify): 푸시 알림 구현 (일일 리마인더, 스트릭 경고, SRS 복습)"
```
