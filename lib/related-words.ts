import { Word } from './vocabulary';

export interface RelatedWord {
  korean: string;
  english: string;
  pronunciation: string;
  isDrama?: boolean;
}

const RELATED_MAP: Record<string, RelatedWord[]> = {
  '안녕하세요': [
    { korean: '안녕히 가세요', english: 'Goodbye (to one leaving)', pronunciation: 'an-nyeong-hi ga-se-yo' },
    { korean: '안녕히 계세요', english: 'Goodbye (to one staying)', pronunciation: 'an-nyeong-hi gye-se-yo' },
    { korean: '안녕', english: 'Hi (informal)', pronunciation: 'an-nyeong' },
    { korean: '처음 뵙겠습니다', english: 'Nice to meet you (formal)', pronunciation: 'cheo-eum boep-get-seum-ni-da' },
    { korean: '반갑습니다', english: 'Nice to meet you', pronunciation: 'ban-gap-seum-ni-da' },
    { korean: '잘 지내요?', english: 'How are you?', pronunciation: 'jal ji-nae-yo' },
    { korean: '오랜만이에요', english: 'Long time no see', pronunciation: 'o-raen-man-i-e-yo' },
    { korean: '어서 오세요', english: 'Welcome', pronunciation: 'eo-seo o-se-yo' },
    { korean: '실례합니다', english: 'Excuse me', pronunciation: 'sil-lye-ham-ni-da' },
    { korean: '수고하세요', english: 'Keep up the good work', pronunciation: 'su-go-ha-se-yo' },
    { korean: '여보세요', english: 'Hello (phone)', pronunciation: 'yeo-bo-se-yo' },
    { korean: '잘 부탁합니다', english: 'Please take care of it', pronunciation: 'jal bu-tak-ham-ni-da' },
    { korean: '만나서 반가워요', english: 'Nice to meet you', pronunciation: 'man-na-seo ban-ga-wo-yo' },
    { korean: '좋은 하루 되세요', english: 'Have a nice day', pronunciation: 'jo-eun ha-ru doe-se-yo' },
    { korean: '다시 만나요', english: 'See you again', pronunciation: 'da-si man-na-yo' },
    { korean: '어떻게 지내세요?', english: 'How have you been?', pronunciation: 'eo-tteo-ke ji-nae-se-yo', isDrama: true },
    { korean: '보고 싶었어요', english: 'I missed you', pronunciation: 'bo-go si-peo-sseo-yo', isDrama: true },
    { korean: '잘 지냈어?', english: 'Have you been well? (informal)', pronunciation: 'jal ji-nae-sseo', isDrama: true },
    { korean: '오셨어요?', english: 'You came? (respectful)', pronunciation: 'o-syeo-sseo-yo', isDrama: true },
    { korean: '드디어 왔구나', english: 'You finally came!', pronunciation: 'deu-di-eo wat-gu-na', isDrama: true },
  ],
  '사랑': [
    { korean: '사랑하다', english: 'To love', pronunciation: 'sa-rang-ha-da' },
    { korean: '사랑해', english: 'I love you (informal)', pronunciation: 'sa-rang-hae' },
    { korean: '사랑해요', english: 'I love you (polite)', pronunciation: 'sa-rang-hae-yo' },
    { korean: '사랑스럽다', english: 'Lovely/Adorable', pronunciation: 'sa-rang-seu-reop-da' },
    { korean: '첫사랑', english: 'First love', pronunciation: 'cheot-sa-rang' },
    { korean: '짝사랑', english: 'One-sided love', pronunciation: 'jjak-sa-rang' },
    { korean: '연애', english: 'Romantic relationship', pronunciation: 'yeon-ae' },
    { korean: '고백하다', english: 'To confess (love)', pronunciation: 'go-baek-ha-da' },
    { korean: '좋아하다', english: 'To like', pronunciation: 'jo-a-ha-da' },
    { korean: '마음', english: 'Heart/Mind', pronunciation: 'ma-eum' },
    { korean: '감정', english: 'Feelings', pronunciation: 'gam-jeong' },
    { korean: '연인', english: 'Lover/Partner', pronunciation: 'yeon-in' },
    { korean: '커플', english: 'Couple', pronunciation: 'keo-peul' },
    { korean: '데이트', english: 'Date', pronunciation: 'de-i-teu' },
    { korean: '키스', english: 'Kiss', pronunciation: 'ki-seu' },
    { korean: '내가 너를 얼마나 사랑하는지 알아?', english: 'Do you know how much I love you?', pronunciation: 'nae-ga neo-reul eol-ma-na sa-rang-ha-neun-ji a-ra', isDrama: true },
    { korean: '우리 사이 뭐야?', english: 'What are we?', pronunciation: 'u-ri sa-i mwo-ya', isDrama: true },
    { korean: '너 없이 못 살아', english: "I can't live without you", pronunciation: 'neo eop-si mot sa-ra', isDrama: true },
    { korean: '운명이야', english: "It's destiny", pronunciation: 'un-myeong-i-ya', isDrama: true },
    { korean: '마음이 아파', english: 'My heart hurts', pronunciation: 'ma-eum-i a-pa', isDrama: true },
  ],
  '먹다': [
    { korean: '먹을까요?', english: 'Shall we eat?', pronunciation: 'meo-geul-kka-yo' },
    { korean: '드시다', english: 'To eat (honorific)', pronunciation: 'deu-si-da' },
    { korean: '식사하다', english: 'To have a meal', pronunciation: 'sik-sa-ha-da' },
    { korean: '밥 먹자', english: "Let's eat (informal)", pronunciation: 'bap meok-ja' },
    { korean: '배고프다', english: 'To be hungry', pronunciation: 'bae-go-peu-da' },
    { korean: '배부르다', english: 'To be full', pronunciation: 'bae-bu-reu-da' },
    { korean: '맛있다', english: 'Delicious', pronunciation: 'ma-sit-da' },
    { korean: '맛없다', english: 'Not tasty', pronunciation: 'ma-deop-da' },
    { korean: '요리하다', english: 'To cook', pronunciation: 'yo-ri-ha-da' },
    { korean: '주문하다', english: 'To order', pronunciation: 'ju-mun-ha-da' },
    { korean: '간식', english: 'Snack', pronunciation: 'gan-sik' },
    { korean: '디저트', english: 'Dessert', pronunciation: 'di-jeo-teu' },
    { korean: '음료수', english: 'Beverage', pronunciation: 'eum-nyo-su' },
    { korean: '식당', english: 'Restaurant', pronunciation: 'sik-dang' },
    { korean: '맛집', english: 'Famous restaurant', pronunciation: 'mat-jip' },
    { korean: '이거 진짜 맛있다!', english: 'This is really delicious!', pronunciation: 'i-geo jin-jja ma-sit-da', isDrama: true },
    { korean: '한 입만!', english: 'Just one bite!', pronunciation: 'han ip-man', isDrama: true },
    { korean: '제가 쏠게요', english: "It's my treat", pronunciation: 'je-ga ssol-ge-yo', isDrama: true },
    { korean: '같이 먹으면 더 맛있어', english: 'Food tastes better together', pronunciation: 'ga-chi meo-geu-myeon deo ma-si-sseo', isDrama: true },
    { korean: '먹방 찍자!', english: "Let's film a mukbang!", pronunciation: 'meok-bang jjik-ja', isDrama: true },
  ],
  '친구': [
    { korean: '친한 친구', english: 'Close friend', pronunciation: 'chin-han chin-gu' },
    { korean: '절친', english: 'Best friend (BFF)', pronunciation: 'jeol-chin' },
    { korean: '동창', english: 'Classmate/Alumni', pronunciation: 'dong-chang' },
    { korean: '선후배', english: 'Seniors and juniors', pronunciation: 'seon-hu-bae' },
    { korean: '우정', english: 'Friendship', pronunciation: 'u-jeong' },
    { korean: '사이가 좋다', english: 'To be on good terms', pronunciation: 'sa-i-ga jo-ta' },
    { korean: '사귀다', english: 'To make friends/date', pronunciation: 'sa-gwi-da' },
    { korean: '동료', english: 'Colleague', pronunciation: 'dong-ryo' },
    { korean: '이웃', english: 'Neighbor', pronunciation: 'i-ut' },
    { korean: '모임', english: 'Gathering/Meeting', pronunciation: 'mo-im' },
    { korean: '약속', english: 'Promise/Appointment', pronunciation: 'yak-sok' },
    { korean: '놀다', english: 'To hang out/play', pronunciation: 'nol-da' },
    { korean: '연락하다', english: 'To contact', pronunciation: 'yeol-lak-ha-da' },
    { korean: '만나다', english: 'To meet', pronunciation: 'man-na-da' },
    { korean: '함께', english: 'Together', pronunciation: 'ham-kke' },
    { korean: '친구야, 힘내!', english: 'Friend, cheer up!', pronunciation: 'chin-gu-ya, him-nae', isDrama: true },
    { korean: '우리 영원히 친구하자', english: "Let's be friends forever", pronunciation: 'u-ri yeong-won-hi chin-gu-ha-ja', isDrama: true },
    { korean: '네가 있어서 다행이야', english: "I'm glad I have you", pronunciation: 'ne-ga i-sseo-seo da-haeng-i-ya', isDrama: true },
    { korean: '내 편이 되어줘', english: 'Be on my side', pronunciation: 'nae pyeon-i doe-eo-jwo', isDrama: true },
    { korean: '우리 사이에 비밀은 없어', english: 'No secrets between us', pronunciation: 'u-ri sa-i-e bi-mil-eun eop-seo', isDrama: true },
  ],
  '가다': [
    { korean: '갈까요?', english: 'Shall we go?', pronunciation: 'gal-kka-yo' },
    { korean: '가자', english: "Let's go (informal)", pronunciation: 'ga-ja' },
    { korean: '갈게요', english: "I'll go", pronunciation: 'gal-ge-yo' },
    { korean: '가고 싶다', english: 'I want to go', pronunciation: 'ga-go sip-da' },
    { korean: '돌아가다', english: 'To go back', pronunciation: 'do-ra-ga-da' },
    { korean: '나가다', english: 'To go out', pronunciation: 'na-ga-da' },
    { korean: '올라가다', english: 'To go up', pronunciation: 'ol-la-ga-da' },
    { korean: '내려가다', english: 'To go down', pronunciation: 'nae-ryeo-ga-da' },
    { korean: '걸어가다', english: 'To walk (to)', pronunciation: 'geo-reo-ga-da' },
    { korean: '뛰어가다', english: 'To run (to)', pronunciation: 'ttwi-eo-ga-da' },
    { korean: '출발하다', english: 'To depart', pronunciation: 'chul-bal-ha-da' },
    { korean: '도착하다', english: 'To arrive', pronunciation: 'do-chak-ha-da' },
    { korean: '여행하다', english: 'To travel', pronunciation: 'yeo-haeng-ha-da' },
    { korean: '이동하다', english: 'To move/transfer', pronunciation: 'i-dong-ha-da' },
    { korean: '길', english: 'Road/Path', pronunciation: 'gil' },
    { korean: '가지 마!', english: "Don't go!", pronunciation: 'ga-ji ma', isDrama: true },
    { korean: '어디 가는 거야?', english: 'Where are you going?', pronunciation: 'eo-di ga-neun geo-ya', isDrama: true },
    { korean: '나 먼저 갈게', english: "I'll go first", pronunciation: 'na meon-jeo gal-ge', isDrama: true },
    { korean: '같이 가자', english: "Let's go together", pronunciation: 'ga-chi ga-ja', isDrama: true },
    { korean: '여기서 나가!', english: 'Get out of here!', pronunciation: 'yeo-gi-seo na-ga', isDrama: true },
  ],
  '집': [
    { korean: '우리 집', english: 'Our house/My home', pronunciation: 'u-ri jip' },
    { korean: '집안', english: 'Inside the house', pronunciation: 'ji-ban' },
    { korean: '방', english: 'Room', pronunciation: 'bang' },
    { korean: '거실', english: 'Living room', pronunciation: 'geo-sil' },
    { korean: '부엌', english: 'Kitchen', pronunciation: 'bu-eok' },
    { korean: '화장실', english: 'Bathroom', pronunciation: 'hwa-jang-sil' },
    { korean: '현관', english: 'Entrance/Front door', pronunciation: 'hyeon-gwan' },
    { korean: '아파트', english: 'Apartment', pronunciation: 'a-pa-teu' },
    { korean: '이사하다', english: 'To move (house)', pronunciation: 'i-sa-ha-da' },
    { korean: '살다', english: 'To live', pronunciation: 'sal-da' },
    { korean: '가구', english: 'Furniture', pronunciation: 'ga-gu' },
    { korean: '침대', english: 'Bed', pronunciation: 'chim-dae' },
    { korean: '책상', english: 'Desk', pronunciation: 'chaek-sang' },
    { korean: '창문', english: 'Window', pronunciation: 'chang-mun' },
    { korean: '열쇠', english: 'Key', pronunciation: 'yeol-soe' },
    { korean: '집에 가고 싶다', english: 'I want to go home', pronunciation: 'ji-be ga-go sip-da', isDrama: true },
    { korean: '여기가 네 집이야?', english: 'Is this your house?', pronunciation: 'yeo-gi-ga ne ji-bi-ya', isDrama: true },
    { korean: '들어와', english: 'Come in', pronunciation: 'deu-reo-wa', isDrama: true },
    { korean: '우리 집에 올래?', english: 'Want to come to my place?', pronunciation: 'u-ri ji-be ol-lae', isDrama: true },
    { korean: '집 나가!', english: 'Get out of the house!', pronunciation: 'jip na-ga', isDrama: true },
  ],
  '공부하다': [
    { korean: '공부', english: 'Study', pronunciation: 'gong-bu' },
    { korean: '열심히 공부하다', english: 'To study hard', pronunciation: 'yeol-sim-hi gong-bu-ha-da' },
    { korean: '시험', english: 'Test/Exam', pronunciation: 'si-heom' },
    { korean: '학생', english: 'Student', pronunciation: 'hak-saeng' },
    { korean: '선생님', english: 'Teacher', pronunciation: 'seon-saeng-nim' },
    { korean: '수업', english: 'Class/Lesson', pronunciation: 'su-eop' },
    { korean: '숙제', english: 'Homework', pronunciation: 'suk-je' },
    { korean: '도서관', english: 'Library', pronunciation: 'do-seo-gwan' },
    { korean: '배우다', english: 'To learn', pronunciation: 'bae-u-da' },
    { korean: '외우다', english: 'To memorize', pronunciation: 'oe-u-da' },
    { korean: '복습하다', english: 'To review', pronunciation: 'bok-seup-ha-da' },
    { korean: '예습하다', english: 'To preview/prepare', pronunciation: 'ye-seup-ha-da' },
    { korean: '연습하다', english: 'To practice', pronunciation: 'yeon-seup-ha-da' },
    { korean: '이해하다', english: 'To understand', pronunciation: 'i-hae-ha-da' },
    { korean: '성적', english: 'Grades', pronunciation: 'seong-jeok' },
    { korean: '공부 좀 해!', english: 'Go study!', pronunciation: 'gong-bu jom hae', isDrama: true },
    { korean: '시험 망했어', english: 'I failed the exam', pronunciation: 'si-heom mang-hae-sseo', isDrama: true },
    { korean: '1등 했어!', english: 'I got first place!', pronunciation: 'il-deung hae-sseo', isDrama: true },
    { korean: '포기하지 마', english: "Don't give up", pronunciation: 'po-gi-ha-ji ma', isDrama: true },
    { korean: '너라면 할 수 있어', english: 'You can do it', pronunciation: 'neo-ra-myeon hal su i-sseo', isDrama: true },
  ],
  '김치': [
    { korean: '김치찌개', english: 'Kimchi stew', pronunciation: 'gim-chi-jji-gae' },
    { korean: '김치볶음밥', english: 'Kimchi fried rice', pronunciation: 'gim-chi-bo-kkeum-bap' },
    { korean: '배추김치', english: 'Napa cabbage kimchi', pronunciation: 'bae-chu-gim-chi' },
    { korean: '깍두기', english: 'Cubed radish kimchi', pronunciation: 'kkak-du-gi' },
    { korean: '젓갈', english: 'Fermented seafood', pronunciation: 'jeot-gal' },
    { korean: '발효식품', english: 'Fermented food', pronunciation: 'bal-hyo-sik-pum' },
    { korean: '반찬', english: 'Side dishes', pronunciation: 'ban-chan' },
    { korean: '양념', english: 'Seasoning/Sauce', pronunciation: 'yang-nyeom' },
    { korean: '고춧가루', english: 'Red pepper flakes', pronunciation: 'go-chut-ga-ru' },
    { korean: '마늘', english: 'Garlic', pronunciation: 'ma-neul' },
    { korean: '파', english: 'Green onion', pronunciation: 'pa' },
    { korean: '소금', english: 'Salt', pronunciation: 'so-geum' },
    { korean: '김장', english: 'Kimchi making season', pronunciation: 'gim-jang' },
    { korean: '맵다', english: 'Spicy', pronunciation: 'maep-da' },
    { korean: '시다', english: 'Sour', pronunciation: 'si-da' },
    { korean: '이 김치 진짜 맛있다!', english: 'This kimchi is really delicious!', pronunciation: 'i gim-chi jin-jja ma-sit-da', isDrama: true },
    { korean: '우리 엄마 김치가 최고야', english: "My mom's kimchi is the best", pronunciation: 'u-ri eom-ma gim-chi-ga choe-go-ya', isDrama: true },
    { korean: '김치 없이 못 살아', english: "Can't live without kimchi", pronunciation: 'gim-chi eop-si mot sa-ra', isDrama: true },
    { korean: '이거 너무 매워!', english: "This is too spicy!", pronunciation: 'i-geo neo-mu mae-wo', isDrama: true },
    { korean: '한국 음식은 역시 김치지', english: 'Korean food is all about kimchi', pronunciation: 'han-guk eum-si-geun yeok-si gim-chi-ji', isDrama: true },
  ],
};

const GENERIC_DRAMA_EXPRESSIONS: RelatedWord[] = [
  { korean: '뭐야 이게?', english: 'What is this?', pronunciation: 'mwo-ya i-ge', isDrama: true },
  { korean: '말도 안 돼!', english: 'No way! / Impossible!', pronunciation: 'mal-do an dwae', isDrama: true },
  { korean: '진짜?', english: 'Really?', pronunciation: 'jin-jja', isDrama: true },
  { korean: '미쳤어?', english: 'Are you crazy?', pronunciation: 'mi-chyeo-sseo', isDrama: true },
  { korean: '어떡해?', english: 'What do I do?', pronunciation: 'eo-tteo-kae', isDrama: true },
];

function generateRelatedFromCategory(word: Word, allWords: Word[]): RelatedWord[] {
  const sameCategory = allWords.filter(w => w.category === word.category && w.id !== word.id);
  return sameCategory.slice(0, 15).map(w => ({
    korean: w.korean,
    english: w.english,
    pronunciation: w.pronunciation,
  }));
}

export function getRelatedWords(word: Word, allWords: Word[]): RelatedWord[] {
  const mapped = RELATED_MAP[word.korean];
  if (mapped && mapped.length >= 20) {
    return mapped.slice(0, 20);
  }

  const result: RelatedWord[] = mapped ? [...mapped] : [];

  if (result.length < 20) {
    const catWords = generateRelatedFromCategory(word, allWords);
    for (const cw of catWords) {
      if (result.length >= 15 && result.filter(r => !r.isDrama).length >= 15) break;
      if (!result.find(r => r.korean === cw.korean)) {
        result.push(cw);
      }
    }
  }

  const dramaCount = result.filter(r => r.isDrama).length;
  if (dramaCount < 5) {
    const needed = 5 - dramaCount;
    const available = GENERIC_DRAMA_EXPRESSIONS.filter(
      d => !result.find(r => r.korean === d.korean)
    );
    result.push(...available.slice(0, needed));
  }

  return result.slice(0, 20);
}
