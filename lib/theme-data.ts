export interface ThemeLesson {
  id: string;
  title: string;
  titleKr: string;
  icon: string;
  color: string;
  description: string;
  words: ThemeWord[];
}

export interface ThemeWord {
  korean: string;
  english: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

export const THEME_LESSONS: ThemeLesson[] = [
  {
    id: 'kdrama',
    title: 'K-Drama Expressions',
    titleKr: '드라마 표현',
    icon: 'film',
    color: '#FF6B6B',
    description: 'Popular phrases from Korean dramas',
    words: [
      { korean: '사랑해', english: 'I love you', pronunciation: 'sa-rang-hae', example: '나는 너를 사랑해.', exampleTranslation: 'I love you.' },
      { korean: '보고 싶어', english: 'I miss you', pronunciation: 'bo-go si-peo', example: '너무 보고 싶었어.', exampleTranslation: 'I missed you so much.' },
      { korean: '미안해', english: "I'm sorry", pronunciation: 'mi-an-hae', example: '정말 미안해.', exampleTranslation: "I'm really sorry." },
      { korean: '괜찮아', english: "It's okay", pronunciation: 'gwaen-chan-a', example: '괜찮아, 걱정 마.', exampleTranslation: "It's okay, don't worry." },
      { korean: '잠깐만', english: 'Wait a moment', pronunciation: 'jam-kkan-man', example: '잠깐만 기다려!', exampleTranslation: 'Wait a moment!' },
      { korean: '어떡해', english: 'What do I do?', pronunciation: 'eo-tteok-hae', example: '이제 어떡해?', exampleTranslation: 'What do I do now?' },
      { korean: '진짜?', english: 'Really?', pronunciation: 'jin-jja', example: '진짜? 정말이야?', exampleTranslation: 'Really? Is it true?' },
      { korean: '가지 마', english: "Don't go", pronunciation: 'ga-ji ma', example: '제발 가지 마.', exampleTranslation: 'Please don\'t go.' },
      { korean: '잘 했어', english: 'Good job', pronunciation: 'jal haess-eo', example: '정말 잘 했어!', exampleTranslation: 'You did really well!' },
      { korean: '힘내', english: 'Cheer up', pronunciation: 'him-nae', example: '힘내! 할 수 있어.', exampleTranslation: 'Cheer up! You can do it.' },
      { korean: '운명이야', english: "It's destiny", pronunciation: 'un-myeong-i-ya', example: '우리는 운명이야.', exampleTranslation: "We are destiny." },
      { korean: '첫눈에 반했어', english: 'Love at first sight', pronunciation: 'cheot-nun-e ban-haess-eo', example: '널 첫눈에 반했어.', exampleTranslation: 'I fell for you at first sight.' },
    ],
  },
  {
    id: 'kpop',
    title: 'K-Pop Fan Talk',
    titleKr: '케이팝 팬 용어',
    icon: 'musical-notes',
    color: '#DDA0DD',
    description: 'Essential vocabulary for K-Pop fans',
    words: [
      { korean: '최애', english: 'Bias / Favorite', pronunciation: 'choe-ae', example: '내 최애는 지민이야.', exampleTranslation: 'My bias is Jimin.' },
      { korean: '컴백', english: 'Comeback', pronunciation: 'keom-baek', example: '다음 달에 컴백해요.', exampleTranslation: "They're coming back next month." },
      { korean: '총공', english: 'Mass streaming', pronunciation: 'chong-gong', example: '총공 시간이에요!', exampleTranslation: "It's time for mass streaming!" },
      { korean: '음원', english: 'Digital track', pronunciation: 'eum-won', example: '음원이 나왔어요.', exampleTranslation: 'The digital track is out.' },
      { korean: '떡밥', english: 'Teaser / Hint', pronunciation: 'tteok-bap', example: '떡밥이 나왔다!', exampleTranslation: 'A teaser dropped!' },
      { korean: '입덕', english: 'Becoming a fan', pronunciation: 'ip-deok', example: '이 영상 보고 입덕했어.', exampleTranslation: 'I became a fan after watching this.' },
      { korean: '덕질', english: 'Fan activities', pronunciation: 'deok-jil', example: '덕질이 행복해요.', exampleTranslation: 'Fan activities make me happy.' },
      { korean: '직캠', english: 'Fancam', pronunciation: 'jik-kaem', example: '직캠 조회수가 대박이야.', exampleTranslation: 'The fancam views are amazing.' },
      { korean: '팬싸', english: 'Fan sign event', pronunciation: 'paen-ssa', example: '팬싸에 당첨됐어!', exampleTranslation: 'I won the fan sign lottery!' },
      { korean: '멜론', english: 'Melon (music app)', pronunciation: 'mel-lon', example: '멜론 차트 1위!', exampleTranslation: 'Number 1 on Melon chart!' },
    ],
  },
  {
    id: 'kfood',
    title: 'Korean Food & Dining',
    titleKr: '한식과 식사',
    icon: 'restaurant',
    color: '#FFE66D',
    description: 'Food vocabulary and ordering phrases',
    words: [
      { korean: '맛있게 드세요', english: 'Enjoy your meal', pronunciation: 'ma-sit-ge deu-se-yo', example: '맛있게 드세요!', exampleTranslation: 'Enjoy your meal!' },
      { korean: '잘 먹겠습니다', english: "I'll eat well (before eating)", pronunciation: 'jal meok-get-seum-ni-da', example: '잘 먹겠습니다!', exampleTranslation: 'Thank you for the food!' },
      { korean: '잘 먹었습니다', english: 'I ate well (after eating)', pronunciation: 'jal meog-eot-seum-ni-da', example: '잘 먹었습니다!', exampleTranslation: 'Thank you for the meal!' },
      { korean: '소주', english: 'Soju', pronunciation: 'so-ju', example: '소주 한 병 주세요.', exampleTranslation: 'One bottle of soju please.' },
      { korean: '삼겹살', english: 'Pork belly', pronunciation: 'sam-gyeop-sal', example: '삼겹살 먹으러 가자!', exampleTranslation: "Let's go eat pork belly!" },
      { korean: '반찬', english: 'Side dishes', pronunciation: 'ban-chan', example: '반찬 더 주세요.', exampleTranslation: 'More side dishes please.' },
      { korean: '매워요', english: "It's spicy", pronunciation: 'mae-wo-yo', example: '이거 너무 매워요!', exampleTranslation: 'This is too spicy!' },
      { korean: '배불러요', english: "I'm full", pronunciation: 'bae-bul-leo-yo', example: '배불러요, 더 못 먹어요.', exampleTranslation: "I'm full, I can't eat more." },
      { korean: '건배', english: 'Cheers!', pronunciation: 'geon-bae', example: '건배! 위하여!', exampleTranslation: 'Cheers! To us!' },
      { korean: '포장해 주세요', english: 'Please wrap it to go', pronunciation: 'po-jang-hae ju-se-yo', example: '이거 포장해 주세요.', exampleTranslation: 'Please wrap this to go.' },
    ],
  },
  {
    id: 'ktravel',
    title: 'Travel in Korea',
    titleKr: '한국 여행',
    icon: 'airplane',
    color: '#45B7D1',
    description: 'Essential phrases for traveling in Korea',
    words: [
      { korean: '여기 어디예요?', english: 'Where is this?', pronunciation: 'yeo-gi eo-di-ye-yo', example: '여기 어디예요? 길을 잃었어요.', exampleTranslation: 'Where is this? I\'m lost.' },
      { korean: '화장실', english: 'Restroom', pronunciation: 'hwa-jang-sil', example: '화장실이 어디예요?', exampleTranslation: 'Where is the restroom?' },
      { korean: '지하철', english: 'Subway', pronunciation: 'ji-ha-cheol', example: '지하철역이 가까워요.', exampleTranslation: 'The subway station is close.' },
      { korean: '호텔', english: 'Hotel', pronunciation: 'ho-tel', example: '호텔 예약했어요.', exampleTranslation: 'I reserved a hotel.' },
      { korean: '관광지', english: 'Tourist spot', pronunciation: 'gwan-gwang-ji', example: '유명한 관광지예요.', exampleTranslation: "It's a famous tourist spot." },
      { korean: '환전', english: 'Currency exchange', pronunciation: 'hwan-jeon', example: '환전소가 어디예요?', exampleTranslation: 'Where is the currency exchange?' },
      { korean: '길을 잃었어요', english: "I'm lost", pronunciation: 'gir-eul il-eoss-eo-yo', example: '길을 잃었어요. 도와주세요.', exampleTranslation: "I'm lost. Please help me." },
      { korean: '사진 찍어 주세요', english: 'Please take a photo', pronunciation: 'sa-jin jjig-eo ju-se-yo', example: '사진 좀 찍어 주세요.', exampleTranslation: 'Could you take a photo please?' },
      { korean: '면세점', english: 'Duty-free shop', pronunciation: 'myeon-se-jeom', example: '면세점에서 쇼핑할 거예요.', exampleTranslation: "I'll shop at the duty-free." },
      { korean: '출구', english: 'Exit', pronunciation: 'chul-gu', example: '출구는 어디예요?', exampleTranslation: 'Where is the exit?' },
    ],
  },
  {
    id: 'kslang',
    title: 'Korean Internet Slang',
    titleKr: '인터넷 신조어',
    icon: 'phone-portrait',
    color: '#96CEB4',
    description: 'Modern slang used online & in daily life',
    words: [
      { korean: 'ㅋㅋㅋ', english: 'Haha (laughing)', pronunciation: 'keu-keu-keu', example: '진짜 웃기다 ㅋㅋㅋ', exampleTranslation: 'So funny haha.' },
      { korean: 'ㅎㅎ', english: 'Hehe (gentle laugh)', pronunciation: 'heu-heu', example: '귀엽다 ㅎㅎ', exampleTranslation: 'Cute hehe.' },
      { korean: '갑분싸', english: 'Sudden awkward silence', pronunciation: 'gap-bun-ssa', example: '갑분싸됐네...', exampleTranslation: 'It got awkward suddenly...' },
      { korean: '존맛', english: 'Super delicious', pronunciation: 'jon-mat', example: '이거 존맛이야!', exampleTranslation: 'This is super delicious!' },
      { korean: '꿀잼', english: 'So fun / Entertaining', pronunciation: 'kkul-jaem', example: '이 영화 꿀잼이야.', exampleTranslation: 'This movie is so fun.' },
      { korean: '노잼', english: 'Not fun / Boring', pronunciation: 'no-jaem', example: '완전 노잼이야.', exampleTranslation: 'Totally boring.' },
      { korean: '혼밥', english: 'Eating alone', pronunciation: 'hon-bap', example: '오늘 혼밥했어.', exampleTranslation: 'I ate alone today.' },
      { korean: '혼술', english: 'Drinking alone', pronunciation: 'hon-sul', example: '혼술 하는 중이야.', exampleTranslation: "I'm drinking alone." },
      { korean: '인싸', english: 'Popular person (insider)', pronunciation: 'in-ssa', example: '완전 인싸야!', exampleTranslation: 'Totally a social butterfly!' },
      { korean: '아싸', english: 'Loner (outsider)', pronunciation: 'a-ssa', example: '나는 아싸인데...', exampleTranslation: "I'm kind of a loner..." },
    ],
  },
  {
    id: 'kmanners',
    title: 'Korean Manners & Culture',
    titleKr: '한국 예절',
    icon: 'heart',
    color: '#FFEAA7',
    description: 'Cultural etiquette and polite expressions',
    words: [
      { korean: '수고하셨습니다', english: 'Thank you for your hard work', pronunciation: 'su-go-ha-syeot-seum-ni-da', example: '오늘도 수고하셨습니다.', exampleTranslation: 'Thank you for your hard work today.' },
      { korean: '실례합니다', english: 'Excuse me', pronunciation: 'sil-lye-ham-ni-da', example: '실례합니다, 지나갈게요.', exampleTranslation: 'Excuse me, let me pass.' },
      { korean: '덕분에', english: 'Thanks to you', pronunciation: 'deok-bun-e', example: '선생님 덕분에 합격했어요.', exampleTranslation: 'I passed thanks to you, teacher.' },
      { korean: '죄송합니다', english: "I'm sorry (formal)", pronunciation: 'joe-song-ham-ni-da', example: '늦어서 죄송합니다.', exampleTranslation: "I'm sorry for being late." },
      { korean: '잘 부탁드립니다', english: 'Please take care of me', pronunciation: 'jal bu-tak-deu-rim-ni-da', example: '앞으로 잘 부탁드립니다.', exampleTranslation: 'Please take care of me going forward.' },
      { korean: '어서 오세요', english: 'Welcome', pronunciation: 'eo-seo o-se-yo', example: '어서 오세요! 뭐 드실래요?', exampleTranslation: 'Welcome! What would you like?' },
      { korean: '안녕히 가세요', english: 'Goodbye (to someone leaving)', pronunciation: 'an-nyeong-hi ga-se-yo', example: '안녕히 가세요!', exampleTranslation: 'Goodbye!' },
      { korean: '안녕히 계세요', english: 'Goodbye (to someone staying)', pronunciation: 'an-nyeong-hi gye-se-yo', example: '안녕히 계세요!', exampleTranslation: 'Goodbye! (Stay well!)' },
      { korean: '존댓말', english: 'Formal/polite language', pronunciation: 'jon-daen-mal', example: '존댓말을 사용해 주세요.', exampleTranslation: 'Please use formal language.' },
      { korean: '반말', english: 'Informal language', pronunciation: 'ban-mal', example: '반말 해도 돼요?', exampleTranslation: 'Can I speak informally?' },
    ],
  },
];
