# Flutter_Migration_Review.md — 플러터 마이그레이션 제안서
### Klexi: 20 Korean Words (React Native → Flutter 전환 검토)

> **버전**: v1.0
> **작성일**: 2026년 3월
> **목적**: Flutter 마이그레이션의 득실 분석 및 의사결정 가이드

---

## 1. 결론 요약 (TL;DR)

> **현시점에서 Flutter 마이그레이션은 권장하지 않는다.**
> 단, 아래 조건이 충족될 경우 마이그레이션을 재검토할 수 있다.

| 조건 | 상태 |
|------|------|
| MAU 50,000 이상 도달 | 미충족 |
| 성능 병목이 실제 매출/리텐션에 영향을 줄 때 | 미확인 |
| 개발팀이 Dart 경험자 보유 | 미확인 |
| 전체 UI 리디자인 계획이 있을 때 | 미확인 |

---

## 2. 현재 스택(Expo/RN) vs Flutter 비교

### 2.1 핵심 지표 비교

| 항목 | Expo/React Native (현재) | Flutter |
|------|-------------------------|---------|
| **성능** | JS 브리지 경유 (일부 네이티브) | 네이티브 렌더링 (Skia/Impeller) |
| **애니메이션** | Reanimated 4 (네이티브 스레드) | 60/120fps 일관성 |
| **번들 크기** | ~93MB AAB (현재) | ~20~30MB (초기) |
| **개발 속도** | Hot Reload ✅ | Hot Reload ✅ |
| **웹 지원** | expo-router → 웹 지원 ✅ | Flutter Web (베타 수준) |
| **한국어 폰트** | Noto Sans KR (npm) | google_fonts 패키지 |
| **Supabase** | @supabase/supabase-js ✅ | supabase_flutter ✅ |
| **OpenAI** | openai npm ✅ | http 패키지로 직접 구현 |
| **Polar 결제** | @polar-sh/sdk ✅ | 직접 REST 구현 필요 |
| **expo-speech** | 기본 내장 ✅ | flutter_tts 패키지 |
| **expo-av (녹음)** | 기본 내장 ✅ | flutter_sound 패키지 |
| **SRS 알고리즘** | 이미 구현됨 (lib/srs.ts) | 재구현 필요 |
| **AsyncStorage** | @react-native-async-storage | shared_preferences / Hive |
| **App Store 배포** | EAS CLI (자동화) | 수동 Xcode/Gradle 설정 필요 |
| **TypeScript** | ✅ 100% | ❌ Dart (별도 학습 필요) |

### 2.2 성능 실제 차이

```
Klexi 앱의 성능 병목 가능 구간:

① 플래시카드 뒤집기 애니메이션
   - Reanimated 4: 네이티브 스레드 실행 → 이미 충분히 빠름
   - Flutter: Skia 렌더링 → 약간 더 부드러울 수 있음
   - 실질적 차이: 사용자가 체감하기 어려운 수준

② 단어 데이터 로딩 (7,200개)
   - 현재: JS 번들 내 객체 배열 (메모리 로딩)
   - Flutter: Dart isolate로 별도 스레드 처리 가능
   - 현재 문제: 없음 (이미 빠름)

③ SRS 알고리즘 계산
   - 현재: JS 동기 계산 → 체감 불가 수준
   - Flutter: Dart 더 빠름 (GC 효율)
   - 실질적 차이: 없음 (알고리즘이 단순함)

결론: 성능상의 실질적 개선 효과가 마이그레이션 비용보다 작다.
```

---

## 3. 마이그레이션 비용 분석

### 3.1 작업량 추정

| 구성요소 | 현재 규모 | 재작성 비용 |
|----------|---------|------------|
| 스크린 21개 | ~8,000줄 | 21 × 2~3일 = 42~63일 |
| 비즈니스 로직 (lib/) | ~3,000줄 | 15~20일 |
| 서버 코드 (server/) | ~2,000줄 | 유지 (Express 유지 가능) |
| 상태 관리 (Context → Riverpod) | ~1,500줄 | 10~15일 |
| 콘텐츠 데이터 변환 | ~7,200단어 | 3~5일 |
| 테스트 재작성 | — | 10~20일 |
| **총 소요 기간** | | **약 80~120일 (1인 개발 기준)** |

### 3.2 기회비용
- 마이그레이션 기간(3~4개월) 동안 신기능 개발 완전 중단
- 현재 앱 버그/이슈 대응 지연
- 마케팅/ASO 활동 차질

### 3.3 비용 대비 효과

| 기대 효과 | 실현 가능성 | 대안 |
|----------|-----------|------|
| 앱 크기 감소 | ✅ 가능 (~40%) | 불필요한 의존성 제거로 부분 달성 가능 |
| 애니메이션 향상 | ⚠️ 미미 | Reanimated 4 최적화로 충분 |
| iOS 성능 향상 | ✅ 가능 | 현재 성능 문제 없음 |
| 개발자 채용 | ⚠️ Flutter는 RN보다 커뮤니티 작음 | RN 개발자가 더 많음 |

---

## 4. Flutter 마이그레이션이 유리한 시나리오

```
마이그레이션 권장 조건 체크리스트:

□ 앱이 고성능 그래픽/애니메이션 중심으로 진화할 계획
□ Dart 경험이 있는 개발자 합류
□ 웹 지원 비중이 감소하고 네이티브 앱에 집중
□ MAU 100,000+ 이상에서 성능 불만 리뷰가 지속적으로 발생
□ TypeScript → Dart 학습에 2~3개월 투자 가능
□ 완전한 UI 리디자인과 함께 진행 (코드 재작성 시너지)
```

---

## 5. Flutter 마이그레이션 시 아키텍처 설계

*(마이그레이션 결정 시 참고)*

### 5.1 Flutter 권장 아키텍처

```
Flutter (MVVM + Riverpod)

lib/
├── main.dart                # 앱 진입점
├── app/
│   ├── router.dart          # go_router (expo-router 대응)
│   └── theme.dart           # ThemeData (colors.ts 대응)
├── features/
│   ├── home/                # 홈 기능 단위
│   │   ├── presentation/    # 위젯 (UI)
│   │   ├── domain/          # 유즈케이스 (비즈니스 로직)
│   │   └── data/            # 레포지토리 (저장소)
│   ├── quiz/
│   ├── vocabulary/
│   ├── srs/
│   └── premium/
├── shared/
│   ├── widgets/             # 공통 위젯 (Button, Card 등)
│   └── providers/           # 공통 Riverpod 프로바이더
└── core/
    ├── constants/
    ├── services/            # Supabase, OpenAI 서비스
    └── storage/             # SharedPreferences, Hive
```

### 5.2 핵심 패키지 매핑

| React Native / Expo | Flutter 대응 패키지 |
|--------------------|--------------------|
| expo-router | go_router |
| react-native-reanimated | flutter_animate / lottie_flutter |
| @tanstack/react-query | riverpod (AsyncNotifier) |
| AsyncStorage | shared_preferences / flutter_secure_storage |
| expo-speech | flutter_tts |
| expo-av | flutter_sound |
| @supabase/supabase-js | supabase_flutter |
| @polar-sh/sdk | http (직접 REST API 호출) |
| react-native-reanimated | flutter_animate |
| expo-haptics | haptic_feedback |
| @expo/vector-icons | flutter_svg / Material Icons |

### 5.3 SRS 알고리즘 Dart 포팅

```dart
// lib/core/algorithms/srs.dart
// SM-2 알고리즘 (lib/srs.ts에서 포팅)

class SRSCard {
  final String wordId;
  double easeFactor;    // 초기 2.5
  int interval;         // 일 단위
  int repetitions;
  DateTime nextReview;
  DateTime lastReview;

  SRSCard({
    required this.wordId,
    this.easeFactor = 2.5,
    this.interval = 1,
    this.repetitions = 0,
    DateTime? nextReview,
    DateTime? lastReview,
  }) : nextReview = nextReview ?? DateTime.now(),
       lastReview = lastReview ?? DateTime.now();
}

SRSCard updateCard(SRSCard card, int quality) {
  // quality: 0~5 (0~2: 실패, 3~5: 성공)
  if (quality >= 3) {
    if (card.repetitions == 0) {
      card = card.copyWith(interval: 1);
    } else if (card.repetitions == 1) {
      card = card.copyWith(interval: 6);
    } else {
      card = card.copyWith(
        interval: (card.interval * card.easeFactor).round(),
      );
    }
    card = card.copyWith(repetitions: card.repetitions + 1);
  } else {
    card = card.copyWith(repetitions: 0, interval: 1);
  }

  final newEF = card.easeFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  card = card.copyWith(
    easeFactor: newEF.clamp(1.3, 2.5),
    nextReview: DateTime.now().add(Duration(days: card.interval)),
    lastReview: DateTime.now(),
  );
  return card;
}
```

### 5.4 상태 관리 (Riverpod 예시)

```dart
// features/vocabulary/providers/daily_words_provider.dart
@riverpod
class DailyWordsNotifier extends _$DailyWordsNotifier {
  @override
  Future<List<VocabWord>> build() async {
    final settings = ref.watch(settingsProvider);
    final progress = ref.watch(progressProvider);
    return VocabularyRepository.getDailyWords(
      level: settings.topikLevel,
      count: settings.wordsPerDay,
      learnedIds: progress.learnedWordIds,
    );
  }

  void markLearned(String wordId, bool knew) {
    ref.read(progressProvider.notifier).addLearnedWord(wordId, knew);
    ref.read(srsProvider.notifier).updateCard(wordId, knew ? 4 : 1);
  }
}
```

---

## 6. 마이그레이션 없이 성능 개선하는 방법 (권장)

> Flutter 마이그레이션 없이도 현재 스택에서 달성 가능한 개선 사항

### 즉각 개선 가능
```bash
# 1. 불필요한 의존성 제거
npm uninstall playwright  # 앱에서 미사용

# 2. Metro 번들러 최적화 (metro.config.js)
module.exports = {
  transformer: {
    minifierConfig: {
      compress: { drop_console: true }  # 프로덕션에서 console.log 제거
    }
  }
};

# 3. 이미지 최적화
npx expo install expo-image  # 이미 설치됨, 기본 <Image> 대신 사용 확인
```

### 단기 개선 (1개월)
- vocab 데이터 → Supabase로 이관 (번들 크기 -20MB)
- Reanimated worklet 최적화 (플래시카드 성능 향상)
- FlatList → FlashList 교체 (스크롤 성능 향상)

```bash
# FlashList 설치 (Shopify 제작, FlatList 대체)
npx expo install @shopify/flash-list
```

---

## 7. 최종 권고사항

```
현재 권고: React Native / Expo 유지

이유:
1. 기능 완성도 우선 — 소셜 로그인, 푸시 알림, 애널리틱스가 더 급함
2. 성능 차이 미미 — 사용자가 체감할 수 없는 수준의 차이
3. 재작성 비용 과다 — 3~4개월의 개발 중단은 스타트업에 치명적
4. RN 생태계 성숙 — Expo SDK 54, Reanimated 4, New Architecture 지원으로 충분
5. 코드 자산 활용 — 7,200단어 데이터, SRS 로직, 서버 코드 모두 재사용 가능

재검토 시점:
- 앱 리뷰에서 "느리다", "버벅인다" 불만이 전체 리뷰의 20% 초과
- MAU 100,000 이상에서 성능 스케일링 문제 발생
- 신규 팀원이 Dart/Flutter 전문가일 경우
```
