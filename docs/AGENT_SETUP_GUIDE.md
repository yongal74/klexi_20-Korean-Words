# AGENT_SETUP_GUIDE.md — Claude Code 멀티 에이전트 세팅 가이드
### 처음 사용자를 위한 단계별 가이드

---

## 멀티 에이전트란?

```
일반 개발:
  [터미널 1개] → Claude 1개 → 한 번에 하나씩

멀티 에이전트:
  [터미널 1] → Claude Agent 1 → agent/migration 브랜치 작업
  [터미널 2] → Claude Agent 2 → agent/security 브랜치 작업
  [터미널 3] → Claude Agent 3 → agent/auth 브랜치 작업

→ 동시에 3개 기능 개발 진행!
```

핵심 개념: **Git Worktree** = 같은 레포를 여러 폴더에 동시에 체크아웃
각 폴더에서 독립적인 Claude Code 인스턴스 실행

---

## Step 0: 사전 준비 (1회만)

```bash
# 프로젝트 폴더로 이동
cd /c/Users/장우경/TwentyKorean/Daily-Word-Mastery

# 현재 상태 커밋 (워킹 트리가 깨끗해야 함)
git add -A
git commit -m "chore: multi-agent 개발 시작 전 스냅샷"

# main 브랜치인지 확인
git branch  # * main 또는 * master 확인
```

---

## Step 1: Git Worktree 5개 생성

```bash
# 현재 위치: C:/Users/장우경/TwentyKorean/Daily-Word-Mastery

# 에이전트별 브랜치 + 워크트리 동시 생성
git worktree add ../klexi-migration -b agent/migration
git worktree add ../klexi-security  -b agent/security
git worktree add ../klexi-auth      -b agent/auth
git worktree add ../klexi-notify    -b agent/notify
git worktree add ../klexi-analytics -b agent/analytics

# 확인
git worktree list
```

실행 후 폴더 구조:
```
TwentyKorean/
├── Daily-Word-Mastery/   ← main 브랜치 (원본)
├── klexi-migration/      ← 에이전트 1 작업 폴더
├── klexi-security/       ← 에이전트 2 작업 폴더
├── klexi-auth/           ← 에이전트 3 작업 폴더
├── klexi-notify/         ← 에이전트 4 작업 폴더
└── klexi-analytics/      ← 에이전트 5 작업 폴더
```

---

## Step 2: 각 워크트리에 에이전트 지시서(CLAUDE.md) 복사

```bash
# 각 워크트리에 해당 에이전트 CLAUDE.md 복사
cp docs/agents/migration-claude.md  ../klexi-migration/CLAUDE.md
cp docs/agents/security-claude.md   ../klexi-security/CLAUDE.md
cp docs/agents/auth-claude.md       ../klexi-auth/CLAUDE.md
cp docs/agents/notify-claude.md     ../klexi-notify/CLAUDE.md
cp docs/agents/analytics-claude.md  ../klexi-analytics/CLAUDE.md
```

---

## Step 3: 각 워크트리에 node_modules 심볼릭 링크

```bash
# node_modules를 각 워크트리에 복사하면 용량 낭비 (600MB × 5)
# 심볼릭 링크로 공유

# Windows (Git Bash에서)
ln -s /c/Users/장우경/TwentyKorean/Daily-Word-Mastery/node_modules \
      /c/Users/장우경/TwentyKorean/klexi-migration/node_modules

ln -s /c/Users/장우경/TwentyKorean/Daily-Word-Mastery/node_modules \
      /c/Users/장우경/TwentyKorean/klexi-security/node_modules

ln -s /c/Users/장우경/TwentyKorean/Daily-Word-Mastery/node_modules \
      /c/Users/장우경/TwentyKorean/klexi-auth/node_modules

ln -s /c/Users/장우경/TwentyKorean/Daily-Word-Mastery/node_modules \
      /c/Users/장우경/TwentyKorean/klexi-notify/node_modules

ln -s /c/Users/장우경/TwentyKorean/Daily-Word-Mastery/node_modules \
      /c/Users/장우경/TwentyKorean/klexi-analytics/node_modules
```

---

## Step 4: 터미널 5개 열고 Claude Code 실행

```
[터미널 1 — 에이전트 MIGRATION]
cd /c/Users/장우경/TwentyKorean/klexi-migration
claude   ← Claude Code 실행

[터미널 2 — 에이전트 SECURITY]
cd /c/Users/장우경/TwentyKorean/klexi-security
claude

[터미널 3 — 에이전트 AUTH]
cd /c/Users/장우경/TwentyKorean/klexi-auth
claude

[터미널 4 — 에이전트 NOTIFY]
cd /c/Users/장우경/TwentyKorean/klexi-notify
claude

[터미널 5 — 에이전트 ANALYTICS]
cd /c/Users/장우경/TwentyKorean/klexi-analytics
claude
```

---

## Step 5: 각 Claude에게 시작 명령

각 터미널의 Claude에게 동일한 첫 마디:

```
CLAUDE.md를 읽고 이 에이전트의 임무를 파악한 후,
TDD 방식으로 개발을 시작해줘.
먼저 테스트 파일을 작성하고, 그 다음 구현해줘.
```

---

## Step 6: 에이전트 작업 모니터링

```bash
# 각 에이전트의 진행 상황 확인 (원본 폴더에서)
cd /c/Users/장우경/TwentyKorean/Daily-Word-Mastery

# 모든 브랜치 커밋 현황
git log --oneline --all --graph

# 특정 에이전트 변경사항 확인
git diff main..agent/migration
git diff main..agent/security
```

---

## Step 7: 에이전트 작업 완료 후 머지

```bash
cd /c/Users/장우경/TwentyKorean/Daily-Word-Mastery

# 1. security 먼저 머지 (TypeScript 에러 해소)
git checkout main
git merge agent/security --no-ff -m "feat: 보안 수정 + TypeScript 에러 해소"

# 2. migration 머지
git merge agent/migration --no-ff -m "feat: Replit → Railway 마이그레이션 완료"

# 3. 충돌 있으면
git status  # 충돌 파일 확인
# 충돌 해결 후
git add -A
git merge --continue

# 4. auth, notify, analytics 순서대로
git merge agent/auth --no-ff -m "feat: Google 소셜 로그인 구현"
git merge agent/notify --no-ff -m "feat: 푸시 알림 구현"
git merge agent/analytics --no-ff -m "feat: Firebase Analytics 연동"
```

---

## Step 8: 워크트리 정리 (머지 완료 후)

```bash
# 작업 완료된 워크트리 제거
git worktree remove ../klexi-security
git worktree remove ../klexi-migration
git worktree remove ../klexi-auth
git worktree remove ../klexi-notify
git worktree remove ../klexi-analytics

# 브랜치도 삭제 (선택)
git branch -d agent/security
git branch -d agent/migration
git branch -d agent/auth
git branch -d agent/notify
git branch -d agent/analytics
```

---

## 에이전트 간 의존성 처리

```
에이전트가 서로의 코드가 필요한 경우:

예) auth 에이전트가 migration에서 수정된 server/index.ts 필요
→ migration 에이전트가 해당 변경사항 커밋
→ auth 워크트리에서:
   git fetch origin
   git cherry-pick <migration의 해당 커밋 해시>
```

---

## 자주 발생하는 문제

### 문제 1: 워크트리에서 npm install이 안 됨
```bash
# 해결: 심볼릭 링크 대신 실제 install
cd /c/Users/장우경/TwentyKorean/klexi-migration
npm install
```

### 문제 2: 두 에이전트가 같은 파일 수정
```bash
# 머지 시 충돌 발생 — Claude에게 요청:
# "머지 충돌이 발생했어. git status 확인하고 해결해줘"
```

### 문제 3: 에이전트가 잘못된 방향으로 개발 중
```bash
# 해당 에이전트 브랜치 리셋
git checkout agent/migration
git reset --hard main  # main으로 완전 리셋
# Claude에게 다시 시작 요청
```
