# Design_Brief.md — 디자인 기획서
### Klexi: 20 Korean Words

> **버전**: v2.0 (개선판)
> **작성일**: 2026년 3월
> **도구**: React Native StyleSheet (현재), Figma (디자인 작업용)

---

## 1. 브랜드 아이덴티티

### 1.1 브랜드 포지셔닝

```
Klexi는 "체계적이고 즐거운 한국어 학습"을 대표한다.

핵심 감성:
- Energetic (활기찬) — K-컬처의 에너지, 학습의 동기
- Systematic (체계적) — TOPIK 커리큘럼, SRS 과학적 방법론
- Approachable (친근한) — AI 튜터 달리, 게임화 요소
- Cultural (문화적) — K-드라마, K-팝, 진정성 있는 한국 문화
```

### 1.2 브랜드 색상 시스템 (개선)

```
현재 Primary: #B8D43C (라임 그린)
→ 배경이 검정(#0F0F0F)이라 보완색으로 적합하나
  타 학습 앱과 차별화 부족

권장 Primary: #00E5C0 (청록 네온) — 현대적, 기술적, 한국적 느낌
또는 유지: #B8D43C 브랜드 일관성 중시 시
```

#### 완성된 색상 팔레트

```
┌─────────────────────────────────────────────────────┐
│  PRIMARY PALETTE                                     │
│  ■ Primary:     #B8D43C  Lime Green (라임 그린)      │
│  ■ Secondary:   #D4864E  Rust Orange (러스트 오렌지) │
│  ■ Accent:      #A67B5B  Warm Tan (웜 탠)            │
├─────────────────────────────────────────────────────┤
│  BACKGROUND SYSTEM                                   │
│  ■ BG-900:      #0F0F0F  Near Black (거의 검정)      │
│  ■ BG-800:      #1A1A1A  Dark Gray (어두운 회색)     │
│  ■ BG-700:      #242424  Medium Dark                 │
│  ■ BG-600:      #2A2A2A  Medium Gray                 │
│  ■ BG-500:      #3A3A3A  Card Border                 │
├─────────────────────────────────────────────────────┤
│  TEXT SYSTEM                                         │
│  ■ Text-100:    #FFFFFF  Primary Text                │
│  ■ Text-300:    #CCCCCC  Secondary Text              │
│  ■ Text-500:    #AAAAAA  Muted Text                  │
│  ■ Text-700:    #666666  Disabled Text               │
├─────────────────────────────────────────────────────┤
│  STATE COLORS                                        │
│  ■ Success:     #4CAF50  Correct Answer              │
│  ■ Error:       #F44336  Wrong Answer                │
│  ■ Warning:     #FF9800  Alert                       │
│  ■ Info:        #2196F3  Info                        │
│  ■ XP Gold:     #FFD700  XP / Points                 │
│  ■ Streak:      #FF6B35  Streak / Fire               │
├─────────────────────────────────────────────────────┤
│  TOPIK LEVEL COLORS                                  │
│  ■ Level 1:     #4CAF50  입문 초록                   │
│  ■ Level 2:     #2196F3  초급 파랑                   │
│  ■ Level 3:     #FF9800  초중급 주황                 │
│  ■ Level 4:     #9C27B0  중급 보라                   │
│  ■ Level 5:     #F44336  고급 빨강                   │
│  ■ Level 6:     #B8D43C  최고급 라임                 │
└─────────────────────────────────────────────────────┘
```

### 1.3 타이포그래피 시스템

```
폰트 패밀리:
- 한국어: Noto Sans KR (현재 설치됨)
- 영어 UI: Inter (추가 권장) 또는 System Font

타이포그래피 스케일:
┌──────────────────────────────────────────────────┐
│  이름        크기   두께   용도                   │
├──────────────────────────────────────────────────┤
│  Display     48px  Bold   메인 한국어 단어 표시  │
│  Heading1    32px  Bold   화면 제목              │
│  Heading2    24px  SemiBold 섹션 제목            │
│  Heading3    20px  SemiBold 카드 타이틀          │
│  Body        16px  Regular  본문 텍스트          │
│  BodyMedium  16px  Medium   강조 본문            │
│  Small       14px  Regular  부가 정보            │
│  Caption     12px  Regular  레이블, 태그         │
│  Label       11px  Medium   탭 라벨              │
└──────────────────────────────────────────────────┘
```

---

## 2. 컴포넌트 디자인 시스템

### 2.1 버튼 (Button)

```
Primary Button (주요 CTA):
┌────────────────────────────────┐
│         학습 시작하기 →         │
└────────────────────────────────┘
  배경: #B8D43C
  텍스트: #0F0F0F (검정 — 명도 대비)
  높이: 52px
  모서리: 12px
  폰트: 16px Bold

Secondary Button (보조 액션):
┌────────────────────────────────┐
│           나중에               │
└────────────────────────────────┘
  배경: 투명
  테두리: 1px #3A3A3A
  텍스트: #AAAAAA
  높이: 52px

Ghost Button (네비게이션):
  배경: 투명
  텍스트: #B8D43C (Primary 색상)
  아이콘 + 텍스트 조합

Danger Button (삭제, 위험 액션):
  배경: #F44336
  텍스트: #FFFFFF
```

### 2.2 카드 (Card)

```
Default Card (일반 콘텐츠):
┌─────────────────────────────────┐
│  [아이콘]  제목                  │
│           설명 텍스트            │
│                      [→ 버튼]   │
└─────────────────────────────────┘
  배경: #1A1A1A
  테두리: 1px #2A2A2A
  모서리: 16px
  패딩: 16px

Vocabulary Flashcard:
┌─────────────────────────────────┐
│                                 │
│         사랑해                   │   ← 앞면
│      사 · 랑 · 해               │
│         TOPIK L2                │
│                                 │
└─────────────────────────────────┘
  ↓ 탭하여 뒤집기 (3D 회전 애니메이션)
┌─────────────────────────────────┐
│         I love you              │   ← 뒷면
│                                 │
│  "너를 사랑해!"                  │
│  "I love you!"                  │
│                                 │
│  [★]    [🔊]    [→ 관련 단어]   │
└─────────────────────────────────┘
  배경: Linear Gradient (#1A1A1A → #242424)
  모서리: 24px (더 부드럽게)
  그림자: 0 8px 32px rgba(0,0,0,0.5)

Quiz Option Card:
  기본: 배경 #1A1A1A, 테두리 #2A2A2A
  선택 중: 테두리 #B8D43C (Primary)
  정답: 배경 #1B2E1B, 테두리 #4CAF50
  오답: 배경 #2E1B1B, 테두리 #F44336 + 쉐이크 애니메이션
```

### 2.3 탭 바 (Tab Bar)

```
┌────────────────────────────────────────┐
│  🏠         🎮         📊         ⚙️    │
│  홈         퀴즈       진도       설정  │
└────────────────────────────────────────┘
  배경: #0F0F0F
  활성 탭: 아이콘 #B8D43C + 라벨 #B8D43C + 하단 인디케이터
  비활성 탭: 아이콘 #666666 + 라벨 #666666
  높이: 80px (하단 Safe Area 포함)
  상단 구분선: 1px #1A1A1A
```

### 2.4 진행 바 (Progress Bar)

```
XP 진행 바:
[================--------] Lv.3 → Lv.4
  채운 부분: #B8D43C (라임)
  빈 부분: #2A2A2A
  높이: 8px
  모서리: 4px
  애니메이션: 수평 슬라이드 (Reanimated)

TOPIK 레벨 배지:
┌──────┐
│ L2  │
└──────┘
  배경: 해당 레벨 색상 (#2196F3 for L2)
  텍스트: #FFFFFF
  크기: 28×20px
  모서리: 4px
```

### 2.5 알림 / 토스트

```
성공 토스트:
┌──────────────────────────────────┐
│  ✅  정답! +15 XP               │
└──────────────────────────────────┘
  배경: #1B2E1B
  아이콘 색상: #4CAF50
  위치: 화면 상단 (Safe Area 아래)
  애니메이션: 슬라이드 인 from top → 2초 후 슬라이드 아웃

XP 획득 팝업 (레벨업 시):
  ┌────────────────┐
  │  🎉           │
  │  레벨 업!      │
  │  Lv.3 → Lv.4  │
  │  +50 XP       │
  └────────────────┘
  배경: Linear Gradient (#B8D43C33 → 투명)
  애니메이션: Scale 0.8 → 1.2 → 1.0 + 별 파티클
```

---

## 3. 화면별 디자인 가이드라인

### 3.1 홈 화면 개선 디자인

```
현재 문제:
- 상단 정보 밀도 과다 (XP, 레벨, 스트릭, 진도 모두 상단에)
- 그리드 카드 크기 불균일
- 광고 배너 플레이스홀더 UX 저해

개선 방향:

섹션 1: 헤더 (72px)
  왼쪽: [앱 로고 + 이름]
  오른쪽: [XP: 350 ⚡] [프로필 아바타]

섹션 2: 대시보드 카드 (높이 80px)
  ┌─────────────────────────────────┐
  │  🔥 7일     📚 140단어   ⭐ Lv3  │
  └─────────────────────────────────┘
  3개 지표를 가로 배열, 배경 카드에 통합

섹션 3: 오늘의 학습 CTA (full-width, 높이 120px)
  그라디언트 배경 (#1A1A2E → #2A2A4E)
  큰 타이포 + [시작하기 →] 버튼
  오늘 완료 시: 체크 표시 + "훌륭해요!" 상태로 변환

섹션 4: SRS 복습 배너 (있을 때만 표시)
  주황 테두리 + 숫자 배지

섹션 5: 기능 그리드 (3×2)
  카드 높이 통일: 80px
  아이콘 크기: 32px
  줄당 3개 → 더 많은 기능을 compact하게
```

### 3.2 단어 학습 화면 개선

```
현재 문제:
- 카드 진행 상황 표시 없음 (몇 번째 단어인지 모름)
- "알았어요/몰랐어요" 버튼이 크고 무거움
- 뒷면 관련 단어 버튼 작음

개선 방향:

상단:
  ← 뒤로   [3 / 20] ━━━━━━━━━━━   [★ 북마크]
  진행 바 (현재 위치 표시, 라임 그린)

카드 영역:
  카드 높이: 화면의 55% 차지
  단어 크기: 48px Bold (현재 유지)
  음절 분리: 16px, 각 음절 사이 공백 명확히

하단 버튼:
  [← 몰랐어요]        [알았어요 →]
  스와이프 힌트 제스처 (← →) 아이콘 표시
  버튼 높이: 56px
  오른쪽(알았어요): Primary 색상
  왼쪽(몰랐어요): 다크 회색
```

### 3.3 프리미엄 화면 개선

```
현재 문제:
- 가격 정보가 명확하지 않음
- "가장 인기" 등 소셜 프루프 없음
- 연간 플랜 절약 금액 강조 부족

개선 방향:

헤더:
  ✨ Klexi Premium
  부제: "한국어 마스터로 가는 지름길"

플랜 카드 (세로 배열):
  ┌─────────────────────────────────┐
  │  ⭐ 연간 플랜          [가장 인기] │
  │  $49.99 / 년                    │
  │  월 $4.17 — 48% 절약!           │
  │  (월간 대비 $46 절약)            │
  └─────────────────────────────────┘
  강조 테두리 (#B8D43C)

  ┌─────────────────────────────────┐
  │  월간 플랜                       │
  │  $7.99 / 월                     │
  └─────────────────────────────────┘

  ┌─────────────────────────────────┐
  │  💎 평생 이용권                  │
  │  $99.99 단 1회 결제             │
  │  최고 가성비 (2년 구독 비용)      │
  └─────────────────────────────────┘

소셜 프루프 섹션:
  ⭐⭐⭐⭐⭐ "달리 덕분에 TOPIK 2급 합격!"
  — @korean_learner_amy

기능 목록:
  ✅ 전체 6개 TOPIK 레벨
  ✅ K-컬처 테마 6개 전체
  ✅ AI 달리 무제한 대화
  ✅ 발음 녹음 비교
  ✅ 문장 연습
  ✅ 광고 없음

CTA: [지금 시작하기 →] (Primary, 풀 와이드)
하단: 언제든지 취소 가능 · 보안 결제
```

---

## 4. 마이크로 인터랙션 & 애니메이션

### 4.1 핵심 애니메이션 목록

| 애니메이션 | 트리거 | 스펙 |
|-----------|--------|------|
| 플래시카드 뒤집기 | 탭/스와이프 | rotateY 0→180°, duration 300ms, ease-out |
| XP 바 증가 | 단어 학습/퀴즈 완료 | width 애니메이션, duration 600ms, ease-in-out |
| 레벨업 팝업 | XP 임계치 도달 | scale 0.8→1.2→1.0, duration 500ms + 파티클 |
| 정답 체크 | 정답 선택 | opacity 0→1 + scale 0.8→1, 200ms |
| 오답 쉐이크 | 오답 선택 | translateX ±8px × 3, duration 400ms |
| 스트릭 불꽃 | 스트릭 증가 | scale 1→1.3→1, duration 300ms |
| 버튼 눌림 | pressIn | scale 1→0.95, duration 100ms |
| 카드 진입 | 화면 마운트 | opacity 0→1 + translateY 20→0, 300ms |
| 탭 전환 | 탭 탭 | 각 탭 컨텐츠 fade in, 200ms |

### 4.2 Reanimated 4 구현 참고

```typescript
// 플래시카드 뒤집기 (현재 구현 개선)
const flipCard = useCallback(() => {
  const toValue = isFlipped.value ? 0 : 1;

  rotateY.value = withSpring(toValue, {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  });

  isFlipped.value = !isFlipped.value;
}, []);

// 오답 쉐이크 (개선)
const shakeCard = useCallback(() => {
  translateX.value = withSequence(
    withTiming(-10, { duration: 60 }),
    withTiming(10, { duration: 60 }),
    withTiming(-8, { duration: 60 }),
    withTiming(8, { duration: 60 }),
    withTiming(-4, { duration: 60 }),
    withTiming(0, { duration: 60 }),
  );
}, []);
```

---

## 5. 아이콘 시스템

### 5.1 현재: Ionicons (@expo/vector-icons)

```typescript
// 일관된 아이콘 크기 기준
const IconSizes = {
  xs: 16,  // 인라인 텍스트 아이콘
  sm: 20,  // 버튼 내 아이콘
  md: 24,  // 표준 아이콘 (대부분)
  lg: 32,  // 기능 카드 아이콘
  xl: 48,  // 빈 상태(empty state) 아이콘
};

// 탭 아이콘 매핑 (현재 → 통일)
const TabIcons = {
  home: { active: 'home', inactive: 'home-outline' },
  quiz: { active: 'game-controller', inactive: 'game-controller-outline' },
  progress: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  settings: { active: 'settings', inactive: 'settings-outline' },
};
```

### 5.2 K-컬처 테마 아이콘 (현재 이모지 → 커스텀 SVG 권장)

```
현재:
🎭 K-Drama  🎵 K-Pop  🍜 K-Food  ✈️ Travel  💬 Internet  🙏 Manners

개선 권장:
커스텀 SVG 아이콘으로 브랜드 통일성 강화
(단기적으로는 이모지도 허용)
```

---

## 6. 빈 상태 (Empty State) 디자인

```
오답 없음:
  🎉
  [아직 오답 없어요!]
  "계속 잘하고 있어요"
  [단어 학습하기 →]

복습 예정 없음:
  📚
  [오늘 복습할 단어 없어요]
  "내일 다시 확인하세요"

커스텀 단어 없음:
  ✏️
  [아직 추가한 단어가 없어요]
  "직접 단어를 추가해보세요"
  [+ 새 단어 추가]

AI 채팅 시작:
  🤖
  "안녕하세요! 저는 달리예요."
  "무엇이든 한국어로 대화해봐요!"
  [추천 대화 주제 3개 버튼]
```

---

## 7. 다크 모드 전용 → 라이트 모드 추가 (선택적 개선)

```typescript
// constants/colors.ts 개선
export const lightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceLight: '#F0F0F0',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  // Primary 색상 동일 유지
  primary: '#7A9C1A',  // 다크 버전의 라임 그린 (라이트 모드에서 가독성)
};

// 사용
import { useColorScheme } from 'react-native';
const colorScheme = useColorScheme();
const colors = colorScheme === 'dark' ? darkColors : lightColors;
```

---

## 8. 디자인 체크리스트

### 일관성 확인
```
□ 모든 버튼이 동일한 높이 (52px) 사용
□ 모든 카드가 동일한 모서리 반지름 (16px) 사용
□ 색상이 constants/colors.ts에서만 참조됨 (하드코딩 없음)
□ 아이콘 크기가 정의된 스케일 준수
□ 폰트 크기가 타이포그래피 스케일 준수

접근성 확인
□ 텍스트 대비비 4.5:1 이상
□ 모든 터치 영역 44×44pt 이상
□ accessibilityLabel 모든 터치 요소에 추가
□ 색각 이상자 대응 (색상 외 아이콘/형태로 상태 구분)

애니메이션 확인
□ 감소된 동작(Reduced Motion) 설정 시 애니메이션 비활성화
□ 모든 애니메이션 useNativeDriver: true (또는 Reanimated 네이티브)
□ 애니메이션 지속 시간 100~600ms 범위
```
