export interface HangeulChar {
  char: string;
  romanization: string;
  sound: string;
  type: 'consonant' | 'vowel' | 'double_consonant' | 'double_vowel';
  example: string;
  exampleMeaning: string;
  tip: string;
}

export interface HangeulSection {
  title: string;
  titleKorean: string;
  description: string;
  chars: HangeulChar[];
}

export const HANGEUL_SECTIONS: HangeulSection[] = [
  {
    title: 'Basic Consonants',
    titleKorean: '기본 자음',
    description: 'The 14 basic consonant letters of Korean',
    chars: [
      { char: 'ㄱ', romanization: 'g/k', sound: 'Like "g" in "go" or "k" in "kite"', type: 'consonant', example: '가방', exampleMeaning: 'bag', tip: 'Softer "g" at the start, harder "k" at the end of syllables' },
      { char: 'ㄴ', romanization: 'n', sound: 'Like "n" in "nice"', type: 'consonant', example: '나라', exampleMeaning: 'country', tip: 'Same as English "n" - easy one!' },
      { char: 'ㄷ', romanization: 'd/t', sound: 'Like "d" in "door" or "t" in "top"', type: 'consonant', example: '달', exampleMeaning: 'moon', tip: 'Softer "d" at start, sharper "t" at end' },
      { char: 'ㄹ', romanization: 'r/l', sound: 'Between "r" and "l"', type: 'consonant', example: '라면', exampleMeaning: 'ramen', tip: 'Flap your tongue like a soft "r" - unique Korean sound!' },
      { char: 'ㅁ', romanization: 'm', sound: 'Like "m" in "mom"', type: 'consonant', example: '마음', exampleMeaning: 'heart/mind', tip: 'Looks like a box - think of closing your lips to say "m"' },
      { char: 'ㅂ', romanization: 'b/p', sound: 'Like "b" in "bus" or "p" in "park"', type: 'consonant', example: '바다', exampleMeaning: 'sea', tip: 'Soft "b" at start, firm "p" at end' },
      { char: 'ㅅ', romanization: 's', sound: 'Like "s" in "sun"', type: 'consonant', example: '사랑', exampleMeaning: 'love', tip: 'Looks like a hat or tent shape' },
      { char: 'ㅇ', romanization: 'ng (or silent)', sound: 'Silent at start, "ng" at end', type: 'consonant', example: '아이', exampleMeaning: 'child', tip: 'Silent placeholder at start of syllable, "ng" sound at end' },
      { char: 'ㅈ', romanization: 'j', sound: 'Like "j" in "just"', type: 'consonant', example: '자리', exampleMeaning: 'seat', tip: 'Think of it as a "j" sound' },
      { char: 'ㅊ', romanization: 'ch', sound: 'Like "ch" in "church"', type: 'consonant', example: '친구', exampleMeaning: 'friend', tip: 'ㅈ with an extra stroke = aspirated (more air)' },
      { char: 'ㅋ', romanization: 'k', sound: 'Like "k" in "king" (strong)', type: 'consonant', example: '커피', exampleMeaning: 'coffee', tip: 'ㄱ with an extra stroke = stronger, more air' },
      { char: 'ㅌ', romanization: 't', sound: 'Like "t" in "top" (strong)', type: 'consonant', example: '토끼', exampleMeaning: 'rabbit', tip: 'ㄷ with an extra stroke = stronger' },
      { char: 'ㅍ', romanization: 'p', sound: 'Like "p" in "park" (strong)', type: 'consonant', example: '피자', exampleMeaning: 'pizza', tip: 'ㅂ with an extra stroke = stronger' },
      { char: 'ㅎ', romanization: 'h', sound: 'Like "h" in "hello"', type: 'consonant', example: '하늘', exampleMeaning: 'sky', tip: 'Looks like a person wearing a hat' },
    ],
  },
  {
    title: 'Basic Vowels',
    titleKorean: '기본 모음',
    description: 'The 10 basic vowel letters of Korean',
    chars: [
      { char: 'ㅏ', romanization: 'a', sound: 'Like "a" in "father"', type: 'vowel', example: '아빠', exampleMeaning: 'dad', tip: 'Vertical line with stroke to the RIGHT' },
      { char: 'ㅑ', romanization: 'ya', sound: 'Like "ya" in "yard"', type: 'vowel', example: '야구', exampleMeaning: 'baseball', tip: 'Double stroke to the right = adds "y" sound' },
      { char: 'ㅓ', romanization: 'eo', sound: 'Like "u" in "bus"', type: 'vowel', example: '엄마', exampleMeaning: 'mom', tip: 'Vertical line with stroke to the LEFT' },
      { char: 'ㅕ', romanization: 'yeo', sound: 'Like "yo" in "young"', type: 'vowel', example: '여자', exampleMeaning: 'woman', tip: 'Double stroke to the left = adds "y" sound' },
      { char: 'ㅗ', romanization: 'o', sound: 'Like "o" in "old"', type: 'vowel', example: '오빠', exampleMeaning: 'older brother', tip: 'Horizontal line with stroke going UP' },
      { char: 'ㅛ', romanization: 'yo', sound: 'Like "yo" in "yoga"', type: 'vowel', example: '요리', exampleMeaning: 'cooking', tip: 'Double stroke up = adds "y" sound' },
      { char: 'ㅜ', romanization: 'u', sound: 'Like "oo" in "moon"', type: 'vowel', example: '우유', exampleMeaning: 'milk', tip: 'Horizontal line with stroke going DOWN' },
      { char: 'ㅠ', romanization: 'yu', sound: 'Like "you"', type: 'vowel', example: '유리', exampleMeaning: 'glass', tip: 'Double stroke down = adds "y" sound' },
      { char: 'ㅡ', romanization: 'eu', sound: 'Like "oo" but with lips spread (not rounded)', type: 'vowel', example: '그림', exampleMeaning: 'picture', tip: 'Just a horizontal line - spread your lips saying "oo"' },
      { char: 'ㅣ', romanization: 'i', sound: 'Like "ee" in "see"', type: 'vowel', example: '이름', exampleMeaning: 'name', tip: 'Just a vertical line - easiest vowel!' },
    ],
  },
  {
    title: 'Double Consonants',
    titleKorean: '쌍자음',
    description: 'Tense (double) consonants - pronounced with more force',
    chars: [
      { char: 'ㄲ', romanization: 'kk', sound: 'Tense "k" - no air released', type: 'double_consonant', example: '꽃', exampleMeaning: 'flower', tip: 'Like "k" but tighter in throat, no breath' },
      { char: 'ㄸ', romanization: 'tt', sound: 'Tense "t" - no air released', type: 'double_consonant', example: '떡', exampleMeaning: 'rice cake', tip: 'Like "t" but tighter, think of tteokbokki!' },
      { char: 'ㅃ', romanization: 'pp', sound: 'Tense "p" - no air released', type: 'double_consonant', example: '빵', exampleMeaning: 'bread', tip: 'Like "p" but tighter, no breath' },
      { char: 'ㅆ', romanization: 'ss', sound: 'Tense "s" - sharper hiss', type: 'double_consonant', example: '씨', exampleMeaning: 'Mr./Ms. (suffix)', tip: 'Sharper and stronger than regular ㅅ' },
      { char: 'ㅉ', romanization: 'jj', sound: 'Tense "j" - no air released', type: 'double_consonant', example: '짜장면', exampleMeaning: 'black bean noodles', tip: 'Like "j" but tighter, think of jjajangmyeon!' },
    ],
  },
  {
    title: 'Compound Vowels',
    titleKorean: '복합 모음',
    description: 'Vowels formed by combining two basic vowels',
    chars: [
      { char: 'ㅐ', romanization: 'ae', sound: 'Like "a" in "bad"', type: 'double_vowel', example: '개', exampleMeaning: 'dog', tip: 'ㅏ + ㅣ combined = "ae" sound' },
      { char: 'ㅔ', romanization: 'e', sound: 'Like "e" in "bed"', type: 'double_vowel', example: '세계', exampleMeaning: 'world', tip: 'ㅓ + ㅣ combined = "e" sound' },
      { char: 'ㅘ', romanization: 'wa', sound: 'Like "wa" in "water"', type: 'double_vowel', example: '과자', exampleMeaning: 'snack', tip: 'ㅗ + ㅏ = "wa" - say them fast together!' },
      { char: 'ㅙ', romanization: 'wae', sound: 'Like "we" in "wet"', type: 'double_vowel', example: '왜', exampleMeaning: 'why', tip: 'ㅗ + ㅐ = "wae"' },
      { char: 'ㅚ', romanization: 'oe', sound: 'Like "we" in "wet" (similar to ㅙ)', type: 'double_vowel', example: '외국', exampleMeaning: 'foreign country', tip: 'ㅗ + ㅣ = modern pronunciation is similar to "we"' },
      { char: 'ㅝ', romanization: 'wo', sound: 'Like "wo" in "wonder"', type: 'double_vowel', example: '원', exampleMeaning: 'won (currency)', tip: 'ㅜ + ㅓ = "wo" - say them fast!' },
      { char: 'ㅞ', romanization: 'we', sound: 'Like "we" in "wet"', type: 'double_vowel', example: '웨딩', exampleMeaning: 'wedding', tip: 'ㅜ + ㅔ = "we"' },
      { char: 'ㅟ', romanization: 'wi', sound: 'Like "wee" in "week"', type: 'double_vowel', example: '위', exampleMeaning: 'above/top', tip: 'ㅜ + ㅣ = "wi"' },
      { char: 'ㅢ', romanization: 'ui', sound: '"eu" + "ee" said quickly', type: 'double_vowel', example: '의사', exampleMeaning: 'doctor', tip: 'ㅡ + ㅣ = slide from "eu" to "ee"' },
      { char: 'ㅒ', romanization: 'yae', sound: 'Like "yeh"', type: 'double_vowel', example: '얘기', exampleMeaning: 'story/talk', tip: 'ㅑ + ㅣ = "yae" - rare in modern Korean' },
      { char: 'ㅖ', romanization: 'ye', sound: 'Like "ye" in "yes"', type: 'double_vowel', example: '예', exampleMeaning: 'yes (polite)', tip: 'ㅕ + ㅣ = "ye"' },
    ],
  },
];

export interface HangeulPrinciple {
  title: string;
  titleKr: string;
  icon: string;
  content: string;
  details: { label: string; description: string; visual?: string }[];
}

export const HANGEUL_PRINCIPLES: HangeulPrinciple[] = [
  {
    title: 'Origin & History',
    titleKr: '한글의 탄생',
    icon: 'book-outline',
    content: 'Hangeul was created in 1443 by King Sejong the Great (세종대왕) and his scholars. Before Hangeul, Koreans used Chinese characters (한자), which were extremely difficult for common people to learn. King Sejong wanted everyone — farmers, merchants, women — to be able to read and write. He published "Hunminjeongeum" (훈민정음, "The Correct Sounds for the Instruction of the People") in 1446.',
    details: [
      { label: 'Created', description: '1443 by King Sejong the Great (세종대왕)' },
      { label: 'Published', description: '1446 as Hunminjeongeum (훈민정음)' },
      { label: 'Purpose', description: 'So all people could easily learn to read and write' },
      { label: 'Hangeul Day', description: 'October 9th — a national holiday in Korea (한글날)' },
    ],
  },
  {
    title: 'Consonants = Mouth Shapes',
    titleKr: '자음의 원리',
    icon: 'body-outline',
    content: 'Korean consonants are scientifically designed based on the shape of the mouth, tongue, and throat when making each sound. There are 5 basic shapes, and other consonants are formed by adding strokes to show stronger sounds.',
    details: [
      { label: 'ㄱ (g/k)', description: 'Shape of the tongue touching the back of the mouth (velar)', visual: 'Tongue root → ㄱ' },
      { label: 'ㄴ (n)', description: 'Shape of the tongue touching the front roof of the mouth (alveolar)', visual: 'Tongue tip → ㄴ' },
      { label: 'ㅁ (m)', description: 'Shape of closed lips (bilabial)', visual: 'Closed mouth → ㅁ' },
      { label: 'ㅅ (s)', description: 'Shape of a tooth (dental/fricative)', visual: 'Tooth shape → ㅅ' },
      { label: 'ㅇ (ng)', description: 'Shape of the open throat (glottal)', visual: 'Open throat → ㅇ' },
      { label: 'Adding strokes', description: 'ㄱ→ㅋ (add stroke = more air), ㄴ→ㄷ→ㅌ, ㅁ→ㅂ→ㅍ, ㅅ→ㅈ→ㅊ, ㅇ→ㅎ' },
    ],
  },
  {
    title: 'Vowels = Heaven, Earth, Human',
    titleKr: '모음의 원리',
    icon: 'planet-outline',
    content: 'Korean vowels are based on three philosophical elements from East Asian cosmology: Heaven (하늘, a dot ·), Earth (땅, a horizontal line ㅡ), and Human (사람, a vertical line ㅣ). All vowels are combinations of these three elements.',
    details: [
      { label: '· (Heaven)', description: 'Originally a round dot representing the sky. In modern Hangeul, it became short strokes.' },
      { label: 'ㅡ (Earth)', description: 'A flat horizontal line representing the ground.' },
      { label: 'ㅣ (Human)', description: 'A standing vertical line representing a person.' },
      { label: 'ㅏ (a)', description: 'ㅣ + · = Human with Heaven to the right (bright/yang vowel)' },
      { label: 'ㅓ (eo)', description: 'ㅣ + · = Human with Heaven to the left (dark/yin vowel)' },
      { label: 'ㅗ (o)', description: 'ㅡ + · = Earth with Heaven above (bright/yang vowel)' },
      { label: 'ㅜ (u)', description: 'ㅡ + · = Earth with Heaven below (dark/yin vowel)' },
      { label: 'Yin & Yang', description: 'Bright vowels (양성): ㅏ, ㅗ, ㅑ, ㅛ — Dark vowels (음성): ㅓ, ㅜ, ㅕ, ㅠ — Neutral: ㅡ, ㅣ' },
    ],
  },
  {
    title: 'Syllable Block System',
    titleKr: '음절 구조',
    icon: 'grid-outline',
    content: 'Korean letters are not written in a line like English. Instead, they are grouped into syllable blocks. Each block represents one syllable and contains 2-4 letters arranged in a square-like shape.',
    details: [
      { label: 'CV Pattern', description: 'Consonant + Vowel: 가 (ㄱ+ㅏ), 나 (ㄴ+ㅏ), 무 (ㅁ+ㅜ)' },
      { label: 'CVC Pattern', description: 'Consonant + Vowel + Final consonant: 한 (ㅎ+ㅏ+ㄴ), 글 (ㄱ+ㅡ+ㄹ)' },
      { label: 'Left-Right', description: 'When vowel has a vertical stroke (ㅏ,ㅓ,ㅣ): consonant goes LEFT, vowel goes RIGHT → 가, 너' },
      { label: 'Top-Bottom', description: 'When vowel has a horizontal stroke (ㅗ,ㅜ,ㅡ): consonant goes on TOP, vowel goes BELOW → 무, 고' },
      { label: 'Final consonant (받침)', description: 'The final consonant sits at the BOTTOM of the block: 밥 = ㅂ(top) + ㅏ(right) + ㅂ(bottom)' },
    ],
  },
  {
    title: 'Why Hangeul is Special',
    titleKr: '한글의 우수성',
    icon: 'star-outline',
    content: 'Hangeul is considered one of the most scientific and logical writing systems ever created. UNESCO praised it, and linguists around the world admire its elegant design.',
    details: [
      { label: 'Learnable in hours', description: 'The basic letters can be memorized in just a few hours — it was designed for simplicity.' },
      { label: 'Perfect for Korean sounds', description: 'Every Korean sound has exactly one letter — no ambiguity like English spelling.' },
      { label: 'Scientific design', description: 'Letters are based on actual speech organ positions — not arbitrary symbols.' },
      { label: 'UNESCO Memory of the World', description: 'Hunminjeongeum was registered as a UNESCO Memory of the World Heritage in 1997.' },
      { label: 'Featural alphabet', description: 'Hangeul is a "featural" alphabet — related sounds have related shapes (ㄱ→ㅋ→ㄲ).' },
      { label: 'Digital age friendly', description: 'The systematic structure makes Korean very efficient for typing on keyboards and phones.' },
    ],
  },
];

export interface SyllableExample {
  syllable: string;
  consonant: string;
  vowel: string;
  finalConsonant?: string;
  romanization: string;
  meaning: string;
}

export const SYLLABLE_EXAMPLES: SyllableExample[] = [
  { syllable: '가', consonant: 'ㄱ', vowel: 'ㅏ', romanization: 'ga', meaning: 'to go (stem)' },
  { syllable: '나', consonant: 'ㄴ', vowel: 'ㅏ', romanization: 'na', meaning: 'I/me' },
  { syllable: '다', consonant: 'ㄷ', vowel: 'ㅏ', romanization: 'da', meaning: '(verb ending)' },
  { syllable: '라', consonant: 'ㄹ', vowel: 'ㅏ', romanization: 'ra/la', meaning: '(particle)' },
  { syllable: '마', consonant: 'ㅁ', vowel: 'ㅏ', romanization: 'ma', meaning: '(informal ending)' },
  { syllable: '바', consonant: 'ㅂ', vowel: 'ㅏ', romanization: 'ba', meaning: 'bar/rock' },
  { syllable: '사', consonant: 'ㅅ', vowel: 'ㅏ', romanization: 'sa', meaning: 'four' },
  { syllable: '아', consonant: 'ㅇ', vowel: 'ㅏ', romanization: 'a', meaning: 'ah' },
  { syllable: '자', consonant: 'ㅈ', vowel: 'ㅏ', romanization: 'ja', meaning: 'ruler' },
  { syllable: '차', consonant: 'ㅊ', vowel: 'ㅏ', romanization: 'cha', meaning: 'car/tea' },
  { syllable: '카', consonant: 'ㅋ', vowel: 'ㅏ', romanization: 'ka', meaning: 'card (stem)' },
  { syllable: '타', consonant: 'ㅌ', vowel: 'ㅏ', romanization: 'ta', meaning: 'to ride (stem)' },
  { syllable: '파', consonant: 'ㅍ', vowel: 'ㅏ', romanization: 'pa', meaning: 'green onion' },
  { syllable: '하', consonant: 'ㅎ', vowel: 'ㅏ', romanization: 'ha', meaning: 'to do (stem)' },
  { syllable: '한', consonant: 'ㅎ', vowel: 'ㅏ', finalConsonant: 'ㄴ', romanization: 'han', meaning: 'one/Korean' },
  { syllable: '글', consonant: 'ㄱ', vowel: 'ㅡ', finalConsonant: 'ㄹ', romanization: 'geul', meaning: 'writing' },
  { syllable: '밥', consonant: 'ㅂ', vowel: 'ㅏ', finalConsonant: 'ㅂ', romanization: 'bap', meaning: 'rice/meal' },
  { syllable: '김', consonant: 'ㄱ', vowel: 'ㅣ', finalConsonant: 'ㅁ', romanization: 'gim', meaning: 'Kim (surname)' },
];
