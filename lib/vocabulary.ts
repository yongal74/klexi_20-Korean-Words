export interface Word {
  id: string;
  korean: string;
  english: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  category: string;
}

export interface TopikLevel {
  id: string;
  level: string;
  sublevel: string;
  title: string;
  description: string;
  color: string;
  days: string;
}

export const TOPIK_LEVELS: TopikLevel[] = [
  { id: 'topik1-1', level: 'TOPIK I', sublevel: 'Level 1', title: 'Complete Beginner', description: 'Hangeul basics, greetings, numbers, daily essentials', color: '#4ECDC4', days: 'Days 1-30' },
  { id: 'topik1-2', level: 'TOPIK I', sublevel: 'Level 2', title: 'Elementary', description: 'Daily conversations, shopping, K-pop vocabulary', color: '#45B7D1', days: 'Days 31-60' },
  { id: 'topik2-3', level: 'TOPIK II', sublevel: 'Level 3', title: 'Pre-Intermediate', description: 'Social topics, K-drama expressions, travel', color: '#96CEB4', days: 'Days 61-90' },
  { id: 'topik2-4', level: 'TOPIK II', sublevel: 'Level 4', title: 'Intermediate', description: 'News, culture, formal Korean, business', color: '#FFEAA7', days: 'Days 91-120' },
];

const VOCABULARY_DATA: Record<string, Word[]> = {
  'topik1-1': [
    { id: '1-1', korean: '안녕하세요', english: 'Hello', pronunciation: 'an-nyeong-ha-se-yo', partOfSpeech: 'greeting', example: '안녕하세요, 만나서 반갑습니다.', exampleTranslation: 'Hello, nice to meet you.', category: 'Greetings' },
    { id: '1-2', korean: '감사합니다', english: 'Thank you', pronunciation: 'gam-sa-ham-ni-da', partOfSpeech: 'greeting', example: '도와주셔서 감사합니다.', exampleTranslation: 'Thank you for helping me.', category: 'Greetings' },
    { id: '1-3', korean: '네', english: 'Yes', pronunciation: 'ne', partOfSpeech: 'adverb', example: '네, 알겠습니다.', exampleTranslation: 'Yes, I understand.', category: 'Basics' },
    { id: '1-4', korean: '아니요', english: 'No', pronunciation: 'a-ni-yo', partOfSpeech: 'adverb', example: '아니요, 괜찮습니다.', exampleTranslation: 'No, it\'s okay.', category: 'Basics' },
    { id: '1-5', korean: '사랑', english: 'Love', pronunciation: 'sa-rang', partOfSpeech: 'noun', example: '사랑은 아름답습니다.', exampleTranslation: 'Love is beautiful.', category: 'Emotions' },
    { id: '1-6', korean: '물', english: 'Water', pronunciation: 'mul', partOfSpeech: 'noun', example: '물 한 잔 주세요.', exampleTranslation: 'Please give me a glass of water.', category: 'Food & Drink' },
    { id: '1-7', korean: '밥', english: 'Rice / Meal', pronunciation: 'bap', partOfSpeech: 'noun', example: '밥 먹었어요?', exampleTranslation: 'Have you eaten?', category: 'Food & Drink' },
    { id: '1-8', korean: '집', english: 'House / Home', pronunciation: 'jip', partOfSpeech: 'noun', example: '집에 가고 싶어요.', exampleTranslation: 'I want to go home.', category: 'Places' },
    { id: '1-9', korean: '학교', english: 'School', pronunciation: 'hak-gyo', partOfSpeech: 'noun', example: '학교에 갑니다.', exampleTranslation: 'I go to school.', category: 'Places' },
    { id: '1-10', korean: '친구', english: 'Friend', pronunciation: 'chin-gu', partOfSpeech: 'noun', example: '친구와 만났어요.', exampleTranslation: 'I met my friend.', category: 'People' },
    { id: '1-11', korean: '가족', english: 'Family', pronunciation: 'ga-jok', partOfSpeech: 'noun', example: '가족이 보고 싶어요.', exampleTranslation: 'I miss my family.', category: 'People' },
    { id: '1-12', korean: '하나', english: 'One', pronunciation: 'ha-na', partOfSpeech: 'number', example: '하나만 주세요.', exampleTranslation: 'Just give me one please.', category: 'Numbers' },
    { id: '1-13', korean: '둘', english: 'Two', pronunciation: 'dul', partOfSpeech: 'number', example: '둘이 함께 갔어요.', exampleTranslation: 'Two went together.', category: 'Numbers' },
    { id: '1-14', korean: '좋아요', english: 'I like it / Good', pronunciation: 'jo-a-yo', partOfSpeech: 'adjective', example: '이 노래 좋아요.', exampleTranslation: 'I like this song.', category: 'Emotions' },
    { id: '1-15', korean: '먹다', english: 'To eat', pronunciation: 'meok-da', partOfSpeech: 'verb', example: '같이 먹을까요?', exampleTranslation: 'Shall we eat together?', category: 'Actions' },
    { id: '1-16', korean: '가다', english: 'To go', pronunciation: 'ga-da', partOfSpeech: 'verb', example: '어디 가요?', exampleTranslation: 'Where are you going?', category: 'Actions' },
    { id: '1-17', korean: '오다', english: 'To come', pronunciation: 'o-da', partOfSpeech: 'verb', example: '여기로 오세요.', exampleTranslation: 'Please come here.', category: 'Actions' },
    { id: '1-18', korean: '이름', english: 'Name', pronunciation: 'i-reum', partOfSpeech: 'noun', example: '이름이 뭐예요?', exampleTranslation: 'What is your name?', category: 'Basics' },
    { id: '1-19', korean: '나라', english: 'Country', pronunciation: 'na-ra', partOfSpeech: 'noun', example: '어느 나라에서 왔어요?', exampleTranslation: 'Which country are you from?', category: 'Basics' },
    { id: '1-20', korean: '오늘', english: 'Today', pronunciation: 'o-neul', partOfSpeech: 'adverb', example: '오늘 날씨가 좋아요.', exampleTranslation: 'The weather is nice today.', category: 'Time' },
    { id: '1-21', korean: '내일', english: 'Tomorrow', pronunciation: 'nae-il', partOfSpeech: 'adverb', example: '내일 만나요.', exampleTranslation: 'See you tomorrow.', category: 'Time' },
    { id: '1-22', korean: '어제', english: 'Yesterday', pronunciation: 'eo-je', partOfSpeech: 'adverb', example: '어제 뭐 했어요?', exampleTranslation: 'What did you do yesterday?', category: 'Time' },
    { id: '1-23', korean: '사람', english: 'Person / People', pronunciation: 'sa-ram', partOfSpeech: 'noun', example: '좋은 사람이에요.', exampleTranslation: 'You are a good person.', category: 'People' },
    { id: '1-24', korean: '음식', english: 'Food', pronunciation: 'eum-sik', partOfSpeech: 'noun', example: '한국 음식을 좋아해요.', exampleTranslation: 'I like Korean food.', category: 'Food & Drink' },
    { id: '1-25', korean: '커피', english: 'Coffee', pronunciation: 'keo-pi', partOfSpeech: 'noun', example: '커피 마실래요?', exampleTranslation: 'Would you like coffee?', category: 'Food & Drink' },
    { id: '1-26', korean: '보다', english: 'To see / To watch', pronunciation: 'bo-da', partOfSpeech: 'verb', example: '영화를 봤어요.', exampleTranslation: 'I watched a movie.', category: 'Actions' },
    { id: '1-27', korean: '읽다', english: 'To read', pronunciation: 'ik-da', partOfSpeech: 'verb', example: '책을 읽어요.', exampleTranslation: 'I read a book.', category: 'Actions' },
    { id: '1-28', korean: '쓰다', english: 'To write', pronunciation: 'sseu-da', partOfSpeech: 'verb', example: '편지를 써요.', exampleTranslation: 'I write a letter.', category: 'Actions' },
    { id: '1-29', korean: '듣다', english: 'To listen / To hear', pronunciation: 'deut-da', partOfSpeech: 'verb', example: '음악을 들어요.', exampleTranslation: 'I listen to music.', category: 'Actions' },
    { id: '1-30', korean: '말하다', english: 'To speak / To say', pronunciation: 'mal-ha-da', partOfSpeech: 'verb', example: '한국어로 말해 주세요.', exampleTranslation: 'Please speak in Korean.', category: 'Actions' },
    { id: '1-31', korean: '공부하다', english: 'To study', pronunciation: 'gong-bu-ha-da', partOfSpeech: 'verb', example: '한국어를 공부해요.', exampleTranslation: 'I study Korean.', category: 'Actions' },
    { id: '1-32', korean: '일하다', english: 'To work', pronunciation: 'il-ha-da', partOfSpeech: 'verb', example: '회사에서 일해요.', exampleTranslation: 'I work at a company.', category: 'Actions' },
    { id: '1-33', korean: '자다', english: 'To sleep', pronunciation: 'ja-da', partOfSpeech: 'verb', example: '일찍 자요.', exampleTranslation: 'I sleep early.', category: 'Actions' },
    { id: '1-34', korean: '크다', english: 'Big / Large', pronunciation: 'keu-da', partOfSpeech: 'adjective', example: '이 집은 커요.', exampleTranslation: 'This house is big.', category: 'Descriptions' },
    { id: '1-35', korean: '작다', english: 'Small / Little', pronunciation: 'jak-da', partOfSpeech: 'adjective', example: '이 가방은 작아요.', exampleTranslation: 'This bag is small.', category: 'Descriptions' },
    { id: '1-36', korean: '많다', english: 'Many / Much', pronunciation: 'man-ta', partOfSpeech: 'adjective', example: '사람이 많아요.', exampleTranslation: 'There are many people.', category: 'Descriptions' },
    { id: '1-37', korean: '예쁘다', english: 'Pretty / Beautiful', pronunciation: 'ye-ppeu-da', partOfSpeech: 'adjective', example: '꽃이 예뻐요.', exampleTranslation: 'The flower is pretty.', category: 'Descriptions' },
    { id: '1-38', korean: '맛있다', english: 'Delicious', pronunciation: 'ma-sit-da', partOfSpeech: 'adjective', example: '이 음식 맛있어요!', exampleTranslation: 'This food is delicious!', category: 'Descriptions' },
    { id: '1-39', korean: '재미있다', english: 'Fun / Interesting', pronunciation: 'jae-mi-it-da', partOfSpeech: 'adjective', example: '이 영화 재미있어요.', exampleTranslation: 'This movie is fun.', category: 'Descriptions' },
    { id: '1-40', korean: '날씨', english: 'Weather', pronunciation: 'nal-ssi', partOfSpeech: 'noun', example: '오늘 날씨가 좋아요.', exampleTranslation: 'The weather is nice today.', category: 'Nature' },
    { id: '1-41', korean: '시간', english: 'Time', pronunciation: 'si-gan', partOfSpeech: 'noun', example: '시간이 없어요.', exampleTranslation: 'I don\'t have time.', category: 'Time' },
    { id: '1-42', korean: '돈', english: 'Money', pronunciation: 'don', partOfSpeech: 'noun', example: '돈이 얼마예요?', exampleTranslation: 'How much money is it?', category: 'Daily Life' },
    { id: '1-43', korean: '전화', english: 'Phone call', pronunciation: 'jeon-hwa', partOfSpeech: 'noun', example: '전화 받으세요.', exampleTranslation: 'Please answer the phone.', category: 'Daily Life' },
    { id: '1-44', korean: '버스', english: 'Bus', pronunciation: 'beo-seu', partOfSpeech: 'noun', example: '버스를 타요.', exampleTranslation: 'I take the bus.', category: 'Transportation' },
    { id: '1-45', korean: '역', english: 'Station', pronunciation: 'yeok', partOfSpeech: 'noun', example: '지하철역이 어디예요?', exampleTranslation: 'Where is the subway station?', category: 'Transportation' },
    { id: '1-46', korean: '병원', english: 'Hospital', pronunciation: 'byeong-won', partOfSpeech: 'noun', example: '병원에 가야 해요.', exampleTranslation: 'I need to go to the hospital.', category: 'Places' },
    { id: '1-47', korean: '은행', english: 'Bank', pronunciation: 'eun-haeng', partOfSpeech: 'noun', example: '은행에서 돈을 찾아요.', exampleTranslation: 'I withdraw money from the bank.', category: 'Places' },
    { id: '1-48', korean: '마트', english: 'Mart / Supermarket', pronunciation: 'ma-teu', partOfSpeech: 'noun', example: '마트에서 쇼핑해요.', exampleTranslation: 'I shop at the mart.', category: 'Places' },
    { id: '1-49', korean: '주말', english: 'Weekend', pronunciation: 'ju-mal', partOfSpeech: 'noun', example: '주말에 뭐 해요?', exampleTranslation: 'What do you do on weekends?', category: 'Time' },
    { id: '1-50', korean: '여행', english: 'Travel / Trip', pronunciation: 'yeo-haeng', partOfSpeech: 'noun', example: '한국 여행을 가고 싶어요.', exampleTranslation: 'I want to travel to Korea.', category: 'Activities' },
    { id: '1-51', korean: '생일', english: 'Birthday', pronunciation: 'saeng-il', partOfSpeech: 'noun', example: '생일 축하합니다!', exampleTranslation: 'Happy birthday!', category: 'Events' },
    { id: '1-52', korean: '선물', english: 'Gift / Present', pronunciation: 'seon-mul', partOfSpeech: 'noun', example: '선물을 받았어요.', exampleTranslation: 'I received a gift.', category: 'Events' },
    { id: '1-53', korean: '운동', english: 'Exercise / Sports', pronunciation: 'un-dong', partOfSpeech: 'noun', example: '매일 운동해요.', exampleTranslation: 'I exercise every day.', category: 'Activities' },
    { id: '1-54', korean: '노래', english: 'Song', pronunciation: 'no-rae', partOfSpeech: 'noun', example: '이 노래 알아요?', exampleTranslation: 'Do you know this song?', category: 'K-Culture' },
    { id: '1-55', korean: '드라마', english: 'Drama (TV)', pronunciation: 'deu-ra-ma', partOfSpeech: 'noun', example: '한국 드라마를 좋아해요.', exampleTranslation: 'I like Korean dramas.', category: 'K-Culture' },
    { id: '1-56', korean: '아이돌', english: 'Idol (K-pop)', pronunciation: 'a-i-dol', partOfSpeech: 'noun', example: '좋아하는 아이돌이 있어요?', exampleTranslation: 'Do you have a favorite idol?', category: 'K-Culture' },
    { id: '1-57', korean: '화이팅', english: 'Fighting! (encouragement)', pronunciation: 'hwa-i-ting', partOfSpeech: 'exclamation', example: '시험 화이팅!', exampleTranslation: 'Good luck on your exam!', category: 'K-Culture' },
    { id: '1-58', korean: '대박', english: 'Amazing! / Jackpot', pronunciation: 'dae-bak', partOfSpeech: 'exclamation', example: '이거 대박이야!', exampleTranslation: 'This is amazing!', category: 'K-Culture' },
    { id: '1-59', korean: '아파요', english: 'It hurts / I\'m sick', pronunciation: 'a-pa-yo', partOfSpeech: 'adjective', example: '머리가 아파요.', exampleTranslation: 'I have a headache.', category: 'Health' },
    { id: '1-60', korean: '행복하다', english: 'To be happy', pronunciation: 'haeng-bok-ha-da', partOfSpeech: 'adjective', example: '오늘 행복해요.', exampleTranslation: 'I\'m happy today.', category: 'Emotions' },
  ],
  'topik1-2': [
    { id: '2-1', korean: '주문하다', english: 'To order', pronunciation: 'ju-mun-ha-da', partOfSpeech: 'verb', example: '커피 한 잔 주문할게요.', exampleTranslation: 'I\'ll order one cup of coffee.', category: 'Shopping' },
    { id: '2-2', korean: '얼마예요', english: 'How much is it?', pronunciation: 'eol-ma-ye-yo', partOfSpeech: 'phrase', example: '이거 얼마예요?', exampleTranslation: 'How much is this?', category: 'Shopping' },
    { id: '2-3', korean: '계산하다', english: 'To pay / Calculate', pronunciation: 'gye-san-ha-da', partOfSpeech: 'verb', example: '여기서 계산할게요.', exampleTranslation: 'I\'ll pay here.', category: 'Shopping' },
    { id: '2-4', korean: '비싸다', english: 'Expensive', pronunciation: 'bi-ssa-da', partOfSpeech: 'adjective', example: '너무 비싸요.', exampleTranslation: 'It\'s too expensive.', category: 'Shopping' },
    { id: '2-5', korean: '싸다', english: 'Cheap / Inexpensive', pronunciation: 'ssa-da', partOfSpeech: 'adjective', example: '여기가 더 싸요.', exampleTranslation: 'It\'s cheaper here.', category: 'Shopping' },
    { id: '2-6', korean: '약속', english: 'Promise / Appointment', pronunciation: 'yak-sok', partOfSpeech: 'noun', example: '내일 약속이 있어요.', exampleTranslation: 'I have an appointment tomorrow.', category: 'Daily Life' },
    { id: '2-7', korean: '기다리다', english: 'To wait', pronunciation: 'gi-da-ri-da', partOfSpeech: 'verb', example: '잠깐만 기다려 주세요.', exampleTranslation: 'Please wait a moment.', category: 'Actions' },
    { id: '2-8', korean: '찾다', english: 'To find / To look for', pronunciation: 'chat-da', partOfSpeech: 'verb', example: '화장실을 찾고 있어요.', exampleTranslation: 'I\'m looking for the restroom.', category: 'Actions' },
    { id: '2-9', korean: '알다', english: 'To know', pronunciation: 'al-da', partOfSpeech: 'verb', example: '이 노래 알아요?', exampleTranslation: 'Do you know this song?', category: 'Actions' },
    { id: '2-10', korean: '모르다', english: 'To not know', pronunciation: 'mo-reu-da', partOfSpeech: 'verb', example: '잘 모르겠어요.', exampleTranslation: 'I\'m not sure.', category: 'Actions' },
    { id: '2-11', korean: '축하하다', english: 'To congratulate', pronunciation: 'chuk-ha-ha-da', partOfSpeech: 'verb', example: '결혼 축하해요!', exampleTranslation: 'Congratulations on your wedding!', category: 'Social' },
    { id: '2-12', korean: '초대하다', english: 'To invite', pronunciation: 'cho-dae-ha-da', partOfSpeech: 'verb', example: '파티에 초대할게요.', exampleTranslation: 'I\'ll invite you to the party.', category: 'Social' },
    { id: '2-13', korean: '걱정하다', english: 'To worry', pronunciation: 'geok-jeong-ha-da', partOfSpeech: 'verb', example: '걱정하지 마세요.', exampleTranslation: 'Don\'t worry.', category: 'Emotions' },
    { id: '2-14', korean: '실망하다', english: 'To be disappointed', pronunciation: 'sil-mang-ha-da', partOfSpeech: 'verb', example: '실망하지 마세요.', exampleTranslation: 'Don\'t be disappointed.', category: 'Emotions' },
    { id: '2-15', korean: '설레다', english: 'To be excited / Flutter', pronunciation: 'seol-le-da', partOfSpeech: 'verb', example: '마음이 설레요.', exampleTranslation: 'My heart is fluttering.', category: 'K-Culture' },
    { id: '2-16', korean: '멋있다', english: 'Cool / Handsome', pronunciation: 'meot-it-da', partOfSpeech: 'adjective', example: '오빠 진짜 멋있어!', exampleTranslation: 'Oppa, you\'re really cool!', category: 'K-Culture' },
    { id: '2-17', korean: '귀엽다', english: 'Cute', pronunciation: 'gwi-yeop-da', partOfSpeech: 'adjective', example: '정말 귀여워요!', exampleTranslation: 'So cute!', category: 'K-Culture' },
    { id: '2-18', korean: '오빠', english: 'Older brother (female speaker)', pronunciation: 'o-ppa', partOfSpeech: 'noun', example: '오빠, 어디 가요?', exampleTranslation: 'Oppa, where are you going?', category: 'K-Culture' },
    { id: '2-19', korean: '언니', english: 'Older sister (female speaker)', pronunciation: 'eon-ni', partOfSpeech: 'noun', example: '언니, 같이 가요.', exampleTranslation: 'Unnie, let\'s go together.', category: 'K-Culture' },
    { id: '2-20', korean: '선배', english: 'Senior (school/work)', pronunciation: 'seon-bae', partOfSpeech: 'noun', example: '선배님, 감사합니다.', exampleTranslation: 'Thank you, sunbae.', category: 'K-Culture' },
    { id: '2-21', korean: '후배', english: 'Junior (school/work)', pronunciation: 'hu-bae', partOfSpeech: 'noun', example: '후배를 도와주세요.', exampleTranslation: 'Please help the junior.', category: 'K-Culture' },
    { id: '2-22', korean: '치킨', english: 'Fried chicken', pronunciation: 'chi-kin', partOfSpeech: 'noun', example: '치킨 시킬까요?', exampleTranslation: 'Shall we order chicken?', category: 'K-Food' },
    { id: '2-23', korean: '떡볶이', english: 'Spicy rice cakes', pronunciation: 'tteok-bok-ki', partOfSpeech: 'noun', example: '떡볶이 좋아해요?', exampleTranslation: 'Do you like tteokbokki?', category: 'K-Food' },
    { id: '2-24', korean: '김치', english: 'Kimchi', pronunciation: 'gim-chi', partOfSpeech: 'noun', example: '김치 맛있어요.', exampleTranslation: 'Kimchi is delicious.', category: 'K-Food' },
    { id: '2-25', korean: '불고기', english: 'Bulgogi (grilled meat)', pronunciation: 'bul-go-gi', partOfSpeech: 'noun', example: '불고기 먹어 봤어요?', exampleTranslation: 'Have you tried bulgogi?', category: 'K-Food' },
    { id: '2-26', korean: '비빔밥', english: 'Bibimbap (mixed rice)', pronunciation: 'bi-bim-bap', partOfSpeech: 'noun', example: '비빔밥 하나 주세요.', exampleTranslation: 'One bibimbap please.', category: 'K-Food' },
    { id: '2-27', korean: '노래방', english: 'Karaoke room', pronunciation: 'no-rae-bang', partOfSpeech: 'noun', example: '노래방 가자!', exampleTranslation: 'Let\'s go to karaoke!', category: 'K-Culture' },
    { id: '2-28', korean: '편의점', english: 'Convenience store', pronunciation: 'pyeon-ui-jeom', partOfSpeech: 'noun', example: '편의점에서 사요.', exampleTranslation: 'I buy it at the convenience store.', category: 'Places' },
    { id: '2-29', korean: '카페', english: 'Cafe', pronunciation: 'ka-pe', partOfSpeech: 'noun', example: '카페에서 만나요.', exampleTranslation: 'Let\'s meet at the cafe.', category: 'Places' },
    { id: '2-30', korean: '지하철', english: 'Subway', pronunciation: 'ji-ha-cheol', partOfSpeech: 'noun', example: '지하철로 가요.', exampleTranslation: 'I go by subway.', category: 'Transportation' },
    { id: '2-31', korean: '택시', english: 'Taxi', pronunciation: 'taek-si', partOfSpeech: 'noun', example: '택시를 탈까요?', exampleTranslation: 'Shall we take a taxi?', category: 'Transportation' },
    { id: '2-32', korean: '비행기', english: 'Airplane', pronunciation: 'bi-haeng-gi', partOfSpeech: 'noun', example: '비행기로 가요.', exampleTranslation: 'I go by airplane.', category: 'Transportation' },
    { id: '2-33', korean: '여름', english: 'Summer', pronunciation: 'yeo-reum', partOfSpeech: 'noun', example: '여름에 한국에 갈 거예요.', exampleTranslation: 'I\'m going to Korea in summer.', category: 'Seasons' },
    { id: '2-34', korean: '겨울', english: 'Winter', pronunciation: 'gyeo-ul', partOfSpeech: 'noun', example: '겨울에 눈이 와요.', exampleTranslation: 'It snows in winter.', category: 'Seasons' },
    { id: '2-35', korean: '봄', english: 'Spring', pronunciation: 'bom', partOfSpeech: 'noun', example: '봄에 벚꽃이 예뻐요.', exampleTranslation: 'Cherry blossoms are pretty in spring.', category: 'Seasons' },
    { id: '2-36', korean: '가을', english: 'Autumn / Fall', pronunciation: 'ga-eul', partOfSpeech: 'noun', example: '가을 단풍이 아름다워요.', exampleTranslation: 'Autumn leaves are beautiful.', category: 'Seasons' },
    { id: '2-37', korean: '사진', english: 'Photo / Picture', pronunciation: 'sa-jin', partOfSpeech: 'noun', example: '사진 찍어 주세요.', exampleTranslation: 'Please take a photo.', category: 'Daily Life' },
    { id: '2-38', korean: '영화', english: 'Movie / Film', pronunciation: 'yeong-hwa', partOfSpeech: 'noun', example: '영화 보러 갈래요?', exampleTranslation: 'Do you want to go see a movie?', category: 'Entertainment' },
    { id: '2-39', korean: '게임', english: 'Game', pronunciation: 'ge-im', partOfSpeech: 'noun', example: '게임 같이 할래요?', exampleTranslation: 'Want to play a game together?', category: 'Entertainment' },
    { id: '2-40', korean: '피곤하다', english: 'To be tired', pronunciation: 'pi-gon-ha-da', partOfSpeech: 'adjective', example: '오늘 너무 피곤해요.', exampleTranslation: 'I\'m so tired today.', category: 'Emotions' },
  ],
  'topik2-3': [
    { id: '3-1', korean: '경험', english: 'Experience', pronunciation: 'gyeong-heom', partOfSpeech: 'noun', example: '좋은 경험이었어요.', exampleTranslation: 'It was a good experience.', category: 'Life' },
    { id: '3-2', korean: '기회', english: 'Opportunity / Chance', pronunciation: 'gi-hoe', partOfSpeech: 'noun', example: '좋은 기회를 잡으세요.', exampleTranslation: 'Seize the good opportunity.', category: 'Life' },
    { id: '3-3', korean: '성공하다', english: 'To succeed', pronunciation: 'seong-gong-ha-da', partOfSpeech: 'verb', example: '꼭 성공할 거예요.', exampleTranslation: 'You will definitely succeed.', category: 'Life' },
    { id: '3-4', korean: '실패하다', english: 'To fail', pronunciation: 'sil-pae-ha-da', partOfSpeech: 'verb', example: '실패해도 괜찮아요.', exampleTranslation: 'It\'s okay even if you fail.', category: 'Life' },
    { id: '3-5', korean: '관계', english: 'Relationship', pronunciation: 'gwan-gye', partOfSpeech: 'noun', example: '좋은 관계를 유지해요.', exampleTranslation: 'Maintain good relationships.', category: 'Social' },
    { id: '3-6', korean: '문화', english: 'Culture', pronunciation: 'mun-hwa', partOfSpeech: 'noun', example: '한국 문화가 재미있어요.', exampleTranslation: 'Korean culture is interesting.', category: 'Culture' },
    { id: '3-7', korean: '전통', english: 'Tradition', pronunciation: 'jeon-tong', partOfSpeech: 'noun', example: '한국의 전통을 배워요.', exampleTranslation: 'I learn Korean traditions.', category: 'Culture' },
    { id: '3-8', korean: '존경하다', english: 'To respect', pronunciation: 'jon-gyeong-ha-da', partOfSpeech: 'verb', example: '선생님을 존경해요.', exampleTranslation: 'I respect my teacher.', category: 'Social' },
    { id: '3-9', korean: '그리워하다', english: 'To miss (someone)', pronunciation: 'geu-ri-wo-ha-da', partOfSpeech: 'verb', example: '고향이 그리워요.', exampleTranslation: 'I miss my hometown.', category: 'K-Drama' },
    { id: '3-10', korean: '이별', english: 'Farewell / Parting', pronunciation: 'i-byeol', partOfSpeech: 'noun', example: '이별은 슬퍼요.', exampleTranslation: 'Farewells are sad.', category: 'K-Drama' },
    { id: '3-11', korean: '운명', english: 'Destiny / Fate', pronunciation: 'un-myeong', partOfSpeech: 'noun', example: '우리는 운명이에요.', exampleTranslation: 'We are destiny.', category: 'K-Drama' },
    { id: '3-12', korean: '배우', english: 'Actor / Actress', pronunciation: 'bae-u', partOfSpeech: 'noun', example: '좋아하는 배우가 있어요?', exampleTranslation: 'Do you have a favorite actor?', category: 'K-Drama' },
    { id: '3-13', korean: '촬영', english: 'Filming / Shooting', pronunciation: 'chwal-yeong', partOfSpeech: 'noun', example: '드라마 촬영 중이에요.', exampleTranslation: 'They\'re filming a drama.', category: 'K-Drama' },
    { id: '3-14', korean: '인기', english: 'Popularity', pronunciation: 'in-gi', partOfSpeech: 'noun', example: '이 드라마가 인기 많아요.', exampleTranslation: 'This drama is very popular.', category: 'K-Drama' },
    { id: '3-15', korean: '연습하다', english: 'To practice', pronunciation: 'yeon-seup-ha-da', partOfSpeech: 'verb', example: '매일 연습해요.', exampleTranslation: 'I practice every day.', category: 'K-Pop' },
    { id: '3-16', korean: '무대', english: 'Stage', pronunciation: 'mu-dae', partOfSpeech: 'noun', example: '무대가 멋있었어요.', exampleTranslation: 'The stage was amazing.', category: 'K-Pop' },
    { id: '3-17', korean: '팬미팅', english: 'Fan meeting', pronunciation: 'paen-mi-ting', partOfSpeech: 'noun', example: '팬미팅에 갈 거예요.', exampleTranslation: 'I\'m going to the fan meeting.', category: 'K-Pop' },
    { id: '3-18', korean: '데뷔', english: 'Debut', pronunciation: 'de-bwi', partOfSpeech: 'noun', example: '올해 데뷔했어요.', exampleTranslation: 'They debuted this year.', category: 'K-Pop' },
    { id: '3-19', korean: '환경', english: 'Environment', pronunciation: 'hwan-gyeong', partOfSpeech: 'noun', example: '환경을 보호해야 해요.', exampleTranslation: 'We must protect the environment.', category: 'Society' },
    { id: '3-20', korean: '건강', english: 'Health', pronunciation: 'geon-gang', partOfSpeech: 'noun', example: '건강이 가장 중요해요.', exampleTranslation: 'Health is the most important.', category: 'Health' },
    { id: '3-21', korean: '계획', english: 'Plan', pronunciation: 'gye-hoek', partOfSpeech: 'noun', example: '여행 계획을 세웠어요.', exampleTranslation: 'I made a travel plan.', category: 'Daily Life' },
    { id: '3-22', korean: '소개하다', english: 'To introduce', pronunciation: 'so-gae-ha-da', partOfSpeech: 'verb', example: '자기소개를 해 주세요.', exampleTranslation: 'Please introduce yourself.', category: 'Social' },
    { id: '3-23', korean: '추천하다', english: 'To recommend', pronunciation: 'chu-cheon-ha-da', partOfSpeech: 'verb', example: '맛집 추천해 주세요.', exampleTranslation: 'Please recommend a good restaurant.', category: 'Social' },
    { id: '3-24', korean: '의견', english: 'Opinion', pronunciation: 'ui-gyeon', partOfSpeech: 'noun', example: '의견을 말해 주세요.', exampleTranslation: 'Please share your opinion.', category: 'Communication' },
    { id: '3-25', korean: '동의하다', english: 'To agree', pronunciation: 'dong-ui-ha-da', partOfSpeech: 'verb', example: '저도 동의해요.', exampleTranslation: 'I agree too.', category: 'Communication' },
    { id: '3-26', korean: '반대하다', english: 'To oppose / Disagree', pronunciation: 'ban-dae-ha-da', partOfSpeech: 'verb', example: '그 의견에 반대해요.', exampleTranslation: 'I disagree with that opinion.', category: 'Communication' },
    { id: '3-27', korean: '설명하다', english: 'To explain', pronunciation: 'seol-myeong-ha-da', partOfSpeech: 'verb', example: '다시 설명해 주세요.', exampleTranslation: 'Please explain again.', category: 'Communication' },
    { id: '3-28', korean: '비교하다', english: 'To compare', pronunciation: 'bi-gyo-ha-da', partOfSpeech: 'verb', example: '두 개를 비교해 봐요.', exampleTranslation: 'Let\'s compare the two.', category: 'Actions' },
    { id: '3-29', korean: '결정하다', english: 'To decide', pronunciation: 'gyeol-jeong-ha-da', partOfSpeech: 'verb', example: '빨리 결정해야 해요.', exampleTranslation: 'We need to decide quickly.', category: 'Actions' },
    { id: '3-30', korean: '포기하다', english: 'To give up', pronunciation: 'po-gi-ha-da', partOfSpeech: 'verb', example: '절대 포기하지 마세요.', exampleTranslation: 'Never give up.', category: 'Motivation' },
    { id: '3-31', korean: '노력하다', english: 'To make effort', pronunciation: 'no-ryeok-ha-da', partOfSpeech: 'verb', example: '열심히 노력할게요.', exampleTranslation: 'I\'ll try my best.', category: 'Motivation' },
    { id: '3-32', korean: '꿈', english: 'Dream', pronunciation: 'kkum', partOfSpeech: 'noun', example: '꿈을 이루세요.', exampleTranslation: 'Achieve your dream.', category: 'Motivation' },
    { id: '3-33', korean: '자신감', english: 'Confidence', pronunciation: 'ja-sin-gam', partOfSpeech: 'noun', example: '자신감을 가지세요.', exampleTranslation: 'Have confidence.', category: 'Motivation' },
    { id: '3-34', korean: '습관', english: 'Habit', pronunciation: 'seup-gwan', partOfSpeech: 'noun', example: '좋은 습관을 만드세요.', exampleTranslation: 'Create good habits.', category: 'Daily Life' },
    { id: '3-35', korean: '복잡하다', english: 'Complicated / Complex', pronunciation: 'bok-jap-ha-da', partOfSpeech: 'adjective', example: '이 문제가 복잡해요.', exampleTranslation: 'This problem is complicated.', category: 'Descriptions' },
    { id: '3-36', korean: '간단하다', english: 'Simple / Easy', pronunciation: 'gan-dan-ha-da', partOfSpeech: 'adjective', example: '간단한 질문이에요.', exampleTranslation: 'It\'s a simple question.', category: 'Descriptions' },
    { id: '3-37', korean: '정확하다', english: 'Accurate / Precise', pronunciation: 'jeong-hwak-ha-da', partOfSpeech: 'adjective', example: '정확하게 말해 주세요.', exampleTranslation: 'Please speak precisely.', category: 'Descriptions' },
    { id: '3-38', korean: '중요하다', english: 'Important', pronunciation: 'jung-yo-ha-da', partOfSpeech: 'adjective', example: '건강이 중요해요.', exampleTranslation: 'Health is important.', category: 'Descriptions' },
    { id: '3-39', korean: '필요하다', english: 'Necessary / Needed', pronunciation: 'pil-yo-ha-da', partOfSpeech: 'adjective', example: '뭐가 필요해요?', exampleTranslation: 'What do you need?', category: 'Descriptions' },
    { id: '3-40', korean: '특별하다', english: 'Special', pronunciation: 'teuk-byeol-ha-da', partOfSpeech: 'adjective', example: '특별한 날이에요.', exampleTranslation: 'It\'s a special day.', category: 'Descriptions' },
  ],
  'topik2-4': [
    { id: '4-1', korean: '경제', english: 'Economy', pronunciation: 'gyeong-je', partOfSpeech: 'noun', example: '경제가 성장하고 있어요.', exampleTranslation: 'The economy is growing.', category: 'Business' },
    { id: '4-2', korean: '정치', english: 'Politics', pronunciation: 'jeong-chi', partOfSpeech: 'noun', example: '정치에 관심이 있어요.', exampleTranslation: 'I\'m interested in politics.', category: 'Society' },
    { id: '4-3', korean: '사회', english: 'Society', pronunciation: 'sa-hoe', partOfSpeech: 'noun', example: '사회 문제를 해결해야 해요.', exampleTranslation: 'We need to solve social problems.', category: 'Society' },
    { id: '4-4', korean: '기술', english: 'Technology', pronunciation: 'gi-sul', partOfSpeech: 'noun', example: '기술이 빠르게 발전해요.', exampleTranslation: 'Technology is advancing rapidly.', category: 'Technology' },
    { id: '4-5', korean: '연구하다', english: 'To research', pronunciation: 'yeon-gu-ha-da', partOfSpeech: 'verb', example: '새로운 주제를 연구해요.', exampleTranslation: 'I research new topics.', category: 'Academic' },
    { id: '4-6', korean: '발표하다', english: 'To present / Announce', pronunciation: 'bal-pyo-ha-da', partOfSpeech: 'verb', example: '내일 발표가 있어요.', exampleTranslation: 'I have a presentation tomorrow.', category: 'Academic' },
    { id: '4-7', korean: '논쟁', english: 'Debate / Argument', pronunciation: 'non-jaeng', partOfSpeech: 'noun', example: '이 주제는 논쟁이 많아요.', exampleTranslation: 'This topic has much debate.', category: 'Communication' },
    { id: '4-8', korean: '주장하다', english: 'To argue / Claim', pronunciation: 'ju-jang-ha-da', partOfSpeech: 'verb', example: '자신의 의견을 주장해요.', exampleTranslation: 'They assert their opinion.', category: 'Communication' },
    { id: '4-9', korean: '해결하다', english: 'To solve / Resolve', pronunciation: 'hae-gyeol-ha-da', partOfSpeech: 'verb', example: '문제를 해결했어요.', exampleTranslation: 'I solved the problem.', category: 'Actions' },
    { id: '4-10', korean: '영향', english: 'Influence / Impact', pronunciation: 'yeong-hyang', partOfSpeech: 'noun', example: '큰 영향을 미쳤어요.', exampleTranslation: 'It had a big impact.', category: 'Academic' },
    { id: '4-11', korean: '조사하다', english: 'To investigate / Survey', pronunciation: 'jo-sa-ha-da', partOfSpeech: 'verb', example: '시장을 조사했어요.', exampleTranslation: 'I surveyed the market.', category: 'Business' },
    { id: '4-12', korean: '분석하다', english: 'To analyze', pronunciation: 'bun-seok-ha-da', partOfSpeech: 'verb', example: '데이터를 분석해요.', exampleTranslation: 'I analyze the data.', category: 'Business' },
    { id: '4-13', korean: '적용하다', english: 'To apply', pronunciation: 'jeok-yong-ha-da', partOfSpeech: 'verb', example: '새 방법을 적용해요.', exampleTranslation: 'I apply a new method.', category: 'Business' },
    { id: '4-14', korean: '효과', english: 'Effect / Effectiveness', pronunciation: 'hyo-gwa', partOfSpeech: 'noun', example: '효과가 좋아요.', exampleTranslation: 'The effect is good.', category: 'Academic' },
    { id: '4-15', korean: '구조', english: 'Structure', pronunciation: 'gu-jo', partOfSpeech: 'noun', example: '문장 구조를 배워요.', exampleTranslation: 'I learn sentence structure.', category: 'Academic' },
    { id: '4-16', korean: '과정', english: 'Process / Course', pronunciation: 'gwa-jeong', partOfSpeech: 'noun', example: '학습 과정이 중요해요.', exampleTranslation: 'The learning process is important.', category: 'Academic' },
    { id: '4-17', korean: '원인', english: 'Cause / Reason', pronunciation: 'won-in', partOfSpeech: 'noun', example: '원인을 찾아야 해요.', exampleTranslation: 'We need to find the cause.', category: 'Academic' },
    { id: '4-18', korean: '결과', english: 'Result / Outcome', pronunciation: 'gyeol-gwa', partOfSpeech: 'noun', example: '좋은 결과를 얻었어요.', exampleTranslation: 'I got a good result.', category: 'Academic' },
    { id: '4-19', korean: '책임', english: 'Responsibility', pronunciation: 'chaek-im', partOfSpeech: 'noun', example: '책임감이 중요해요.', exampleTranslation: 'Responsibility is important.', category: 'Business' },
    { id: '4-20', korean: '협력하다', english: 'To cooperate', pronunciation: 'hyeop-ryeok-ha-da', partOfSpeech: 'verb', example: '함께 협력합시다.', exampleTranslation: 'Let\'s cooperate together.', category: 'Business' },
    { id: '4-21', korean: '존중하다', english: 'To respect', pronunciation: 'jon-jung-ha-da', partOfSpeech: 'verb', example: '서로 존중해야 해요.', exampleTranslation: 'We must respect each other.', category: 'Social' },
    { id: '4-22', korean: '변화', english: 'Change', pronunciation: 'byeon-hwa', partOfSpeech: 'noun', example: '변화를 두려워하지 마세요.', exampleTranslation: 'Don\'t be afraid of change.', category: 'Life' },
    { id: '4-23', korean: '도전', english: 'Challenge', pronunciation: 'do-jeon', partOfSpeech: 'noun', example: '새로운 도전을 해요.', exampleTranslation: 'I take on new challenges.', category: 'Motivation' },
    { id: '4-24', korean: '성취', english: 'Achievement', pronunciation: 'seong-chwi', partOfSpeech: 'noun', example: '큰 성취를 이뤘어요.', exampleTranslation: 'I achieved great things.', category: 'Motivation' },
    { id: '4-25', korean: '갈등', english: 'Conflict', pronunciation: 'gal-deung', partOfSpeech: 'noun', example: '갈등을 해결해요.', exampleTranslation: 'I resolve the conflict.', category: 'Social' },
    { id: '4-26', korean: '타협하다', english: 'To compromise', pronunciation: 'ta-hyeop-ha-da', partOfSpeech: 'verb', example: '서로 타협해야 해요.', exampleTranslation: 'We need to compromise.', category: 'Social' },
    { id: '4-27', korean: '인정하다', english: 'To acknowledge / Admit', pronunciation: 'in-jeong-ha-da', partOfSpeech: 'verb', example: '실수를 인정해요.', exampleTranslation: 'I acknowledge my mistake.', category: 'Communication' },
    { id: '4-28', korean: '증가하다', english: 'To increase', pronunciation: 'jeung-ga-ha-da', partOfSpeech: 'verb', example: '인구가 증가해요.', exampleTranslation: 'The population is increasing.', category: 'Academic' },
    { id: '4-29', korean: '감소하다', english: 'To decrease', pronunciation: 'gam-so-ha-da', partOfSpeech: 'verb', example: '비용이 감소했어요.', exampleTranslation: 'The cost decreased.', category: 'Academic' },
    { id: '4-30', korean: '유지하다', english: 'To maintain', pronunciation: 'yu-ji-ha-da', partOfSpeech: 'verb', example: '건강을 유지하세요.', exampleTranslation: 'Maintain your health.', category: 'Life' },
  ],
};

export function getWordsForLevel(levelId: string): Word[] {
  return VOCABULARY_DATA[levelId] || [];
}

export function getDailyWords(levelId: string, day: number, wordsPerDay: number = 20): Word[] {
  const allWords = getWordsForLevel(levelId);
  const startIndex = ((day - 1) * wordsPerDay) % allWords.length;
  const words: Word[] = [];
  for (let i = 0; i < wordsPerDay; i++) {
    words.push(allWords[(startIndex + i) % allWords.length]);
  }
  return words;
}

export function generateQuizOptions(correctWord: Word, allWords: Word[], count: number = 4): string[] {
  const options = [correctWord.english];
  const otherWords = allWords.filter(w => w.id !== correctWord.id);
  const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
  for (const w of shuffled) {
    if (options.length >= count) break;
    if (!options.includes(w.english)) {
      options.push(w.english);
    }
  }
  while (options.length < count) {
    options.push(`Option ${options.length + 1}`);
  }
  return options.sort(() => Math.random() - 0.5);
}

export function getAllWords(): Word[] {
  return Object.values(VOCABULARY_DATA).flat();
}
