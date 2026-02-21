import { Word } from './vocabulary';

export type RelationType =
  | 'morphological'
  | 'semantic_field'
  | 'synonym'
  | 'antonym'
  | 'hypernym'
  | 'hyponym'
  | 'collocation'
  | 'register'
  | 'derivation'
  | 'compound';

export interface WordConnection {
  word: Word;
  relationType: RelationType;
  relationLabel: string;
  strength: number;
}

const RELATION_LABELS: Record<RelationType, string> = {
  morphological: '형태소 관련',
  semantic_field: '의미장',
  synonym: '유의어',
  antonym: '반의어',
  hypernym: '상위어',
  hyponym: '하위어',
  collocation: '연어',
  register: '높임/낮춤',
  derivation: '파생어',
  compound: '합성어',
};

const RELATION_COLORS: Record<RelationType, string> = {
  morphological: '#FF6B6B',
  semantic_field: '#4ECDC4',
  synonym: '#45B7D1',
  antonym: '#FF8E8E',
  hypernym: '#96CEB4',
  hyponym: '#FFEAA7',
  collocation: '#DDA0DD',
  register: '#FFE66D',
  derivation: '#C98A5E',
  compound: '#9B8EC4',
};

export { RELATION_LABELS, RELATION_COLORS };

const KOREAN_VERB_STEMS: Record<string, string[]> = {
  '가': ['가다', '나가다', '올라가다', '내려가다', '돌아가다', '걸어가다', '뛰어가다', '들어가다', '지나가다', '따라가다'],
  '오': ['오다', '나오다', '들어오다', '돌아오다', '올라오다', '내려오다', '찾아오다'],
  '하': ['하다', '공부하다', '운동하다', '요리하다', '일하다', '시작하다', '준비하다', '사랑하다', '연습하다', '노력하다', '이해하다', '설명하다', '결정하다', '선택하다', '경험하다', '참여하다', '도착하다', '출발하다', '여행하다', '이동하다', '소개하다', '약속하다', '전화하다', '주문하다', '계산하다', '졸업하다', '입학하다', '취직하다'],
  '보': ['보다', '바라보다', '내려다보다', '올려다보다', '지켜보다', '돌아보다', '살펴보다'],
  '먹': ['먹다', '잡아먹다', '들어먹다'],
  '살': ['살다', '살아가다', '살아남다', '살펴보다'],
  '쓰': ['쓰다', '쓰이다', '써놓다', '쓰러지다'],
  '듣': ['듣다', '들리다', '들어보다'],
  '읽': ['읽다', '읽히다', '읽어보다'],
  '놀': ['놀다', '놀라다', '놀리다'],
  '배우': ['배우다', '배워가다'],
  '만나': ['만나다', '만남'],
  '잡': ['잡다', '잡히다', '붙잡다'],
  '나': ['나다', '나오다', '나가다', '나타나다', '나누다'],
};

const SYNONYM_MAP: Record<string, string[]> = {
  '예쁘다': ['아름답다', '곱다', '매력적이다'],
  '아름답다': ['예쁘다', '곱다', '화려하다'],
  '크다': ['거대하다', '넓다', '방대하다'],
  '작다': ['적다', '소규모의', '미세한'],
  '좋다': ['훌륭하다', '멋지다', '괜찮다'],
  '나쁘다': ['안 좋다', '불량하다', '형편없다'],
  '빠르다': ['신속하다', '재빠르다', '급하다'],
  '느리다': ['더디다', '천천히', '늦다'],
  '많다': ['풍부하다', '다수의', '넘치다'],
  '적다': ['부족하다', '드물다', '모자라다'],
  '기쁘다': ['즐겁다', '행복하다', '반갑다', '흐뭇하다'],
  '슬프다': ['우울하다', '서럽다', '비통하다'],
  '말하다': ['이야기하다', '대화하다', '얘기하다', '발표하다'],
  '보다': ['관찰하다', '바라보다', '감상하다', '지켜보다'],
  '먹다': ['식사하다', '드시다', '섭취하다'],
  '주다': ['제공하다', '전달하다', '건네다'],
  '받다': ['수령하다', '획득하다', '얻다'],
  '가다': ['이동하다', '향하다', '출발하다'],
  '오다': ['도착하다', '방문하다', '찾아오다'],
  '사다': ['구매하다', '구입하다', '장만하다'],
  '팔다': ['판매하다', '내놓다'],
  '알다': ['이해하다', '파악하다', '깨닫다', '인식하다'],
  '모르다': ['이해 못하다', '무지하다'],
  '걷다': ['산책하다', '거닐다', '보행하다'],
  '뛰다': ['달리다', '도약하다'],
  '웃다': ['미소짓다', '웃음짓다'],
  '울다': ['눈물 흘리다', '통곡하다', '오열하다'],
  '집': ['가정', '주택', '거주지', '주거지'],
  '학교': ['학원', '교육 기관'],
  '음식': ['식품', '먹을 것', '식량', '요리'],
  '사람': ['인간', '인물', '개인', '남', '여'],
  '친구': ['벗', '동료', '동무', '지인'],
  '돈': ['금전', '자금', '화폐', '재산'],
  '시간': ['때', '시기', '시각', '기간'],
  '일': ['업무', '작업', '직무', '노동'],
  '물': ['수분', '음료수'],
  '나라': ['국가', '국토', '조국'],
};

const ANTONYM_MAP: Record<string, string[]> = {
  '크다': ['작다', '적다'],
  '작다': ['크다', '거대하다'],
  '좋다': ['나쁘다', '싫다'],
  '나쁘다': ['좋다', '훌륭하다'],
  '빠르다': ['느리다', '더디다'],
  '느리다': ['빠르다', '신속하다'],
  '많다': ['적다', '모자라다'],
  '적다': ['많다', '넘치다'],
  '높다': ['낮다', '짧다'],
  '낮다': ['높다', '길다'],
  '넓다': ['좁다'],
  '좁다': ['넓다', '크다'],
  '길다': ['짧다'],
  '짧다': ['길다'],
  '밝다': ['어둡다'],
  '어둡다': ['밝다'],
  '뜨겁다': ['차갑다', '시원하다'],
  '차갑다': ['뜨겁다', '따뜻하다'],
  '무겁다': ['가볍다'],
  '가볍다': ['무겁다'],
  '덥다': ['춥다', '시원하다'],
  '춥다': ['덥다', '따뜻하다'],
  '새롭다': ['오래되다', '낡다'],
  '오래되다': ['새롭다'],
  '기쁘다': ['슬프다', '우울하다'],
  '슬프다': ['기쁘다', '즐겁다'],
  '사다': ['팔다'],
  '팔다': ['사다'],
  '오다': ['가다'],
  '가다': ['오다'],
  '주다': ['받다'],
  '받다': ['주다'],
  '열다': ['닫다'],
  '닫다': ['열다'],
  '시작하다': ['끝나다', '마치다'],
  '끝나다': ['시작하다', '시작되다'],
  '이기다': ['지다'],
  '지다': ['이기다'],
  '남자': ['여자'],
  '여자': ['남자'],
  '아버지': ['어머니'],
  '어머니': ['아버지'],
  '형': ['동생'],
  '언니': ['동생'],
  '오빠': ['동생'],
  '누나': ['동생'],
  '아침': ['저녁'],
  '저녁': ['아침'],
  '낮': ['밤'],
  '밤': ['낮'],
  '봄': ['가을'],
  '여름': ['겨울'],
  '가을': ['봄'],
  '겨울': ['여름'],
  '왼쪽': ['오른쪽'],
  '오른쪽': ['왼쪽'],
  '위': ['아래'],
  '아래': ['위'],
  '앞': ['뒤'],
  '뒤': ['앞'],
  '안': ['밖'],
  '밖': ['안'],
};

const SEMANTIC_FIELD_MAP: Record<string, string[]> = {
  'greeting_social': ['Greetings & Manners', 'Communication', 'Social Relationships'],
  'family_people': ['Family & People', 'Social Relationships', 'People & Relationships'],
  'food_cooking': ['Food & Drinks', 'Korean Food Culture', 'Cooking & Cuisine'],
  'education_study': ['Education', 'Academic Writing', 'School & Education'],
  'time_calendar': ['Time & Calendar', 'Daily Life', 'Seasons & Weather'],
  'body_health': ['Body Parts', 'Medicine & Health', 'Health & Wellness', 'Sports & Exercise'],
  'nature_environment': ['Animals', 'Environment & Nature', 'Nature & Geography', 'Seasons & Weather'],
  'work_business': ['Workplace & Career', 'Business & Economics', 'Business & Economy'],
  'travel_places': ['Travel & Tourism', 'Places & Locations', 'Transportation'],
  'culture_arts': ['Arts & Culture', 'K-Culture', 'Literature & Writing', 'Media & Entertainment', 'Entertainment'],
  'emotions_psych': ['Psychology & Emotions', 'Emotions', 'Philosophy & Abstract'],
  'law_politics': ['Law & Justice', 'Law & Legal', 'Politics & Government', 'Social Issues'],
  'science_tech': ['Science & Technology', 'Science & Innovation'],
  'numbers_math': ['Numbers', 'Mathematics'],
  'verbs_actions': ['Basic Verbs', 'Verbs & Adjectives Extended'],
  'adjectives_desc': ['Basic Adjectives', 'Verbs & Adjectives Extended'],
};

const HYPERNYM_MAP: Record<string, string[]> = {
  '동물': ['강아지', '고양이', '새', '물고기', '토끼', '말', '소', '돼지', '닭', '곰'],
  '음식': ['밥', '빵', '국', '고기', '생선', '과일', '야채', '면', '김치', '떡'],
  '과일': ['사과', '배', '포도', '바나나', '딸기', '수박', '감', '귤', '오렌지', '복숭아'],
  '야채': ['배추', '무', '양파', '마늘', '파', '당근', '감자', '고구마', '오이', '토마토'],
  '음료': ['물', '커피', '차', '주스', '우유', '술', '맥주', '소주', '콜라'],
  '가족': ['아버지', '어머니', '형', '누나', '오빠', '언니', '동생', '할아버지', '할머니'],
  '운동': ['축구', '야구', '농구', '수영', '달리기', '태권도', '탁구', '배구'],
  '색깔': ['빨간색', '파란색', '노란색', '초록색', '하얀색', '검정색', '주황색', '보라색'],
  '교통수단': ['버스', '택시', '지하철', '기차', '비행기', '자전거', '배', '자동차'],
  '장소': ['학교', '병원', '은행', '우체국', '시장', '공원', '도서관', '식당', '회사'],
  '날씨': ['비', '눈', '바람', '구름', '태풍', '안개'],
  '계절': ['봄', '여름', '가을', '겨울'],
  '옷': ['바지', '치마', '셔츠', '모자', '양말', '신발', '코트', '자켓'],
  '가구': ['침대', '책상', '의자', '소파', '식탁', '옷장', '서랍장'],
  '직업': ['의사', '선생님', '경찰관', '소방관', '요리사', '가수', '배우', '간호사', '변호사'],
  '감정': ['기쁨', '슬픔', '분노', '두려움', '놀람', '행복', '불안', '외로움'],
  '신체': ['머리', '눈', '코', '입', '귀', '손', '발', '팔', '다리', '어깨'],
};

const COLLOCATION_MAP: Record<string, string[]> = {
  '밥': ['밥을 먹다', '밥을 짓다', '밥을 차리다', '밥맛', '밥상'],
  '물': ['물을 마시다', '물을 끓이다', '물이 흐르다'],
  '길': ['길을 가다', '길을 찾다', '길을 건너다', '길을 잃다'],
  '꿈': ['꿈을 꾸다', '꿈을 이루다', '꿈이 있다'],
  '마음': ['마음을 먹다', '마음이 아프다', '마음을 열다', '마음에 들다'],
  '약속': ['약속을 지키다', '약속을 하다', '약속을 잡다', '약속을 어기다'],
  '시험': ['시험을 보다', '시험에 합격하다', '시험에 떨어지다', '시험 공부'],
  '사진': ['사진을 찍다', '사진을 보다'],
  '전화': ['전화를 하다', '전화를 걸다', '전화를 받다', '전화를 끊다'],
  '노래': ['노래를 부르다', '노래를 듣다', '노래를 배우다'],
  '운동': ['운동을 하다', '운동을 시작하다'],
  '일': ['일을 하다', '일이 많다', '일이 끝나다', '일을 시작하다'],
  '생각': ['생각을 하다', '생각이 나다', '생각이 많다'],
  '이야기': ['이야기를 하다', '이야기를 듣다', '이야기를 나누다'],
  '영화': ['영화를 보다', '영화를 만들다', '영화에 나오다'],
  '책': ['책을 읽다', '책을 쓰다', '책을 사다'],
  '편지': ['편지를 쓰다', '편지를 보내다', '편지를 받다'],
};

const REGISTER_MAP: Record<string, { formal: string; informal: string; honorific?: string }> = {
  '먹다': { formal: '드시다', informal: '먹어', honorific: '잡수시다' },
  '자다': { formal: '주무시다', informal: '자', honorific: '주무시다' },
  '있다': { formal: '계시다', informal: '있어', honorific: '계시다' },
  '말하다': { formal: '말씀하시다', informal: '말해', honorific: '말씀하시다' },
  '보다': { formal: '보시다', informal: '봐', honorific: '보시다' },
  '가다': { formal: '가시다', informal: '가', honorific: '가시다' },
  '오다': { formal: '오시다', informal: '와', honorific: '오시다' },
  '주다': { formal: '드리다', informal: '줘', honorific: '드리다' },
  '알다': { formal: '아시다', informal: '알아', honorific: '아시다' },
  '죽다': { formal: '돌아가시다', informal: '죽어', honorific: '돌아가시다' },
  '아프다': { formal: '편찮으시다', informal: '아파', honorific: '편찮으시다' },
  '이름': { formal: '성함', informal: '이름', honorific: '성함' },
  '나이': { formal: '연세', informal: '나이', honorific: '연세' },
  '집': { formal: '댁', informal: '집', honorific: '댁' },
  '말': { formal: '말씀', informal: '말', honorific: '말씀' },
  '밥': { formal: '식사', informal: '밥', honorific: '진지' },
  '사람': { formal: '분', informal: '사람', honorific: '분' },
};

function findMorphologicalConnections(word: Word, allWords: Word[]): WordConnection[] {
  const connections: WordConnection[] = [];
  const kr = word.korean;

  for (const [stem, family] of Object.entries(KOREAN_VERB_STEMS)) {
    if (family.includes(kr)) {
      for (const related of family) {
        if (related !== kr) {
          const match = allWords.find(w => w.korean === related);
          if (match) {
            connections.push({
              word: match,
              relationType: 'morphological',
              relationLabel: `어근 '${stem}' 공유`,
              strength: 0.9,
            });
          }
        }
      }
      break;
    }
  }

  if (kr.endsWith('하다') && kr.length > 2) {
    const nounPart = kr.slice(0, -2);
    const nounMatch = allWords.find(w => w.korean === nounPart);
    if (nounMatch) {
      connections.push({
        word: nounMatch,
        relationType: 'derivation',
        relationLabel: '명사-동사 파생',
        strength: 0.95,
      });
    }
    const relatedVerbs = allWords.filter(w =>
      w.korean.endsWith('하다') && w.korean !== kr && w.category === word.category
    ).slice(0, 3);
    relatedVerbs.forEach(w => {
      connections.push({
        word: w,
        relationType: 'derivation',
        relationLabel: '-하다 동사 패턴',
        strength: 0.6,
      });
    });
  }

  const compoundParts = allWords.filter(w =>
    w.korean !== kr && kr.length > 2 && (kr.includes(w.korean) || w.korean.includes(kr)) && w.korean.length >= 2
  ).slice(0, 3);
  compoundParts.forEach(w => {
    connections.push({
      word: w,
      relationType: 'compound',
      relationLabel: '합성어 관계',
      strength: 0.7,
    });
  });

  return connections;
}

function findSynonymConnections(word: Word, allWords: Word[]): WordConnection[] {
  const connections: WordConnection[] = [];
  const synonyms = SYNONYM_MAP[word.korean];
  if (synonyms) {
    for (const syn of synonyms) {
      const match = allWords.find(w => w.korean === syn);
      if (match) {
        connections.push({
          word: match,
          relationType: 'synonym',
          relationLabel: '유의어',
          strength: 0.85,
        });
      }
    }
  }
  return connections;
}

function findAntonymConnections(word: Word, allWords: Word[]): WordConnection[] {
  const connections: WordConnection[] = [];
  const antonyms = ANTONYM_MAP[word.korean];
  if (antonyms) {
    for (const ant of antonyms) {
      const match = allWords.find(w => w.korean === ant);
      if (match) {
        connections.push({
          word: match,
          relationType: 'antonym',
          relationLabel: '반의어',
          strength: 0.9,
        });
      }
    }
  }
  return connections;
}

function findSemanticFieldConnections(word: Word, allWords: Word[]): WordConnection[] {
  const connections: WordConnection[] = [];
  let fieldName = '';
  let fieldCategories: string[] = [];

  for (const [field, cats] of Object.entries(SEMANTIC_FIELD_MAP)) {
    if (cats.some(c => word.category.includes(c) || c.includes(word.category))) {
      fieldName = field;
      fieldCategories = cats;
      break;
    }
  }

  if (fieldCategories.length > 0) {
    const related = allWords.filter(w =>
      w.id !== word.id &&
      w.category !== word.category &&
      fieldCategories.some(c => w.category.includes(c) || c.includes(w.category))
    );
    const selected = related.sort(() => Math.random() - 0.5).slice(0, 4);
    selected.forEach(w => {
      connections.push({
        word: w,
        relationType: 'semantic_field',
        relationLabel: `의미장: ${fieldName.replace(/_/g, ' ')}`,
        strength: 0.65,
      });
    });
  }

  return connections;
}

function findHypernymConnections(word: Word, allWords: Word[]): WordConnection[] {
  const connections: WordConnection[] = [];

  for (const [hypernym, hyponyms] of Object.entries(HYPERNYM_MAP)) {
    if (hyponyms.includes(word.korean)) {
      const hypernymMatch = allWords.find(w => w.korean === hypernym);
      if (hypernymMatch) {
        connections.push({
          word: hypernymMatch,
          relationType: 'hypernym',
          relationLabel: '상위어 (is-a)',
          strength: 0.85,
        });
      }
      for (const sibling of hyponyms) {
        if (sibling !== word.korean) {
          const sibMatch = allWords.find(w => w.korean === sibling);
          if (sibMatch) {
            connections.push({
              word: sibMatch,
              relationType: 'hyponym',
              relationLabel: `같은 종류 (${hypernym})`,
              strength: 0.75,
            });
          }
        }
      }
      break;
    }
    if (word.korean === hypernym) {
      for (const hypo of hyponyms.slice(0, 6)) {
        const match = allWords.find(w => w.korean === hypo);
        if (match) {
          connections.push({
            word: match,
            relationType: 'hyponym',
            relationLabel: '하위어 (종류)',
            strength: 0.8,
          });
        }
      }
      break;
    }
  }

  return connections;
}

function findRegisterConnections(word: Word, allWords: Word[]): WordConnection[] {
  const connections: WordConnection[] = [];
  const register = REGISTER_MAP[word.korean];
  if (register) {
    [register.formal, register.informal, register.honorific].forEach(form => {
      if (form && form !== word.korean) {
        const match = allWords.find(w => w.korean === form);
        if (match) {
          const label = form === register.formal ? '높임말' : form === register.informal ? '반말' : '존칭';
          connections.push({
            word: match,
            relationType: 'register',
            relationLabel: label,
            strength: 0.8,
          });
        }
      }
    });
  }
  return connections;
}

function findCollocationConnections(word: Word, allWords: Word[]): WordConnection[] {
  const connections: WordConnection[] = [];
  const collocations = COLLOCATION_MAP[word.korean];
  if (collocations) {
    for (const col of collocations) {
      const verbPart = col.split(' ').pop() || '';
      const match = allWords.find(w => w.korean === verbPart || w.korean === col);
      if (match) {
        connections.push({
          word: match,
          relationType: 'collocation',
          relationLabel: `연어: ${col}`,
          strength: 0.7,
        });
      }
    }
  }
  return connections;
}

export function getWordConnections(word: Word, allWords: Word[]): WordConnection[] {
  const allConnections: WordConnection[] = [];

  allConnections.push(...findSynonymConnections(word, allWords));
  allConnections.push(...findAntonymConnections(word, allWords));
  allConnections.push(...findMorphologicalConnections(word, allWords));
  allConnections.push(...findHypernymConnections(word, allWords));
  allConnections.push(...findRegisterConnections(word, allWords));
  allConnections.push(...findCollocationConnections(word, allWords));
  allConnections.push(...findSemanticFieldConnections(word, allWords));

  const seen = new Set<string>();
  const unique: WordConnection[] = [];
  for (const conn of allConnections) {
    if (!seen.has(conn.word.id)) {
      seen.add(conn.word.id);
      unique.push(conn);
    }
  }

  unique.sort((a, b) => b.strength - a.strength);

  if (unique.length < 6) {
    const sameCategory = allWords
      .filter(w => w.id !== word.id && w.category === word.category && !seen.has(w.id))
      .slice(0, 6 - unique.length);
    sameCategory.forEach(w => {
      unique.push({
        word: w,
        relationType: 'semantic_field',
        relationLabel: `같은 분류: ${word.category}`,
        strength: 0.4,
      });
    });
  }

  return unique.slice(0, 12);
}

export interface UserWordHistory {
  wordId: string;
  viewCount: number;
  quizCorrect: number;
  quizWrong: number;
  lastSeen: number;
  connectedWordIds: string[];
}

export interface NetworkLearningData {
  history: Record<string, UserWordHistory>;
  updatedAt: number;
}

export function createEmptyLearningData(): NetworkLearningData {
  return { history: {}, updatedAt: Date.now() };
}

export function recordWordView(data: NetworkLearningData, wordId: string, connectedIds: string[]): NetworkLearningData {
  const existing = data.history[wordId] || {
    wordId,
    viewCount: 0,
    quizCorrect: 0,
    quizWrong: 0,
    lastSeen: 0,
    connectedWordIds: [],
  };

  const mergedConnections = [...new Set([...existing.connectedWordIds, ...connectedIds])];

  return {
    history: {
      ...data.history,
      [wordId]: {
        ...existing,
        viewCount: existing.viewCount + 1,
        lastSeen: Date.now(),
        connectedWordIds: mergedConnections,
      },
    },
    updatedAt: Date.now(),
  };
}

export function getPersonalizedConnections(
  word: Word,
  allWords: Word[],
  learningData: NetworkLearningData
): WordConnection[] {
  const baseConnections = getWordConnections(word, allWords);
  const wordHistory = learningData.history[word.id];

  if (!wordHistory || wordHistory.viewCount < 3) {
    return baseConnections;
  }

  const frequentlyCoViewed = wordHistory.connectedWordIds
    .map(id => {
      const connHistory = learningData.history[id];
      return { id, score: connHistory ? connHistory.viewCount : 0 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const personalConnections: WordConnection[] = [];
  for (const item of frequentlyCoViewed) {
    const match = allWords.find(w => w.id === item.id);
    if (match && !baseConnections.find(c => c.word.id === match.id)) {
      personalConnections.push({
        word: match,
        relationType: 'semantic_field',
        relationLabel: '학습 패턴 기반',
        strength: 0.5 + Math.min(item.score / 20, 0.3),
      });
    }
  }

  const combined = [...baseConnections.slice(0, 8), ...personalConnections.slice(0, 4)];
  return combined.slice(0, 12);
}

export function getConnectionStats(connections: WordConnection[]): Record<RelationType, number> {
  const stats: Record<string, number> = {};
  connections.forEach(c => {
    stats[c.relationType] = (stats[c.relationType] || 0) + 1;
  });
  return stats as Record<RelationType, number>;
}
