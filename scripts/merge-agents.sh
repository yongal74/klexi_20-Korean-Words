#!/bin/bash
# merge-agents.sh — 에이전트 작업 머지 스크립트

set -e

PROJECT_DIR="/c/Users/장우경/TwentyKorean/Daily-Word-Mastery"
cd "$PROJECT_DIR"

echo "🔀 Klexi 에이전트 머지 시작..."
echo ""

# 함수: 브랜치 존재 확인
branch_exists() {
  git show-ref --verify --quiet "refs/heads/$1"
}

# 함수: 테스트 통과 확인
run_tests() {
  echo "🧪 테스트 실행 중..."
  if npm test -- --passWithNoTests --silent; then
    echo "✅ 테스트 통과"
    return 0
  else
    echo "❌ 테스트 실패 — 머지 중단"
    return 1
  fi
}

# 함수: TypeScript 확인
check_typescript() {
  echo "📝 TypeScript 체크..."
  if npx tsc --noEmit; then
    echo "✅ TypeScript 에러 없음"
    return 0
  else
    echo "❌ TypeScript 에러 발생 — 머지 중단"
    return 1
  fi
}

git checkout main

# ──────────────────────────────────────────
# Step 1: security (가장 먼저)
# ──────────────────────────────────────────
if branch_exists "agent/security"; then
  echo "━━━ [1/5] agent/security 머지 ━━━"
  git merge agent/security --no-ff -m "feat: 보안 수정 + TypeScript 에러 해소 + 핵심 로직 테스트" || {
    echo "⚠️  충돌 발생! 수동으로 해결 후 'git merge --continue' 실행"
    exit 1
  }
  check_typescript
  run_tests
  echo "✅ security 머지 완료"
  echo ""
else
  echo "⏭️  agent/security 브랜치 없음 — 스킵"
fi

# ──────────────────────────────────────────
# Step 2: migration
# ──────────────────────────────────────────
if branch_exists "agent/migration"; then
  echo "━━━ [2/5] agent/migration 머지 ━━━"
  git merge agent/migration --no-ff -m "feat: Replit 제거, Supabase Edge Functions 마이그레이션" || {
    echo "⚠️  충돌 발생! 수동으로 해결 후 'git merge --continue' 실행"
    exit 1
  }
  check_typescript
  run_tests
  echo "✅ migration 머지 완료"
  echo ""
else
  echo "⏭️  agent/migration 브랜치 없음 — 스킵"
fi

# ──────────────────────────────────────────
# Step 3: auth
# ──────────────────────────────────────────
if branch_exists "agent/auth"; then
  echo "━━━ [3/5] agent/auth 머지 ━━━"
  git merge agent/auth --no-ff -m "feat: Google OAuth 소셜 로그인 구현" || {
    echo "⚠️  충돌 발생! 수동으로 해결 후 'git merge --continue' 실행"
    exit 1
  }
  run_tests
  echo "✅ auth 머지 완료"
  echo ""
fi

# ──────────────────────────────────────────
# Step 4: notify
# ──────────────────────────────────────────
if branch_exists "agent/notify"; then
  echo "━━━ [4/5] agent/notify 머지 ━━━"
  git merge agent/notify --no-ff -m "feat: 푸시 알림 구현" || {
    echo "⚠️  충돌 발생! 수동으로 해결 후 'git merge --continue' 실행"
    exit 1
  }
  run_tests
  echo "✅ notify 머지 완료"
  echo ""
fi

# ──────────────────────────────────────────
# Step 5: analytics
# ──────────────────────────────────────────
if branch_exists "agent/analytics"; then
  echo "━━━ [5/5] agent/analytics 머지 ━━━"
  git merge agent/analytics --no-ff -m "feat: Firebase Analytics 연동" || {
    echo "⚠️  충돌 발생! 수동으로 해결 후 'git merge --continue' 실행"
    exit 1
  }
  run_tests
  echo "✅ analytics 머지 완료"
  echo ""
fi

# ──────────────────────────────────────────
# 최종 확인
# ──────────────────────────────────────────
echo "════════════════════════════════════════"
echo "최종 TypeScript 검사..."
check_typescript

echo ""
echo "최종 테스트 실행..."
npm test -- --coverage --silent

echo ""
echo "🎉 모든 머지 완료!"
echo ""
echo "다음 단계:"
echo "  1. EAS 빌드: eas build --platform android --profile production"
echo "  2. Supabase Edge Functions 배포: supabase functions deploy"
echo "════════════════════════════════════════"
