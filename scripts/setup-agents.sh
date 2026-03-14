#!/bin/bash
# setup-agents.sh — 멀티 에이전트 환경 한 번에 세팅

set -e

PROJECT_DIR="/c/Users/장우경/TwentyKorean/Daily-Word-Mastery"
PARENT_DIR="/c/Users/장우경/TwentyKorean"

echo "🚀 Klexi 멀티 에이전트 환경 세팅 시작..."
echo ""

# 현재 디렉토리 확인
cd "$PROJECT_DIR"

# 작업 트리 깨끗한지 확인
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  커밋되지 않은 변경사항이 있습니다."
  echo "   git add -A && git commit -m 'chore: agent 세팅 전 스냅샷' 을 먼저 실행하세요"
  exit 1
fi

echo "✅ 작업 트리 깨끗함 확인"

# 기존 워크트리 있으면 제거
for agent in migration security auth notify analytics; do
  WORKTREE="$PARENT_DIR/klexi-$agent"
  if [ -d "$WORKTREE" ]; then
    echo "🧹 기존 워크트리 제거: klexi-$agent"
    git worktree remove "$WORKTREE" --force 2>/dev/null || true
    git branch -D "agent/$agent" 2>/dev/null || true
  fi
done

echo ""
echo "📂 Git 워크트리 5개 생성 중..."

# 워크트리 생성
git worktree add "$PARENT_DIR/klexi-migration"  -b agent/migration
git worktree add "$PARENT_DIR/klexi-security"   -b agent/security
git worktree add "$PARENT_DIR/klexi-auth"       -b agent/auth
git worktree add "$PARENT_DIR/klexi-notify"     -b agent/notify
git worktree add "$PARENT_DIR/klexi-analytics"  -b agent/analytics

echo "✅ 워크트리 생성 완료"
echo ""

echo "📋 CLAUDE.md (에이전트 지시서) 복사 중..."

cp "$PROJECT_DIR/docs/agents/migration-claude.md"  "$PARENT_DIR/klexi-migration/CLAUDE.md"
cp "$PROJECT_DIR/docs/agents/security-claude.md"   "$PARENT_DIR/klexi-security/CLAUDE.md"
cp "$PROJECT_DIR/docs/agents/auth-claude.md"       "$PARENT_DIR/klexi-auth/CLAUDE.md"
cp "$PROJECT_DIR/docs/agents/notify-claude.md"     "$PARENT_DIR/klexi-notify/CLAUDE.md"
cp "$PROJECT_DIR/docs/agents/analytics-claude.md"  "$PARENT_DIR/klexi-analytics/CLAUDE.md"

echo "✅ CLAUDE.md 복사 완료"
echo ""

echo "🔗 node_modules 심볼릭 링크 생성 중..."

for agent in migration security auth notify analytics; do
  WORKTREE="$PARENT_DIR/klexi-$agent"
  if [ ! -d "$WORKTREE/node_modules" ]; then
    ln -s "$PROJECT_DIR/node_modules" "$WORKTREE/node_modules"
    echo "   ✓ klexi-$agent/node_modules → (공유)"
  fi
done

echo "✅ 심볼릭 링크 완료"
echo ""

# 워크트리 목록 출력
echo "📋 생성된 워크트리 목록:"
git worktree list
echo ""

echo "════════════════════════════════════════"
echo "✨ 세팅 완료! 이제 아래 순서대로 진행하세요:"
echo ""
echo "1. 터미널 5개 열기"
echo ""
echo "   [터미널 1] cd $PARENT_DIR/klexi-migration && claude"
echo "   [터미널 2] cd $PARENT_DIR/klexi-security && claude"
echo "   [터미널 3] cd $PARENT_DIR/klexi-auth && claude"
echo "   [터미널 4] cd $PARENT_DIR/klexi-notify && claude"
echo "   [터미널 5] cd $PARENT_DIR/klexi-analytics && claude"
echo ""
echo "2. 각 Claude에게 시작 명령:"
echo "   'CLAUDE.md를 읽고 TDD 방식으로 개발을 시작해줘'"
echo ""
echo "3. 머지 순서: security → migration → auth → notify → analytics"
echo "════════════════════════════════════════"
