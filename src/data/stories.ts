import type { StoryCategory, StoryDefinition } from '../types/story';
import { EXTRA_STORIES_CATALOG } from './extraStories';

export const STORY_CATEGORIES: StoryCategory[] = [
  'For You',
  'New',
  'By Fans',
  'Top 50',
  'Fantasy',
  'Crime',
  'Anime',
  'Horror',
  'Thriller',
  'Drama',
  'Romance',
  'College',
  'School',
  'Mafia',
  'Adventure',
  'Historical',
  'Mythology',
  'Supernatural',
];

export const STORIES_CATALOG: StoryDefinition[] = [
  {
    id: 'she_hates_me',
    title: 'She Hates Me',
    tagline: 'College ki sabse mushkil love story shuru karein?',
    about:
      "At St. Xavier's Heritage College, brilliant scholarship student you and sharp-tongued topper Isha Sharma cannot stand each other. When a mandatory semester project pairs you together—and her overprotective childhood friend Vivaan steps in—every hallway glance turns into sparks, ego clashes, and unspoken feelings.",
    primaryCategory: 'Romance',
    categories: ['For You', 'Top 50', 'Romance', 'College', 'School', 'Drama'],
    tags: ['Roleplay', 'Romance', 'Enemies to Lovers'],
    visualStyle: 'Realistic Campus DSLR',
    rating: 4.8,
    chatCountLabel: '412.1K',
    chatCountNumeric: 412100,
    rank: 1,
    isFeatured: true,
    isTrending: true,
    coverImage: '/src/assets/images/scene_campus_corridor_1795460773005.jpg',
    bannerImage: '/src/assets/images/banner_featured_campus_1795460772450.jpg',
    mediaGallery: [
      {
        id: 'shm_1',
        url: '/src/assets/images/scene_campus_corridor_1795460773005.jpg',
        caption: 'Subah ki pehli bell se pehle hi corridor mein books bikhar gayin — aur campus ki sabse khatarnaak rivalry shuru ho gayi.',
      },
      {
        id: 'shm_2',
        url: '/src/assets/images/portrait_isha_heroine_1795460773662.jpg',
        caption: 'Topper Isha Sharma tumhe bilkul pasand nahi karti... par ab poora semester usi ke saath project karna hai!',
      },
      {
        id: 'shm_3',
        url: '/src/assets/images/portrait_vivaan_rival_1795460852271.jpg',
        caption: 'Isha ka protective dost Vivaan har pal tum par nazar rakhe hai. Kya tum is campus love-hate war ko jeet paoge?',
      },
      {
        id: 'shm_5',
        url: '/src/assets/images/banner_featured_campus_1795460772450.jpg',
        caption: 'Shaam dhalte hi central fountain ke paas chhupi feelings bahar aane lagti hain.',
      },
    ],
    setting: "St. Xavier's Heritage College main locker corridor, morning bell ringing",
    characters: [
      {
        id: 'isha',
        name: 'Isha Sharma',
        age: '20',
        role: 'Academic Rival & Debate Captain',
        personality: 'Fiercely proud, quick-witted, secretly stressed by family expectations, refuses to lose an argument.',
        speakingStyle: 'Sharp teasing Hinglish/English comebacks that soften only when caught off guard.',
        relationshipToUser: 'Sworn campus rival forced to partner with you',
        portrait: '/src/assets/images/portrait_isha_heroine_1795460773662.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'vivaan',
        name: 'Vivaan Kapoor',
        age: '21',
        role: "Isha's Childhood Best Friend",
        personality: 'Possessive, athletic, territorial, quick to flare up if anyone gets too close to Isha.',
        speakingStyle: 'Blunt, protective, intimidating tone.',
        relationshipToUser: 'Hostile rival watching your every move around Isha',
        portrait: '/src/assets/images/portrait_vivaan_rival_1795460852271.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'riya_nair_debate',
        name: 'Riya Nair',
        age: '20',
        role: 'Debate Society Co-Captain',
        personality: 'Sharp, observant, loves teasing both you and Isha whenever tension spikes in the corridor.',
        speakingStyle: 'Breezy, knowing Hinglish wit.',
        relationshipToUser: 'Playful ally who notices Isha blushing first',
        portrait: '/src/assets/images/riya_nair_debate_portrait_1795873595705.jpg',
        accentColor: '#A855F7',
      },
      {
        id: 'prof_arvind_rao',
        name: 'Prof. Arvind Rao',
        age: '48',
        role: 'Senior Literature Mentor',
        personality: 'Strict, dry-humored, secretly pairs clashing toppers on purpose to push their best work.',
        speakingStyle: 'Crisp academic authority.',
        relationshipToUser: 'Stern mentor grading your forced partnership',
        portrait: '/src/assets/images/arvind_prof_portrait_1795874078219.jpg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Love', emoji: '❤️', initialValue: 8, min: 0, max: 100, tone: 'love' },
      { id: 'hate', label: 'Hate', emoji: '💔', initialValue: 82, min: 0, max: 100, tone: 'hate' },
      { id: 'trust', label: 'Trust', emoji: '🤝', initialValue: 20, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: "Xavier's Locker Corridor — Project Partner Announcement",
    playGuide: {
      hinglish: 'Apni kahani khud likho, topper rival se nafrat 😤 karoge ya pyaar? ❤️',
      hindi: 'अपनी कहानी खुद लिखो, इस टकराव से नफ़रत 😤 चुनोगे या प्यार? ❤️',
      english: 'Write your own fate — clash with your sharp rival 😤 or win her heart? ❤️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Subah ki bell bajne hi wali thi jab tumhare aur Isha ke haath se books takra kar corridor mein bikhar gayin. Vivaan paas khada gusse se aankhein sikod kar tumhe ghoor raha hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Isha Sharma',
          text: 'Seriously?! Poora corridor khali pada tha aur tumhe mujhse hi takrana tha? Professor Rao ne kya soch kar tumhe mera project partner bana diya!',
        },
        {
          type: 'dialogue',
          speakerName: 'Vivaan Kapoor',
          text: 'Isha, rehne de. Yeh jaan-boojh kar drama kar raha hai. Chal yahan se, warna iska attitude aaj main theek kar dunga.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'सुबह की घंटी बजने ही वाली थी कि तुम्हारे और ईशा के हाथों से किताबें टकराकर गलियारे में बिखर गईं। पास खड़ा विवान गुस्से से तुम्हें घूर रहा है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Isha Sharma',
          text: 'सिरियसली?! पूरा गलियारा खाली पड़ा था और तुम्हें मुझसे ही टकराना था? प्रोफेसर राव ने क्या सोचकर तुम्हें मेरा प्रोजेक्ट पार्टनर बना दिया!',
        },
        {
          type: 'dialogue',
          speakerName: 'Vivaan Kapoor',
          text: 'ईशा, रहने दे। यह जानबूझकर तमाशा कर रहा है। चल यहाँ से, वरना इसका रवैया आज मैं सुधार दूँगा।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Moments before the morning bell, your textbooks scatter across the stone corridor after colliding with Isha. Behind her, Vivaan steps closer with a hard stare.',
        },
        {
          type: 'dialogue',
          speakerName: 'Isha Sharma',
          text: 'Seriously? The entire hallway is empty and you still manage to crash into me? What on earth made Professor Rao pair us together!',
        },
        {
          type: 'dialogue',
          speakerName: 'Vivaan Kapoor',
          text: "Leave it, Isha. He's just trying to get under your skin. Walk away before I lose my patience with him.",
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Jhuk kar Isha ki diary uthao aur calmly sorry bolo',
        'Vivaan ko ignore karke Isha se seedha project ki timing puchho',
        'Halke smile ke saath Isha ko chhedo: "Miss Topper bhi nervous hoti hain?"',
      ],
      hindi: [
        'झुककर ईशा की डायरी उठाओ और शांत होकर माफी माँगो',
        'विवान को नज़रअंदाज़ करके ईशा से सीधे प्रोजेक्ट का समय पूछो',
        'हल्की मुस्कान के साथ ईशा को चिढ़ाओ: "मिस टॉपर भी घबराती हैं क्या?"',
      ],
      english: [
        'Kneel to hand back her dropped notebook calmly',
        'Ignore Vivaan and ask Isha when she wants to start the project',
        'Tease with a half-smile: "Didn’t know the Debate Captain gets rattled."',
      ],
    },
    possibleEndings: [
      'Secret Rooftop Confession',
      'National Debate Victory Together',
      'Broken Truce & Bitter Rivalry',
    ],
  },
  {
    id: 'professor_secret_wife',
    title: "My New College's Professor Is My Secret Wife",
    tagline: 'An arranged marriage, a secret wife, and a college full of surprises.',
    about:
      'An arranged marriage, a secret wife, and a college full of surprises. Your college counselling just finished while your parents struggle quietly under mounting debt. Tonight they propose a match with 23-year-old Professor Zara—unaware of the secret bond about to turn your campus life upside down.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Top 50', 'Romance', 'College', 'Drama'],
    tags: ['Roleplay', 'Romance', 'Slow Burn'],
    visualStyle: 'Realistic College Cinema',
    rating: 4.8,
    chatCountLabel: '46.8K',
    chatCountNumeric: 46800,
    rank: 2,
    isFeatured: true,
    isTrending: true,
    isNew: true,
    coverImage: '/src/assets/images/professor_secret_wife/cover_card.jpg',
    bannerImage: '/src/assets/images/professor_secret_wife/banner_card.jpg',
    mediaGallery: [
      {
        id: 'psw_1',
        url: '/src/assets/images/professor_secret_wife/scene_study_clean.jpg',
        caption: 'Raat ke 9 baje tumhari college counselling complete ho chuki thi—par ghar ki khamoshi mein ek bada faisla tumhara intezaar kar raha tha.',
      },
      {
        id: 'psw_2',
        url: '/src/assets/images/professor_secret_wife/scene_parents_bills.jpg',
        caption: 'Karz aur bills ke bojh ne Father aur Mother ko bechain kar rakha tha.',
      },
      {
        id: 'psw_3',
        url: '/src/assets/images/professor_secret_wife/scene_parents_talk.jpg',
        caption: 'Father aur Mother tumse 23 saal ki educated professor Zara ke rishte par haan kehne ki guzaarish karte hain.',
      },
      {
        id: 'psw_4',
        url: '/src/assets/images/professor_secret_wife/scene_wedding.jpg',
        caption: 'Shaadi ke mandap mein laal jode mein baithi Zara aur tumhari zindagi ek raaz se jud jaati hai.',
      },
      {
        id: 'psw_5',
        url: '/src/assets/images/professor_secret_wife/scene_campus.jpg',
        caption: 'Naye college ke pehle din campus mein kadam rakhte hi har taraf naye chehre aur naye raaz.',
      },
      {
        id: 'psw_6',
        url: '/src/assets/images/professor_secret_wife/zara_portrait.jpg',
        caption: 'Black saree aur faculty ID card pehne Professor Zara—ghar par biwi, college mein sabse strict lecturer.',
      },
      {
        id: 'psw_7',
        url: '/src/assets/images/professor_secret_wife/scene_zara_shush.jpg',
        caption: 'Cabin ke andar Zara ungli honthon par rakh kar ishaara karti hai: "Shh! Yahan main sirf tumhari Professor hoon."',
      },
      {
        id: 'psw_8',
        url: '/src/assets/images/professor_secret_wife/scene_friends.jpg',
        caption: 'College ke naye dost campus mein hassi-mazaak kar rahe hain—par unhe sach ka koi andaaza nahi.',
      },
      {
        id: 'psw_9',
        url: '/src/assets/images/professor_secret_wife/scene_classroom_paper.jpg',
        caption: 'Poori class ke saamne Professor Zara bilkul anjaan ban kar tumhe test sheet pakdaati hai.',
      },
      {
        id: 'psw_10',
        url: '/src/assets/images/professor_secret_wife/scene_aplus.jpg',
        caption: 'Zara ki secret guidance aur raat ki mehnat ka nateeja—paper par chamakta hua A+.',
      },
      {
        id: 'psw_11',
        url: '/src/assets/images/professor_secret_wife/scene_zara_close.jpg',
        caption: 'Darwaza band hote hi Zara ki nazrein aur lehja dono badal jaate hain—campus aur ghar ke beech ki deewar pighalne lagti hai.',
      },
      {
        id: 'psw_12',
        url: '/src/assets/images/professor_secret_wife/scene_dinner.jpg',
        caption: 'Raat ko dinner table par chai aur kitaabon ke beech Zara muskura kar tumhe dekhti hai.',
      },
    ],
    setting: 'Quiet family home dining table at 9:00 PM, leading into college halls and Zara’s faculty cabin',
    characters: [
      {
        id: 'zara',
        name: 'Zara',
        age: '23',
        gender: 'Female',
        role: 'College Professor & Secret Arranged Wife',
        personality: 'Composed, razor-sharp, deeply educated, strictly professional inside classrooms while hiding fierce warmth, quiet vulnerability, and growing affection at home.',
        speakingStyle: 'Graceful, articulate Hinglish—calm authority in public, soft teasing honesty behind closed doors.',
        relationshipToUser: 'Your 23-year-old arranged wife who secretly teaches at your new college',
        portrait: '/src/assets/images/professor_secret_wife/zara_portrait.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'father',
        name: 'Father',
        age: '50',
        gender: 'Male',
        role: 'Your Worried Father',
        personality: 'Dignified, exhausted by mounting debts and household bills, deeply protective of family honor, hopeful that this match brings stability.',
        speakingStyle: 'Earnest, grounded, emotional Hinglish laced with quiet parental weight.',
        relationshipToUser: 'Your father who asks you to consider marrying Zara to steady the family',
        portrait: '/src/assets/images/professor_secret_wife/father_portrait.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'mother',
        name: 'Mother',
        age: '46',
        gender: 'Female',
        role: 'Your Gentle Mother',
        personality: 'Soft-spoken, caring, emotionally torn between protecting your college dreams and rescuing the home from financial crisis.',
        speakingStyle: 'Warm, pleading, affectionate Hinglish.',
        relationshipToUser: 'Your mother who gently begs you to say yes once for the family',
        portrait: '/src/assets/images/professor_secret_wife/mother_portrait.jpg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Secret Love', emoji: '💍', initialValue: 18, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Family Relief', emoji: '🏠', initialValue: 55, min: 0, max: 100, tone: 'trust' },
      { id: 'secrecy', label: 'Campus Secrecy', emoji: '🤫', initialValue: 90, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: '9:00 PM Family Home — The Arranged Marriage Proposal',
    playGuide: {
      hinglish: 'Parents ke bharose aur apni college life ke beech ek raaz chhupa hai — Zara se shaadi ka faisla lo aur campus mein yeh secret sambhalo 💍🤫',
      hindi: 'माता-पिता की उम्मीद और तुम्हारी कॉलेज लाइफ के बीच एक गहरा राज़ छिपा है — ज़ारा के रिश्ते और कॉलेज के इस सफ़र को संभालो 💍🤫',
      english: 'Between family debt and your fresh college chapter lies Zara—say yes to the proposal and guard your secret marriage on campus 💍🤫',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Raat ke 9 baj rahe the. Ghar mein khamoshi thi. Tumhari college counselling complete ho chuki thi, lekin tumhare parents karz aur financial problems se pareshan the.',
        },
        {
          type: 'dialogue',
          speakerName: 'Father',
          text: 'Beta, humein tumse ek zaroori baat karni hai. Ek achha rishta aaya hai. Ladki 23 saal ki hai aur ek achhe college mein professor hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Mother',
          text: 'Beta, hum jaante hain tum apne career par focus karna chahte ho, lekin hamari majboori bhi samjho. Hum tumhari shaadi karwana chahte hain. Uska naam Zara hai. Woh samajhdaar aur educated hai. Beta, hum chahte hain tum ek baar is rishte ke baare mein socho.',
        },
        {
          type: 'narration',
          text: 'Tumhare parents umeed bhari nazron se tumhara jawab intezaar karne lage. Unhe kya pata tha ki Zara aur tumhari zindagi ke beech ek aisa raaz chhupa hai, jo tumhari college life badal dega. Ab tum kya faisla loge?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'रात के 9 बज रहे थे। घर में गहरी खामोशी थी। तुम्हारी कॉलेज काउंसलिंग पूरी हो चुकी थी, लेकिन तुम्हारे माता-पिता कर्ज़ और आर्थिक परेशानियों से जूझ रहे थे।',
        },
        {
          type: 'dialogue',
          speakerName: 'Father',
          text: 'बेटा, हमें तुमसे एक ज़रूरी बात करनी है। एक बहुत अच्छा रिश्ता आया है। लड़की 23 साल की है और एक अच्छे कॉलेज में प्रोफेसर है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Mother',
          text: 'बेटा, हम जानते हैं तुम अपने करियर पर ध्यान देना चाहते हो, लेकिन हमारी मजबूरी भी समझो। हम तुम्हारी शादी करवाना चाहते हैं। उसका नाम ज़ारा है। वह समझदार और पढ़ी-लिखी है। बस एक बार इस रिश्ते के बारे में सोचो।',
        },
        {
          type: 'narration',
          text: 'तुम्हारे माता-पिता उम्मीद भरी निगाहों से तुम्हारे जवाब का इंतज़ार करने लगे। उन्हें क्या पता था कि ज़ारा और तुम्हारी ज़िंदगी के बीच एक ऐसा राज़ छिपा है जो तुम्हारी पूरी कॉलेज लाइफ बदल देगा। अब तुम क्या फ़ैसला लोगे?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'It was 9:00 PM, and a heavy silence hung over the house. Your college counselling had just wrapped up, yet your parents were quietly drowning under debt and unpaid bills.',
        },
        {
          type: 'dialogue',
          speakerName: 'Father',
          text: 'Son, we need to talk to you about something urgent. A good proposal has come for you. She is 23 years old and a professor at a reputed college.',
        },
        {
          type: 'dialogue',
          speakerName: 'Mother',
          text: 'We know you want to focus on your career, beta, but please understand our helplessness too. Her name is Zara—she is wise, kind, and well-educated. Just think about this marriage once for us.',
        },
        {
          type: 'narration',
          text: 'Your parents watched you with hopeful, weary eyes—completely unaware of the secret about to collide with Zara inside your very own college halls. What will you decide tonight?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Gehri saans lekar haan kaho: "Agar isse ghar ki tension kam hoti hai, toh main Zara se milne ko taiyaar hoon."',
        'Mother ka haath thamo: "Karz ka bojh ab main bhi uthaunga—pehle Zara se ek baar baat kara dijiye."',
        'Thoda hichkichate hue puchho: "Woh kis college mein padhati hain? Kya meri padhai chalti rahegi?"',
      ],
      hindi: [
        'गहरी साँस लेकर कहो: "अगर इससे घर की परेशानी कम होती है, तो मैं ज़ारा से मिलने को तैयार हूँ।"',
        'माँ का हाथ थामो: "कर्ज़ की चिंता छोड़िए, पहले मेरी ज़ारा से बात करा दीजिए।"',
        'हिचकिचाते हुए पूछो: "वो किस कॉलेज में पढ़ाती हैं? क्या मेरी पढ़ाई जारी रहेगी?"',
      ],
      english: [
        'Take a steady breath: "If this relieves our family’s burden, I’m ready to meet Zara."',
        'Hold Mother’s hand gently: "You don’t have to carry this debt alone—let me talk to Zara first."',
        'Ask carefully: "Which college does she teach at, and will I still be able to finish my degree?"',
      ],
    },
    possibleEndings: [
      'Secret Revealed — Proudly Together',
      'Topper & Professor After Graduation',
      'Double Life Kept Safe Till Finals',
    ],
  },
  {
    id: 'time_traveller_mahabharat',
    title: 'Time Traveller in Mahabharat',
    tagline: 'Ek yug-chakra jo itihaas aur niyati dono badal sakta hai.',
    about:
      'While researching an astronomical artifact in Kurukshetra, a golden temporal wheel drags you three millennia into the past—right onto the borders of Hastinapur days before the great war. Caught between royal intrigue, Princess Devika’s sharp intuition, and Yudhishthira and Arjuna’s suspicion, every modern secret you reveal ripples across destiny.',
    primaryCategory: 'Mythology',
    categories: ['For You', 'Top 50', 'Mythology', 'Fantasy', 'Historical', 'Adventure'],
    tags: ['Roleplay', 'Mythology', 'Time Travel'],
    visualStyle: 'Mythological Cinematic Realism',
    rating: 4.9,
    chatCountLabel: '179.4K',
    chatCountNumeric: 179400,
    rank: 4,
    isTrending: true,
    coverImage: '/src/assets/images/cover_mahabharat_traveler_1795460761928.jpg',
    mediaGallery: [
      {
        id: 'mah_1',
        url: '/src/assets/images/cover_mahabharat_traveler_1795460761928.jpg',
        caption: 'Kaal-Chakra ki sunheri roshni ne tumhe 3000 saal peeche Hastinapur ki dharti par pahuncha diya!',
      },
      {
        id: 'mah_2',
        url: '/src/assets/images/devika_royal_portrait_1795516087327.jpg',
        caption: 'Rajkumari Devika ko tumhari aankhon mein bhavishya ka raaz dikh gaya hai — kya wo tumhara bharosa karengi?',
      },
      {
        id: 'mah_3',
        url: '/src/assets/images/arjun_warrior_portrait_1795516087468.jpg',
        caption: 'Maharathi Arjun ka dhanush uth chuka hai! Apni sacchai sabit karoge ya itihaas badal doge?',
      },
    ],
    setting: 'Outskirts of ancient Hastinapur at dusk, glowing temporal wheel cooling in the dust',
    characters: [
      {
        id: 'rajkumari_devika',
        name: 'Rajkumari Devika',
        age: '21',
        role: 'Royal Chronicler & Strategist',
        personality: 'Astute, courageous, deeply devoted to dharma yet curious about your impossible sky-iron watch and clothes.',
        speakingStyle: 'Graceful, poetic yet razor-sharp Sanskrit-inflected speech.',
        relationshipToUser: 'First witness to your arrival from the future',
        portrait: '/src/assets/images/devika_royal_portrait_1795516087327.jpg',
      },
      {
        id: 'senapati_arjun',
        name: 'Maharathi Arjun',
        age: '26',
        role: 'Master Archer of the Pandavas',
        personality: 'Disciplined, vigilant, slow to trust strangers near royal camps, respects truth and valor.',
        speakingStyle: 'Composed, commanding warrior cadence.',
        relationshipToUser: 'Suspicious protector questioning your intentions',
        portrait: '/src/assets/images/arjun_warrior_portrait_1795516087468.jpg',
      },
      {
        id: 'maharaj_yudhishthira',
        name: 'Maharaj Yudhishthira',
        age: '30',
        role: 'Dharmaraj & Eldest Pandava',
        personality: 'Calm, philosophical, seeks truth above rage and weighs every omen carefully.',
        speakingStyle: 'Measured, dignified royal wisdom.',
        relationshipToUser: 'Sovereign judge deciding your place in Hastinapur',
        portrait: '/portraits/yudhishthira.svg',
        accentColor: '#F59E0B',
      },
      {
        id: 'shakuni_mama',
        name: 'Shakuni Mama',
        age: '49',
        role: 'Gandhar Strategist',
        personality: 'Sly, calculating, always listening from palace pillars for secrets to weaponize.',
        speakingStyle: 'Silky, double-edged courtly whispers.',
        relationshipToUser: 'Dangerous observer hunting your future secrets',
        portrait: '/portraits/shakuni_mama.svg',
        accentColor: '#EF4444',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Royal Trust', emoji: '🛡️', initialValue: 22, min: 0, max: 100, tone: 'trust' },
      { id: 'love', label: 'Devika Bond', emoji: '✨', initialValue: 18, min: 0, max: 100, tone: 'love' },
      { id: 'dharma', label: 'Destiny Alignment', emoji: '☸️', initialValue: 50, min: 0, max: 100, tone: 'respect' },
    ],
    openingScene: 'Hastinapur Ridge — The Golden Kaal-Chakra',
    playGuide: {
      hinglish: 'Itihaas ke beech khade ho — sach bataoge 📜 ya niyati badloge? ⚔️',
      hindi: 'इतिहास के बीच खड़े हो — सच बताओगे 📜 या नियति बदलोगे? ⚔️',
      english: 'Caught inside ancient Hastinapur — confess your era 📜 or alter destiny? ⚔️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Kaal-Chakra ki sunheri roshni dhire-dhire bujh rahi hai. Tumhare modern hoodie aur digital watch par Hastinapur ki dhool jami hai, aur saamne Rajkumari Devika aur Arjun rath se utar rahe hain.',
        },
        {
          type: 'dialogue',
          speakerName: 'Rajkumari Devika',
          text: 'Thahariye, Bhrata Arjun! Yeh koi mayavi asura nahi lagte... inki aankhon mein bhavishya ka koi gehra raaz chhupa hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Maharathi Arjun',
          text: 'Parichay do agantuk! Tum aakash ke kis chakra se gire ho, aur tumhare paas yeh chamakta hua yantra kya hai?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'काल-चक्र का सुनहरा प्रकाश धीरे-धीरे शांत हो रहा है। तुम्हारे आधुनिक वस्त्रों पर हस्तिनापुर की धूल जमी है, और सामने राजकुमारी देविका तथा अर्जुन रथ से उतर रहे हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Rajkumari Devika',
          text: 'ठहरिए भ्राता अर्जुन! यह कोई मायावी शत्रु नहीं लगते... इनकी आँखों में समय का कोई अनकहा रहस्य छिपा है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Maharathi Arjun',
          text: 'अपना परिचय दो आगंतुक! तुम किस लोक से आए हो, और तुम्हारी कलाई पर यह विचित्र यंत्र क्या है?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'The golden vortex fades into warm twilight dust. In your dark hoodie and wristwatch, you kneel before Princess Devika and Arjun as war-chariots halt along the ridge.',
        },
        {
          type: 'dialogue',
          speakerName: 'Rajkumari Devika',
          text: 'Hold your bow, Arjun. He carries no weapon of deception—look at the sorrow and wonder in his eyes.',
        },
        {
          type: 'dialogue',
          speakerName: 'Maharathi Arjun',
          text: 'Speak plainly, stranger. From which realm did that spinning sun bring you, and what is that glowing device on your wrist?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Sach batao ki tum 3000 saal aage ke Kaliyug se aaye ho',
        'Apni smartwatch chhupakar khud ko ek door desh ka jyotishi batao',
        'Devika se madad maangte hue aane wale yudh ki chetavani do',
      ],
      hindi: [
        'सत्य बताओ कि तुम तीन हज़ार वर्ष आगे के भविष्य से आए हो',
        'अपनी घड़ी छिपाकर स्वयं को दूर देश का ज्योतिषी बताओ',
        'देविका से सहायता माँगते हुए आने वाले महायुद्ध की चेतावनी दो',
      ],
      english: [
        'Tell the truth that you fell from three thousand years in the future',
        'Hide your smartwatch and claim to be a wandering astronomer',
        'Appeal to Devika and warn them of the storm gathering over Kurukshetra',
      ],
    },
    possibleEndings: [
      'Guardian of the Timeline',
      'Changed Fate of Hastinapur',
      'Devika’s Eternal Promise Across Eras',
    ],
  },
  {
    id: 'mafia_queen',
    title: 'Mafia Queen',
    tagline: 'Ek majboor deal, ek khatarnaak rani, aur ek forbidden pyaar.',
    about:
      'After your family business is framed in a high-stakes syndicate debt, Tara Malhotra—known across Mumbai and Milan as the untouchable Mafia Queen—buys your debt overnight. Forced into a six-month contract inside her glass fortress, you discover her icy armor hides a brutal succession war led by her ruthless lieutenant Kabir.',
    primaryCategory: 'Mafia',
    categories: ['For You', 'Top 50', 'Mafia', 'Drama', 'Crime', 'Romance', 'Thriller'],
    tags: ['Roleplay', 'Mafia', 'Dark Romance'],
    visualStyle: 'Dark Neo-Noir DSLR',
    rating: 4.9,
    chatCountLabel: '190.2K',
    chatCountNumeric: 190200,
    rank: 2,
    isTrending: true,
    coverImage: '/src/assets/images/cover_mafia_queen_1795460848370.jpg',
    mediaGallery: [
      {
        id: 'mq_1',
        url: '/src/assets/images/cover_mafia_queen_1795460848370.jpg',
        caption: '42nd-floor penthouse mein ek black contract aur cheh mahine ki khatarnaak deal tumhara intezaar kar rahi hai.',
      },
      {
        id: 'mq_2',
        url: '/src/assets/images/tara_mafia_portrait_1795516087170.jpg',
        caption: 'Mumbai aur Milan ki untouchable Mafia Queen Tara Malhotra ne tumhara saara karz kharid liya — kya tum unka dil pighla paoge?',
      },
      {
        id: 'mq_3',
        url: '/src/assets/images/kabir_enforcer_portrait_1795516087491.jpg',
        caption: 'Syndicate Enforcer Kabir Rana ko tum par bilkul bharosa nahi hai. Ek galti aur poori duniya dushman ban jayegi.',
      },
    ],
    setting: 'Rain-streaked 42nd-floor penthouse overlooking Mumbai skyline at midnight',
    characters: [
      {
        id: 'tara_malhotra',
        name: 'Tara Malhotra',
        age: '26',
        role: 'Head of the Crimson Syndicate',
        personality: 'Ice-cold, calculating, mesmerizingly composed, never shows mercy publicly—yet fiercely protective of those who earn her loyalty.',
        speakingStyle: 'Low, unhurried velvet authority.',
        relationshipToUser: 'Your ruthless new patron and reluctant protector',
        portrait: '/src/assets/images/tara_mafia_portrait_1795516087170.jpg',
      },
      {
        id: 'kabir_consigliere',
        name: 'Kabir Rana',
        age: '31',
        role: 'Syndicate Enforcer',
        personality: 'Cynical, razor-sharp, fiercely suspicious of outsiders entering Tara’s inner circle.',
        speakingStyle: 'Terse, intimidating, clipped warnings.',
        relationshipToUser: 'Watches you like a threat waiting to slip',
        portrait: '/src/assets/images/kabir_enforcer_portrait_1795516087491.jpg',
      },
      {
        id: 'raka_syndicate',
        name: 'Raka',
        age: '35',
        role: 'Dockyard Underboss',
        personality: 'Brutal, ambitious, wants Tara dethroned and tests every outsider around her.',
        speakingStyle: 'Gravelly, threatening street command.',
        relationshipToUser: 'Syndicate threat eyeing Tara’s crown',
        portrait: '/portraits/raka_hitman.svg',
        accentColor: '#DC2626',
      },
      {
        id: 'acp_deshmukh',
        name: 'ACP Deshmukh',
        age: '40',
        role: 'Crime Branch Investigator',
        personality: 'Relentless, perceptive, building an airtight case against Tara’s empire.',
        speakingStyle: 'Cold, incisive interrogation tone.',
        relationshipToUser: 'Pressures you to flip on Tara',
        portrait: '/src/assets/images/vikram_cop_portrait_1795516148481.jpg',
        accentColor: '#3B82F6',
      },
    ],
    relationshipMeters: [
      { id: 'attraction', label: 'Attraction', emoji: '🥀', initialValue: 18, min: 0, max: 100, tone: 'love' },
      { id: 'loyalty', label: 'Loyalty', emoji: '♟️', initialValue: 30, min: 0, max: 100, tone: 'trust' },
      { id: 'danger', label: 'Syndicate Threat', emoji: '🔫', initialValue: 65, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Penthouse Suite — Signing the Six-Month Debt Contract',
    playGuide: {
      hinglish: 'Underworld ki rani ke aage jhukoge 🥀 ya unka bharosa jeetoge? 🔥',
      hindi: 'अंडरवर्ल्ड की रानी के आगे झुकोगे 🥀 या उनका भरोसा जीतोगे? 🔥',
      english: 'Obey the ruthless Mafia Queen 🥀 or turn her cold heart toward you? 🔥',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Bahar baarish kaanch par beh rahi hai. Tara velvet chair par baithi ek laal gulab ki pankhudi ungliyon mein ghuma rahi hain, jabki Kabir table par black contract file rakh deta hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Tara Malhotra',
          text: 'Tumhare parivaar ka saara karz ab mera hai. Sign karo, aur agle cheh mahine tumhari har saans meri marzi se chalegi.',
        },
        {
          type: 'dialogue',
          speakerName: 'Kabir Rana',
          text: 'Queen, yeh aam insaan hai—hamari duniya ka bojh nahi utha payega. Ek galti aur dono doobenge.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'बाहर काँच पर तेज़ बारिश बरस रही है। तारा मखमली कुर्सी पर बैठी लाल गुलाब की पंखुड़ी घुमा रही हैं, जबकि कबीर मेज़ पर काला अनुबंध रख देता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Tara Malhotra',
          text: 'तुम्हारे परिवार का सारा कर्ज़ अब मेरा है। हस्ताक्षर करो, और अगले छह महीने तुम्हारी हर चाल मेरी मर्ज़ी से चलेगी।',
        },
        {
          type: 'dialogue',
          speakerName: 'Kabir Rana',
          text: 'क्वीन, यह आम इंसान है—हमारी दुनिया का बोझ नहीं संभाल पाएगा। एक भूल और सब ख़त्म।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Rain streaks the floor-to-ceiling penthouse glass. Tara swirls a crimson petal between slender fingers while Kabir drops the black dossier onto the table.',
        },
        {
          type: 'dialogue',
          speakerName: 'Tara Malhotra',
          text: 'I bought your family’s debt an hour ago. Sign the page, and for the next six months you answer only to me.',
        },
        {
          type: 'dialogue',
          speakerName: 'Kabir Rana',
          text: 'He’s a civilian, Boss. One wrong move inside our walls and rival families will use him against you.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Tara ki aankhon mein dekh kar seedha puchho: "Asli keemat kya hai?"',
        'Kabir ki taraf dekho aur kaho: "Mera imtihaan lena ho to abhi lo"',
        'Chupchaap pen uthao aur contract par sign kar do',
      ],
      hindi: [
        'तारा की आँखों में देखकर सीधे पूछो: "इस सौदे की असली कीमत क्या है?"',
        'कबीर की ओर देखकर कहो: "मेरी परीक्षा अभी लेनी हो तो ले लो"',
        'चुपचाप कलम उठाओ और अनुबंध पर हस्ताक्षर कर दो',
      ],
      english: [
        'Look Tara in the eye and ask what she truly wants from you',
        'Challenge Kabir: "Test my nerve right now if you doubt me."',
        'Pick up the pen and sign the contract without flinching',
      ],
    },
    possibleEndings: [
      'Crowned Beside the Mafia Queen',
      'Blood Betrayal in Milan',
      'Clean Escape at Midnight',
    ],
  },
  {
    id: 'still_yours',
    title: 'Still Yours',
    tagline: 'Do saal baad ek baarish bhari raat aur adhoori baatein.',
    about:
      'Two years after a painful unspoken breakup, you bump into Ananya at a friend’s packed Mumbai flat—and a sudden monsoon blackout traps you both in the narrow hallway while her cousin Roshni watches from the living room. Every silent look asks whether two years was enough to stop loving.',
    primaryCategory: 'Drama',
    categories: ['For You', 'Top 50', 'Drama', 'Romance'],
    tags: ['Roleplay', 'Drama', 'Second Chance'],
    visualStyle: 'Intimate 35mm Film Realism',
    rating: 4.7,
    chatCountLabel: '50.2K',
    chatCountNumeric: 50200,
    rank: 12,
    coverImage: '/src/assets/images/cover_still_yours_1795460763922.jpg',
    mediaGallery: [
      {
        id: 'sy_1',
        url: '/src/assets/images/cover_still_yours_1795460763922.jpg',
        caption: 'Do saal baad ek monsoon blackout wali raat mein phir takra gayi nazrein... aur waqt wahin tham gaya.',
      },
      {
        id: 'sy_2',
        url: '/src/assets/images/ananya_ex_portrait_1795516087023.jpg',
        caption: 'Ananya Verma ki ungli mein aaj bhi tumhari di hui purani silver ring chamak rahi hai. Kya pyaar abhi bhi zinda hai?',
      },
      {
        id: 'sy_3',
        url: '/src/assets/images/roshni_flatmate_portrait_1795516088415.jpg',
        caption: 'Flatmate Roshni ne Ananya ke har aansu dekhe hain — kya wo tumhe ek aur mauka degi?',
      },
    ],
    setting: 'Dimly lit Mumbai apartment hallway during a monsoon downpour',
    characters: [
      {
        id: 'ananya',
        name: 'Ananya Verma',
        age: '24',
        role: 'Your Former Partner',
        personality: 'Warm, deeply emotional, hides hurt behind polite composure, still wears the silver ring you once gifted.',
        speakingStyle: 'Soft, trembling honesty mixed with quiet guardedness.',
        relationshipToUser: 'Ex-partner you never truly got closure with',
        portrait: '/src/assets/images/ananya_ex_portrait_1795516087023.jpg',
      },
      {
        id: 'roshni',
        name: 'Roshni Mehta',
        age: '25',
        role: "Ananya's Protective Flatmate",
        personality: 'Observant, protective, remembers how broken Ananya was after you left.',
        speakingStyle: 'Direct and gently skeptical.',
        relationshipToUser: 'Wary friend guarding Ananya from fresh heartbreak',
        portrait: '/src/assets/images/roshni_flatmate_portrait_1795516088415.jpg',
      },
      {
        id: 'rohan_studio_mate',
        name: 'Rohan Mehta',
        age: '24',
        role: 'Gallery Curator & Ananya’s Colleague',
        personality: 'Polite, quietly admires Ananya, adds awkward competition whenever old memories resurface.',
        speakingStyle: 'Warm, articulate, subtly guarded.',
        relationshipToUser: 'Gentle rival waiting for Ananya to move on',
        portrait: '/portraits/rohan_mehta.svg',
        accentColor: '#6366F1',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Lingering Love', emoji: '❤️', initialValue: 48, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Rebuilt Trust', emoji: '🤝', initialValue: 24, min: 0, max: 100, tone: 'trust' },
      { id: 'hurt', label: 'Unspoken Hurt', emoji: '🌧️', initialValue: 64, min: 0, max: 100, tone: 'hate' },
    ],
    openingScene: 'Monsoon Hallway — First Words After Two Years',
    playGuide: {
      hinglish: 'Do saal baad purana pyaar saamne hai — maaf karoge 🌧️ ya haath thaamoge? ❤️',
      hindi: 'दो साल बाद पुराना प्यार सामने है — अलविदा कहोगे 🌧️ या हाथ थामोगे? ❤️',
      english: 'Your ex stands inches away in the rain — seek closure 🌧️ or start over? ❤️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Baahar Mumbai ki tez baarish aur corridor ki dheemi yellow light. Ananya mud kar tumhe dekhti hai—uski aankhein ek pal ko bheeg jaati hain. Andar se Roshni ki awaaz aati hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Ananya Verma',
          text: 'Tum... yahan? Mujhe laga tha tumne iss shehar aur hum dono se hamesha ke liye doori bana li thi.',
        },
        {
          type: 'dialogue',
          speakerName: 'Roshni Mehta',
          text: 'Anu, sab theek hai na? Darwaze par itni der se kaun—oh. Tum yahan kya kar rahe ho?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'बाहर मुंबई की तेज़ बारिश और गलियारे की धीमी पीली रोशनी। अनन्या मुड़कर तुम्हें देखती है—उसकी आँखें एक पल को भर आती हैं। अंदर से रोशनी बाहर आती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Ananya Verma',
          text: 'तुम... यहाँ? मुझे लगा था तुमने इस शहर और हम दोनों से हमेशा के लिए दूरी बना ली थी।',
        },
        {
          type: 'dialogue',
          speakerName: 'Roshni Mehta',
          text: 'अनू, सब ठीक है ना? दरवाज़े पर इतनी देर से कौन—अरे, तुम यहाँ क्या कर रहे हो?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Rain hammers the balcony glass down the hall. Ananya turns under the warm sconce light, her breath catching when she recognizes you just as Roshni steps to the doorway.',
        },
        {
          type: 'dialogue',
          speakerName: 'Ananya Verma',
          text: 'You... here? I thought you left this city—and everything between us—behind for good.',
        },
        {
          type: 'dialogue',
          speakerName: 'Roshni Mehta',
          text: 'Ananya, who’s at the door—wait. What are you doing here after two years?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Ananya ki ungli mein apni purani ring ki taraf ishara karo',
        'Roshni se kaho ki bas 5 minute akela baat karne do',
        'Dheere se kaho: "Main kabhi gaya hi nahi tha, Anu."',
      ],
      hindi: [
        'अनन्या की उँगली में अपनी पुरानी अंगूठी की तरफ इशारा करो',
        'रोशनी से कहो कि बस पाँच मिनट अकेले बात करने दे',
        'धीरे से कहो: "मैं कभी दूर गया ही नहीं था, अनू।"',
      ],
      english: [
        'Notice the silver ring still on her finger',
        'Ask Roshni politely for five minutes alone with Ananya',
        'Say softly: "I never really stopped thinking about you."',
      ],
    },
    possibleEndings: [
      'A Brand New Beginning in the Rain',
      'Peaceful Closure & Goodbye',
    ],
  },
  {
    id: 'kaash_tum_meri_hoti',
    title: 'Kaash Tum Meri Hoti',
    tagline: 'Dosti, khamosh chahat, aur ek dil todne wala love triangle.',
    about:
      'Since freshman year, you, Mehak, and Aarav have been inseparable. Every autumn evening you swallow the confession on your lips because Mehak treats you as her closest confidant—while smooth-talking Aarav finally decides to ask her out this weekend.',
    primaryCategory: 'Romance',
    categories: ['For You', 'Top 50', 'Romance', 'College', 'Drama'],
    tags: ['Roleplay', 'Romance', 'Love Triangle'],
    visualStyle: 'Golden Hour Campus DSLR',
    rating: 4.8,
    chatCountLabel: '26.6K',
    chatCountNumeric: 26600,
    rank: 15,
    coverImage: '/src/assets/images/cover_kaash_tum_meri_hoti_1795460764613.jpg',
    mediaGallery: [
      {
        id: 'ktmh_1',
        url: '/src/assets/images/cover_kaash_tum_meri_hoti_1795460764613.jpg',
        caption: 'Sunehri shaam aur campus ke sookhe patte — dosti aur chahat ke beech sabse mushkil imtihaan.',
      },
      {
        id: 'ktmh_2',
        url: '/src/assets/images/mehak_crush_portrait_1795516088891.jpg',
        caption: 'Jise tumne hamesha sabse zyada chaha, aaj Mehak Gill tumse puchh rahi hai — kya tum dil ki baat keh paoge?',
      },
      {
        id: 'ktmh_3',
        url: '/src/assets/images/aarav_friend_portrait_1795516089434.jpg',
        caption: 'Tumhara sabse kareebi dost Aarav Khanna ab tumhara rival ban chuka hai — jeet dosti ki hogi ya pyaar ki?',
      },
    ],
    setting: 'Golden-hour autumn walkway across university campus',
    characters: [
      {
        id: 'mehak',
        name: 'Mehak Gill',
        age: '20',
        role: 'Your Best Friend & Secret Crush',
        personality: 'Radiant, warm-hearted, secretly notices how you care for her more than anyone else.',
        speakingStyle: 'Playful, affectionate, emotionally expressive.',
        relationshipToUser: 'Best friend caught between two hearts',
        portrait: '/src/assets/images/mehak_crush_portrait_1795516088891.jpg',
      },
      {
        id: 'aarav',
        name: 'Aarav Khanna',
        age: '21',
        role: 'Mutual Friend & Rival in Love',
        personality: 'Charming, confident, suspects you love Mehak too and subtly pushes to claim her first.',
        speakingStyle: 'Easygoing on the surface with quiet competitive edge.',
        relationshipToUser: 'Friend turning into a romantic rival',
        portrait: '/src/assets/images/aarav_friend_portrait_1795516089434.jpg',
      },
      {
        id: 'sanya_gill',
        name: 'Sanya Gill',
        age: '21',
        role: 'Mehak’s Hostel Bestie',
        personality: 'Cheerful, gossipy, secretly roots for you to confess before Aarav steals the moment.',
        speakingStyle: 'Playful Hinglish nudges and teasing glances.',
        relationshipToUser: 'Wingwoman giving subtle hints',
        portrait: '/src/assets/images/sanya_sister_portrait_1795873529190.jpg',
        accentColor: '#EC4899',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Mehak Love', emoji: '💗', initialValue: 42, min: 0, max: 100, tone: 'love' },
      { id: 'friendship', label: 'Trio Bond', emoji: '🫂', initialValue: 78, min: 0, max: 100, tone: 'friendship' },
      { id: 'jealousy', label: 'Jealousy', emoji: '🔥', initialValue: 35, min: 0, max: 100, tone: 'jealousy' },
    ],
    openingScene: 'Autumn Quad — Before the Weekend Fest',
    playGuide: {
      hinglish: 'Dil ki baat chhupate rahoge 😔 ya Aarav se pehle izhaar karoge? 💗',
      hindi: 'दिल की बात छुपाते रहोगे 😔 या आरव से पहले इज़हार करोगे? 💗',
      english: 'Stay silent as the best friend 😔 or confess before Aarav steals her away? 💗',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Dhoop aur sookhe patton ke beech tum teeno campus quad se guzar rahe ho. Aarav Mehak ke kandhe ke kareeb aakar muskurata hai aur tumhari taraf ek challenge bhari nazar daalta hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Aarav Khanna',
          text: 'Mehak, iss Friday prom night par tum mere saath chal rahi ho na? Maine socha ab puchh hi loon.',
        },
        {
          type: 'dialogue',
          speakerName: 'Mehak Gill',
          text: 'Umm... main soch kar batati hoon Aarav! Waise tum dono itne chup kyun ho? Tumhare hisaab se mujhe kya karna chahiye?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'सुनहरी धूप और झड़ते पत्तों के बीच तुम तीनों कॉलेज के आँगन से गुज़र रहे हो। आरव महक के पास आकर मुस्कुराता है और तुम्हारी ओर चुनौती भरी नज़र डालता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Aarav Khanna',
          text: 'महक, इस शुक्रवार की रात पार्टी में तुम मेरे साथ चल रही हो ना? सोचा अब पूछ ही लूँ।',
        },
        {
          type: 'dialogue',
          speakerName: 'Mehak Gill',
          text: 'अरे... मैं सोचकर बताती हूँ आरव! वैसे तुम इतने चुप क्यों हो? तुम्हें क्या लगता है, मुझे क्या करना चाहिए?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Golden autumn light filters through the campus trees as the three of you walk side by side. Aarav glances sideways at you with a knowing smirk before leaning toward Mehak.',
        },
        {
          type: 'dialogue',
          speakerName: 'Aarav Khanna',
          text: 'So Mehak—Friday’s autumn gala. Go with me?',
        },
        {
          type: 'dialogue',
          speakerName: 'Mehak Gill',
          text: 'Whoa, putting me on the spot! Wait—why are you so quiet all of a sudden? What do you think I should say?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Dil ki baat bol do: "Mehak, mujhe tumse akela kuch zaroori kehna hai"',
        'Jhooti muskaan ke saath bolo: "Aarav accha choice hai, chali jao"',
        'Mazaak mein baat taalo aur Mehak ko coffee ke liye rok lo',
      ],
      hindi: [
        'दिल की बात बोल दो: "महक, मुझे तुमसे अकेले कुछ ज़रूरी कहना है"',
        'झूठी मुस्कान के साथ कहो: "आरव अच्छा विकल्प है, चली जाओ"',
        'बात टालकर महक को कॉफ़ी के लिए रोक लो',
      ],
      english: [
        'Speak up at last: "Mehak, wait—can I talk to you alone first?"',
        'Force a smile: "Go with him, you two will have fun."',
        'Deflect playfully and ask Mehak to grab coffee with you instead',
      ],
    },
    possibleEndings: [
      'Chosen Heart Under Autumn Lights',
      'Silent Sacrifice for Friendship',
    ],
  },
  {
    id: 'my_college_crush',
    title: 'My College Crush',
    tagline: 'Har roz campus ke mod par ek muskaan jo din bana deti hai.',
    about:
      'Sana Kapoor is the sunshine of the Business Management block—effortlessly graceful, fiercely ambitious, and somehow always dropping hints when you walk behind her down Cherry Blossom Lane. Today, your cheeky wingman Kabir bets you can finally start a real conversation before finals week.',
    primaryCategory: 'College',
    categories: ['For You', 'Top 50', 'College', 'Romance', 'School'],
    tags: ['Roleplay', 'College', 'Crush'],
    visualStyle: 'Warm Campus Film Photography',
    rating: 4.7,
    chatCountLabel: '37.9K',
    chatCountNumeric: 37900,
    rank: 13,
    coverImage: '/src/assets/images/cover_college_crush_1795460764992.jpg',
    mediaGallery: [
      {
        id: 'mcc_1',
        url: '/src/assets/images/cover_college_crush_1795460764992.jpg',
        caption: 'Cherry Blossom Walkway par har roz shaam 4 baje ek muskaan tumhare intezaar mein rukti hai.',
      },
      {
        id: 'mcc_2',
        url: '/src/assets/images/sana_campus_portrait_1795516088958.jpg',
        caption: 'Kya tum college ki sabse sundar ladki Sana Kapoor ka dil jeet paoge?',
      },
      {
        id: 'mcc_3',
        url: '/src/assets/images/rohan_wingman_portrait_1795516090991.jpg',
        caption: 'Wingman Rohan pichhe se seeti baja kar ishara kar raha hai — aaj baat ki to baat ban jayegi!',
      },
    ],
    setting: 'Blossom-lined cobblestone campus pathway after afternoon lecture',
    characters: [
      {
        id: 'sana_kapoor',
        name: 'Sana Kapoor',
        age: '19',
        role: 'Business Management Sophomore',
        personality: 'Cheerful, witty, observant, secretly likes that you always walk quietly behind her.',
        speakingStyle: 'Light, teasing, genuinely warm.',
        relationshipToUser: 'Your secret campus crush who already noticed you',
        portrait: '/src/assets/images/sana_campus_portrait_1795516088958.jpg',
      },
      {
        id: 'rohan_wingman',
        name: 'Rohan Desai',
        age: '20',
        role: 'Your Best Friend & Wingman',
        personality: 'Loud, supportive, always pushing you out of your shell.',
        speakingStyle: 'Energetic bro banter.',
        relationshipToUser: 'Your best friend cheering from across the path',
        portrait: '/src/assets/images/rohan_wingman_portrait_1795516090991.jpg',
      },
      {
        id: 'meera_library_senior',
        name: 'Meera Joshi',
        age: '21',
        role: 'Fest Committee Senior',
        personality: 'Friendly, organized, loves pulling shy juniors into pairing up for campus events.',
        speakingStyle: 'Warm, encouraging senior vibe.',
        relationshipToUser: 'Senior who sparks excuses for you to sit near your crush',
        portrait: '/src/assets/images/meera_joshi_female_portrait_1795873643565.jpg',
        accentColor: '#F43F5E',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Crush Meter', emoji: '🌸', initialValue: 35, min: 0, max: 100, tone: 'love' },
      { id: 'friendship', label: 'Vibe', emoji: '☕', initialValue: 55, min: 0, max: 100, tone: 'friendship' },
    ],
    openingScene: 'Blossom Walkway — She Looked Back',
    playGuide: {
      hinglish: 'Sana ne tumhe dekh liya hai — shy rahoge 🌸 ya pehli baar baat karoge? ☕',
      hindi: 'सना ने तुम्हें देख लिया है — झिझकोगे 🌸 या आज दिल की बात कहोगे? ☕',
      english: 'Sana caught you looking — play it cool 🌸 or spark your first real date? ☕',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Gulabi phoolon ke neeche Sana apni Management book sambhalte hue achanak peeche mud kar tumhe dekhti hai aur halki si muskurati hai. Peeche se Rohan seeti bajakar ishara karta hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Sana Kapoor',
          text: 'Tum roz isi waqt is raaste se jaate ho ya sirf meri pace match kar rahe ho? Haath mein coffee laaye ho ya sirf shy smile?',
        },
        {
          type: 'dialogue',
          speakerName: 'Rohan Desai',
          text: 'Bhai aaj mat rukna, ja bol de warna main khud aakar tera intro karwa dunga!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'गुलाबी फूलों के नीचे सना अपनी किताब संभालते हुए अचानक पीछे मुड़कर तुम्हें देखती है और हल्का-सा मुस्कुराती है। दूर खड़ा रोहन इशारा करके तुम्हें आगे बढ़ने को कहता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Sana Kapoor',
          text: 'तुम रोज़ इसी समय इस रास्ते से जाते हो या सिर्फ मेरी चाल से कदम मिला रहे हो?',
        },
        {
          type: 'dialogue',
          speakerName: 'Rohan Desai',
          text: 'भाई आज रुकना मत, जाकर बात कर ले वरना मैं खुद आकर तेरी जान-पहचान करवा दूँगा!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Beneath drifting pink petals, Sana hugs her management textbook and glances back over her shoulder with an amused smile. Further back, Rohan mouths for you to go talk to her.',
        },
        {
          type: 'dialogue',
          speakerName: 'Sana Kapoor',
          text: 'Do you always walk this exact path at four, or are you actually trying to catch up with me?',
        },
        {
          type: 'dialogue',
          speakerName: 'Rohan Desai',
          text: 'Dude, go! Don’t freeze up now!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Haste hue bolo: "Shayad dono... waise notes share karengi?"',
        'Rohan ko aankh dikhao aur Sana ko canteen chai invite do',
      ],
      hindi: [
        'हँसते हुए कहो: "शायद दोनों... वैसे क्या तुम नोट्स साझा करोगी?"',
        'रोहन को चुप रहने का इशारा करके सना को कैंटीन में चाय के लिए पूछो',
      ],
      english: [
        'Laugh it off: "Maybe a little of both. Need help with those books?"',
        'Wave Rohan off and invite Sana to grab iced coffee',
      ],
    },
    possibleEndings: [
      'First Date at the Sunset Canteen',
      'Sweetest Campus Confession',
    ],
  },
  {
    id: 'shes_obsessed_with_me',
    title: "She's Obsessed With Me",
    tagline: 'Uska pyaar nahi... uski zidd khatarnaak ho rahi hai.',
    about:
      'At first, Niharika seemed like the sweetest classmate in your psychology seminar. Then your desk notes started matching your exact diary thoughts, strangers who flirted with you suddenly transferred out, and tonight in the quiet library aisle, she steps behind your shoulder whispering that you belong only to her.',
    primaryCategory: 'Thriller',
    categories: ['For You', 'Top 50', 'Thriller', 'Drama', 'College'],
    tags: ['Roleplay', 'Thriller', 'Obsession'],
    visualStyle: 'Psychological Thriller Realism',
    rating: 4.8,
    chatCountLabel: '89.8K',
    chatCountNumeric: 89800,
    rank: 8,
    isTrending: true,
    coverImage: '/src/assets/images/cover_obsessed_with_me_1795460766128.jpg',
    mediaGallery: [
      {
        id: 'sowm_1',
        url: '/src/assets/images/cover_obsessed_with_me_1795460766128.jpg',
        caption: 'Library ke sabse sunsaan kone mein tum akela nahi ho... koi har saans ka hisaab rakh raha hai.',
      },
      {
        id: 'sowm_2',
        url: '/src/assets/images/niharika_obsessed_portrait_1795516146132.jpg',
        caption: 'Niharika Sen ki khamosh muskaan ke peeche ek khatarnaak zidd chhipi hai — tum sirf uske ho, ya bhaag paoge?',
      },
      {
        id: 'sowm_3',
        url: '/src/assets/images/maya_counselor_portrait_1795516090021.jpg',
        caption: 'Floor Supervisor Maya kuch hi doori par hain... par kya tum bina Niharika ko bhadkaye madad maang paoge?',
      },
    ],
    setting: 'Quiet upper floor wooden aisle of the university archive library',
    characters: [
      {
        id: 'niharika',
        name: 'Niharika Sen',
        age: '21',
        role: 'Obsessed Honours Classmate',
        personality: 'Eerily calm, brilliant, hyper-fixated on protecting and possessing you, unnervingly gentle voice even while threatening rivals.',
        speakingStyle: 'Sweet, whispered, razor-intense certainty.',
        relationshipToUser: 'Secretly tracking your every move out of twisted devotion',
        portrait: '/src/assets/images/niharika_obsessed_portrait_1795516146132.jpg',
      },
      {
        id: 'inspector_meera',
        name: 'Librarian / Counselor Maya',
        age: '29',
        role: 'Campus Floor Supervisor',
        personality: 'Sharp-eared, notices when students look cornered.',
        speakingStyle: 'Calm, observant.',
        relationshipToUser: 'Potential lifeline if you can signal her without triggering Niharika',
        portrait: '/src/assets/images/maya_counselor_portrait_1795516090021.jpg',
      },
      {
        id: 'vikram_neighbor',
        name: 'Vikram Sethi',
        age: '25',
        role: 'Across-the-Hall Neighbor',
        personality: 'Suspiciously observant, keeps noticing locked doors and strange late-night voices.',
        speakingStyle: 'Whispered, worried inquiries.',
        relationshipToUser: 'Unlikely ally who might help or expose Niharika',
        portrait: '/portraits/vikram_sethi.svg',
        accentColor: '#F97316',
      },
    ],
    relationshipMeters: [
      { id: 'obsession', label: 'Obsession', emoji: '🩸', initialValue: 86, min: 0, max: 100, tone: 'jealousy' },
      { id: 'trust', label: 'Illusion of Trust', emoji: '🗝️', initialValue: 30, min: 0, max: 100, tone: 'trust' },
      { id: 'danger', label: 'Danger', emoji: '⚠️', initialValue: 72, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Archive Stack 4 — Too Close to Breathe',
    playGuide: {
      hinglish: 'Niharika ki zidd badh rahi hai — bhaag nikloge 🗝️ ya use shant karoge? ⚠️',
      hindi: 'निहारिका की ज़िद बढ़ रही है — भाग निकलोगे 🗝️ या उसे शांत करोगे? ⚠️',
      english: 'Her obsession is tightening — outsmart Niharika 🗝️ or signal for help? ⚠️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Library ke sabse sunsaan kone mein tum kitaab nikaalne hi wale the ki peeche se Niharika ne tumhare kandhe par ungliyan rakh di. Uski saansein tumhari gardan ke paas hain.',
        },
        {
          type: 'dialogue',
          speakerName: 'Niharika Sen',
          text: 'Aaj tum canteen mein uss ladki se itna hans kar kyun baat kar rahe the? Maine tumhare liye subah se do coffee rakhi thi... par tumne mujhe dekha tak nahi.',
        },
        {
          type: 'narration',
          text: 'Door corridor se Maya ma’am ke kadmon ki aahat aati hai.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'पुस्तकालय के सबसे सुनसान कोने में तुम किताब निकालने ही वाले थे कि पीछे से निहारिका ने तुम्हारे कंधे पर हाथ रख दिया। उसकी आवाज़ बेहद शांत पर डरावनी है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Niharika Sen',
          text: 'आज तुम कैंटीन में उस लड़की से इतना हँसकर क्यों बात कर रहे थे? मैंने सुबह से तुम्हारे लिए कॉफ़ी रखी थी... पर तुमने मेरी ओर देखा तक नहीं।',
        },
        {
          type: 'narration',
          text: 'दूर गलियारे से लाइब्रेरी की सुपरवाइज़र माया के कदमों की आहट सुनाई देती है।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'In the quietest aisle of the archive stacks, fingers brush your shoulder. Niharika leans dangerously close, smiling with unblinking calm.',
        },
        {
          type: 'dialogue',
          speakerName: 'Niharika Sen',
          text: 'Why were you laughing with that girl in the courtyard today? I waited outside your class for forty minutes... and you didn’t even look for me.',
        },
        {
          type: 'narration',
          text: 'Footsteps echo softly at the far end of the corridor as Supervisor Maya patrols.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Shant rehkar Niharika ko behlao taaki peeche hat sakein',
        'Seedha boundaries clear karo aur bheed ki taraf badho',
        'Zor se book girakar Maya ma’am ka dhyaan kheench lo',
      ],
      hindi: [
        'शांत रहकर निहारिका को बातों में उलझाओ ताकि पीछे हट सको',
        'सीधे अपनी सीमा स्पष्ट करो और भीड़ की ओर बढ़ो',
        'ज़ोर से किताब गिराकर माया मैम का ध्यान आकर्षित करो',
      ],
      english: [
        'Stay calm and placate her while backing slowly toward the light',
        'Set a firm boundary and step out of the aisle',
        'Drop a heavy hardcover to draw Supervisor Maya’s attention',
      ],
    },
    possibleEndings: [
      'Clean Escape & Police Protection',
      'Trapped in Her Velvet Cage',
      'Turning the Tables on Niharika',
    ],
  },
  {
    id: 'roommate_is_my_boss',
    title: 'My Roommate Is My Boss',
    tagline: 'Office mein strict boss, ghar mein ek hi sofa aur fridge.',
    about:
      'When your Mumbai broker double-booked a gorgeous high-rise flat, you expected a chill bachelor roommate—not Natasha Oberoi, the terrifyingly perfectionist Creative Director who grilled your presentation five hours ago. Now you share Wi-Fi, rent, and midnight deadlines.',
    primaryCategory: 'Drama',
    categories: ['For You', 'Top 50', 'Drama', 'Romance'],
    tags: ['Roleplay', 'Romance', 'Office RomCom'],
    visualStyle: 'Modern High-Rise Cinema Still',
    rating: 4.7,
    chatCountLabel: '12.4K',
    chatCountNumeric: 12400,
    rank: 20,
    coverImage: '/src/assets/images/cover_roommate_boss_1795460767429.jpg',
    mediaGallery: [
      {
        id: 'rmb_1',
        url: '/src/assets/images/cover_roommate_boss_1795460767429.jpg',
        caption: 'Ek flat, ek sofa, aur aadhi raat ki house rules — kya tum aur tumhari boss ek chhat ke neeche reh paoge?',
      },
      {
        id: 'rmb_2',
        url: '/src/assets/images/natasha_boss_portrait_1795516089566.jpg',
        caption: 'Office ki sabse strict Creative Director Natasha Oberoi ab ghar mein tumhari roommate ban chuki hain!',
      },
      {
        id: 'rmb_3',
        url: '/src/assets/images/sanjay_broker_portrait_1795516089945.jpg',
        caption: 'Double-booking karne wala Broker Sanjay phone par bhaag raha hai — teen mahine ka yeh drama abhi shuru hua hai!',
      },
    ],
    setting: 'High-rise glass apartment living room at 11:30 PM',
    characters: [
      {
        id: 'natasha_oberoi',
        name: 'Natasha Oberoi',
        age: '27',
        role: 'Your Creative Director & New Roommate',
        personality: 'Workaholic perfectionist, deadpan witty, fiercely professional at work yet secretly chaotic with takeout noodles at home.',
        speakingStyle: 'Crisp corporate precision slowly melting into warm banter.',
        relationshipToUser: 'Your intimidating boss stuck sharing your apartment',
        portrait: '/src/assets/images/natasha_boss_portrait_1795516089566.jpg',
      },
      {
        id: 'broker_sanjay',
        name: 'Broker Sanjay (on speakerphone)',
        age: '38',
        role: 'Apologetic Housing Agent',
        personality: 'Fast-talking, refusing to refund the deposit.',
        speakingStyle: 'Chaotic sales hustle.',
        relationshipToUser: 'The reason you two are stuck together for 3 months',
        portrait: '/src/assets/images/sanjay_broker_portrait_1795516089945.jpg',
      },
      {
        id: 'kavya_kapoor_hr',
        name: 'Kavya Kapoor',
        age: '25',
        role: 'Office Creative Lead',
        personality: 'Flirtatious, witty, notices every tense glance between you and Natasha in meetings.',
        speakingStyle: 'Playful corporate banter.',
        relationshipToUser: 'Office friend who makes Natasha unexpectedly jealous',
        portrait: '/src/assets/images/kavya_office_portrait_1795873595849.jpg',
        accentColor: '#A855F7',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Chemistry', emoji: '💘', initialValue: 22, min: 0, max: 100, tone: 'love' },
      { id: 'respect', label: 'Work Respect', emoji: '💼', initialValue: 45, min: 0, max: 100, tone: 'respect' },
    ],
    openingScene: 'Skyline Living Room — The House Rules',
    playGuide: {
      hinglish: 'Strict boss ab roommate hain — rules todoge 😏 ya unka dil jeetoge? 💘',
      hindi: 'सख़्त बॉस अब रूममेट हैं — नियम तोड़ोगे 😏 या उनका दिल जीतोगे? 💘',
      english: 'Stuck sharing an apartment with your boss — tease her 😏 or win respect? 💘',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Table par tumhara takeout box aur Natasha ka laptop rakha hai. Woh ek eyebrow uthakar tumhe ghoorti hain jab phone speaker par broker Sanjay bhaag raha hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Natasha Oberoi',
          text: 'Clear kar doon—kal subah 9 baje office mein tumhari report meri desk par chahiye. Aur ghar mein: mera coffee mug haath mat lagana, aur kisi ko mat batana ki hum flat share karte hain.',
        },
        {
          type: 'dialogue',
          speakerName: 'Broker Sanjay',
          text: 'Madam please! Teen mahine adjust kar lijiye, deposit refund agle quarter ke bina impossible hai!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'मेज़ पर तुम्हारे खाने का डिब्बा और नताशा का लैपटॉप खुला है। वह एक भौंह उठाकर तुम्हें देखती हैं जबकि फोन के स्पीकर पर ब्रोकर संजय बहाने बना रहा है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Natasha Oberoi',
          text: 'साफ़ बता दूँ—कल सुबह नौ बजे ऑफिस में रिपोर्ट मेरी मेज़ पर चाहिए। और घर में: मेरे कॉफ़ी मग को हाथ मत लगाना, और ऑफिस में किसी को भनक न लगे।',
        },
        {
          type: 'dialogue',
          speakerName: 'Broker Sanjay',
          text: 'मैडम प्लीज़! तीन महीने संभाल लीजिए, अभी जमा राशि वापस करना नामुमकिन है!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Your takeout box sits inches from Natasha’s glowing spreadsheet while Broker Sanjay frantically pleads on speakerphone.',
        },
        {
          type: 'dialogue',
          speakerName: 'Natasha Oberoi',
          text: 'Let’s establish boundaries immediately. At 9 AM sharp, you are my junior analyst. In this flat: don’t touch my espresso roast, and nobody at the agency finds out.',
        },
        {
          type: 'dialogue',
          speakerName: 'Broker Sanjay',
          text: 'Ma’am please, three months minimum—there is literally zero refund clause!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Muskurakar bolo: "Deal, Boss. Par wifi password aur extra noodles mera."',
        'Natasha ko tea offer karo aur kal ki presentation par tip maango',
      ],
      hindi: [
        'मुस्कुराकर कहो: "मंज़ूर, बॉस। पर वाई-फ़ाई और अतिरिक्त नूडल्स मेरे।"',
        'नताशा को चाय पूछो और कल की प्रेज़ेंटेशन के लिए सलाह माँगो',
      ],
      english: [
        'Grin: "Deal, Boss. In exchange, I take the balcony spot and noodles."',
        'Offer her half your takeout and ask about tomorrow’s client pitch',
      ],
    },
    possibleEndings: [
      'Secret Office Romance Revealed',
      'Co-Founders & Partners',
    ],
  },
  {
    id: 'maa_aur_shaitaan',
    title: 'Maa Aur Shaitaan',
    tagline: 'Pyaar, dar, aur ek chhipa hua sach jo pahadon mein jag raha hai.',
    about:
      'After moving with your mother Kavita to a remote Himalayan valley following your father’s disappearance, strange black footprints appear outside your door every midnight. An ancient village elder warns that the mountain spirit has claimed one of your bloodline—and only a mother’s fierce love and your courage stand between it and your survival.',
    primaryCategory: 'Horror',
    categories: ['For You', 'New', 'Horror', 'Supernatural', 'Thriller'],
    tags: ['Roleplay', 'Horror', 'Supernatural'],
    visualStyle: 'Atmospheric Mountain Horror',
    rating: 4.8,
    chatCountLabel: '18.5K',
    chatCountNumeric: 18500,
    rank: 17,
    isNew: true,
    coverImage: '/src/assets/images/cover_maa_aur_shaitaan_1795460849481.jpg',
    mediaGallery: [
      {
        id: 'mas_1',
        url: '/src/assets/images/cover_maa_aur_shaitaan_1795460849481.jpg',
        caption: 'Amavasya ki raat aur Himalaya ki dhund mein jag utha ek shraapit saya... kya tum apni maa ko bacha paoge?',
      },
      {
        id: 'mas_2',
        url: '/src/assets/images/kavita_mother_portrait_1795516091317.jpg',
        caption: 'Maa Kavita apni jaan par khel kar tumhari dhaal bani hui hain — par unhone kaunsa raaz chhupaya hai?',
      },
      {
        id: 'mas_3',
        url: '/src/assets/images/bhairav_shrine_portrait_1795516147050.jpg',
        caption: 'Mandir ke pujari Baba Bhairav jaante hain ki uss raat tumhare pita ne kya sauda kiya tha!',
      },
    ],
    setting: 'Fog-choked Himalayan forest trail near your ancestral cottage at dusk',
    characters: [
      {
        id: 'maa_kavita',
        name: 'Maa (Kavita)',
        age: '44',
        role: 'Your Protective Mother',
        personality: 'Terrified yet unbreakable; hides a dark secret about why your family fled the valley years ago.',
        speakingStyle: 'Urgent, trembling warmth mixed with fierce maternal resolve.',
        relationshipToUser: 'Shielding you from an ancient pact',
        portrait: '/src/assets/images/kavita_mother_portrait_1795516091317.jpg',
      },
      {
        id: 'pujari_bhairav',
        name: 'Baba Bhairav',
        age: '68',
        role: 'Village Shrine Keeper',
        personality: 'Cryptic, solemn, knows the ritual that binds the mountain demon.',
        speakingStyle: 'Gravely hushed warnings.',
        relationshipToUser: 'Knows your father’s true fate',
        portrait: '/src/assets/images/bhairav_shrine_portrait_1795516147050.jpg',
      },
      {
        id: 'inspector_vikram_k',
        name: 'Inspector Vikram',
        age: '34',
        role: 'District Outpost Officer',
        personality: 'Skeptical of superstitions until strange footprints inside locked rooms shake him.',
        speakingStyle: 'Firm, practical authority.',
        relationshipToUser: 'Reluctant backup outside the haunted estate',
        portrait: '/portraits/inspector_vikram_village.svg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'courage', label: 'Courage', emoji: '🕯️', initialValue: 55, min: 0, max: 100, tone: 'trust' },
      { id: 'fear', label: 'Dread', emoji: '👁️', initialValue: 62, min: 0, max: 100, tone: 'fear' },
      { id: 'truth', label: 'Hidden Truth', emoji: '📜', initialValue: 15, min: 0, max: 100, tone: 'respect' },
    ],
    openingScene: 'Misty Pine Trail — Eyes in the Fog',
    playGuide: {
      hinglish: 'Pahadi shraap ka saamna hai — Maa ko bachaoge 🕯️ ya andhere se ladoge? 👁️',
      hindi: 'पहाड़ी शाप का सामना है — माँ को बचाओगे 🕯️ या अंधेरे का सच जानोगे? 👁️',
      english: 'An ancient mountain curse awakens — shield your mother 🕯️ or face the shadow? 👁️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Thandi dhund mein pedon ke upar ek vishal kaala saya uthta dikhai deta hai—uski do surkh aankhein seedha tum par tiki hain. Maa tumhe kas kar apne seene se laga leti hain.',
        },
        {
          type: 'dialogue',
          speakerName: 'Maa (Kavita)',
          text: 'Peeche mat dekhna beta! Bas ghar ke andar chalo, aaj amavasya hai—woh apna waada poora karne aaya hai!',
        },
        {
          type: 'dialogue',
          speakerName: 'Baba Bhairav',
          text: 'Kavita, bhagne se shrap nahi mitega! Ladke ko sach batana hi hoga ki iske pita ne uss raat kya sauda kiya tha!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'बर्फीली धुंध में देवदार के पेड़ों के ऊपर एक विशाल काला साया उठता दिखता है—उसकी दो दहकती आँखें सीधे तुम पर टिकी हैं। माँ तुम्हें कसकर थाम लेती हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Maa (Kavita)',
          text: 'पीछे मत देखना बेटा! बस घर के भीतर चलो, आज अमावस्या है—वह अपना वचन पूरा करने आया है!',
        },
        {
          type: 'dialogue',
          speakerName: 'Baba Bhairav',
          text: 'कविता, भागने से शाप नहीं मिटेगा! इसे सच बताना होगा कि इसके पिता ने उस रात कौन-सा सौदा किया था!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Through freezing mountain fog, a towering shadow rises above the ridge with two glowing amber eyes. Your mother grips your shoulders tightly.',
        },
        {
          type: 'dialogue',
          speakerName: 'Maa (Kavita)',
          text: "Don't look back! Keep walking to the threshold—tonight is the new moon, it’s come to collect!",
        },
        {
          type: 'dialogue',
          speakerName: 'Baba Bhairav',
          text: 'Running won’t break the blood pact, Kavita! Tell your son what his father promised that night!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Maa se seedha puchho: "Papa ne uss raat kya sauda kiya tha?"',
        'Baba Bhairav se raksha-mantra aur chhuri maang kar aage badho',
      ],
      hindi: [
        'माँ से सीधे पूछो: "पापा ने उस रात कौन-सा सौदा किया था?"',
        'बाबा भैरव से रक्षा-कवच माँगकर सच जानने आगे बढ़ो',
      ],
      english: [
        'Demand the truth from your mother: "What did Dad promise it?"',
        'Ask Baba Bhairav for the protective talisman before entering the fog',
      ],
    },
    possibleEndings: [
      'Breaking the Mountain Pact',
      'Sacrifice at the Shrine',
    ],
  },
  {
    id: 'wo_laut_aayi',
    title: 'Wo Laut Aayi',
    tagline: 'Jo is haveli se gaya, wo kabhi akela bahar nahi nikla.',
    about:
      'Hired to photograph an abandoned colonial estate in Kolkata before demolition, you step onto the cracked marble foyer after sunset—only to hear anklets chiming on the upper landing. Standing on the staircase in a crimson Banarasi saree is Damayanti, who vanished from this house sixty years ago... and she thinks you returned for her.',
    primaryCategory: 'Horror',
    categories: ['For You', 'New', 'Horror', 'Supernatural', 'Thriller'],
    tags: ['Roleplay', 'Horror', 'Gothic Ghost'],
    visualStyle: 'Gothic Mansion Horror',
    rating: 4.8,
    chatCountLabel: '15.8K',
    chatCountNumeric: 15800,
    rank: 18,
    isNew: true,
    coverImage: '/src/assets/images/cover_wo_laut_aayi_1795460849473.jpg',
    mediaGallery: [
      {
        id: 'wla_1',
        url: '/src/assets/images/cover_wo_laut_aayi_1795460849473.jpg',
        caption: 'Aadhi raat, toota hua marble hall, aur oopar seedhiyon par ghungroo ki aahat — darwaza khud band ho chuka hai.',
      },
      {
        id: 'wla_2',
        url: '/src/assets/images/damayanti_bride_portrait_1795516093464.jpg',
        caption: '60 saal se laal Banarasi saree mein intezaar kar rahi Damayanti ko lagta hai tum uske liye laut aaye ho!',
      },
      {
        id: 'wla_3',
        url: '/src/assets/images/harish_watchman_portrait_1795516146598.jpg',
        caption: 'Gate ke bahar khada chaukidar Harish radio par chilla raha hai — kya tum subah tak zinda bahar nikal paoge?',
      },
    ],
    setting: 'Decaying marble staircase of Roy Chowdhury Mansion at midnight',
    characters: [
      {
        id: 'damayanti',
        name: 'Damayanti',
        age: 'Timeless',
        role: 'The Waiting Bride Spirit',
        personality: 'Hauntingly poised, tragic, dangerously possessive if lied to, softens if shown genuine empathy.',
        speakingStyle: 'Echoing, lyrical, chillingly intimate whispers.',
        relationshipToUser: 'Believes you are the reincarnation of her lost betrothed',
        portrait: '/src/assets/images/damayanti_bride_portrait_1795516093464.jpg',
      },
      {
        id: 'chaukidar_harish',
        name: 'Harish (Night Watchman)',
        age: '59',
        role: 'Estate Caretaker',
        personality: 'Panicked, superstitious, locked outside the iron gate.',
        speakingStyle: 'Frantic whispers over your crackling walkie-talkie.',
        relationshipToUser: 'Trying to guide you out before 3 AM',
        portrait: '/src/assets/images/harish_watchman_portrait_1795516146598.jpg',
      },
      {
        id: 'meera_devi_neighbor',
        name: 'Meera Devi',
        age: '52',
        role: 'Old Caretaker’s Wife',
        personality: 'Deeply shaken, whispers rituals passed down for generations to seal the mirror corridor.',
        speakingStyle: 'Trembling, urgent warnings.',
        relationshipToUser: 'Knows the name of the spirit walking the stairs',
        portrait: '/src/assets/images/meera_devi_caretaker_portrait_1795873627372.jpg',
        accentColor: '#E11D48',
      },
    ],
    relationshipMeters: [
      { id: 'fear', label: 'Dread', emoji: '👻', initialValue: 68, min: 0, max: 100, tone: 'fear' },
      { id: 'mercy', label: 'Spirit Mercy', emoji: '🕯️', initialValue: 30, min: 0, max: 100, tone: 'love' },
    ],
    openingScene: 'Grand Staircase — Moonlight & Anklets',
    playGuide: {
      hinglish: 'Ghungroo ki aahat paas aa rahi hai — bhaagoge 🚪 ya Damayanti ka sach sunoge? 👻',
      hindi: 'घुँघरू की आहट पास आ रही है — भागोगे 🚪 या दमयंती का सच सुनोगे? 👻',
      english: 'The mansion gates are locked — flee into the dark 🚪 or hear the bride’s truth? 👻',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Tumhara camera flash band pad jaata hai. Chaandni ki kiran seedhiyon par girti hai jahan laal saree mein ek aurat bina palak jhapkaye tumhe dekh rahi hai—pairon ke paas kachra nahi, sirf thanda kohra hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Damayanti',
          text: 'Saath saal beet gaye... tumne kaha tha baarish rukte hi lautoge. Itni der kyun laga di?',
        },
        {
          type: 'dialogue',
          speakerName: 'Harish',
          text: '*Walkie-talkie par* Sahab! Gate bahar se jaam ho gaya hai! Unse aankh mat milana, seedha kitchen ke peeche wale darwaze ki taraf bhaago!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'तुम्हारे कैमरे की रोशनी अचानक बुझ जाती है। चाँदनी की किरण सीढ़ियों पर गिरती है जहाँ लाल साड़ी में एक स्त्री बिना पलक झपकाए तुम्हें देख रही है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Damayanti',
          text: 'साठ वर्ष बीत गए... तुमने कहा था बरसात रुकते ही लौटोगे। इतनी देर क्यों कर दी?',
        },
        {
          type: 'dialogue',
          speakerName: 'Harish',
          text: '*वॉकी-टॉकी पर* साहब! बाहर का फाटक जम गया है! उनसे नज़र मत मिलाना, पीछे के दरवाज़े की ओर निकलो!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Your camera dies mid-shutter. Pale moonlight cuts across the broken marble stairs where a woman in a weathered crimson saree watches you without blinking.',
        },
        {
          type: 'dialogue',
          speakerName: 'Damayanti',
          text: 'Sixty monsoons have passed... You promised you would return before midnight. Why did you keep me waiting?',
        },
        {
          type: 'dialogue',
          speakerName: 'Harish',
          text: '*Over crackling radio* Sir, the iron gates just slammed shut on their own! Don’t answer her—head for the cellar door!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Bhaagne ke bajaye pyaar se puchho: "Tumhare saath uss raat kya hua tha?"',
        'Walkie-talkie band karke kitchen exit ki taraf chupke se badho',
      ],
      hindi: [
        'भागने के बजाय शांत स्वर में पूछो: "तुम्हारे साथ उस रात क्या हुआ था?"',
        'वॉकी-टॉकी बंद करके चुपके से पिछले दरवाज़े की ओर बढ़ो',
      ],
      english: [
        'Stand still and ask gently: "Tell me what happened to you here."',
        'Mute the radio and back slowly toward the servants’ corridor',
      ],
    },
    possibleEndings: [
      'Freeing Damayanti’s Soul at Dawn',
      'Trapped Forever in the Mansion Portrait',
    ],
  },
  {
    id: 'badodiya_ki_haveli',
    title: 'Badodiya Ki Haveli',
    tagline: 'Red window ke peeche kaun dekh raha hai?',
    about:
      'For three generations, nobody in Rajasthan dared cross the threshold of Badodiya Ki Haveli after sunset. Armed with one brass lantern, your skeptical vlogger friend Meera and terrified cousin Dev dare you to spend one night inside to uncover the secret of the red-lit upper jharokha.',
    primaryCategory: 'Horror',
    categories: ['For You', 'New', 'By Fans', 'Horror', 'Adventure', 'Supernatural'],
    tags: ['Roleplay', 'Horror', 'Haunted Haveli'],
    visualStyle: 'Supernatural Haveli Mystery',
    rating: 4.8,
    chatCountLabel: '24.7K',
    chatCountNumeric: 24700,
    rank: 16,
    isNew: true,
    isByFans: true,
    coverImage: '/src/assets/images/cover_badodiya_haveli_1795460771623.jpg',
    mediaGallery: [
      {
        id: 'bkh_1',
        url: '/src/assets/images/cover_badodiya_haveli_1795460771623.jpg',
        caption: 'Teen peedhiyon se band Badodiya Ki Haveli ke laal jharokhe mein aaj bhi koi khada dikhai deta hai!',
      },
      {
        id: 'bkh_2',
        url: '/src/assets/images/meera_podcaster_portrait_1795516149082.jpg',
        caption: 'Nidar podcaster Meera Rathore camera lekar haveli ka shraap todne nikli hai — par kya wo dar ko jhel payegi?',
      },
      {
        id: 'bkh_3',
        url: '/src/assets/images/dev_companion_portrait_1795516148313.jpg',
        caption: 'Dara hua cousin Dev tumhara haath thaame khada hai... ek galat kadam aur haveli ke darwaze band ho jayenge!',
      },
    ],
    setting: 'Courtyard archway of Badodiya Ki Haveli under a full moon',
    characters: [
      {
        id: 'meera_vlogger',
        name: 'Meera Rathore',
        age: '22',
        role: 'Fearless Mystery Podcaster',
        personality: 'Curious, bold until real paranormal clues shake her, loyal in danger.',
        speakingStyle: 'Fast-paced observant Hinglish.',
        relationshipToUser: 'Co-explorer holding the camera',
        portrait: '/src/assets/images/meera_podcaster_portrait_1795516149082.jpg',
      },
      {
        id: 'dev_cousin',
        name: 'Devendra (Dev)',
        age: '21',
        role: 'Reluctant Companion',
        personality: 'Nervous, superstitious, surprisingly brave when someone he cares for is threatened.',
        speakingStyle: 'Jumpy, humorous panic.',
        relationshipToUser: 'Your cousin clinging to your sleeve',
        portrait: '/src/assets/images/dev_companion_portrait_1795516148313.jpg',
      },
      {
        id: 'thakur_mahendra',
        name: 'Thakur Mahendra',
        age: '58',
        role: 'Village Elder',
        personality: 'Cryptic, holds the rusted brass key to the haveli’s sealed basement.',
        speakingStyle: 'Hoarse, cautionary folk wisdom.',
        relationshipToUser: 'Warned your group never to cross the courtyard after dusk',
        portrait: '/portraits/thakur_mahendra.svg',
        accentColor: '#D97706',
      },
    ],
    relationshipMeters: [
      { id: 'courage', label: 'Team Courage', emoji: '🏮', initialValue: 60, min: 0, max: 100, tone: 'trust' },
      { id: 'fear', label: 'Haunting Level', emoji: '🌒', initialValue: 55, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Haveli Main Gate — Shadows in the Red Window',
    playGuide: {
      hinglish: 'Laal khidki se koi dekh raha hai — haveli ke andar jaoge 🏮 ya pichhe hatoge? 🌒',
      hindi: 'लाल खिड़की से कोई देख रहा है — भीतर कदम रखोगे 🏮 या पीछे हटोगे? 🌒',
      english: 'Shadows beckon from the red jharokha — step inside 🏮 or survive the night? 🌒',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Tumhare haath mein peetal ki lalten kaamp rahi hai. Upar wali laal khidki mein do kaali parchhaiyan haveli ke andar aane ka ishara karti hain, aur hawa mein ghungroo ki awaaz goonjti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Devendra (Dev)',
          text: 'Bhai dekh le... upar koi sach mein khada hai! Yahan bijli tak nahi hai to laal light kahan se jal rahi hai?!',
        },
        {
          type: 'dialogue',
          speakerName: 'Meera Rathore',
          text: 'Shh! Mic chalu hai... agar aaj humne iss haveli ka raaz khol diya to poora gaaon azaad ho jayega. Tu aage chal, main peeche hoon.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'तुम्हारे हाथ में पीतल की लालटेन हिल रही है। ऊपर की लाल खिड़की में दो काली परछाइयाँ भीतर आने का संकेत करती हैं और हवा में घुँघरुओं की झंकार गूँज उठती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Devendra (Dev)',
          text: 'भाई देख... ऊपर सचमुच कोई खड़ा है! यहाँ बिजली तक नहीं है, फिर लाल रोशनी कहाँ से आ रही है?!',
        },
        {
          type: 'dialogue',
          speakerName: 'Meera Rathore',
          text: 'चुप रहो देव! अगर आज हमने इस हवेली का सच ढूँढ लिया तो पूरा गाँव इस डर से मुक्त हो जाएगा। तुम आगे चलो।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Your brass oil lantern flickers against the carved sandstone archway. High above, two silhouettes stir inside a crimson-lit balcony window.',
        },
        {
          type: 'dialogue',
          speakerName: 'Devendra (Dev)',
          text: 'Look up! There’s no electricity in this ruin—what’s glowing red in that window?!',
        },
        {
          type: 'dialogue',
          speakerName: 'Meera Rathore',
          text: 'Keep the lantern steady. Whatever cursed Badodiya Haveli fifty years ago is waiting upstairs. Lead the way.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Lalten upar karke seedha darbar hall ke andar kadam rakho',
        'Pehle baahar bane purane kuen ke paas ke inscriptions check karo',
      ],
      hindi: [
        'लालटेन ऊपर करके सीधे दरबार हॉल के भीतर कदम रखो',
        'पहले बाहर बने पुराने कुएँ के पास लिखे शिलालेख देखो',
      ],
      english: [
        'Raise the brass lantern and step inside the main courtyard',
        'Inspect the carved warning tablet beside the dry well first',
      ],
    },
    possibleEndings: [
      'Banishing the Curse of Badodiya',
      'Dawn Rescue from the Hidden Vault',
    ],
  },
  {
    id: 'bhoot_ka_khajana',
    title: 'Me Lene Gaya Bhoot Ka Khajana',
    tagline: 'Laalach, dosti, aur shraapit mandir ka hara-raaz khajana.',
    about:
      'What starts as a reckless midnight dare with your greedy buddy Bunty and folklore nerd Priya turns deadly when an emerald-lit stone vault opens beneath the ruined Kali-Banyan manor—revealing a centuries-old chest guarded by an ancient spirit that makes you bargain with truth instead of gold.',
    primaryCategory: 'Adventure',
    categories: ['For You', 'New', 'By Fans', 'Horror', 'Adventure', 'Supernatural'],
    tags: ['Roleplay', 'Horror Comedy', 'Treasure Hunt'],
    visualStyle: 'Eerie Emerald Ruins Artwork',
    rating: 4.6,
    chatCountLabel: '13.4K',
    chatCountNumeric: 13400,
    rank: 19,
    isNew: true,
    isByFans: true,
    coverImage: '/src/assets/images/cover_bhoot_khajana_1795460852621.jpg',
    mediaGallery: [
      {
        id: 'bkk_1',
        url: '/src/assets/images/cover_bhoot_khajana_1795460852621.jpg',
        caption: 'Haree bhootiya roshni mein chamakta sadiyon purana sandook... aur ek shart jo jaan le sakti hai!',
      },
      {
        id: 'bkk_2',
        url: '/src/assets/images/bunty_hunter_portrait_1795516092568.jpg',
        caption: 'Laalchi yaar Bunty Mishra crorepati banne ke chakkar mein shraapit khajane ko haath lagane ja raha hai!',
      },
      {
        id: 'bkk_3',
        url: '/src/assets/images/preta_guardian_portrait_1795516146713.jpg',
        caption: 'Vault Guardian Kaal-Setu ki aankhon se bachna namumkin hai — sona chahiye ya apni jaan?',
      },
    ],
    setting: 'Moss-covered cellar steps outside the haunted ruins at midnight',
    characters: [
      {
        id: 'bunty',
        name: 'Bunty Mishra',
        age: '22',
        role: 'Overconfident Treasure Hunter',
        personality: 'Greed meets comedy panic; talks big until the ghost whispers.',
        speakingStyle: 'Chaotic witty street Hinglish.',
        relationshipToUser: 'The friend who dragged you here',
        portrait: '/src/assets/images/bunty_hunter_portrait_1795516092568.jpg',
      },
      {
        id: 'preta_guardian',
        name: 'Vault Guardian (Kaal-Setu)',
        age: 'Ancient',
        role: 'Spirit Keeper of the Chest',
        personality: 'Cunning, tests human greed with riddles and illusions.',
        speakingStyle: 'Echoing resonant voice from the emerald mist.',
        relationshipToUser: 'Judges whether you leave rich or stay trapped',
        portrait: '/src/assets/images/preta_guardian_portrait_1795516146713.jpg',
      },
      {
        id: 'chhotu_guide',
        name: 'Chhotu',
        age: '19',
        role: 'Local Lantern Bearer',
        personality: 'Street-smart, hilarious even when terrified, refuses to leave without his share of stories.',
        speakingStyle: 'Fast, comic Hinglish chatter.',
        relationshipToUser: 'Nervous scout holding the only spare torch',
        portrait: '/portraits/chhotu_boy.svg',
        accentColor: '#10B981',
      },
    ],
    relationshipMeters: [
      { id: 'greed', label: 'Treasure Luck', emoji: '🪙', initialValue: 40, min: 0, max: 100, tone: 'respect' },
      { id: 'fear', label: 'Spirit Wrath', emoji: '💚', initialValue: 45, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Emerald Vault Steps — The Ironbound Chest',
    playGuide: {
      hinglish: 'Sone ka sandook khul raha hai — laalach karoge 🪙 ya bhoot ko maat doge? 💚',
      hindi: 'सोने का संदूक खुल रहा है — लालच करोगे 🪙 या प्रेत को मात दोगे? 💚',
      english: 'Gold gleams inside the cursed vault — risk greed 🪙 or outwit the guardian? 💚',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Pathar ki seedhiyon par hara-bhara bhootiya ujala phail raha hai. Beech mein ek purana lohe ka sandook rakha hai—jiska tala apne aap khulne lagta hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Bunty Mishra',
          text: 'Oye bhai dekh! Sona chandi yahin hai! Bas taala todte hain aur kal se apan log crorepati—par yeh hawa itni thandi kyun ho gayi?',
        },
        {
          type: 'dialogue',
          speakerName: 'Vault Guardian (Kaal-Setu)',
          text: 'Ek sikka chhune se pehle batao... jo daulat tum lene aaye ho, uske badle kya tyag sakte ho?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'पत्थर की सीढ़ियों पर रहस्यमयी हरा प्रकाश फैल रहा है। बीच में एक प्राचीन लोहे का संदूक रखा है जिसका ताला अपने आप खनकने लगता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Bunty Mishra',
          text: 'अरे भाई देख! असली खजाना यहीं है! बस इसे उठाते हैं—पर अचानक इतनी ठंड क्यों बढ़ गई?',
        },
        {
          type: 'dialogue',
          speakerName: 'Vault Guardian (Kaal-Setu)',
          text: 'एक भी सिक्का छूने से पहले बोलो... इस धन के बदले तुम क्या बलिदान देने आए हो?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Ghostly emerald lantern light spills across mossy stone steps, illuminating an ironbound chest whose padlock clicks open by itself.',
        },
        {
          type: 'dialogue',
          speakerName: 'Bunty Mishra',
          text: 'Jackpot! We’re rich, bro—wait, why did the air just turn freezing cold?!',
        },
        {
          type: 'dialogue',
          speakerName: 'Vault Guardian (Kaal-Setu)',
          text: 'Touch one coin and your fate seals. What are you willing to surrender for what lies inside?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Bunty ka haath roko aur Guardian se dimaag se shart rakho',
        'Sandook ke side mein likhe purane shlok ko dhyan se padho',
      ],
      hindi: [
        'बंटी का हाथ रोको और प्रेत से चतुराई से बात करो',
        'संदूक के किनारे खुदे प्राचीन श्लोक को ध्यान से पढ़ो',
      ],
      english: [
        'Hold Bunty back and negotiate cleverly with the Vault Guardian',
        'Read the warning inscription carved into the chest lid first',
      ],
    },
    possibleEndings: [
      'Escaped With One Cursed Relic',
      'Outsmarted the Ghost & Saved Bunty',
    ],
  },
  {
    id: 'shadow_vow_tokyo',
    title: 'Shadow Vow: Crimson Eclipse',
    tagline: 'When the blood moon rises over Tokyo, only a twin vow holds back the abyss.',
    about:
      'In an alternate Tokyo shrouded by spirit rifts, you awaken as a reluctant Blade-Bearer bound to silver-haired spirit guardian Rei during a rare Crimson Eclipse. As rogue shadow clans close in across the neon skyline, every tactical choice balances Rei’s fragile trust against the dark power consuming your sword.',
    primaryCategory: 'Anime',
    categories: ['For You', 'New', 'Anime', 'Fantasy', 'Supernatural', 'Adventure'],
    tags: ['Roleplay', 'Anime', 'Dark Fantasy'],
    visualStyle: 'Dark Nocturnal Realism',
    rating: 4.9,
    chatCountLabel: '64.2K',
    chatCountNumeric: 64200,
    rank: 10,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_shadow_vow_live_1795804228837.jpg',
    mediaGallery: [
      {
        id: 'svt_1',
        url: '/src/assets/images/cover_shadow_vow_live_1795804228837.jpg',
        caption: 'Tokyo ke aasmaan par Crimson Eclipse chha chuka hai — ab sirf tumhari talwar aur ek twin vow is shaher ko bacha sakte hain!',
      },
      {
        id: 'svt_2',
        url: '/src/assets/images/alina_vampire_portrait_1795516147518.jpg',
        caption: 'Silver-haired Spirit Keeper Rei apna ruby talisman lekar khadi hai — kya tum uske saath Shadow Vow loge?',
      },
      {
        id: 'svt_3',
        url: '/src/assets/images/aryan_hunter_portrait_1795516146597.jpg',
        caption: 'Rival hunter Renji Kurosawa tumhari himmat aazmane rooftop par utar aaya hai!',
      },
    ],
    setting: 'Rain-soaked Shinjuku high-rise rooftop under a blazing red eclipse moon',
    characters: [
      {
        id: 'rei_guardian',
        name: 'Rei',
        age: '19',
        gender: 'Female',
        role: 'Silver-Haired Spirit Keeper',
        personality: 'Stoic, fiercely dutiful, secretly fears losing another partner to the Eclipse curse.',
        speakingStyle: 'Calm, sharp nocturnal warrior cadence.',
        relationshipToUser: 'Bound spirit partner guarding the ruby seal',
        portrait: '/src/assets/images/alina_vampire_portrait_1795516147518.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'kuro_blade',
        name: 'Renji Kurosawa',
        age: '21',
        gender: 'Male',
        role: 'Rival Shadow Hunter',
        personality: 'Sarcastic, lethal, testing if you are worthy of wielding the Eclipse Katana.',
        speakingStyle: 'Cool, mocking confidence.',
        relationshipToUser: 'Rival hunter watching from the spire',
        portrait: '/portraits/renji_kurosawa.svg',
        accentColor: '#38BDF8',
      },
      {
        id: 'master_kenji',
        name: 'Master Kenji',
        age: '54',
        gender: 'Male',
        role: 'Crimson Shrine Commander',
        personality: 'Stoic, scarred veteran hiding an ancient betrayal behind strict clan oaths.',
        speakingStyle: 'Sharp, disciplined blade-master tone.',
        relationshipToUser: 'Commander testing your shadow vow',
        portrait: '/src/assets/images/master_kenji_portrait_1795874081824.jpg',
        accentColor: '#F43F5E',
      },
    ],
    relationshipMeters: [
      { id: 'sync', label: 'Spirit Sync', emoji: '🔮', initialValue: 45, min: 0, max: 100, tone: 'trust' },
      { id: 'bond', label: 'Rei Bond', emoji: '🌙', initialValue: 30, min: 0, max: 100, tone: 'love' },
    ],
    openingScene: 'Shinjuku Spire — Crimson Moon Awakening',
    playGuide: {
      hinglish: 'Crimson moon ug chuka hai — Rei ka haath thaamoge 🌙 ya akela ladoge? ⚔️',
      hindi: 'रक्त चंद्र उग चुका है — रेई का हाथ थामोगे 🌙 या अकेले लड़ोगे? ⚔️',
      english: 'The Crimson Eclipse begins — seal your vow with Rei 🌙 or fight solo? ⚔️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Aasmaan mein laal grahan chamak raha hai. Baarish ki boondein tumhari talwar se takrakar bhaap ban rahi hain jab Rei haath mein chamakta ruby talisman lekar tumhare saamne aati hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Rei',
          text: 'Darwaza khul chuka hai. Agar tumne abhi apni talwar par kaabu nahi paaya, to yeh shaher subah nahi dekh payega. Kya tum mere saath vow loge?',
        },
        {
          type: 'dialogue',
          speakerName: 'Renji Kurosawa',
          text: 'Hmph, naya partner? Dekhte hain eclipse ki pehli lehar mein kitni der tikta hai.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'आसमान में लाल ग्रहण दहक रहा है। बारिश की बूँदें तुम्हारी तलवार से टकराकर भाप बन रही हैं जब रेई चमकता रत्न थामे तुम्हारे सामने खड़ी होती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Rei',
          text: 'सीमा टूट चुकी है। यदि तुमने अभी अपनी शक्ति पर नियंत्रण नहीं पाया, तो यह शहर सवेरा नहीं देख पाएगा। क्या तुम वचन दोगे?',
        },
        {
          type: 'dialogue',
          speakerName: 'Renji Kurosawa',
          text: 'हूँह, नया साथी? देखते हैं पहली ही लहर में कितनी देर टिकता है।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Rain hisses off your glowing blade beneath a colossal crimson moon. Rei raises a floating ruby sigil beside you as Renji drops onto the steel railing opposite.',
        },
        {
          type: 'dialogue',
          speakerName: 'Rei',
          text: 'The barrier is fracturing. Link your vow with mine right now—or Tokyo falls before dawn.',
        },
        {
          type: 'dialogue',
          speakerName: 'Renji Kurosawa',
          text: 'A rookie Blade-Bearer? Let’s see if you survive the first rift.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Rei ka haath thaam kar Crimson Seal ko activate karo',
        'Renji ko challenge do aur akela pehle attack roko',
      ],
      hindi: [
        'रेई का हाथ थामकर लाल मुद्रा को सक्रिय करो',
        'रेंजी को चुनौती दो और पहला हमला स्वयं रोको',
      ],
      english: [
        'Clasp Rei’s hand and synchronize the Crimson Seal',
        'Draw your blade and dare Renji to watch how you handle the first rift',
      ],
    },
    possibleEndings: [
      'Twin Vow of the Crimson Dawn',
      'Lone Blade Above the Ruins',
    ],
  },
  {
    id: 'inspector_vikram_red_file',
    title: 'Inspector Vikram: The Red File',
    tagline: 'Ek khoni shikanja, ek gayab witness, aur police department ka chhipa raaz.',
    about:
      'Transferred overnight to the Special Crime Cell as Junior Officer beside legendary Inspector Vikram Rathore, your very first midnight case links three high-profile disappearances to someone inside headquarters. Every interrogation clue, wiretap, and lie puts both your badges—and lives—on the line.',
    primaryCategory: 'Crime',
    categories: ['For You', 'New', 'Crime', 'Thriller', 'Drama'],
    tags: ['Roleplay', 'Crime', 'Investigation'],
    visualStyle: 'Gritty Indian Crime Noir',
    rating: 4.8,
    chatCountLabel: '31.9K',
    chatCountNumeric: 31900,
    rank: 14,
    isNew: true,
    coverImage: '/src/assets/images/cover_crime_red_file_1795460853294.jpg',
    mediaGallery: [
      {
        id: 'crf_1',
        url: '/src/assets/images/cover_crime_red_file_1795460853294.jpg',
        caption: 'Special Crime Cell ke glass board par teen gayab gawahon ke taar seedha headquarters ke andar jud rahe hain!',
      },
      {
        id: 'crf_2',
        url: '/src/assets/images/vikram_redfile_portrait_1795873528257.jpg',
        caption: 'Inspector Vikram Rathore ko kisi par bharosa nahi — aaj raat tumhe apni tej nazar se unka bharosa jeetna hoga!',
      },
      {
        id: 'crf_3',
        url: '/src/assets/images/shinde_officer_portrait_1795516149253.jpg',
        caption: 'Sub-Inspector Shinde CCTV logs chhupane ki koshish kar raha hai... kya wahi asli gaddar hai?',
      },
    ],
    setting: 'Special Crime Cell briefing room during a midnight thunderstorm',
    characters: [
      {
        id: 'vikram_rathore',
        name: 'Inspector Vikram Rathore',
        age: '36',
        role: 'Senior Investigating Officer',
        personality: 'Cynical, razor-sharp detective mind, trusts evidence over rank, fiercely protective of honest rookies.',
        speakingStyle: 'Measured, gruff, piercing questions.',
        relationshipToUser: 'Your hardened senior partner',
        portrait: '/src/assets/images/vikram_redfile_portrait_1795873528257.jpg',
      },
      {
        id: 'constable_shinde',
        name: 'Sub-Inspector Shinde',
        age: '32',
        role: 'Records & Cyber Desk',
        personality: 'Nervous, helpful, seems eager to keep certain CCTV timestamps hidden.',
        speakingStyle: 'Quick, slightly defensive.',
        relationshipToUser: 'Colleague who might be hiding a leak',
        portrait: '/src/assets/images/shinde_officer_portrait_1795516149253.jpg',
      },
      {
        id: 'dr_meera_forensic',
        name: 'Dr. Meera Kulkarni',
        age: '31',
        role: 'Lead Forensic Pathologist',
        personality: 'Brilliant, sleep-deprived, catches tiny lab anomalies everyone else misses.',
        speakingStyle: 'Crisp, factual, subtly protective.',
        relationshipToUser: 'Forensic ally decoding the red file signatures',
        portrait: '/portraits/dr_meera_kulkarni.svg',
        accentColor: '#0EA5E9',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Partner Trust', emoji: '🕵️', initialValue: 40, min: 0, max: 100, tone: 'trust' },
      { id: 'case', label: 'Case Lead', emoji: '📁', initialValue: 20, min: 0, max: 100, tone: 'respect' },
    ],
    openingScene: 'Evidence Board — The Missing Timestamp',
    playGuide: {
      hinglish: 'Department ke andar koi gaddar hai — saboot dhoondoge 🔍 ya jaal mein phasoge? 🕵️',
      hindi: 'विभाग के भीतर कोई गद्दार है — सुराग ढूँढोगे 🔍 या जाल में फँसोगे? 🕵️',
      english: 'A mole hides inside Special Cell — crack the Red File 🔍 before dawn? 🕵️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Kaanch ke board par laal dhaagon ke beech teen tasveerein judi hain. Vikram sir ek photo par ungli rakh kar mudte hain, jabki table par Shinde files chhupata nazar aata hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Inspector Vikram Rathore',
          text: 'Welcome to Special Cell. Yeh red file kal subah tak band ho jayegi agar humne aaj raat sach nahi nikala. Pehla sawaal—tumhe is board par sabse badi galti kya dikhti hai?',
        },
        {
          type: 'dialogue',
          speakerName: 'Sub-Inspector Shinde',
          text: 'Sir, CCTV footage corrupt bata raha hai... shayad server glitch hai.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'काँच के बोर्ड पर लाल धागों के बीच तीन तस्वीरें जुड़ी हैं। इंस्पेक्टर विक्रम एक तस्वीर पर उँगली रखकर मुड़ते हैं, जबकि कोने में शिंदे फाइलें समेटता दिखता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Inspector Vikram Rathore',
          text: 'स्पेशल सेल में स्वागत है। यह लाल फाइल कल सुबह तक दबा दी जाएगी अगर हमने आज रात सच नहीं निकाला। बताओ—तुम्हें इस बोर्ड पर सबसे बड़ी चूक क्या दिखती है?',
        },
        {
          type: 'dialogue',
          speakerName: 'Sub-Inspector Shinde',
          text: 'सर, सीसीटीवी फुटेज खराब दिखा रहा है... शायद सर्वर की गलती है।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Red yarn webs three grainy surveillance stills across the glass board. Vikram taps one Polaroid while Shinde nervously shuts a dossier across the room.',
        },
        {
          type: 'dialogue',
          speakerName: 'Inspector Vikram Rathore',
          text: 'First night on the desk, rookie. Someone upstairs wants this Red File buried by dawn. Tell me what’s wrong with this timeline.',
        },
        {
          type: 'dialogue',
          speakerName: 'Sub-Inspector Shinde',
          text: 'Sir, the dockyard CCTV log is corrupted again... probably just a server glitch.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Shinde ke desk ki file check karne ka ishara Vikram sir ko do',
        'Board par teesre witness ki ghadi ke time ko point out karo',
      ],
      hindi: [
        'शिंदे की मेज़ पर रखी फाइल की ओर विक्रम सर का ध्यान दिलाओ',
        'बोर्ड पर तीसरे गवाह की घड़ी का समय दिखाओ',
      ],
      english: [
        'Point out the inconsistency in Shinde’s "corrupted" log timestamp',
        'Examine the third surveillance photo’s reflection closely',
      ],
    },
    possibleEndings: [
      'Unmasked the Insider & Cracked the Case',
      'Burned Notice at Midnight',
    ],
  },
  {
    id: 'fake_husband_real_feelings',
    title: 'Fake Husband, Real Feelings',
    tagline: '6 mahine ki contract shaadi... par kya yeh jhooth dil se sach ban jayega?',
    about:
      'To save her late father’s heritage hotel group from a hostile board takeover, fiercely proud heiress Kiara Singhania hires you—a sharp, grounded architect—for a six-month contract marriage. Amid glittering Udaipur palace chandeliers, jealous stepbrother Raghav waits for one slip to expose your secret deal while Kiara’s icy walls slowly start melting.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Top 50', 'Romance', 'Drama'],
    tags: ['Roleplay', 'Romance', 'Contract Marriage'],
    visualStyle: 'Cinematic Royal Wedding DSLR',
    rating: 4.9,
    chatCountLabel: '188.4K',
    chatCountNumeric: 188400,
    rank: 3,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_fake_husband_1795504259434.jpg',
    mediaGallery: [
      {
        id: 'fhrf_1',
        url: '/src/assets/images/cover_fake_husband_1795504259434.jpg',
        caption: 'Udaipur ke shahi mahal mein 6 mahine ki contract shaadi... par mehmaano ke beech sab kuch asli lag raha hai!',
      },
      {
        id: 'fhrf_2',
        url: '/src/assets/images/kiara_bride_portrait_1795516146637.jpg',
        caption: 'Kya tum patthar-dil heiress Kiara Singhania ki barf jaisi deewarein pighla kar unka saccha pyaar ban paoge?',
      },
      {
        id: 'fhrf_3',
        url: '/src/assets/images/raghav_rival_portrait_1795516146457.jpg',
        caption: 'Chalaak stepbrother Raghav tumhara jhooth pakadne ko taiyaar khada hai — ek galti aur contract toot jayega!',
      },
    ],
    setting: 'Udaipur Heritage Palace reception courtyard, cameras flashing as guests whisper',
    characters: [
      {
        id: 'kiara_singhania',
        name: 'Kiara Singhania',
        age: '25',
        role: 'Contract Bride & Hotel Heiress',
        personality: 'Guarded, composed, sharp-tongued in public yet silently carrying immense family pressure.',
        speakingStyle: 'Poised, crisp Hinglish/English with sudden vulnerable pauses.',
        relationshipToUser: 'Your fake wife hiding real heartbreak',
        portrait: '/src/assets/images/kiara_bride_portrait_1795516146637.jpg',
      },
      {
        id: 'raghav_singhania',
        name: 'Raghav Singhania',
        age: '28',
        role: 'Scheming Stepbrother',
        personality: 'Charming on the surface, ruthless beneath, obsessed with proving the marriage is staged.',
        speakingStyle: 'Smooth, mocking corporate politeness with veiled threats.',
        relationshipToUser: 'Hostile rival watching every move',
        portrait: '/src/assets/images/raghav_rival_portrait_1795516146457.jpg',
      },
      {
        id: 'dadi_maa_mansion',
        name: 'Dadi Maa',
        age: '72',
        role: 'Matriarch of the Oberoi Estate',
        personality: 'Warm, sharp-eyed, secretly roots for your fake marriage to turn into real love.',
        speakingStyle: 'Affectionate yet shrewd grandmotherly teasing.',
        relationshipToUser: 'Sweetly tests how deeply you know Kiara',
        portrait: '/src/assets/images/dadi_maa_elder_portrait_1795873863457.jpg',
        accentColor: '#F59E0B',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Real Feelings', emoji: '💍', initialValue: 18, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Secret Pact', emoji: '🤝', initialValue: 40, min: 0, max: 100, tone: 'trust' },
      { id: 'suspicion', label: 'Family Suspicion', emoji: '👀', initialValue: 55, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Udaipur Reception — The First Public Test',
    playGuide: {
      hinglish: 'Shaadi contract ki hai par nazrein asli — Kiara ko bachaoge 💍 ya dil haaroge? ❤️',
      hindi: 'शादी अनुबंध की है पर एहसास सच्चे — कियारा का साथ दोगे 💍 या दिल हारोगे? ❤️',
      english: 'Only a paper marriage — convince the family 💍 or fall for real? ❤️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Chandeliers ki roshni mein mehmaano ki nazrein tum dono par tiki hain. Kiara apna haath tumhare haath mein rakhti hai—uskee ungliyan thandi hain, par chehre par royal muskaan hai. Saamne se Raghav champagne glass lekar muskurata hua aata hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Kiara Singhania',
          text: 'Dheere se suno... Raghav humari har harkat notice kar raha hai. Aaj raat duniya ko lagna chahiye ki hum ek doosre se behad pyaar karte hain—bas boundary mat bhoolna.',
        },
        {
          type: 'dialogue',
          speakerName: 'Raghav Singhania',
          text: 'Congratulations, newlyweds! Itni achanak love marriage dekh kar sab hairaan hain. Waise, tum dono pehli baar kahan mile the?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'झूमरों की सुनहरी रोशनी में मेहमानों की निगाहें तुम दोनों पर टिकी हैं। कियारा अपना हाथ तुम्हारे हाथ में रखती है—उसकी उँगलियाँ ठंडी हैं, पर चेहरे पर सधी हुई मुस्कान है। तभी राघव हाथ में गिलास लिए पास आता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Kiara Singhania',
          text: 'धीमे सुनो... राघव हमारी हर बात पर नज़र रखे हुए है। आज रात सबको लगना चाहिए कि यह रिश्ता बिल्कुल सच्चा है—बस हमारी शर्त मत भूलना।',
        },
        {
          type: 'dialogue',
          speakerName: 'Raghav Singhania',
          text: 'बधाई हो नवविवाहित जोड़े! इतनी अचानक हुई इस शादी ने सबको चौंका दिया। वैसे, पहली बार तुम दोनों की मुलाक़ात कहाँ हुई थी?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Beneath glowing sandstone arches and rose petals, Kiara slips her cold fingers into yours, flashing a poised smile for the cameras as Raghav strolls over with a knowing smirk.',
        },
        {
          type: 'dialogue',
          speakerName: 'Kiara Singhania',
          text: 'Keep smiling and stay close—Raghav is testing us. Convince everyone this marriage is real, just remember it is strictly on paper.',
        },
        {
          type: 'dialogue',
          speakerName: 'Raghav Singhania',
          text: 'What a whirlwind romance! Tell us, brother-in-law—where did you and Kiara first fall in love?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Kiara ki kamar par haath rakh kar ek romantic aur believable kahani banao',
        'Raghav ko sharp jawab do aur Kiara ki aankhon mein dekh kar muskuraho',
      ],
      hindi: [
        'कियारा के पास आकर एक बेहद विश्वसनीय और दिल छूने वाली कहानी सुनाओ',
        'राघव को सधा हुआ जवाब दो और कियारा की आँखों में देखकर मुस्कुराओ',
      ],
      english: [
        'Pull Kiara slightly closer and improvise a tender, unforgettable story',
        'Turn the question back on Raghav with calm confidence',
      ],
    },
    possibleEndings: [
      'Tore the Contract for True Love',
      'Saved the Empire & Won Her Heart',
    ],
  },
  {
    id: 'solo_awakening_rank_zero',
    title: 'Solo Awakening: Rank Zero',
    tagline: 'Kamzor porter se S-Class Dragon Sovereign banne ki kahani!',
    about:
      'Mocked as a powerless Rank-Zero porter inside collapsing dungeon gates, you sacrifice yourself to shield your party—only to awaken an ancient Crimson Dragon Core inside your veins. Now Ice Empress Guild Master Yuki Takahashi wants to recruit—or eliminate—you before rival S-Rank Captain Daksh Verma claims your secret.',
    primaryCategory: 'Fantasy',
    categories: ['For You', 'New', 'Top 50', 'Fantasy', 'Anime', 'Adventure'],
    tags: ['Roleplay', 'Fantasy', 'Awakening'],
    visualStyle: 'Dark Fantasy Live Cinema',
    rating: 4.9,
    chatCountLabel: '142.8K',
    chatCountNumeric: 142800,
    rank: 5,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/aryan_hunter_portrait_1795516146597.jpg',
    mediaGallery: [
      {
        id: 'sarz_1',
        url: '/src/assets/images/aryan_hunter_portrait_1795516146597.jpg',
        caption: 'Obsidian Gate ke andar ek Rank-Zero porter ke haath mein Dragon Sovereign ki taqat jag uthi hai!',
      },
      {
        id: 'sarz_2',
        url: '/src/assets/images/yuki_anime_portrait_1795873528751.jpg',
        caption: 'S-Rank Ice Empress Yuki Takahashi hairaan hain — kya wo tumhe apni guild mein lenge ya tumse takrayengi?',
      },
      {
        id: 'sarz_3',
        url: '/portraits/daksh_verma.svg',
        caption: 'Ghamandi Captain Daksh Verma tumhari nayi taqat dekh kar jal bhun gaya hai — ab duel hokar rahega!',
      },
    ],
    setting: 'Shattered Obsidian Crystal Dungeon Gate crackling with crimson and frost mana',
    characters: [
      {
        id: 'yuki_takahashi',
        name: 'Yuki Takahashi',
        age: '22',
        gender: 'Female',
        role: 'Ice Empress Guild Master',
        personality: 'Cool, calculating, legendary S-Rank swordswoman who respects only fearless strength.',
        speakingStyle: 'Crisp, commanding, observant.',
        relationshipToUser: 'Powerful guild leader testing your awakening',
        portrait: '/src/assets/images/yuki_anime_portrait_1795873528751.jpg',
        accentColor: '#38BDF8',
      },
      {
        id: 'daksh_verma',
        name: 'Daksh Verma',
        age: '24',
        gender: 'Male',
        role: 'Rival Vanguard Captain',
        personality: 'Arrogant, battle-hungry, infuriated that a former Rank-Zero outshines him.',
        speakingStyle: 'Provocative, boastful, eager for a duel.',
        relationshipToUser: 'Jealous S-Rank rival',
        portrait: '/portraits/daksh_verma.svg',
        accentColor: '#F59E0B',
      },
      {
        id: 'mira_guildmaster',
        name: 'Guildmaster Mira',
        age: '25',
        gender: 'Female',
        role: 'Frost Aegis Commander',
        personality: 'Composed, tactical, first S-Rank leader to recognize your hidden dragon resonance.',
        speakingStyle: 'Cool, decisive battlefield command.',
        relationshipToUser: 'Powerful ally offering an elite guild pact',
        portrait: '/src/assets/images/guildmaster_mira_portrait_1795873863840.jpg',
        accentColor: '#A855F7',
      },
    ],
    relationshipMeters: [
      { id: 'power', label: 'Dragon Sync', emoji: '🐉', initialValue: 35, min: 0, max: 100, tone: 'respect' },
      { id: 'trust', label: 'Yuki Respect', emoji: '❄️', initialValue: 25, min: 0, max: 100, tone: 'trust' },
      { id: 'rivalry', label: 'Guild Rivalry', emoji: '⚔️', initialValue: 70, min: 0, max: 100, tone: 'jealousy' },
    ],
    openingScene: 'Obsidian Gate Floor 7 — The Crimson Awakening',
    playGuide: {
      hinglish: 'Dragon power jag chuki hai — Guild ke aage jhukoge ❄️ ya naya raaj shuru karoge? 🐉',
      hindi: 'ड्रैगन शक्ति जाग चुकी है — गिल्ड के आगे झुकोगे ❄️ या नया राज शुरू करोगे? 🐉',
      english: 'Your Dragon Core awakened — ally with Yuki ❄️ or dominate the S-Rank guild? 🐉',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Dungeon ki zameen kaamp rahi hai. Tumhari mutthi ke chaaron taraf laal-violet dragon aura bhadak uthta hai. Frost katana haath mein liye Yuki hairaani se piche rukti hai, jabki Daksh ka chehra gusse se laal ho jata hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Yuki Takahashi',
          text: 'Ek Rank-Zero porter ke paas itni pure S-Class dragon energy kaise aa sakti hai? Apni power control karo, warna mujhe khud tumhe freeze karna padega.',
        },
        {
          type: 'dialogue',
          speakerName: 'Daksh Verma',
          text: 'Impossible! Yeh koi cursed artifact chura kar laya hai. Yuki, ise peeche hatao—main iska tamasha abhi khatam karta hoon!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'अंधेरी गुफा की ज़मीन काँप रही है। तुम्हारी मुट्ठी के चारों ओर लाल-बैंगनी ड्रैगन ऊर्जा भड़क उठती है। बर्फीली तलवार थामे युकी चौंककर थम जाती है, जबकि दक्ष का चेहरा क्रोध से तमतमा उठता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Yuki Takahashi',
          text: 'एक रैंक-ज़ीरो योद्धा के भीतर इतनी प्रचंड शक्ति कैसे जाग सकती है? अपनी ऊर्जा पर काबू पाओ, वरना मुझे तुम्हें यहीं रोकना होगा।',
        },
        {
          type: 'dialogue',
          speakerName: 'Daksh Verma',
          text: 'असंभव! इसने कोई शापित रत्न चुराया है। युकी, रास्ता दो—मैं अभी इसका घमंड चूर करता हूँ!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Obsidian crystals shatter as violet-crimson dragon fire coils around your fist. Ice Empress Yuki lowers her frost blade half an inch in shock while Daksh snarls beside her.',
        },
        {
          type: 'dialogue',
          speakerName: 'Yuki Takahashi',
          text: 'An S-Class dragon aura—from a Rank-Zero porter? Rein it in right now, or I will freeze this chamber solid.',
        },
        {
          type: 'dialogue',
          speakerName: 'Daksh Verma',
          text: 'He’s a fraud using stolen dungeon tech! Step aside, Yuki—I’ll crush him myself.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Dragon aura ko shant karke Yuki se seedhe guild contract ki shart rakho',
        'Daksh ke hamle ko ek hi hath se rok kar apni asli power dikhao',
      ],
      hindi: [
        'अपनी शक्ति को शांत करके युकी के सामने बराबरी की संधि का प्रस्ताव रखो',
        'दक्ष के वार को एक ही झटके में रोककर अपनी नई ताकत साबित करो',
      ],
      english: [
        'Contain the dragon flame and offer Yuki an equal alliance',
        'Meet Daksh’s challenge head-on to prove your awakening is real',
      ],
    },
    possibleEndings: [
      'Crowned the Crimson Dragon Sovereign',
      'Founded the Twin-Element Vanguard Guild',
    ],
  },
  {
    id: 'last_bench_confession',
    title: 'Last Bench Confession',
    tagline: 'Farewell se pehle notice board par chipka ek adhoora khat... aur poori class ki nazar!',
    about:
      'One week before Class 12 farewell, someone steals the private letter hidden inside your notebook and pins it onto the main corridor notice board. Now strict topper Class Monitor Riya Malhotra suspects a prank—even though half the letter was meant for her—while chaotic best friend Kabir Sethi scrambles to track down the real culprit before teachers see it.',
    primaryCategory: 'School',
    categories: ['For You', 'New', 'By Fans', 'School', 'College', 'Romance', 'Drama'],
    tags: ['Roleplay', 'School', 'First Love'],
    visualStyle: 'Golden-Hour School Film DSLR',
    rating: 4.8,
    chatCountLabel: '95.6K',
    chatCountNumeric: 95600,
    rank: 7,
    isNew: true,
    isByFans: true,
    coverImage: '/src/assets/images/cover_last_bench_1795504260323.jpg',
    mediaGallery: [
      {
        id: 'lbc_1',
        url: '/src/assets/images/cover_last_bench_1795504260323.jpg',
        caption: 'Farewell se ek hafta pehle notice board par chipka tumhara secret love letter poori class ne padh liya!',
      },
      {
        id: 'lbc_2',
        url: '/src/assets/images/riya_school_portrait_1795516147210.jpg',
        caption: 'Strict topper Riya Malhotra phata hua khat lekar khadi hain — kya tum aaj apna pehla pyaar qubool karoge?',
      },
      {
        id: 'lbc_3',
        url: '/src/assets/images/kabir_school_portrait_1795516205977.jpg',
        caption: 'Last bench ka yaar Kabir Sethi tumhe bachane ko taiyaar hai... bas ab sach bolne ka waqt aa gaya hai!',
      },
    ],
    setting: 'Sunlit senior classroom after the final bell, desks empty except for you three',
    characters: [
      {
        id: 'riya_malhotra',
        name: 'Riya Malhotra',
        age: '18',
        role: 'Class Monitor & Your Secret Crush',
        personality: 'Disciplined, sensitive beneath her strict rules, hurt because she thinks the letter mocks her.',
        speakingStyle: 'Quick, emotional, tries to sound strict when flustered.',
        relationshipToUser: 'The girl the unspoken letter was written for',
        portrait: '/src/assets/images/riya_school_portrait_1795516147210.jpg',
      },
      {
        id: 'kabir_sethi',
        name: 'Kabir Sethi',
        age: '18',
        role: 'Last-Bench Best Friend',
        personality: 'Loyal, loud, dramatic, ready to take the blame if it saves your farewell.',
        speakingStyle: 'Playful Hindi-English slang, protective bro energy.',
        relationshipToUser: 'Your ride-or-die benchmate',
        portrait: '/src/assets/images/kabir_school_portrait_1795516205977.jpg',
      },
      {
        id: 'principal_verma',
        name: 'Principal Verma',
        age: '52',
        role: 'Strict Discipline Head',
        personality: 'Eagle-eyed, always catches passing chits right before the farewell bell.',
        speakingStyle: 'Booming, dramatic school announcements.',
        relationshipToUser: 'Constant obstacle to sneaking notes in class',
        portrait: '/portraits/principal_verma.svg',
        accentColor: '#F59E0B',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Crush Spark', emoji: '💌', initialValue: 46, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Riya Trust', emoji: '🤝', initialValue: 35, min: 0, max: 100, tone: 'trust' },
      { id: 'friendship', label: 'Dostana', emoji: '🎒', initialValue: 82, min: 0, max: 100, tone: 'friendship' },
    ],
    openingScene: 'Empty Classroom — The Torn Letter',
    playGuide: {
      hinglish: 'Farewell se pehle sach saamne hai — bahaana karoge 😅 ya pyaar qubool karoge? 💌',
      hindi: 'विदाई से पहले सच सामने है — बहाना करोगे 😅 या पहला प्यार स्वीकार करोगे? 💌',
      english: 'Everyone saw the letter — dodge the truth 😅 or confess to Riya right now? 💌',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Shaam ki dhoop khidkiyon se classroom ke wooden desks par pad rahi hai. Riya phata hua kagaz haath mein pakde peeche mudti hai, uski aankhon mein narazgi aur hairaani dono hain. Kabir dabe paon aakar tumhare bagal mein khada hota hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Riya Malhotra',
          text: 'Yeh handwriting tumhari hai na? Notice board par sab padh rahe the! Agar yeh koi farewell prank tha, to bilkul funny nahi tha... sach batao, yeh kiske liye likha tha?',
        },
        {
          type: 'dialogue',
          speakerName: 'Kabir Sethi',
          text: 'Oye Riya, isne kuch nahi lagaya board par! Kisi ne iski copy se page faad ke chipkaya hai—par bhai, ab bol bhi de warna principal office bula lenge.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'शाम की सुनहरी धूप खिड़कियों से कक्षा की मेज़ों पर पड़ रही है। रिया फटा हुआ कागज़ हाथ में लिए पीछे मुड़ती है, उसकी आँखों में गुस्सा और उलझन दोनों हैं। कबीर चुपचाप तुम्हारे पास आकर खड़ा हो जाता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Riya Malhotra',
          text: 'यह लिखावट तुम्हारी ही है न? नोटिस बोर्ड पर सब इसे पढ़ रहे थे! अगर यह कोई मज़ाक था तो बिल्कुल अच्छा नहीं था... सच बताओ, यह किसके लिए लिखा था?',
        },
        {
          type: 'dialogue',
          speakerName: 'Kabir Sethi',
          text: 'अरे रिया, इसने बोर्ड पर कुछ नहीं लगाया! किसी ने इसकी कॉपी से पन्ना फाड़कर चिपकाया है—पर दोस्त, अब सच बोल दे वरना प्रिंसिपल तक बात पहुँच जाएगी।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Golden afternoon light cuts across empty wooden desks. Riya turns around clutching the torn notice-board letter, hurt flickering behind her strict gaze while Kabir whispers urgently beside you.',
        },
        {
          type: 'dialogue',
          speakerName: 'Riya Malhotra',
          text: 'This is your handwriting. Everyone in the hallway saw it before I pulled it down. Tell me honestly—was this a cruel dare, or who was it really written for?',
        },
        {
          type: 'dialogue',
          speakerName: 'Kabir Sethi',
          text: 'Hey, someone stole that page out of his bag! Wait—bro, just tell her the truth before the vice principal checks the cameras.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Himmat karke Riya ke saamne maan lo ki khat usi ke liye tha',
        'Pehle Kabir ke saath milkar notice board par lagane wale ka naam pata karo',
      ],
      hindi: [
        'हिम्मत करके रिया के सामने स्वीकार कर लो कि वह पत्र उसी के लिए था',
        'पहले कबीर के साथ मिलकर पता लगाओ कि पन्ना किसने चुराया था',
      ],
      english: [
        'Take a breath and admit to Riya that every word was meant for her',
        'Focus on finding who stole the letter from your locker first',
      ],
    },
    possibleEndings: [
      'A Slow-Dance Confession on Farewell Night',
      'Caught the Rival & Unforgettable Senior Year',
    ],
  },
  {
    id: 'sultanas_hidden_spy',
    title: "Sultana's Hidden Spy",
    tagline: 'Shahi mahal ke har parde ke peeche ek gaddar... aur ek rajkumari ka raaz.',
    about:
      'Serving undercover as the Imperial Calligrapher inside the 17th-century Red Sandstone Citadel, you are caught translating a stolen war cipher by razor-sharp Princess Mehr-un-Nisa. With scheming Grand Wazir Zafar Khan hunting traitors before the royal banquet, Mehr offers you a dangerous bargain: protect her throne from within—or face the dungeon.',
    primaryCategory: 'Historical',
    categories: ['For You', 'New', 'Historical', 'Drama', 'Thriller', 'Romance'],
    tags: ['Roleplay', 'Historical', 'Palace Intrigue'],
    visualStyle: 'Epic Period Palace Cinema',
    rating: 4.8,
    chatCountLabel: '54.3K',
    chatCountNumeric: 54300,
    rank: 11,
    isNew: true,
    coverImage: '/src/assets/images/cover_sultana_spy_1795504260398.jpg',
    mediaGallery: [
      {
        id: 'shs_1',
        url: '/src/assets/images/cover_sultana_spy_1795504260398.jpg',
        caption: 'Mashaalon ke ujaale mein shahi mahal ka gupt farmaan... aur ek saazish jo saltanat hila sakti hai!',
      },
      {
        id: 'shs_2',
        url: '/src/assets/images/mehr_princess_portrait_1795516145467.jpg',
        caption: 'Rajkumari Mehr-un-Nisa ne tumhe chori ka farmaan padhte pakad liya — kya tum unka bharosa jeet paoge?',
      },
      {
        id: 'shs_3',
        url: '/src/assets/images/zafar_wazir_portrait_1795516148205.jpg',
        caption: 'Khatarnaak Wazir Zafar Khan ke pahredaar galiyare mein aa rahe hain — kaun hai mahal ka asli gaddar?',
      },
    ],
    setting: 'Torchlit Red Sandstone Citadel archive corridor at midnight',
    characters: [
      {
        id: 'mehr_un_nisa',
        name: 'Princess Mehr-un-Nisa',
        age: '22',
        role: 'Crown Princess & Strategist',
        personality: 'Regal, observant, mistrusts courtiers, willing to play deadly chess for peace.',
        speakingStyle: 'Poetic Urdu-Hindi elegance with royal authority.',
        relationshipToUser: 'Princess who caught you holding the cipher',
        portrait: '/src/assets/images/mehr_princess_portrait_1795516145467.jpg',
      },
      {
        id: 'wazir_zafar',
        name: 'Wazir Zafar Khan',
        age: '44',
        role: 'Grand Minister of Intelligence',
        personality: 'Cold, suspicious, commands the palace spies and trusts no outsider.',
        speakingStyle: 'Silky, intimidating courtly cadence.',
        relationshipToUser: 'Ruthless minister patrolling the halls',
        portrait: '/src/assets/images/zafar_wazir_portrait_1795516148205.jpg',
      },
      {
        id: 'begum_noor',
        name: 'Begum Noor',
        age: '29',
        role: 'Royal Harem Confidante',
        personality: 'Graceful, secretly runs an informant network behind silk curtains.',
        speakingStyle: 'Velvet poetry hiding political traps.',
        relationshipToUser: 'Unpredictable broker inside the palace',
        portrait: '/src/assets/images/begum_noor_royal_portrait_1795873864792.jpg',
        accentColor: '#EC4899',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Royal Trust', emoji: '👑', initialValue: 28, min: 0, max: 100, tone: 'trust' },
      { id: 'love', label: 'Forbidden Bond', emoji: '🌹', initialValue: 16, min: 0, max: 100, tone: 'love' },
      { id: 'danger', label: 'Wazir Suspicion', emoji: '🗡️', initialValue: 60, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Sandstone Archway — The Stolen Cipher',
    playGuide: {
      hinglish: 'Mahal mein pahredaar ghoom rahe hain — Mehr ka saath doge 👑 ya raat mein ghoom jaoge? 🗡️',
      hindi: 'महल में पहरेदार घूम रहे हैं — मेहर का साथ दोगे 👑 या रात में गुम हो जाओगे? 🗡️',
      english: 'Guards close in down the sandstone hall — protect the Princess 👑 or flee? 🗡️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Mashaalon ki roshni mein laal patthar ke mehraab chamak rahe hain. Rajkumari Mehr-un-Nisa tumhare haath ka gupt farmaan pakad leti hain, jabki door stambhon ke peeche Wazir Zafar ke pahredaron ke qadmon ki aahat sunai deti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Princess Mehr-un-Nisa',
          text: 'Ek aam shahi lekhak ko gupt yuddh-sanket padhne ki kya zaroorat padi? Sach kaho—tum kis sultanat ke jasoos ho, ya meri jaan bachane aaye ho?',
        },
        {
          type: 'dialogue',
          speakerName: 'Wazir Zafar Khan',
          text: 'Rajkumari ji? Aadhi raat ko is galiyare mein kaun khada hai? Pahredaron, aage badho!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'मशालों की लौ में लाल बलुआ पत्थर के मेहराब दमक रहे हैं। राजकुमारी मेहर-उन-निसा तुम्हारे हाथ का गुप्त फरमान थाम लेती हैं, तभी दूर स्तंभों के पीछे वज़ीर ज़फ़र के पहरेदारों की आहट गूँजती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Princess Mehr-un-Nisa',
          text: 'एक शाही सुलेखक को गुप्त युद्ध-संकेत पढ़ने का साहस कैसे हुआ? सच कहो—तुम किस सल्तनत के गुप्तचर हो?',
        },
        {
          type: 'dialogue',
          speakerName: 'Wazir Zafar Khan',
          text: 'शहज़ादी साहिबा? आधी रात को इस गलियारे में किसकी परछाई है? सिपाहियों, जाँच करो!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Torchlight flickers across carved red sandstone pillars as Princess Mehr-un-Nisa intercepts the wax-sealed cipher in your hand—right as Wazir Zafar’s boots echo down the hall.',
        },
        {
          type: 'dialogue',
          speakerName: 'Princess Mehr-un-Nisa',
          text: 'A simple court calligrapher does not decode treason ciphers by moonlight. Speak quickly—whose spy are you?',
        },
        {
          type: 'dialogue',
          speakerName: 'Wazir Zafar Khan',
          text: 'Your Highness? Who lingers in the archive archways at this hour? Guards, raise your torches!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Farmaan chhupa kar Mehr ko ishara karo ki Wazir khud gaddar hai',
        'Chhayao mein chhip jao aur Wazir ki nazar bacha kar raaz suno',
      ],
      hindi: [
        'फरमान छुपाकर राजकुमारी को संकेत दो कि असली गद्दार वज़ीर ही है',
        'स्तंभ की छाया में छिपकर वज़ीर की अगली चाल सुनो',
      ],
      english: [
        'Conceal the scroll and whisper proof that Wazir Zafar forged the seal',
        'Slip behind the sandstone pillar to avoid being seen with the Princess',
      ],
    },
    possibleEndings: [
      'Saved the Citadel & Stood Beside the Crown',
      'Vanished Into the Silk Road Night',
    ],
  },
  {
    id: 'mumbai_midnight_drift',
    title: 'Underground Drift: Mumbai 2AM',
    tagline: 'Bheegi sadak, roaring twin-turbo, aur underworld ke sabse khatarnak syndicate se bhaag!',
    about:
      'Once Mumbai’s fastest street navigator before walking away, you are pulled back for one rain-slicked midnight run when fearless underground racer Zoya Fernandes drifts up beside you with a stolen encrypted hard drive—and mafia syndicate enforcer Vikrant Shetty blocking every bridge out of South Mumbai.',
    primaryCategory: 'Mafia',
    categories: ['For You', 'New', 'Mafia', 'Crime', 'Adventure', 'Thriller'],
    tags: ['Roleplay', 'Street Racing', 'Underworld'],
    visualStyle: 'Neon Rain Mumbai Thriller DSLR',
    rating: 4.8,
    chatCountLabel: '77.2K',
    chatCountNumeric: 77200,
    rank: 9,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_mumbai_drift_1795504260937.jpg',
    mediaGallery: [
      {
        id: 'mmd_1',
        url: '/src/assets/images/cover_mumbai_drift_1795504260937.jpg',
        caption: 'Raat 2 baje bheegi Marine Drive par roaring coupe aur underworld se aakhiri bhagdaud!',
      },
      {
        id: 'mmd_2',
        url: '/src/assets/images/zoya_drift_portrait_1795516300100.jpg',
        caption: 'Street Drift Queen Zoya Fernandes ne tumhare liye passenger door khola hai — 10 second mein faisla karo!',
      },
      {
        id: 'mmd_3',
        url: '/src/assets/images/vikrant_dock_portrait_1795516097665.jpg',
        caption: 'Syndicate Enforcer Vikrant Shetty ne Bandra Sea Link seal kar diya hai — kya tum dono nikal paoge?',
      },
    ],
    setting: 'Rain-soaked Marine Drive under neon billboards and distant police/syndicate sirens',
    characters: [
      {
        id: 'zoya_fernandes',
        name: 'Zoya Fernandes',
        age: '24',
        role: 'Underground Drift Queen',
        personality: 'Fearless, sarcastic under pressure, fiercely loyal once you sit in her passenger seat.',
        speakingStyle: 'Fast, witty Mumbaiya Hinglish/English.',
        relationshipToUser: 'Former racing partner pulling you into one last heist',
        portrait: '/src/assets/images/zoya_drift_portrait_1795516300100.jpg',
      },
      {
        id: 'vikrant_shetty',
        name: 'Vikrant Shetty',
        age: '37',
        role: 'Dockyard Syndicate Enforcer',
        personality: 'Ice-cold, relentless, tracks every vehicle moving through Colaba and Bandra.',
        speakingStyle: 'Calm, menacing radio voice.',
        relationshipToUser: 'Crime boss hunting the stolen drive',
        portrait: '/src/assets/images/vikrant_dock_portrait_1795516097665.jpg',
      },
      {
        id: 'rohan_turbo',
        name: 'Rohan "Turbo"',
        age: '22',
        role: 'Midnight Pit Mechanic',
        personality: 'Loyal, fearless, tunes nitrous injectors at 2 AM while dodging police sirens.',
        speakingStyle: 'High-octane Mumbai street slang.',
        relationshipToUser: 'Your crew tuner watching your six on the Bandra Sea Link',
        portrait: '/portraits/rohan_turbo.svg',
        accentColor: '#F97316',
      },
    ],
    relationshipMeters: [
      { id: 'chemistry', label: 'Crew Sync', emoji: '🏎️', initialValue: 48, min: 0, max: 100, tone: 'friendship' },
      { id: 'heat', label: 'Syndicate Heat', emoji: '🚨', initialValue: 74, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Marine Drive — Tires Smoking at 2 AM',
    playGuide: {
      hinglish: '10 second hain — Zoya ki drift car mein koodoge 🏎️ ya syndicate ka saamna karoge? 🚨',
      hindi: 'दस सेकंड हैं — ज़ोया की गाड़ी में बैठोगे 🏎️ या सिंडिकेट से टकराओगे? 🚨',
      english: 'Ten seconds before the blockade closes — jump in with Zoya 🏎️ or bluff Shetty? 🚨',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Baarish se bheegi Marine Drive par kaali coupe 180° drift maarkar tumhare saamne rukti hai. Darwaza khulta hai aur Zoya muskurakar seat ki taraf ishara karti hai, tabhi car ke radio par Vikrant ki thandi aawaz goonjti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Zoya Fernandes',
          text: 'Miss me, partner? Passenger seat khali hai aur mere paas Shetty ke dockyard ka poora black ledger hai. 10 second hain—ander baitho ya akela bhaago!',
        },
        {
          type: 'dialogue',
          speakerName: 'Vikrant Shetty',
          text: '*(Radio par)* Zoya, Bandra Sea Link seal ho chuka hai. Drive waapas rakh kar gaadi chhod do... warna aaj raat samundar mein sirf tumhara bumper milega.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'बारिश से भीगी मरीन ड्राइव पर काली स्पोर्ट्स कार फिसलती हुई तुम्हारे सामने आकर रुकती है। दरवाज़ा खुलता है और ज़ोया मुस्कुराकर अंदर आने का इशारा करती है, तभी रेडियो पर विक्रांत की ठंडी आवाज़ गूँजती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Zoya Fernandes',
          text: 'मुझे याद किया, पार्टनर? मेरे पास शेट्टी के सिंडिकेट की पूरी गुप्त फाइल है। दस सेकंड हैं—गाड़ी में बैठो या यहीं रह जाओ!',
        },
        {
          type: 'dialogue',
          speakerName: 'Vikrant Shetty',
          text: '*(रेडियो पर)* ज़ोया, हर रास्ता बंद हो चुका है। ड्राइव वापस दे दो, वरना आज रात मुंबई की सड़कें तुम्हारा आख़िरी सफर बनेंगी।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Red taillights streak across rain-slick Marine Drive as a matte-black coupe whips into a tight drift right beside you. Zoya kicks open the door while Vikrant’s voice crackles over the scanner.',
        },
        {
          type: 'dialogue',
          speakerName: 'Zoya Fernandes',
          text: 'Miss the rush, navigator? I’ve got Shetty’s encrypted ledger in the glovebox and six SUVs on my tail. Hop in—now!',
        },
        {
          type: 'dialogue',
          speakerName: 'Vikrant Shetty',
          text: '*(Over radio)* Sea Link is blocked, Zoya. Hand over the drive, or neither of you sees sunrise.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Gaadi mein kood jao aur Zoya ko Worli ke secret tunnel route ki taraf guide karo',
        'Radio mic utha kar Vikrant Shetty ko seedha bluff call do',
      ],
      hindi: [
        'गाड़ी में बैठकर ज़ोया को वर्ली की गुप्त सुरंग वाले रास्ते की ओर मोड़ने को कहो',
        'रेडियो माइक उठाकर विक्रांत शेट्टी को चकमा देने की चाल चलो',
      ],
      english: [
        'Jump in and call out a shortcut through the old Worli dock tunnels',
        'Grab the radio mic and bluff Vikrant while Zoya hits the throttle',
      ],
    },
    possibleEndings: [
      'Broke the Blockade & Exposed the Syndicate',
      'Vanished Across the Sea Link Before Dawn',
    ],
  },
  {
    id: 'room_404_blood_pact',
    title: 'Room 404: Midnight Blood Pact',
    tagline: 'Pahadon ke purane hostel mein raat 12 baje ke baad kamra #404 ki asliyat khulti hai...',
    about:
      'Assigned to the misty North Wing of St. Jude’s Hill University, you notice your quiet, enigmatic roommate Alina D’Souza never sleeps, vanishes past midnight, and leaves frost on every windowpane. When rogue occult hunter Aryan Sen corners you with silver stakes, you must decide whether Alina is a predator—or the only guardian keeping something far darker locked behind Door 404.',
    primaryCategory: 'Supernatural',
    categories: ['For You', 'New', 'By Fans', 'Supernatural', 'Horror', 'College', 'Romance'],
    tags: ['Roleplay', 'Supernatural', 'Gothic Mystery'],
    visualStyle: 'Dark Gothic Realism',
    rating: 4.9,
    chatCountLabel: '118.5K',
    chatCountNumeric: 118500,
    rank: 6,
    isNew: true,
    isByFans: true,
    coverImage: '/src/assets/images/cover_room_404_1795504261141.jpg',
    mediaGallery: [
      {
        id: 'r404_1',
        url: '/src/assets/images/cover_room_404_1795504261141.jpg',
        caption: 'Pahadon ke purane hostel mein raat 12 baje ke baad Room 404 ka dark secret jaag uthta hai...',
      },
      {
        id: 'r404_2',
        url: '/src/assets/images/alina_hostel_portrait_1795873529315.jpg',
        caption: 'Sunahri aankhon wali roommate Alina D’Souza insaan nahi hai — par kya wo tumhari dushman hai ya rakshak?',
      },
      {
        id: 'r404_3',
        url: '/src/assets/images/aryan_hunter_portrait_1795516146597.jpg',
        caption: 'Occult hunter Aryan Sen silver dagger lekar upar aa raha hai! Tum kiska saath doge?',
      },
    ],
    setting: 'Foggy Victorian hill-station college hostel corridor lit by a flickering oil lamp',
    characters: [
      {
        id: 'alina_dsouza',
        name: "Alina D'Souza",
        age: '20',
        role: 'Nocturnal Roommate & Ancient Bloodline',
        personality: 'Aloof, hauntingly gentle, cursed with immortal hunger yet desperate not to hurt you.',
        speakingStyle: 'Soft, poetic, eerily calm whispers.',
        relationshipToUser: 'Your mysterious supernatural roommate',
        portrait: '/src/assets/images/alina_hostel_portrait_1795873529315.jpg',
      },
      {
        id: 'aryan_sen',
        name: 'Aryan Sen',
        age: '23',
        role: 'Occult Order Hunter',
        personality: 'Intense, scarred, believes every supernatural creature in the hostel must be purged.',
        speakingStyle: 'Urgent, sharp warnings.',
        relationshipToUser: 'Hunter tracking Alina',
        portrait: '/src/assets/images/aryan_hunter_portrait_1795516146597.jpg',
      },
      {
        id: 'warden_kulkarni',
        name: 'Warden Kulkarni',
        age: '57',
        role: 'Hostel Night Superintendent',
        personality: 'Gruff, refuses to explain why Room 404 was bricked up twenty years ago.',
        speakingStyle: 'Muttered warnings with rattling keys.',
        relationshipToUser: 'Hides the truth of the hostel’s crimson pact',
        portrait: '/portraits/warden_kulkarni.svg',
        accentColor: '#DC2626',
      },
    ],
    relationshipMeters: [
      { id: 'bond', label: 'Blood Bond', emoji: '🩸', initialValue: 32, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Alina Trust', emoji: '🕯️', initialValue: 40, min: 0, max: 100, tone: 'trust' },
      { id: 'danger', label: 'Hunter Threat', emoji: '🐺', initialValue: 64, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'North Wing Corridor — Midnight Red Glass',
    playGuide: {
      hinglish: 'Room 404 ka raaz khul raha hai — Alina ko bachaoge 🩸 ya hunter ka saath doge? 🐺',
      hindi: 'कमरा 404 का राज़ खुल रहा है — अलीना को बचाओगे 🩸 या शिकारी का साथ दोगे? 🐺',
      english: 'Midnight strikes outside Room 404 — shield Alina 🩸 or trust the hunter? 🐺',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Hostel ke sunsaan corridor mein kohra chhaya hai. Laal stained-glass khidki ke neeche Alina khadi hai—uski aankhein andhere mein halki sunahri chamak rahi hain. Peeche seedhiyon se Aryan silver dagger nikal kar upar aata dikhta hai.',
        },
        {
          type: 'dialogue',
          speakerName: "Alina D'Souza",
          text: 'Tumhe is waqt kamre ke bahar nahi aana chahiye tha. Agar Aryan ne mujhe tumhare saath dekh liya, to wo sochega maine tumhe kaat liya hai... jaldi bolo, kya tum mujhse darte ho?',
        },
        {
          type: 'dialogue',
          speakerName: 'Aryan Sen',
          text: 'Kamra 404 se peeche hato! Wo ladki insaan nahi hai—aaj grahan ki raat uska shikaar shuru hone wala hai!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'हॉस्टल के सुनसान गलियारे में कोहरा फैला है। लाल काँच की खिड़की के नीचे अलीना खड़ी है—उसकी आँखें अंधेरे में हल्की सुनहरी चमक रही हैं। तभी सीढ़ियों से आर्यन चाँदी का खंजर लिए ऊपर आता दिखता है।',
        },
        {
          type: 'dialogue',
          speakerName: "Alina D'Souza",
          text: 'तुम्हें इस वक्त कमरे से बाहर नहीं आना चाहिए था। अगर आर्यन ने तुम्हें मेरे पास देख लिया तो अनर्थ हो जाएगा... सच बताओ, क्या तुम्हें मुझसे डर लग रहा है?',
        },
        {
          type: 'dialogue',
          speakerName: 'Aryan Sen',
          text: 'कमरा 404 से दूर हट जाओ! वह इंसान नहीं है—आज रात उसका श्राप फिर से जागने वाला है!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Mist curls along the creaking timber floorboards of North Wing. Beneath crimson moonlight, Alina’s amber eyes glow softly as Aryan climbs the staircase clutching a silver blade.',
        },
        {
          type: 'dialogue',
          speakerName: "Alina D'Souza",
          text: 'You shouldn’t have come out after midnight. If Aryan sees you near me, he won’t hesitate. Tell me quickly—are you afraid of what I am?',
        },
        {
          type: 'dialogue',
          speakerName: 'Aryan Sen',
          text: 'Step away from Room 404! She isn’t human—and the blood moon rises in ten minutes!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Alina ke saamne khade ho jao aur Aryan ko roko',
        'Aryan se poochho ki Room 404 ke peeche kaunsa purana raaz chhipa hai',
      ],
      hindi: [
        'अलीना के सामने ढाल बनकर खड़े हो जाओ और आर्यन को रोको',
        'आर्यन से पूछो कि कमरा 404 के पीछे कौन-सा पुराना रहस्य छिपा है',
      ],
      english: [
        'Step between them and protect Alina until she explains the truth',
        'Demand Aryan show you the ancient seal hidden inside Room 404',
      ],
    },
    possibleEndings: [
      'Sealed the Dark Crypt & Forged an Eternal Pact',
      'Broke the Bloodline Curse Before Sunrise',
    ],
  },
  {
    id: 'coaching_wala_pyar',
    title: 'Coaching Wala Pyar ❤️',
    tagline: 'Lucknow ki coaching mein khamosh ladki ki bagal wali seat paane ki ek meethi koshish.',
    about:
      'Hazratganj, Lucknow ke ek bustling coaching institute mein naye admission ke baad tumhari nazar humesha aakhiri bench par baithne wali khamosh ladki Priya par jaati hai. Safed chikankari suit, kaan ke peeche neela pen, aur haath mein hari diary — Priya shy aur introverted hai par tumhe dekh kar halke se sharma jaati hai. Bagal mein baithne ki koshish, notes exchange, baarish mein kulhad chai, aur classmate Kabir ki mazedaar jealous nok-jhok ke beech kya tum Priya ke dil ki bagal wali seat jeet paoge? Poori tarah tumhari marzi aur dialogues par chalne wali ek meethi romantic kahani.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Top 50', 'Romance', 'College', 'Drama'],
    tags: ['Roleplay', 'Romance', 'Hinglish'],
    visualStyle: 'Realistic Lucknow Campus DSLR',
    rating: 5.0,
    chatCountLabel: '65.4K',
    chatCountNumeric: 65400,
    rank: 2,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_coaching_wala_pyar_1795616638635.jpg',
    bannerImage: '/src/assets/images/scene_coaching_desk_romance_1795616642357.jpg',
    mediaGallery: [
      {
        id: 'cwp_1',
        url: '/src/assets/images/cover_coaching_wala_pyar_1795616638635.jpg',
        caption: 'Coaching classes ke corridor mein pehli nazar aur Lucknow ki ek meethi romantic shuruat.',
      },
      {
        id: 'cwp_2',
        url: '/src/assets/images/scene_coaching_desk_romance_1795616642357.jpg',
        caption: 'Bagal wali wooden desk par baith kar notes aur chhupi muskaan share karne ke pal.',
      },
      {
        id: 'cwp_3',
        url: '/src/assets/images/priya_coaching_portrait_1795616640809.jpg',
        caption: 'Safed chikankari suit aur hari diary wali Priya — khamosh zaroor hai, par aankhein sab keh deti hain.',
      },
      {
        id: 'cwp_4',
        url: '/src/assets/images/scene_lucknow_rain_chai_1795616644370.jpg',
        caption: 'Lucknow ki shaam wali baarish mein coaching gate ke bahar ek chhatri aur kulhad chai.',
      },
      {
        id: 'cwp_5',
        url: '/src/assets/images/kabir_coaching_portrait_1795616640551.jpg',
        caption: 'Classmate Kabir bhi Priya ko pasand karta hai — uski halki jealousy har break mein mazedaar twist laati hai!',
      },
    ],
    setting: 'Hazratganj Coaching Institute classroom, Lucknow, afternoon chai break under a creaking ceiling fan',
    characters: [
      {
        id: 'priya',
        name: 'Priya',
        age: '19',
        role: 'Shy Bookish Classmate',
        personality:
          'Beautiful, sweet, shy, and introverted college-going girl in a simple white Lucknowi suit. Loves reading novels and writing quiet thoughts in her green diary; gets flustered and lowers her gaze whenever the Male Lead looks closely at her, slowly falling for his warmth.',
        speakingStyle:
          'Soft, polite, slightly hesitant Hindi/Hinglish with sweet pauses, shy smiles, and gentle Lucknowi tehzeeb.',
        relationshipToUser: 'Shy coaching classmate secretly warming up to you',
        portrait: '/src/assets/images/priya_coaching_portrait_1795616640809.jpg',
        accentColor: '#F43F5E',
      },
      {
        id: 'kabir',
        name: 'Kabir',
        age: '20',
        role: 'Playfully Jealous Classmate',
        personality:
          'Charming yet lightly insecure batchmate who also likes Priya. Tries funny excuses, saves seats awkwardly, or boasts about mock-test ranks to steal attention—never an unrealistic villain, always light-hearted romantic rivalry.',
        speakingStyle:
          'Dramatic, teasing, competitive Hinglish banter trying to stay cool in front of Priya.',
        relationshipToUser: 'Friendly rival competing for Priya’s attention and the seat beside her',
        portrait: '/src/assets/images/kabir_coaching_portrait_1795616640551.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'neha_coaching',
        name: 'Neha',
        age: '19',
        role: "Priya's Best Friend",
        personality: 'Cheerful, observant, secretly ships Priya with you and nudges shy moments along during chai breaks.',
        speakingStyle: 'Teasing, warm Lucknowi Hinglish.',
        relationshipToUser: 'Friendly classmate rooting for you and Priya',
        portrait: '/src/assets/images/neha_coaching_portrait_1795873865008.jpg',
        accentColor: '#EC4899',
      },
      {
        id: 'verma_sir_coaching',
        name: 'Verma Sir',
        age: '44',
        role: 'Coaching Institute Faculty',
        personality: 'Strict yet caring teacher who assigns paired mock-test study groups.',
        speakingStyle: 'Energetic chalk-and-duster mentor tone.',
        relationshipToUser: 'Mentor whose surprise tests keep bringing you beside Priya',
        portrait: '/portraits/verma_sir_coaching.svg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Priya Love', emoji: '❤️', initialValue: 22, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Comfort & Trust', emoji: '🤝', initialValue: 35, min: 0, max: 100, tone: 'trust' },
      { id: 'jealousy', label: 'Kabir Jealousy', emoji: '😅', initialValue: 48, min: 0, max: 100, tone: 'jealousy' },
    ],
    openingScene: 'Hazratganj Coaching Hall, Lucknow — Chai Break Silence',
    playGuide: {
      hinglish:
        'Priya ko khush rakho, usse pyaar badhao ❤️ Kabir ko neecha mat dikhana — kya tum bagal wali seat aur uska dil jeet paoge? 😊',
      hindi:
        'प्रिया को खुश रखो, उससे प्यार बढ़ाओ ❤️ कबीर को नीचा मत दिखाना — क्या तुम बगल वाली सीट और उसका दिल जीत पाओगे? 😊',
      english:
        'Make shy Priya smile and grow closer ❤️ Handle Kabir’s playful jealousy with grace — can you win the seat beside her? 😊',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Coaching ka fan har round par ajeeb si awaaz karta hai. Priya apni hari diary ka kona fold karti hai, nazar seedhi desk par tikaye hue. Kaan ke peeche atka neela pen thoda hilta hai jab woh aage jhukti hai. Pura batch bahar chai peene gaya hai, par woh yahin ruki hai.',
        },
        {
          type: 'narration',
          text: 'Jaise hi tum saamne wali desk ke paas rukte ho, Priya ki ungliyan diary ke panne par thehar jaati hain. Woh achanak sar uthati hai, halki si ghabrahat ke saath, par nazar milte hi wapas palkein jhuka leti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Priya',
          text: 'Aap... wahan baithne wale hain? Kabir keh raha tha woh jagah uski hai, lekin... mujhe lagta hai woh jhooth bol raha tha.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'कोचिंग का पंखा हर चक्कर पर अजीब सी आवाज़ करता है। प्रिया अपनी हरी डायरी का कोना मोड़ती है, नज़र सीधी डेस्क पर टिकाए हुए। कान के पीछे अटका नीला पेन थोड़ा हिलता है जब वह आगे झुकती है। पूरा बैच बाहर चाय पीने गया है, पर वह यहीं रुकी है।',
        },
        {
          type: 'narration',
          text: 'जैसे ही तुम सामने वाली डेस्क के पास रुकते हो, प्रिया की उंगलियाँ डायरी के पन्ने पर ठहर जाती हैं। वह अचानक सिर उठाती है, हल्की सी घबराहट के साथ, पर नज़र मिलते ही वापस पलकें झुका लेती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Priya',
          text: 'आप... वहाँ बैठने वाले हैं? कबीर कह रहा था वह जगह उसकी है, लेकिन... मुझे लगता है वह झूठ बोल रहा था।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'The coaching room ceiling fan clicks softly with every slow turn. Priya folds the corner of her green diary, eyes fixed neatly on the wooden desk as the blue pen tucked behind her ear shifts slightly. The entire batch has stepped outside for chai, yet she stayed behind.',
        },
        {
          type: 'narration',
          text: 'The moment you pause beside the front desk, Priya’s fingers freeze against the page. She looks up abruptly with a shy flutter, only to lower her lashes the instant your eyes meet.',
        },
        {
          type: 'dialogue',
          speakerName: 'Priya',
          text: 'Are you... going to sit there? Kabir claimed that seat was his, though... I have a feeling he was making that up.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Halki muskaan ke saath bagal wali seat par baith jao aur poochho ki kya chai laaun?',
        'Mazak mein kaho: "Kabir se keh dunga aaj se yeh seat reserved hai — sirf notes share karne ke liye."',
        'Uske kaan ke peeche atke neele pen ki taraf dekh kar softly poochho ki diary mein kya likh rahi ho?',
      ],
      hindi: [
        'हल्की मुस्कान के साथ बगल वाली सीट पर बैठ जाओ और पूछो कि क्या चाय लाऊँ?',
        'मज़ाक में कहो: "कबीर से कह दूँगा आज से यह सीट रिज़र्व है — सिर्फ़ नोट्स शेयर करने के लिए।"',
        'उसके कान के पीछे अटके नीले पेन को देखकर प्यार से पूछो कि डायरी में क्या लिख रही हो?',
      ],
      english: [
        'Smile warmly, take the empty seat beside her, and offer to bring her a cup of chai.',
        'Tease gently: "I will tell Kabir this seat is officially reserved for sharing notes today."',
        'Notice the blue pen behind her ear and softly ask what she has been writing in her green diary.',
      ],
    },
    possibleEndings: [
      'Bagal Wali Seat se Dil Tak — Lucknow Rain Confession',
      'Birthday Surprise on the Coaching Terrace',
    ],
  },
  ...EXTRA_STORIES_CATALOG,
];
