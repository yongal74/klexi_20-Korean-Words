export interface GrammarPattern {
  pattern: string;
  meaning: string;
  level: string;
}

const GRAMMAR_PATTERNS: GrammarPattern[] = [
  { pattern: '~습니다/ㅂ니다', meaning: 'Formal polite ending', level: 'L1' },
  { pattern: '~아/어요', meaning: 'Informal polite ending', level: 'L1' },
  { pattern: '~고 싶다', meaning: 'Want to~', level: 'L1' },
  { pattern: '~을/를', meaning: 'Object particle', level: 'L1' },
  { pattern: '~이/가', meaning: 'Subject particle', level: 'L1' },
  { pattern: '~은/는', meaning: 'Topic particle', level: 'L1' },
  { pattern: '~에', meaning: 'Location/time particle', level: 'L1' },
  { pattern: '~에서', meaning: 'At/from (action location)', level: 'L1' },
  { pattern: '~(으)로', meaning: 'Direction/method', level: 'L1' },
  { pattern: '~와/과/하고', meaning: 'And/with', level: 'L1' },
  { pattern: '~주세요', meaning: 'Please give/do', level: 'L1' },
  { pattern: '~세요', meaning: 'Honorific request', level: 'L1' },
  { pattern: '~았/었어요', meaning: 'Past tense', level: 'L1' },
  { pattern: '~ㄹ/을 거예요', meaning: 'Future tense', level: 'L1' },
  { pattern: '~고 있다', meaning: 'Progressive (~ing)', level: 'L2' },
  { pattern: '~(으)ㄹ까요?', meaning: 'Shall we~?', level: 'L2' },
  { pattern: '~(으)ㄹ래요?', meaning: 'Would you like to~?', level: 'L2' },
  { pattern: '~지 마세요', meaning: "Don't~", level: 'L2' },
  { pattern: '~아/어 봤어요', meaning: 'Have tried~', level: 'L2' },
  { pattern: '~(으)면', meaning: 'If/when~', level: 'L2' },
  { pattern: '~아/어서', meaning: 'Because/so', level: 'L2' },
  { pattern: '~(으)니까', meaning: 'Because/since', level: 'L2' },
  { pattern: '~지만', meaning: 'But/however', level: 'L2' },
  { pattern: '~(으)ㄹ 수 있다', meaning: 'Can/able to~', level: 'L2' },
  { pattern: '~아/어야 하다', meaning: 'Must/have to~', level: 'L2' },
  { pattern: '~게 되다', meaning: 'End up ~ing', level: 'L3' },
  { pattern: '~(으)ㄹ 것 같다', meaning: 'Seems like~', level: 'L3' },
  { pattern: '~(으)ㄴ 적이 있다', meaning: 'Have experienced~', level: 'L3' },
  { pattern: '~(으)면서', meaning: 'While ~ing', level: 'L3' },
  { pattern: '~기 때문에', meaning: 'Because~', level: 'L3' },
  { pattern: '~도록', meaning: 'So that/in order to', level: 'L3' },
  { pattern: '~(으)ㄹ 뿐만 아니라', meaning: 'Not only~ but also', level: 'L4' },
  { pattern: '~(으)ㄴ/는 반면에', meaning: 'On the other hand', level: 'L4' },
  { pattern: '~(으)ㄴ/는 데 비해', meaning: 'Compared to~', level: 'L4' },
  { pattern: '~(으)ㄹ 수밖에 없다', meaning: 'Have no choice but~', level: 'L4' },
  { pattern: '~(으)ㄴ/는 셈이다', meaning: 'It amounts to~', level: 'L5' },
  { pattern: '~(으)ㄹ 따름이다', meaning: 'Can only~', level: 'L5' },
  { pattern: '~에 불과하다', meaning: 'Is merely~', level: 'L5' },
  { pattern: '~(으)ㄹ 뿐이다', meaning: 'Only/just~', level: 'L5' },
  { pattern: '~기는커녕', meaning: 'Far from~', level: 'L6' },
  { pattern: '~(으)ㄹ 리가 없다', meaning: 'There is no way~', level: 'L6' },
  { pattern: '~(으)ㄴ/는 바', meaning: 'What/that which~', level: 'L6' },
];

const PATTERN_KEYWORDS: [string, string][] = [
  ['고 싶어', '~고 싶다'],
  ['고 싶습니', '~고 싶다'],
  ['습니다', '~습니다/ㅂ니다'],
  ['ㅂ니다', '~습니다/ㅂ니다'],
  ['아요', '~아/어요'],
  ['어요', '~아/어요'],
  ['해요', '~아/어요'],
  ['주세요', '~주세요'],
  ['세요', '~세요'],
  ['았어요', '~았/었어요'],
  ['었어요', '~았/었어요'],
  ['였어요', '~았/었어요'],
  ['ㄹ 거예요', '~ㄹ/을 거예요'],
  ['을 거예요', '~ㄹ/을 거예요'],
  ['고 있', '~고 있다'],
  ['ㄹ까요', '~(으)ㄹ까요?'],
  ['을까요', '~(으)ㄹ까요?'],
  ['ㄹ래요', '~(으)ㄹ래요?'],
  ['을래요', '~(으)ㄹ래요?'],
  ['지 마', '~지 마세요'],
  ['아 봤', '~아/어 봤어요'],
  ['어 봤', '~아/어 봤어요'],
  ['해 봤', '~아/어 봤어요'],
  ['으면', '~(으)면'],
  ['아서', '~아/어서'],
  ['어서', '~아/어서'],
  ['해서', '~아/어서'],
  ['니까', '~(으)니까'],
  ['지만', '~지만'],
  ['ㄹ 수 있', '~(으)ㄹ 수 있다'],
  ['을 수 있', '~(으)ㄹ 수 있다'],
  ['아야 하', '~아/어야 하다'],
  ['어야 하', '~아/어야 하다'],
  ['해야 하', '~아/어야 하다'],
  ['게 되', '~게 되다'],
  ['것 같', '~(으)ㄹ 것 같다'],
  ['ㄴ 적이 있', '~(으)ㄴ 적이 있다'],
  ['은 적이 있', '~(으)ㄴ 적이 있다'],
  ['으면서', '~(으)면서'],
  ['면서', '~(으)면서'],
  ['기 때문에', '~기 때문에'],
  ['도록', '~도록'],
];

export function detectGrammarPatterns(sentence: string): GrammarPattern[] {
  const found: GrammarPattern[] = [];
  const seenPatterns = new Set<string>();
  for (const [keyword, patternName] of PATTERN_KEYWORDS) {
    if (sentence.includes(keyword) && !seenPatterns.has(patternName)) {
      const pattern = GRAMMAR_PATTERNS.find(p => p.pattern === patternName);
      if (pattern) {
        found.push(pattern);
        seenPatterns.add(patternName);
      }
    }
  }
  return found.slice(0, 3);
}

export function getPatternsByLevel(level: string): GrammarPattern[] {
  return GRAMMAR_PATTERNS.filter(p => p.level === level);
}
