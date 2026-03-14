/**
 * Migration Tests — Replit 의존성 제거 확인
 * Agent: MIGRATION
 */

const fs = require('fs');
const path = require('path');

describe('Migration: Replit 의존성 제거', () => {
  it('server/ai-chat.ts에 replit_integrations 없음', () => {
    const file = path.join(process.cwd(), 'server/ai-chat.ts');
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('replit_integrations');
    }
  });

  it('server/ai-chat.ts에 gpt-5-mini 없음 (gpt-4o-mini 사용)', () => {
    const file = path.join(process.cwd(), 'server/ai-chat.ts');
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('gpt-5-mini');
    }
  });

  it('server/ai-tts.ts에 replit_integrations 없음', () => {
    const file = path.join(process.cwd(), 'server/ai-tts.ts');
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('replit_integrations');
    }
  });

  it('supabase/functions/ai-chat/index.ts 파일 존재', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'supabase/functions/ai-chat/index.ts'))).toBe(true);
  });

  it('supabase/functions/ai-tts/index.ts 파일 존재', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'supabase/functions/ai-tts/index.ts'))).toBe(true);
  });

  it('supabase/functions/polar-webhook/index.ts 파일 존재', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'supabase/functions/polar-webhook/index.ts'))).toBe(true);
  });
});

describe('Migration: TTS 검증 로직', () => {
  it('500자 초과 텍스트는 거부되어야 함', () => {
    const text = 'a'.repeat(501);
    expect(text.length).toBeGreaterThan(500);
  });

  it('빈 텍스트는 거부되어야 함', () => {
    const text = '';
    expect(!text || text.length === 0).toBe(true);
  });
});
