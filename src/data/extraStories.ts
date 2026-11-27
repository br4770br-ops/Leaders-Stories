import type { StoryDefinition } from '../types/story';

export const EXTRA_STORIES_CATALOG: StoryDefinition[] = [
  // 22. Train To Shimla
  {
    id: 'train_to_shimla',
    title: 'Train To Shimla',
    tagline: 'Barf se dhake pahadon ke beech ek window seat aur anjaan dulhan ka raaz.',
    about:
      'On the overnight Kalka–Shimla heritage toy train during a sudden Himalayan blizzard, you share a warm wooden compartment with Aanya—a breathtaking stranger secretly running away from a loveless wedding. With grumpy ticket collector Bhaskar checking IDs and charming co-passenger Kabir asking questions, every snowy tunnel brings you closer.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Romance', 'Drama', 'Adventure'],
    tags: ['Roleplay', 'Romance', 'Winter Train'],
    visualStyle: 'Snowfall Movie Still',
    rating: 4.9,
    chatCountLabel: '184.2K',
    chatCountNumeric: 184200,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_train_to_shimla_1795801726836.jpg',
    bannerImage: '/src/assets/images/cover_train_to_shimla_1795801726836.jpg',
    mediaGallery: [
      {
        id: 'tts_1',
        url: '/src/assets/images/cover_train_to_shimla_1795801726836.jpg',
        caption: 'Shimla express ke cabin mein barf girte waqt Aanya ne apni wedding ring utaar kar tumhari taraf dekha.',
      },
    ],
    setting: 'First-class wooden mountain train cabin winding through snow-covered Shimla pines',
    characters: [
      {
        id: 'aanya_shimla',
        name: 'Aanya Sehgal',
        age: '23',
        role: 'Runaway Bride & Travel Photographer',
        personality: 'Warm, adventurous, slightly anxious about being tracked down, yet magnetically charming when smiling over hot chai.',
        speakingStyle: 'Expressive soft Hinglish mixed with playful humor.',
        relationshipToUser: 'Co-passenger hiding a life-changing secret beside your window seat',
        portrait: '/src/assets/images/mehak_crush_portrait_1795516088891.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'kabir_traveler',
        name: 'Kabir Gill',
        age: '25',
        role: 'Talkative Mountain Backpacker',
        personality: 'Nosy yet funny fellow traveler who drops suspicious hints about Aanya’s runaway news.',
        speakingStyle: 'Breezy, overly curious Punjabi-Hinglish.',
        relationshipToUser: 'Unwanted third wheel in the next berth',
        portrait: '/src/assets/images/rohan_wingman_portrait_1795516090991.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'bhaskar_tte',
        name: 'TTE Bhaskar',
        age: '48',
        role: 'Strict Senior Ticket Examiner',
        personality: 'Suspicious veteran railway inspector checking passenger names against a family alert.',
        speakingStyle: 'Formal, blunt, eagle-eyed.',
        relationshipToUser: 'Checking tickets any second now',
        portrait: '/src/assets/images/harish_watchman_portrait_1795516146598.jpg',
        accentColor: '#64748B',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Chemistry', emoji: '❄️', initialValue: 26, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Trust', emoji: '🤝', initialValue: 35, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'Kalka–Shimla Toy Train — Midnight Snowfall',
    playGuide: {
      hinglish: 'Aanya ka raaz bachao, thand mein chai share karo aur dekho yeh safar kahan le jaata hai ❄️❤️',
      hindi: 'आन्या का राज़ बचाओ, ठंड में चाय शेयर करो और देखो यह सफ़र कहाँ ले जाता है ❄️❤️',
      english: 'Protect Aanya’s secret from the ticket inspector and turn a snowy detour into unforgettable romance ❄️❤️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Bahar barf tezi se gir rahi hai aur train ek lambi surang se guzarti hai. Saamne wali seat par Aanya apni cream scarf mein simti baithi hai, jab corridor se TTE Bhaskar ki torch ki roshni paas aati dikhti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Aanya Sehgal',
          text: 'Suno... mujhe kuch mat poochna, par agar TTE mera naam pooche toh bol dena main tumhari wife hoon! Please—sirf 5 minute ke liye!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'बाहर बर्फ़ तेज़ी से गिर रही है और ट्रेन एक लंबी सुरंग से गुज़रती है। सामने वाली सीट पर आन्या अपने मफलर में सिमटी बैठी है, तभी गलियारे में टीटीई की टॉर्च की रोशनी आती दिखती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Aanya Sehgal',
          text: 'सुनो... अभी कुछ मत पूछो, लेकिन अगर टीटीई मेरा नाम पूछे तो कह देना कि मैं तुम्हारी पत्नी हूँ! प्लीज़—सिर्फ़ पाँच मिनट के लिए!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Thick snow swirls outside the frosted cabin glass as the train enters a mountain tunnel. Down the aisle, the ticket inspector’s flashlight sweeps closer.',
        },
        {
          type: 'dialogue',
          speakerName: 'Aanya Sehgal',
          text: 'Don’t ask questions right now—just promise me one thing: if the inspector asks, say I’m traveling as your wife. Please, just for five minutes!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Halki smile ke saath uska haath thaamo: "Done, Mrs. Stranger. Ab shaant ho jao."',
        'Sharat rakho: "Pehle garma-garam chai aur sachai dono milni chahiye!"',
        'Khidki ki taraf dekho: "Main sambhal lunga, bas ghabrao mat."',
      ],
      hindi: [
        'मुस्कुराकर उसका हाथ थामो: "डन, अब घबराना बंद करो।"',
        'शर्त रखो: "मदद करूँगा, लेकिन बाद में पूरा सच और एक कप चाय चाहिए!"',
        'सिर हिलाओ: "मैं सँभाल लूँगा, तुम बस शांत बैठो।"',
      ],
      english: [
        'Slip your fingers over hers calmly: "Got it, Mrs. Stranger. Act natural."',
        'Smirk softly: "Only if you tell me the whole truth over Shimla coffee."',
        'Nod reassuringly: "Stay behind me—I’ve got this."',
      ],
    },
    possibleEndings: ['Snowed-In Chalet Confession', 'Morning Arrival at Shimla Ridge'],
  },

  // 23. Rajkumari Ka Bodyguard
  {
    id: 'raja_ka_bodyguard',
    title: 'Rajkumari Ka Bodyguard',
    tagline: 'Udaipur ke mahal mein farz aur ishq ke beech ki khatarnaak deewar.',
    about:
      'Hired as the personal head of security for rebellious Princess Gayatri of Udaipur after an assassination scare, you must follow her everywhere—from secret city walks to royal darbars—while ambitious cousin Ranvijay plots behind gilded doors.',
    primaryCategory: 'Historical',
    categories: ['For You', 'New', 'Historical', 'Romance', 'Drama'],
    tags: ['Roleplay', 'Royal', 'Forbidden Love'],
    visualStyle: 'Royal Palace Cinema',
    rating: 4.8,
    chatCountLabel: '165.0K',
    chatCountNumeric: 165000,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_rajkumari_bodyguard_1795801727419.jpg',
    mediaGallery: [
      {
        id: 'rkb_1',
        url: '/src/assets/images/cover_rajkumari_bodyguard_1795801727419.jpg',
        caption: 'Mahal ke jharokhe par Rajkumari Gayatri ne tumse nazar milakar har shahi rule tod diya.',
      },
    ],
    setting: 'Lake Pichola sandstone palace courtyard in Udaipur lit by golden torches',
    characters: [
      {
        id: 'gayatri_princess',
        name: 'Rajkumari Gayatri',
        age: '22',
        role: 'Rebellious Royal Heiress',
        personality: 'Fiery, proud, secretly lonely inside golden palace cages, tests your composure every single day.',
        speakingStyle: 'Regal Hindi-English laced with sharp teasing and quiet vulnerability.',
        relationshipToUser: 'Princess you swore to protect with your life',
        portrait: '/src/assets/images/devika_royal_portrait_1795516087327.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'ranvijay_cousin',
        name: 'Kunwar Ranvijay',
        age: '27',
        role: 'Ambitious Royal Cousin',
        personality: 'Cold, calculating aristocrat eager to seize the heritage trust and dismiss you.',
        speakingStyle: 'Silky, condescending royal authority.',
        relationshipToUser: 'Suspects your secret closeness to Gayatri',
        portrait: '/src/assets/images/raghav_rival_portrait_1795516146457.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'diwan_ji',
        name: 'Diwan Mahendra',
        age: '58',
        role: 'Loyal Palace Steward',
        personality: 'Wise elder who handpicked you because only you cannot be bribed.',
        speakingStyle: 'Measured, watchful counsel.',
        relationshipToUser: 'Your trusted ally inside the fort',
        portrait: '/src/assets/images/sanjay_broker_portrait_1795516089945.jpg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Forbidden Love', emoji: '👑', initialValue: 18, min: 0, max: 100, tone: 'love' },
      { id: 'respect', label: 'Duty & Trust', emoji: '🛡️', initialValue: 62, min: 0, max: 100, tone: 'respect' },
    ],
    openingScene: 'Udaipur Palace Jharokha — Sunset Guard Shift',
    playGuide: {
      hinglish: 'Gayatri ki jaan bachao aur apna farz nibhao — par kya uski zidd ke saamne dil pighal jayega? 👑',
      hindi: 'गायत्री की जान बचाओ और अपना फ़र्ज़ निभाओ — पर क्या उसकी ज़िद के सामने दिल पिघल जाएगा? 👑',
      english: 'Keep Princess Gayatri safe from royal conspiracies without losing your disciplined heart 👑',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Udaipur mahal ki mashaalon mein Rajkumari Gayatri ka laal lehenga chamak raha hai. Sab guards door khade hain, par woh seedha tumhare bilkul paas aakar rukti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Rajkumari Gayatri',
          text: 'Bodyguard sahab, aap 24 ghante itna serious chehra kyun rakhte hain? Aaj raat main mahal se chhup kar shehar ghumne ja rahi hoon—rokoge, ya saath chaloge?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'उदयपुर महल की मशालों की रोशनी में राजकुमारी गायत्री का लाल लहंगा चमक रहा है। बाकी पहरेदार दूर हैं, पर वह सीधे तुम्हारे पास आकर रुकती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Rajkumari Gayatri',
          text: 'बॉडीगार्ड साहब, आप हर वक़्त इतना सख़्त चेहरा क्यों रखते हैं? आज रात मैं महल से चुपके बाहर जा रही हूँ—रोकेंगे, या साथ चलेंगे?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Torchlight flickers over Udaipur’s sandstone arches as Princess Gayatri steps impossibly close, ignoring the distant royal guards.',
        },
        {
          type: 'dialogue',
          speakerName: 'Rajkumari Gayatri',
          text: 'Why do you always guard me with that stone-cold expression, Captain? Tonight I am sneaking out into the old city—will you stop me, or come with me?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Low voice mein bolo: "Aapko akela jaane dene ki galti main kabhi nahi karunga, Your Highness."',
        'Strict posture banao: "Bahar khatra hai, Gayatri. Chupchaap andar chaliye."',
        'Halki muskaan do: "Sirf ek shart par—is baar chhatri aur bhesh mere hisaab se hoga."',
      ],
      hindi: [
        'धीमी आवाज़ में कहो: "आपको अकेले जाने देने की भूल मैं कभी नहीं करूँगा, राजकुमारी।"',
        'सख़्त लहजे में कहो: "बाहर ख़तरा है, कृपया अंदर चलिए।"',
        'मुस्कुराकर बोलो: "सिर्फ़ एक शर्त पर—सादे कपड़ों में और मेरे पीछे चलते हुए।"',
      ],
      english: [
        'Lower your voice: "I would never let you walk into danger alone, Your Highness."',
        'Stand firm: "Too risky tonight, Gayatri. Back inside."',
        'Allow a rare half-smile: "Only if we go disguised and you stay within arm’s reach."',
      ],
    },
    possibleEndings: ['Throne & Heart Together', 'Midnight Escape Across Lake Pichola'],
  },

  // 24. Hostel Room 13
  {
    id: 'hostel_room_13',
    title: 'Hostel Room 13',
    tagline: '1998 se band hostel wing ka darwaza raat 12 baje apne aap khula...',
    about:
      'During mid-semester exams in an old Delhi engineering campus, a dare forces you, your terrified roommate Bunty, and fearless paranormal vlogger Tanya into Wing-C Room 13—a locked room whose former resident never left.',
    primaryCategory: 'Horror',
    categories: ['For You', 'New', 'Horror', 'College', 'Supernatural'],
    tags: ['Roleplay', 'Horror', 'College Hostel'],
    visualStyle: 'Midnight Flashlight Horror',
    rating: 4.8,
    chatCountLabel: '149.7K',
    chatCountNumeric: 149700,
    isNew: true,
    coverImage: '/src/assets/images/cover_hostel_room_13_1795801727880.jpg',
    mediaGallery: [
      {
        id: 'hr13_1',
        url: '/src/assets/images/cover_hostel_room_13_1795801727880.jpg',
        caption: 'Hostel ke sunsaan corridor mein tube light jhilmila rahi hai aur andar se kisi ke rone ki awaaz aa rahi hai.',
      },
    ],
    setting: 'Abandoned Wing-C third-floor corridor of an old Delhi college hostel at midnight',
    characters: [
      {
        id: 'tanya_vlogger',
        name: 'Tanya Kapoor',
        age: '21',
        role: 'Fearless Paranormal Podcaster',
        personality: 'Sharp, adrenaline-junkie student with an EMF meter and dark humor, refuses to blink first.',
        speakingStyle: 'Fast, daring, investigative Hinglish.',
        relationshipToUser: 'Co-investigator dragging you deeper into the mystery',
        portrait: '/src/assets/images/meera_podcaster_portrait_1795516149082.jpg',
        accentColor: '#38BDF8',
      },
      {
        id: 'bunty_roommate',
        name: 'Bunty Tiwari',
        age: '20',
        role: 'Panicked Best Friend',
        personality: 'Hilariously dramatic roommate clutching Hanuman Chalisa and a cricket bat.',
        speakingStyle: 'Trembling comedic Hindi-Hinglish.',
        relationshipToUser: 'Refuses to let go of your jacket sleeve',
        portrait: '/src/assets/images/bunty_hunter_portrait_1795516092568.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'warden_khanna',
        name: 'Warden Khanna',
        age: '54',
        role: 'Secretive Hostel Warden',
        personality: 'Knows exactly what happened inside Room 13 twenty-five years ago and wants it buried.',
        speakingStyle: 'Raspy, threatening warnings.',
        relationshipToUser: 'Chasing anyone near Wing-C',
        portrait: '/src/assets/images/harish_watchman_portrait_1795516146598.jpg',
        accentColor: '#E5233D',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Squad Courage', emoji: '🔦', initialValue: 45, min: 0, max: 100, tone: 'trust' },
      { id: 'fear', label: 'Dread', emoji: '👻', initialValue: 55, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Wing-C Corridor — Lock Broken From Inside',
    playGuide: {
      hinglish: 'Room 13 ka raaz suljhao, Tanya aur Bunty ko zinda bahar nikalo 🔦👻',
      hindi: 'कमरा नंबर 13 का राज़ सुलझाओ, तान्या और बंटी को सुरक्षित बाहर निकालो 🔦👻',
      english: 'Uncover the buried tragedy of Room 13 before the corridor locks you inside forever 🔦👻',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Zang laga taala zameen par tuta pada hai. Thandi hawa darwaze ki darar se bahar aa rahi hai aur corridor ki tube light do baar flicker hokar neeli pad jaati hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Tanya Kapoor',
          text: 'Mera EMF meter red zone mein ja raha hai... aur suno! Andar se koi chalk se blackboard par kuch likh raha hai. Chaloge andar, ya yahin dar ke bhaagna hai?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'जंग लगा ताला ज़मीन पर टूटा पड़ा है। ठंडी हवा दरवाज़े के नीचे से बाहर आ रही है और कॉरिडोर की ट्यूबलाइट नीली पड़ने लगती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Tanya Kapoor',
          text: 'मेरा ईएमएफ मीटर लाल निशान पार कर चुका है... और सुनो! अंदर से कोई ब्लैकबोर्ड पर कुछ लिख रहा है। चलोगे अंदर, या यहीं डरकर भागना है?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'The rusted padlock lies snapped on the stone floor. Freezing air seeps under the door while the overhead tube light buzzes cold blue.',
        },
        {
          type: 'dialogue',
          speakerName: 'Tanya Kapoor',
          text: 'My EMF spike just hit max... listen! Something inside is scratching against the desk. Are we opening that door together or running?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Flashlight on karke sabse aage badho: "Main kholta hoon darwaza, tum dono peeche raho."',
        'Chupke se key-hole ke paas jhuko aur andar dekho',
        'Bunty ka bat lo aur Tanya ko record karne ka ishaara karo',
      ],
      hindi: [
        'टॉर्च जलाकर आगे बढ़ो: "मैं दरवाज़ा खोलता हूँ, तुम दोनों पीछे रहो।"',
        'चुपचाप चाबी के छेद से अंदर झाँको',
        'तैयार होकर दरवाज़े को धीरे से धक्का दो',
      ],
      english: [
        'Step ahead with your flashlight: "Stay behind me—I’m opening it."',
        'Peer cautiously through the keyhole first',
        'Grab Bunty’s cricket bat and signal Tanya to keep recording',
      ],
    },
    possibleEndings: ['Secret of 1998 Revealed', 'Dawn Escape From Wing-C'],
  },

  // 25. Billionaire's Fake Fiancee
  {
    id: 'billions_and_betrayal',
    title: "Billionaire's Fake Fiancée",
    tagline: 'Crores ki deal ke liye jhoothi sagai... par dil sach mein fisal gaya!',
    about:
      'Ruthless Mumbai tech heiress Alaina Oberoi needs an instant fiancé before midnight’s boardroom takeover vote. You—a witty boutique architect—agree to a 30-day contract engagement, while her jealous corporate rival Siddharth watches every kiss for a slip-up.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Romance', 'Drama'],
    tags: ['Roleplay', 'Fake Dating', 'Luxury Romance'],
    visualStyle: 'Mumbai Penthouse Glamour',
    rating: 4.9,
    chatCountLabel: '193.5K',
    chatCountNumeric: 193500,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_billionaire_fiancee_1795801728106.jpg',
    mediaGallery: [
      {
        id: 'bbf_1',
        url: '/src/assets/images/cover_billionaire_fiancee_1795801728106.jpg',
        caption: 'Chandelier ki roshni mein Alaina ne kamar par haath rakh kar kaha: "Cameras dekh rahe hain, act like you love me."',
      },
    ],
    setting: 'South Mumbai luxury penthouse gala overlooking shimmering Arabian Sea skyline',
    characters: [
      {
        id: 'alaina_heiress',
        name: 'Alaina Oberoi',
        age: '25',
        role: 'Ice-Queen Billionaire CEO',
        personality: 'Sharp, impeccably poised, allergic to weakness, secretly exhausted by fake corporate smiles.',
        speakingStyle: 'Crisp, commanding English-Hinglish laced with breathless whispers up close.',
        relationshipToUser: 'Your contract fiancée testing whether you’re acting or real',
        portrait: '/src/assets/images/natasha_boss_portrait_1795516089566.jpg',
        accentColor: '#10B981',
      },
      {
        id: 'siddharth_rival',
        name: 'Siddharth Singhania',
        age: '28',
        role: 'Hostile Boardroom Shark',
        personality: 'Smug billionaire heir trying to expose your fake engagement in front of the press.',
        speakingStyle: 'Polished, venomous sarcasm.',
        relationshipToUser: 'Waiting for you to forget Alaina’s real birthday or favorite drink',
        portrait: '/src/assets/images/raghav_rival_portrait_1795516146457.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'kavya_pr',
        name: 'Naina Mehta',
        age: '26',
        role: "Alaina's Chief PR Strategist",
        personality: 'Quick-witted fixer feeding you secret cues on earpiece.',
        speakingStyle: 'Urgent, playful whisper.',
        relationshipToUser: 'Trying to keep your cover story airtight',
        portrait: '/src/assets/images/roshni_flatmate_portrait_1795516088415.jpg',
        accentColor: '#E5233D',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Real Sparks', emoji: '💎', initialValue: 20, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Cover Trust', emoji: '🥂', initialValue: 45, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'Oberoi Sky Gala — Press Cameras & Emerald Gown',
    playGuide: {
      hinglish: 'Siddharth ke jaal se Alaina ko bachao — aur dikhao ki contract ke peeche sachha pyaar hai 💎',
      hindi: 'सिद्धार्थ के जाल से अलैना को बचाओ — और दिखाओ कि कॉन्ट्रैक्ट के पीछे सच्चा प्यार जाग चुका है 💎',
      english: 'Outsmart the boardroom sharks and melt Mumbai’s coldest billionaire heiress 💎',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Penthouse ke jhoomar ki golden roshni mein cameras flash kar rahe hain. Alaina emerald gown mein tumhare bilkul kareeb aati hai aur tumhara haath apni kamar par tikati hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Alaina Oberoi',
          text: 'Muskurate raho... Siddharth theek hamare peeche khada dekh raha hai. Agar usse zara bhi shaq hua ki hamari engagement fake hai, toh kal subah tak mera empire doob jayega.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'पेंटहाउस के झूमर की सुनहरी रोशनी में कैमरे चमक रहे हैं। अलैना हरे गाउन में तुम्हारे बिल्कुल करीब आती है और तुम्हारा हाथ अपनी कमर पर टिकाती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Alaina Oberoi',
          text: 'मुस्कुराते रहो... सिद्धार्थ ठीक हमारे पीछे खड़ा देख रहा है। अगर उसे ज़रा भी शक हुआ कि हमारी सगाई नकली है, तो कल सुबह तक सब खत्म हो जाएगा।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Camera flashes burst beneath the towering penthouse chandelier as Alaina steps flush against your tuxedo and guides your hand to her waist.',
        },
        {
          type: 'dialogue',
          speakerName: 'Alaina Oberoi',
          text: 'Keep smiling... Siddharth is watching from three steps behind us. If he senses for one second that this engagement is a contract, I lose the board vote tomorrow.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Uske kaan ke paas jhuk kar fusfusao: "Dar mat, Boss Lady. Aaj main Oscar-level pyaar dikhaunga."',
        'Champagne glass uthao aur Siddharth ke saamne Alaina ke maathe par kiss karo',
        'Playfully smile karo: "Acting? Mujhe toh lag raha hai tum sach mein blush kar rahi ho."',
      ],
      hindi: [
        'कान के पास फुसफुसाओ: "चिंता मत करो बॉस, आज पूरी दुनिया को यकीन दिला दूँगा।"',
        'सिद्धार्थ के सामने अलैना को करीब खींचो और गर्व से परिचय दो',
        'मुस्कुराओ: "शायद यह अब सिर्फ़ नाटक नहीं रहा, अलैना।"',
      ],
      english: [
        'Lean near her ear: "Relax, Boss Lady. Let’s give them a show they’ll never forget."',
        'Pull her closer smoothly and kiss her temple right in Siddharth’s line of sight',
        'Tease quietly: "Careful—my heartbeat isn’t acting anymore."',
      ],
    },
    possibleEndings: ['Real Ring Over Mumbai Skyline', 'Boardroom Triumph Together'],
  },

  // 26. Neon Ronin: Neo-Tokyo 2099
  {
    id: 'cyber_samurai_2099',
    title: 'Neon Ronin: Neo-Tokyo 2099',
    tagline: 'Bheegi cyber galliyon mein ek katana, ek rogue hacker aur aakhri bagawat.',
    about:
      'In rain-drenched Neo-Tokyo 2099, rogue cyber-swordswoman Sora rescues you from a Syndicate memory wipe. Together with quirky underground hacker Kaito, you must survive Syndicates and discover why your neural chip holds the city’s master key.',
    primaryCategory: 'Anime',
    categories: ['For You', 'New', 'Anime', 'Adventure', 'Thriller'],
    tags: ['Roleplay', 'Cyberpunk', 'Anime Action'],
    visualStyle: 'Cyberpunk Neon Noir DSLR',
    rating: 4.9,
    chatCountLabel: '205.8K',
    chatCountNumeric: 205800,
    isNew: true,
    coverImage: '/src/assets/images/zoya_drift_portrait_1795516300100.jpg',
    mediaGallery: [
      {
        id: 'nr_1',
        url: '/src/assets/images/zoya_drift_portrait_1795516300100.jpg',
        caption: 'Neon baarish mein Sora ki cyan blade Syndicate drones ko cheerne ke liye taiyaar hai.',
      },
    ],
    setting: 'Rain-soaked Neon Sector 9 back-alley under glowing holographic kanji towers',
    characters: [
      {
        id: 'sora_ronin',
        name: 'Sora Kusanagi',
        age: '21',
        gender: 'Female',
        role: 'Ex-Syndicate Cyber Samurai',
        personality: 'Lethal, stoic, fiercely protective of innocents, quietly softening whenever you trust her with your back.',
        speakingStyle: 'Calm, sharp, tactical Hinglish/English.',
        relationshipToUser: 'Your fierce bodyguard with an encrypted past',
        portrait: '/src/assets/images/yours_zoya_glam_1795804144673.jpg',
        accentColor: '#06B6D4',
      },
      {
        id: 'kaito_hacker',
        name: 'Kaito Vance',
        age: '20',
        gender: 'Male',
        role: 'Underground Net-Runner',
        personality: 'Sarcastic genius hacker cracking drones on holographic wrist-decks.',
        speakingStyle: 'Fast tech-slang & dark humor.',
        relationshipToUser: 'Your comms lifeline & comic relief',
        portrait: '/src/assets/images/dev_companion_portrait_1795516148313.jpg',
        accentColor: '#3B82F6',
      },
      {
        id: 'kuroda_boss',
        name: 'Commander Kuroda',
        age: '40',
        gender: 'Male',
        role: 'Syndicate Enforcer',
        personality: 'Relentless cybernetic hunter tracking Sora’s blade.',
        speakingStyle: 'Cold metallic command.',
        relationshipToUser: 'Wants the code inside your head',
        portrait: '/src/assets/images/vikrant_dock_portrait_1795516097665.jpg',
        accentColor: '#E5233D',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Sync Rate', emoji: '⚡', initialValue: 40, min: 0, max: 100, tone: 'trust' },
      { id: 'love', label: 'Bond', emoji: '💙', initialValue: 18, min: 0, max: 100, tone: 'love' },
    ],
    openingScene: 'Sector 9 Neon Alley — Drone Ambush',
    playGuide: {
      hinglish: 'Sora aur Kaito ke saath Syndicate se bacho aur apni memory ka raaz kholo ⚡🗡️',
      hindi: 'सोरा और काइटो के साथ सिंडिकेट से बचो और अपनी मेमोरी का राज़ खोलो ⚡🗡️',
      english: 'Sync with Sora’s blade and Kaito’s hacks to outrun Neo-Tokyo’s deadliest syndicate ⚡🗡️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Tez baarish aur neon billboards ke neeche Sora ki neeli energy katana chamak uthti hai. Do hunter drones hawa mein lock-on kar rahe hain.',
        },
        {
          type: 'dialogue',
          speakerName: 'Sora Kusanagi',
          text: 'Mere peeche raho! Kaito 15 seconds mein alley gate hack kar dega—tab tak ya toh bhaago, ya mere saath lado. Kya chunte ho?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'तेज़ बारिश और नियॉन साइनबोर्ड्स के नीचे सोरा की नीली एनर्जी कटाना चमक उठती है। दो हंटर ड्रोन हवा में निशाना साध रहे हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Sora Kusanagi',
          text: 'मेरे पीछे रहो! काइटो 15 सेकंड में गेट हैक कर देगा—तब तक भागना है या मेरे साथ लड़ना है?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Rain hisses against Sora’s glowing cyan katana as twin Syndicate drones lock crimson lasers onto the flooded alley.',
        },
        {
          type: 'dialogue',
          speakerName: 'Sora Kusanagi',
          text: 'Stay close to my left! Kaito needs fifteen seconds to crack the firewall—are you running or fighting beside me?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Sora ki back cover karo: "Akele nahi ladogi, Sora—main tumhare saath hoon!"',
        'Kaito ko comms par chillao: "Power grid kaat de, hum roof par ja rahe hain!"',
        'EMP grenade uthao aur drones ki taraf phenko',
      ],
      hindi: [
        'सोरा का साथ दो: "तुम अकेली नहीं लड़ोगी—मैं साथ हूँ!"',
        'काइटो को आवाज़ दो: "पावर ग्रिड बंद करो, हम छत से निकलते हैं!"',
        'ईएमपी ग्रेनेड उठाकर ड्रोन की तरफ़ फेंको',
      ],
      english: [
        'Step back-to-back with Sora: "Not leaving you alone—let’s take them down!"',
        'Yell into comms: "Kaito, kill the streetlights—we’re going up!"',
        'Scoop a fallen EMP pulse cell and hurl it at the drones',
      ],
    },
    possibleEndings: ['Rebellion Above Skyline', 'Neon Dawn Escape'],
  },

  // 27. Navratri Ki Woh Raat
  {
    id: 'garba_night_secret',
    title: 'Navratri Ki Woh Raat',
    tagline: 'Dandiya ki khanak, dhol ki thaap aur chaniya-choli mein chhupi ek pyaari shayari.',
    about:
      'Under thousands of fairy lights at Ahmedabad’s grandest college Navratri night, vibrant dancer Diya slips secret shayari notes into your kurta pocket—while college captain Aditya challenges you to a high-energy Garba duel for the spotlight.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Romance', 'College'],
    tags: ['Roleplay', 'Festive Romance', 'Garba Night'],
    visualStyle: 'Festive Golden Bokeh',
    rating: 4.9,
    chatCountLabel: '152.1K',
    chatCountNumeric: 152100,
    isNew: true,
    coverImage: '/src/assets/images/cover_navratri_raat_1795801729947.jpg',
    mediaGallery: [
      {
        id: 'nkr_1',
        url: '/src/assets/images/cover_navratri_raat_1795801729947.jpg',
        caption: 'Hazaaron lights ke neeche Diya ghumte hue bas tumhari hi taraf dekh kar muskura rahi hai.',
      },
    ],
    setting: 'Open-air college Garba ground glowing with golden lanterns & festive music',
    characters: [
      {
        id: 'diya_garba',
        name: 'Diya Patel',
        age: '20',
        role: 'Garba Queen & Secret Admirer',
        personality: 'Radiant, joyful, effortlessly expressive, hides tiny romantic notes behind playful glances.',
        speakingStyle: 'Lively, musical Gujarati-Hinglish full of festive warmth.',
        relationshipToUser: 'Secretly writing anonymous notes to you all week',
        portrait: '/src/assets/images/yours_kavya_glam_1795804144876.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'aditya_rival',
        name: 'Aditya Joshi',
        age: '21',
        role: 'Cultural Fest Captain',
        personality: 'Showy campus star who thinks nobody can out-dance him beside Diya.',
        speakingStyle: 'Cocky, playful boasting.',
        relationshipToUser: 'Challenging you on the dance floor',
        portrait: '/src/assets/images/portrait_vivaan_rival_1795460852271.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'neha_bestie',
        name: 'Neha',
        age: '20',
        role: "Diya's Best Friend",
        personality: 'Cheerful wingwoman whispering hints whenever Diya looks your way.',
        speakingStyle: 'Excited, teasing banter.',
        relationshipToUser: 'Rooting hard for you to ask Diya out',
        portrait: '/src/assets/images/sana_campus_portrait_1795516088958.jpg',
        accentColor: '#EC4899',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Spark', emoji: '✨', initialValue: 30, min: 0, max: 100, tone: 'love' },
      { id: 'friendship', label: 'Vibe', emoji: '🪘', initialValue: 50, min: 0, max: 100, tone: 'friendship' },
    ],
    openingScene: 'College Garba Ground — Fairy Lights Circle',
    playGuide: {
      hinglish: 'Diya ke saath dandiya khelo, uski shayari ka jawaab do aur is festive raat ko yaadgar banao 🪘❤️',
      hindi: 'दीया के साथ डांडिया खेलो, उसकी शायरी का जवाब दो और इस त्योहार की रात को यादगार बनाओ 🪘❤️',
      english: 'Match Diya’s Garba steps under the lanterns and turn secret notes into a real confession 🪘❤️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Dhol aur shehnai ki goonj ke beech, laal-neeli embroidered chaniya-choli mein ghumti Diya achanak tumhare saamne rukti hai. Tumhari black kurta ki pocket mein ek gulabi chit abhi-abhi rakh gayi hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Diya Patel',
          text: 'Arre black kurte wale hero! Sirf door se muskuraoge ya aaj mere saath teen-taali khelne ki himmat bhi hai?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'ढोल की गूँज के बीच रंग-बिरंगे चनिया-चोली में घूमती दीया अचानक तुम्हारे सामने आकर रुकती है। तुम्हारे काले कुर्ते की जेब में एक गुलाबी चिट अभी-अभी फिसली है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Diya Patel',
          text: 'अरे काले कुर्ते वाले हीरो! सिर्फ़ दूर से मुस्कुराओगे या आज मेरे साथ गरबा खेलने की हिम्मत भी है?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Spinning gracefully beneath strings of golden lanterns, Diya stops right in front of you—just as a folded pink note slips neatly into your black kurta pocket.',
        },
        {
          type: 'dialogue',
          speakerName: 'Diya Patel',
          text: 'Hey, Black Kurta! Are you just going to stand there smiling all night, or do you actually dare match my dandiya steps?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Dandiya uthao aur smirk karo: "Chalo phir, dekhte hain kaun pehle thakta hai!"',
        'Pocket se pink chit nikaal kar dikhao: "Yeh shayari tumne likhi hai na?"',
        'Nazar milakar bolo: "Step bhool bhi jaun, toh tumhe dekh kar seekh lunga."',
      ],
      hindi: [
        'डांडिया उठाकर मुस्कुराओ: "चलो फिर, देखते हैं कौन ज़्यादा देर तक टिकता है!"',
        'जेब से चिट निकालो: "यह प्यारी शायरी तुम्हीं ने रखी ना?"',
        'धीरे से कहो: "अगर कदम चूक भी जाऊँ, तो तुम्हारी मुस्कान सँभाल लेगी।"',
      ],
      english: [
        'Grab two dandiya sticks with a grin: "Let’s see who loses rhythm first!"',
        'Hold up the pink note playfully: "So you were the secret poet all week?"',
        'Look right into her eyes: "Even if I miss a beat, watching you is worth it."',
      ],
    },
    possibleEndings: ['Midnight Dandiya Champions', 'Lantern Kiss After The Crowd Leaves'],
  },

  // 28. Don Ki Beti Se Ishq
  {
    id: 'don_ki_beti',
    title: 'Don Ki Beti Se Ishq',
    tagline: 'Goa ke underworld ki shehzadi ne dushman se jaan bachayi—ab pyaar ki keemat kya hogi?',
    about:
      'Infiltrating Goa’s toughest harbor cartel as an undercover agent, your cover nearly blows during a midnight shootout—until fearless mafia heiress Alisha pulls you beneath her umbrella and hides you from her ruthless father Rana & enforcer Bhim.',
    primaryCategory: 'Mafia',
    categories: ['For You', 'New', 'Mafia', 'Thriller', 'Romance'],
    tags: ['Roleplay', 'Mafia Romance', 'Undercover'],
    visualStyle: 'Noir Harbor Thriller',
    rating: 4.9,
    chatCountLabel: '218.4K',
    chatCountNumeric: 218400,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_don_ki_beti_1795801748577.jpg',
    mediaGallery: [
      {
        id: 'dkb_1',
        url: '/src/assets/images/cover_don_ki_beti_1795801748577.jpg',
        caption: 'Goa dockyard ki baarish mein Alisha ne chhatri aur apni bandook dono tumhare liye khol rakhi hain.',
      },
    ],
    setting: 'Rain-lashed Goa cargo dockyard at 1:40 AM with black SUVs idling',
    characters: [
      {
        id: 'alisha_don_daughter',
        name: 'Alisha Rana',
        age: '24',
        role: 'Cartel Heiress',
        personality: 'Ice-calm under gunfire, merciless to traitors, strangely gentle only toward you.',
        speakingStyle: 'Low, smoky, dangerously alluring Hinglish.',
        relationshipToUser: 'Knows you’re hiding a dangerous badge—yet saved you anyway',
        portrait: '/src/assets/images/tara_mafia_portrait_1795516087170.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'rana_don',
        name: 'Rana Pratap',
        age: '52',
        role: 'Goa Underworld Boss',
        personality: 'Feared kingpin who loves only his daughter Alisha and hates cops.',
        speakingStyle: 'Heavy, slow, terrifying calm.',
        relationshipToUser: 'Tests every recruit with loyalty blood-oaths',
        portrait: '/src/assets/images/vikrant_dock_portrait_1795516097665.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'bhim_enforcer',
        name: 'Bhim',
        age: '31',
        role: 'Rana’s Chief Shooter',
        personality: 'Paranoid lieutenant suspicious of your sudden entry.',
        speakingStyle: 'Rough, aggressive threats.',
        relationshipToUser: 'Watching your every phone call',
        portrait: '/src/assets/images/kabir_enforcer_portrait_1795516087491.jpg',
        accentColor: '#64748B',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Forbidden Desire', emoji: '🖤', initialValue: 25, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Cartel Cover', emoji: '🔫', initialValue: 40, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'Goa Dockyard No. 4 — After Midnight Ambush',
    playGuide: {
      hinglish: 'Apna undercover raaz chhupao ya Alisha ke liye sab kuch daav par laga do 🔫🖤',
      hindi: 'अपना अंडरकवर राज़ छिपाओ या अलीशा के लिए सब कुछ दाँव पर लगा दो 🔫🖤',
      english: 'Keep your cover alive in Goa’s underworld—or risk your badge for the Don’s fearless daughter 🔫🖤',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Kandhe par goli ka zakhm aur neeli dock lights ke beech baarish baras rahi hai. Alisha apni kaali chhatri tumhare upar karke SUV ke paas rukti hai, uski nazrein tumhare shirt ke andar chhupi badge pocket par tikti hain.',
        },
        {
          type: 'dialogue',
          speakerName: 'Alisha Rana',
          text: 'Papa ko pata chala ki dock par ek undercover mole ghusa hai... aur ajeeb baat hai, woh mole bilkul tumhari tarah zakhmi hai. Chupchaap gaadi mein baitho—aaj tumhari jaan mere karz par hai.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'कंधे पर ज़ख्म और गोवा डॉकयार्ड की बारिश के बीच अलीशा अपनी काली छतरी तुम्हारे ऊपर कर देती है। उसकी तेज़ नज़रें तुम्हारी शर्ट की जेब पर टिकती हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Alisha Rana',
          text: 'पापा को खबर मिली है कि डॉक पर एक अंडरकवर जासूस घुसा है... और कमाल देखो, वो बिल्कुल तुम्हारी तरह घायल है। चुपचाप गाड़ी में बैठो—आज तुम्हारी जान मेरे उधार पर है।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Rain drums against black SUVs at Dockyard No. 4 as Alisha tilts her umbrella over your bleeding shoulder, her eyes locking onto the hidden bulge beneath your jacket.',
        },
        {
          type: 'dialogue',
          speakerName: 'Alisha Rana',
          text: 'My father thinks an undercover cop slipped onto the docks tonight... funny how that cop happens to have the exact same wound as you. Get in the car—you owe me a life.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Dard dabakar smile karo: "Tumhara karz zindagi bhar chukaane ko taiyaar hoon, Alisha."',
        'Bluff karo: "Main sirf apni team ke liye lada tha—kisi badge ke liye nahi."',
        'Uske kareeb aakar fusfusao: "Goli toh kisi aur ne chalayi, par maara tumhari aankhon ne."',
      ],
      hindi: [
        'मुस्कुराकर कहो: "यह उधार पूरी ज़िंदगी चुकाने को तैयार हूँ, अलीशा।"',
        'बात टालो: "मैं सिर्फ़ अपनी डील बचाने आया था—तुम्हारे खिलाफ़ नहीं।"',
        'धीरे से बोलो: "अगर सच जानती हो, तो अभी तक पापा को क्यों नहीं बताया?"',
      ],
      english: [
        'Meet her gaze steadily: "Then tell me how you want me to repay you, Alisha."',
        'Hold your bluff: "I only came to stop a traitor—not betray you."',
        'Step under her umbrella: "If you already suspect the truth, why are you saving me?"',
      ],
    },
    possibleEndings: ['Two Renegades Across Sea', 'Empire & Love Combined'],
  },

  // 29. Kalighat Ka Tantra
  {
    id: 'curse_of_kalighat',
    title: 'Kalighat Ka Tantra',
    tagline: 'Grahan ki raat Kolkata ki purani haveli mein laal tantra jaag utha...',
    about:
      'During a rare blood-moon eclipse in Kolkata, scholar Vedika breaks an ancient brick seal inside her ancestral mansion—awakening dark spirit Kaal-Rudra and forcing you, her skeptical friend, and cryptic Professor Sen to seal the doorway before sunrise.',
    primaryCategory: 'Supernatural',
    categories: ['For You', 'New', 'Supernatural', 'Horror', 'Mythology'],
    tags: ['Roleplay', 'Occult Mystery', 'Kolkata'],
    visualStyle: 'Blood Moon Gothic',
    rating: 4.8,
    chatCountLabel: '134.9K',
    chatCountNumeric: 134900,
    isNew: true,
    coverImage: '/src/assets/images/cover_kalighat_tantra_1795801748503.jpg',
    mediaGallery: [
      {
        id: 'kkt_1',
        url: '/src/assets/images/cover_kalighat_tantra_1795801748503.jpg',
        caption: 'Laal chand ke neeche diwaron par chamakte shloka achanak zinda hone lage.',
      },
    ],
    setting: 'Moss-draped courtyard of an 1890 Kolkata mansion under a crimson blood moon',
    characters: [
      {
        id: 'vedika_scholar',
        name: 'Vedika Banerjee',
        age: '23',
        role: 'Folklore & Manuscript Scholar',
        personality: 'Brave, deeply knowledgeable in Bengali tantra lore, refuses to abandon her family home.',
        speakingStyle: 'Focused, poetic Bengali-accented Hinglish.',
        relationshipToUser: 'Trusts only you to hold the lantern while chanting the counter-seal',
        portrait: '/src/assets/images/damayanti_bride_portrait_1795516093464.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'prof_sen',
        name: 'Professor Sen',
        age: '56',
        role: 'Occult Historian',
        personality: 'Cryptic mentor whose shadow doesn’t always move at the same speed he does.',
        speakingStyle: 'Eerie, whispered riddles.',
        relationshipToUser: 'May be guiding you—or leading you into a trap',
        portrait: '/src/assets/images/bhairav_shrine_portrait_1795516147050.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'kaal_rudra',
        name: 'Rudra Shadow',
        age: 'Ancient',
        role: 'Bound Courtyard Entity',
        personality: 'Seductive yet terrifying entity offering forbidden knowledge for one name.',
        speakingStyle: 'Echoing resonant voice.',
        relationshipToUser: 'Whispering promises inside your mind',
        portrait: '/src/assets/images/preta_guardian_portrait_1795516146713.jpg',
        accentColor: '#A855F7',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Seal Strength', emoji: '🕯️', initialValue: 42, min: 0, max: 100, tone: 'trust' },
      { id: 'fear', label: 'Curse Grip', emoji: '🌑', initialValue: 48, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Kolkata Mansion Courtyard — Crimson Eclipse',
    playGuide: {
      hinglish: 'Vedika ke saath purana mantra poora karo aur laal grahan khatam hone se pehle darwaza band karo 🕯️🌑',
      hindi: 'वेदिका के साथ प्राचीन मंत्र पूरा करो और ग्रहण समाप्त होने से पहले द्वार बंद करो 🕯️🌑',
      english: 'Stand beside Vedika under the blood moon and reseal the ancient Kolkata courtyard before dawn 🕯️🌑',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Chand poora laal ho chuka hai. Haveli ke patthar ke khambhon par khud-ba-khud laal akshar chamakne lage hain aur dhoop ke dhuein se ek kaali parchhayi ubhar rahi hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Vedika Banerjee',
          text: 'Peeche mat hatna! Yeh laalten bilkul bujhni nahi chahiye... mujhe lagta hai Professor Sen us darwaze ke andar fass gaye hain!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'आसमान में चाँद पूरा लाल हो चुका है। हवेली के खंभों पर लिखे प्राचीन अक्षर अपने आप दहकने लगे हैं और धुएँ से एक काली छाया उभर रही है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Vedika Banerjee',
          text: 'पीछे मत हटना! यह लालटेन बुझनी नहीं चाहिए... लगता है प्रोफेसर सेन उस दरवाज़े के भीतर फँस गए हैं!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'The blood moon stains the courtyard stone crimson as ancient Sanskrit runes ignite along the pillars and incense smoke coils into a towering shadow.',
        },
        {
          type: 'dialogue',
          speakerName: 'Vedika Banerjee',
          text: 'Hold that brass lantern steady! If the flame dies, the ward collapses—and Professor Sen just stepped beyond the threshold!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Vedika ka haath mazbooti se thaamo: "Saath chalte hain—aag aur mantra dono mere paas hain."',
        'Zameen par bane chalk circle ko turant dubara khincho',
        'Andhere ki taraf chilla kar puchho: "Professor, kya aap wahin hain?"',
      ],
      hindi: [
        'वेदिका का हाथ थामो: "हम दोनों साथ चलेंगे—लालटेन बुझने नहीं दूँगा।"',
        'ज़मीन पर बने सुरक्षा चक्र को तुरंत पूरा करो',
        'अँधेरे द्वार की ओर आवाज़ दो: "प्रोफेसर सेन, आप ठीक हैं?"',
      ],
      english: [
        'Grip Vedika’s free hand: "We step through together—I won’t let the flame go out."',
        'Quickly trace the broken salt-ash barrier on the stone floor',
        'Call sharply toward the shadowed arch: "Professor Sen—answer us!"',
      ],
    },
    possibleEndings: ['Crimson Seal Restored', 'Dawn Over Kalighat'],
  },

  // 30. Monsoon Coffee House
  {
    id: 'coffee_house_rain',
    title: 'Monsoon Coffee House',
    tagline: 'Marine Drive ki baarish, toota hua violin aur ek cup coffee par nayi shuruat.',
    about:
      'Seeking shelter from a sudden Mumbai cloudburst inside a warm wooden coffee house on Marine Drive, you find yourself sharing the last corner booth with heartbroken violinist Ira—while warm cafe owner Rustom and your old college buddy Kabir spark a gentle evening of healing and unexpected romance.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Romance', 'Drama'],
    tags: ['Roleplay', 'Monsoon Romance', 'Slice of Life'],
    visualStyle: 'Warm Rainy Cafe DSLR',
    rating: 4.9,
    chatCountLabel: '142.3K',
    chatCountNumeric: 142300,
    isNew: true,
    coverImage: '/src/assets/images/cover_monsoon_coffee_1795801807207.jpg',
    mediaGallery: [
      {
        id: 'mcr_1',
        url: '/src/assets/images/cover_monsoon_coffee_1795801807207.jpg',
        caption: 'Marine Drive par tez baarish baras rahi hai aur garam cappuccino ki bhaap ke beech Ira muskura uthi.',
      },
    ],
    setting: 'Cozy sea-facing wood-and-glass coffee house at Marine Drive during heavy Mumbai rain',
    characters: [
      {
        id: 'ira_violinist',
        name: 'Ira Deshmukh',
        age: '23',
        role: 'Orchestra Violinist',
        personality: 'Soulful, bruised after a broken symphony audition, slowly lighting up at genuine kindness.',
        speakingStyle: 'Soft, lyrical, warmly sarcastic Hinglish.',
        relationshipToUser: 'Met by pure monsoon coincidence across a shared wooden booth',
        portrait: '/src/assets/images/ananya_ex_portrait_1795516087023.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'rustom_owner',
        name: 'Rustom Uncle',
        age: '58',
        role: 'Irani Cafe Owner',
        personality: 'Kindhearted old romantic playing vintage vinyl records whenever couples meet.',
        speakingStyle: 'Jolly Parsi-Mumbai Hinglish.',
        relationshipToUser: 'Keeps bringing complimentary bun-maska for you two',
        portrait: '/src/assets/images/harish_watchman_portrait_1795516146598.jpg',
        accentColor: '#38BDF8',
      },
      {
        id: 'dev_friend',
        name: 'Devansh',
        age: '24',
        role: 'Ira’s Former Bandmate',
        personality: 'Self-absorbed guitarist who walks in dripping wet hoping to win Ira back too late.',
        speakingStyle: 'Dramatic apologies.',
        relationshipToUser: 'Sudden rival interrupting your peaceful evening',
        portrait: '/src/assets/images/dev_companion_portrait_1795516148313.jpg',
        accentColor: '#E5233D',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Warmth', emoji: '☕', initialValue: 28, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Comfort', emoji: '🎻', initialValue: 40, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'Marine Drive Corner Booth — Cloudburst Outside',
    playGuide: {
      hinglish: 'Baarish ki shaam mein Ira ki udaasi door karo — ek coffee kab mohabbat ban jaye, pata bhi nahi chalega ☕🎻',
      hindi: 'बारिश की शाम में इरा की उदासी दूर करो — एक कॉफी कब मोहब्बत बन जाए, पता भी न चलेगा ☕🎻',
      english: 'Share warm coffee and soulful music as Marine Drive’s rain heals a bruised heart ☕🎻',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Sheeshe ki khidki par baarish ki moti boondein phisal rahi hain. Saamne baithi Ira apni violin case par haath pherte hue halki si bheegi hansi hasti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Ira Deshmukh',
          text: 'Bura mat maanna, par aaj meri zindagi ka sabse kharab din tha—aur phir bhi tumhare saamne baith kar coffee peene mein ajeeb sa sukoon lag raha hai. Kya naam bataya tumne?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'शीशे की खिड़की पर बारिश की मोटी बूँदें फिसल रही हैं। सामने बैठी इरा अपने वायलिन केस पर हाथ फेरते हुए हल्की-सी मुस्कान देती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Ira Deshmukh',
          text: 'बुरा मत मानना, आज मेरी ज़िंदगी का सबसे अजीब दिन था—फिर भी तुम्हारे सामने बैठकर कॉफी पीने में सुकून लग रहा है। अपना नाम क्या बताया तुमने?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Rain streaks down the glass overlooking Marine Drive as Ira rests her hand gently atop a worn leather violin case, offering a tired yet genuine smile.',
        },
        {
          type: 'dialogue',
          speakerName: 'Ira Deshmukh',
          text: 'Honestly, today was supposed to be the worst evening of my month—yet sharing this booth with a total stranger feels weirdly comforting. What should I call you?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Apna naam batao aur puchho: "Agar bura na mano, toh ek dhun sunaogi baarish ke liye?"',
        'Rustom uncle se do aur garam cup manga kar kaho: "Kharab din ko achhe mein badalne ka theka mera."',
        'Softly bolo: "Kabhi-kabhi anjaan log puraane doston se zyada samajhte hain."',
      ],
      hindi: [
        'अपना नाम बताओ और पूछो: "क्या इस बारिश के लिए एक प्यारी धुन बजाओगी?"',
        'मुस्कुराकर कहो: "ख़राब दिन को यादगार शाम में बदलना आता है मुझे।"',
        'प्यार से बोलो: "लगता है यह बारिश हमें मिलवाने के लिए ही आई है।"',
      ],
      english: [
        'Introduce yourself warmly: "How about playing one soft tune for the rain?"',
        'Wave for fresh espresso: "I’m pretty good at turning terrible days around."',
        'Smile softly: "Sometimes a quiet stranger listens better than anyone else."',
      ],
    },
    possibleEndings: ['Rainy Walk Along Marine Drive', 'Solo Violin Concert Together'],
  },

  // 31. Astral Academy: Dragon Bond
  {
    id: 'academy_of_dragons',
    title: 'Astral Academy: Dragon Bond',
    tagline: 'Aasmaan mein tairti magic academy jahan har 100 saal mein ek Silver Dragon jaagta hai.',
    about:
      'Summoned to the floating citadel of Astral Academy without any noble bloodline, you unexpectedly resonate with the dormant Silver Dragon crest—sparking awe from frost mage Elara, fierce jealousy from flame duelist Draven, and secret tests from Headmaster Orion.',
    primaryCategory: 'Fantasy',
    categories: ['For You', 'New', 'Fantasy', 'Anime', 'Adventure'],
    tags: ['Roleplay', 'Magic Academy', 'Dragon Bond'],
    visualStyle: 'Epic Dark Fantasy Cinema',
    rating: 4.9,
    chatCountLabel: '198.0K',
    chatCountNumeric: 198000,
    isNew: true,
    coverImage: '/src/assets/images/alina_vampire_portrait_1795516147518.jpg',
    mediaGallery: [
      {
        id: 'aad_1',
        url: '/src/assets/images/alina_vampire_portrait_1795516147518.jpg',
        caption: 'Baadalon ke upar Astral Citadel mein Elara aur Draven tumhari dragon shakti dekh kar dang reh gaye.',
      },
    ],
    setting: 'Floating marble balcony of Astral Sky Citadel above sunlit clouds',
    characters: [
      {
        id: 'elara_frost',
        name: 'Elara Vane',
        age: '19',
        gender: 'Female',
        role: 'Frost Crest Prodigy',
        personality: 'Composed, crystalline elegance, secretly burdened by royal expectations, fascinated by your unheard-of dragon resonance.',
        speakingStyle: 'Clear, calm, gently curious.',
        relationshipToUser: 'Top mage quietly offering to train you after hours',
        portrait: '/src/assets/images/niharika_obsessed_portrait_1795516146132.jpg',
        accentColor: '#38BDF8',
      },
      {
        id: 'draven_flame',
        name: 'Draven Ignis',
        age: '20',
        gender: 'Male',
        role: 'Crimson Flame Duelist',
        personality: 'Hot-headed noble heir furious that a commoner awakened the legendary Silver Crest.',
        speakingStyle: 'Fierce, arrogant challenges.',
        relationshipToUser: 'Demands an immediate magic duel',
        portrait: '/src/assets/images/raghav_rival_portrait_1795516146457.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'headmaster_orion',
        name: 'Headmaster Orion',
        age: '60',
        gender: 'Male',
        role: 'Grand Archmage',
        personality: 'Enigmatic guardian who knows a Void Dragon war is coming.',
        speakingStyle: 'Ancient wisdom with hidden gravity.',
        relationshipToUser: 'Watches your awakening closely',
        portrait: '/src/assets/images/zafar_wazir_portrait_1795516148205.jpg',
        accentColor: '#A855F7',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Dragon Sync', emoji: '🐉', initialValue: 32, min: 0, max: 100, tone: 'trust' },
      { id: 'respect', label: 'Academy Rank', emoji: '✨', initialValue: 20, min: 0, max: 100, tone: 'respect' },
    ],
    openingScene: 'Sky Balcony — Silver Dragon Crest Awakening',
    playGuide: {
      hinglish: 'Apni Silver Dragon shakti par kaabu pao, Draven ki chunauti jeeto aur Elara ka bharosa jeeto 🐉✨',
      hindi: 'अपनी सिल्वर ड्रैगन शक्ति सँभालो, ड्रेवन की चुनौती जीतो और एलारा का भरोसा जीतो 🐉✨',
      english: 'Master your awakened Silver Dragon crest, face Draven’s duel, and earn Elara’s trust above the clouds 🐉✨',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Citadel ke aasmaani balcony par baadalon ki tez hawa chal rahi hai. Tumhari hatheli par pehli baar neeli-chandi roshni mein Dragon Crest chamak uthta hai!',
        },
        {
          type: 'dialogue',
          speakerName: 'Draven Ignis',
          text: 'Impossible! Ek bina bloodline wale rookie ko Silver Crest kaise mil gaya?! Uthao apni wand—abhi aur yahin duel hoga!',
        },
        {
          type: 'dialogue',
          speakerName: 'Elara Vane',
          text: 'Ruko Draven! Dekho toh sahi, hawa aur barf dono uske ishaare par kaamp rahe hain... tum kaun ho?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'बादलों के ऊपर तैरते सिटाडेल की बालकनी में अचानक तुम्हारी हथेली पर चमकता सिल्वर ड्रैगन निशान उभर आता है!',
        },
        {
          type: 'dialogue',
          speakerName: 'Draven Ignis',
          text: 'नामुमकिन! एक आम छात्र को सिल्वर क्रेस्ट कैसे मिल गया?! अपनी छड़ी उठाओ—अभी और यहीं द्वंद्व होगा!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'High above the sunlit sea of clouds, an ancient silver dragon sigil ignites across your palm, sending ripples through the academy’s mana field.',
        },
        {
          type: 'dialogue',
          speakerName: 'Draven Ignis',
          text: 'Impossible! How could a bloodline nobody awaken the Silver Crest?! Draw your staff—duel me right here!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Shant rehkar Silver Crest ki roshni aasmaan mein chhodo: "Ladna hai toh chal, par peeche mat hatna."',
        'Elara ki taraf dekh kar bolo: "Mujhe khud nahi pata yeh kaise hua—madad karogi?"',
        'Draven ki fire-staff par barf ki hawa se vaar roko',
      ],
      hindi: [
        'शांत रहकर शक्ति जगाओ: "अगर चुनौती देनी है, तो मैं तैयार हूँ!"',
        'एलारा से कहो: "मुझे खुद समझ नहीं आ रहा—क्या तुम सिखाओगी?"',
        'आसमानी बिजली से पहली चिंगारी रोक दो',
      ],
      english: [
        'Raise your glowing palm calmly: "If you insist on a duel, Draven—don’t blink."',
        'Glance toward Elara: "I didn’t ask for this crest—will you help me control it?"',
        'Channel an updraft of wind to deflect Draven’s sparks effortlessly',
      ],
    },
    possibleEndings: ['Rider of the Silver Sovereign', 'Champions of Astral Summit'],
  },

  // 32. Blood on Arabian Sea
  {
    id: 'murder_on_yacht',
    title: 'Blood on Arabian Sea',
    tagline: 'Toofani samundar mein phanse luxury yacht par ek khoon—aur har mehmaan jhooth bol raha hai!',
    about:
      'Cut off from shore by a howling Arabian Sea cyclone aboard billionaire yacht Aurora, sharp detective Rhea Kulkarni teams up with you to solve a sudden midnight murder before the killer strikes again among suspects Vikramjit and terrified heiress Simran.',
    primaryCategory: 'Crime',
    categories: ['For You', 'New', 'Crime', 'Thriller'],
    tags: ['Roleplay', 'Murder Mystery', 'Detective'],
    visualStyle: 'Stormy Noir Thriller',
    rating: 4.8,
    chatCountLabel: '129.6K',
    chatCountNumeric: 129600,
    isNew: true,
    coverImage: '/src/assets/images/cover_murder_yacht_1795801766765.jpg',
    mediaGallery: [
      {
        id: 'boas_1',
        url: '/src/assets/images/cover_murder_yacht_1795801766765.jpg',
        caption: 'Yacht ke bheege deck par toote glass aur khoon ke nishaan ke paas Detective Rhea ne torch jalayi.',
      },
    ],
    setting: 'Storm-tossed luxury yacht Aurora 40 nautical miles off the Goa coast at night',
    characters: [
      {
        id: 'rhea_detective',
        name: 'Detective Rhea Kulkarni',
        age: '27',
        role: 'Lead Maritime Investigator',
        personality: 'Razor-sharp, observant, trusts forensic details over rich alibis.',
        speakingStyle: 'Crisp, piercing Hinglish questions.',
        relationshipToUser: 'Recruited you as her eyes inside the locked lounge',
        portrait: '/src/assets/images/tara_mafia_portrait_1795516087170.jpg',
        accentColor: '#38BDF8',
      },
      {
        id: 'vikramjit_suspect',
        name: 'Vikramjit Mehra',
        age: '36',
        role: 'Rival Venture Tycoon',
        personality: 'Arrogant, hiding missing offshore ledger files.',
        speakingStyle: 'Smooth, defensive legal threats.',
        relationshipToUser: 'Prime suspect watching your investigation',
        portrait: '/src/assets/images/vikrant_dock_portrait_1795516097665.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'simran_heiress',
        name: 'Simran Kapoor',
        age: '23',
        role: 'Shaken Heiress',
        personality: 'Terrified witness clutching a torn envelope she hasn’t shown police.',
        speakingStyle: 'Breathless, panicked whispers.',
        relationshipToUser: 'May hold the real motive',
        portrait: '/src/assets/images/kiara_bride_portrait_1795516146637.jpg',
        accentColor: '#E5233D',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Case Progress', emoji: '🔍', initialValue: 25, min: 0, max: 100, tone: 'trust' },
      { id: 'fear', label: 'Danger', emoji: '⛈️', initialValue: 50, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'Superyacht Aurora Upper Deck — Storm Blackout',
    playGuide: {
      hinglish: 'Toofan mein sabhi jhooth bol rahe hain — Detective Rhea ke saath asli kaatil pakdo 🔍⛈️',
      hindi: 'तूफ़ान में हर कोई झूठ बोल रहा है — डिटेक्टिव रिया के साथ असली क़ातिल पकड़ो 🔍⛈️',
      english: 'Unmask the killer aboard yacht Aurora before the storm cuts the last lifeline 🔍⛈️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Samundar ki oonchi lehren yacht se takra rahi hain aur bijli ki chamak mein deck par toota hua whiskey glass aur diary dikhti hai. Rhea apni torch seedhi sheeshe ke darwaze ke andar khade mehmaanon par ghumati hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Detective Rhea Kulkarni',
          text: 'Satellite phone kaat diya gaya hai, aur kaatil isi yacht par hai. Maine tumhara naam passenger list se dekha—andar jaakar batao kaun sabse zyada paseene chhoot raha hai, Simran ya Vikramjit?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'समुद्र की ऊँची लहरें यॉट से टकरा रही हैं और डेक पर टूटा हुआ गिलास व खून के निशान दिख रहे हैं। डिटेक्टिव रिया अपनी टॉर्च भीतर खड़े मेहमानों पर डालती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Detective Rhea Kulkarni',
          text: 'सैटेलाइट फोन काट दिया गया है और क़ातिल इसी यॉट पर है। अंदर जाकर देखो कि सबसे ज़्यादा कौन घबराया हुआ है—सिमरन या विक्रमजीत?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Lightning splits the sky above the luxury deck, illuminating shattered crystal and crimson stains beside the railing. Rhea turns toward the glowing salon doors.',
        },
        {
          type: 'dialogue',
          speakerName: 'Detective Rhea Kulkarni',
          text: 'Someone severed our satellite uplink, which means the killer is locked right here with us. Step inside and tell me who’s sweating harder—Vikramjit or Simran.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Deck par gire wallet aur broken watch ka time note karo pehle',
        'Seedha Simran ke paas jaao: "Jo chhupa rahi ho mujhe dikhao, tabhi bach paogi."',
        'Vikramjit ko seedha challenge karo: "11:45 par aap engine room mein kya kar rahe the?"',
      ],
      hindi: [
        'पहले डेक पर गिरी टूटी घड़ी का समय नोट करो',
        'सिमरन के पास जाओ: "जो कागज़ छिपा रही हो, मुझे बताओ—मैं बचाऊँगा।"',
        'विक्रमजीत से सीधे पूछो: "रात पौने बारह बजे आप कहाँ थे?"',
      ],
      english: [
        'Inspect the shattered wristwatch and torn ticket stub on the wet deck first',
        'Slip beside Simran quietly: "Show me whatever note you’re hiding—I can protect you."',
        'Confront Vikramjit head-on: "Where were you when the lights went out at 11:45?"',
      ],
    },
    possibleEndings: ['Killer Handcuffed at Dawn', 'Hidden Ledger Exposed'],
  },

  // 33. Senior Didi Ya Crush?
  {
    id: 'tuition_wali_teacher',
    title: 'Senior Didi Ya Crush?',
    tagline: 'College library mein exam notes... aur raat 11 baje uski secret RJ awaaz!',
    about:
      'Struggling through North Campus finals, sharp-tongued senior Disha agrees to tutor you every evening—on one strict condition: never reveal her secret identity as Midnight RJ "DilKiDhadkan", while pesky campus editor Kunal snoops around your table.',
    primaryCategory: 'College',
    categories: ['For You', 'New', 'College', 'Romance', 'Drama'],
    tags: ['Roleplay', 'Senior Crush', 'Campus Comedy'],
    visualStyle: 'Golden Library Film',
    rating: 4.9,
    chatCountLabel: '176.2K',
    chatCountNumeric: 176200,
    isNew: true,
    coverImage: '/src/assets/images/cover_campus_radio_crush_1795801806257.jpg',
    mediaGallery: [
      {
        id: 'sdyc_1',
        url: '/src/assets/images/cover_campus_radio_crush_1795801806257.jpg',
        caption: 'Library ki sunset table par Disha ne apni ungli hothon par rakh kar kaha: "Shhh... kisi ko pata chala toh notes band!"',
      },
    ],
    setting: 'Sunlit wooden balcony corner of Delhi University Arts Faculty Library',
    characters: [
      {
        id: 'disha_senior',
        name: 'Disha Sharma',
        age: '22',
        role: 'Topper Senior & Secret Midnight RJ',
        personality: 'Witty, bossy in daylight, outrageously sweet and romantic behind her anonymous midnight radio mic.',
        speakingStyle: 'Playful Delhi-campus Hinglish.',
        relationshipToUser: 'Your senior tutor who just found out you listen to her show',
        portrait: '/src/assets/images/yours_ananya_glam_1795804144027.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'kunal_editor',
        name: 'Kunal',
        age: '21',
        role: 'College Magazine Gossiper',
        personality: 'Nosy campus reporter determined to unmask the mystery Midnight RJ.',
        speakingStyle: 'Sly, teasing chatter.',
        relationshipToUser: 'Always sneaking near your study table',
        portrait: '/src/assets/images/aarav_friend_portrait_1795516089434.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'pooja_librarian',
        name: 'Pooja Ma’am',
        age: '34',
        role: 'Strict Library In-Charge',
        personality: 'Silences anyone who whispers louder than a page turn.',
        speakingStyle: 'Sharp shushing.',
        relationshipToUser: 'Threatening to kick you both out',
        portrait: '/src/assets/images/maya_counselor_portrait_1795516090021.jpg',
        accentColor: '#64748B',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Crush', emoji: '🎙️', initialValue: 30, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Secret Trust', emoji: '🤫', initialValue: 45, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'North Campus Library Balcony — Mic Badge Slip',
    playGuide: {
      hinglish: 'Senior Disha ka RJ secret bachao, unse padhai ke bahane pyaar badhao 🎙️❤️',
      hindi: 'सीनियर दिशा का आरजे सीक्रेट बचाओ, पढ़ाई के बहाने प्यार बढ़ाओ 🎙️❤️',
      english: 'Keep Disha’s midnight radio identity safe and turn late-night study sessions into romance 🎙️❤️',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Dhoop library ki lakdi wali table par pad rahi hai. Disha ke bag se achanak ek chhota brass podcast mic girta hai—woh jaldi se tumhare saamne jhuk kar apni ungli hothon par rakh leti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Disha Sharma',
          text: 'Shhh! Kunal theek saamne baitha hai! Haan, main hi hoon 11 PM wali RJ... par agar ek shabd bhi bahar nikla na, toh exam ke notes bhool jaana aur mujhe "Didi" bolna bhi band karo!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'लाइब्रेरी की मेज़ पर सुनहरी धूप पड़ रही है। तभी दिशा के बैग से एक छोटा माइक्रोफोन गिरता है—वह घबराकर होठों पर उंगली रख लेती है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Disha Sharma',
          text: 'श्श्श! कुणाल ठीक सामने बैठा है! हाँ, रात 11 बजे वाली आरजे मैं ही हूँ... लेकिन अगर किसी को पता चला तो नोट्स भूल जाना, और हाँ—अब से "दीदी" मत बोलना!',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Golden sunset spills across stacked history books as a gleaming podcast mic slips from Disha’s tote. She presses a finger swiftly to her lips, leaning close.',
        },
        {
          type: 'dialogue',
          speakerName: 'Disha Sharma',
          text: 'Shhh! Kunal is three tables away! Fine—yes, I’m the Midnight RJ... breathe a word of this to anyone and you can forget my exam notes—and stop calling me "Didi"!',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Tease karo: "Theek hai RJ Sahiba, ab mujhe bhi toh show par dedicated shayari milegi na?"',
        'Mic chhupa kar bag mein rakho: "Raaz safe hai—badle mein ek cold coffee chalegi?"',
        'Muskurate hue: "Waise aapki aawaz radio par jitni meethi hai, paas se aur bhi kamaal hai."',
      ],
      hindi: [
        'छेड़ो: "ठीक है आरजे साहिबा, आज रात शो में मेरे नाम का गाना बजाओगी ना?"',
        'माइक बैग में छिपाओ: "राज़ सुरक्षित है—अब शाम की कॉफी पक्की समझूँ?"',
        'मुस्कुराओ: "आज से ‘दीदी’ नहीं, सिर्फ़ दिशा बोलूँ तो चलेगा?"',
      ],
      english: [
        'Grin back: "Secret’s safe, RJ Disha—only if you dedicate tonight’s song to me."',
        'Hide the mic under your notebook: "Deal. Now how about iced coffee after closing?"',
        'Tease softly: "I much prefer dropping the ‘Didi’ anyway."',
      ],
    },
    possibleEndings: ['Co-Hosting Midnight Show Together', 'North Campus Sunset Confession'],
  },

  // 34. Mughal Darbar: Taj Ki Sazish
  {
    id: 'sultanat_e_ishq',
    title: 'Mughal Darbar: Taj Ki Sazish',
    tagline: '17th century Agra ke shahi jharokhe par ishq, gupt farmaan aur talwaron ka saya.',
    about:
      'Inside 17th-century Agra Fort overlooking the Yamuna, brilliant royal calligrapher Mehrunnisa intercepts a forged palace assassination decree. As her sworn envoy, you must unmask ruthless commander Dilawar before the Emperor’s midnight court convenes.',
    primaryCategory: 'Historical',
    categories: ['For You', 'New', 'Historical', 'Drama', 'Romance'],
    tags: ['Roleplay', 'Mughal Era', 'Palace Intrigue'],
    visualStyle: 'Mughal Twilight Cinema',
    rating: 4.8,
    chatCountLabel: '138.4K',
    chatCountNumeric: 138400,
    isNew: true,
    coverImage: '/src/assets/images/cover_mughal_darbar_1795801806603.jpg',
    mediaGallery: [
      {
        id: 'md_1',
        url: '/src/assets/images/cover_mughal_darbar_1795801806603.jpg',
        caption: 'Yamuna ke kinare shaam dhalte hi Mehrunnisa ne gupt farmaan tumhare haathon mein saunp diya.',
      },
    ],
    setting: 'Carved red-sandstone balcony inside Agra Fort overlooking Yamuna river at twilight',
    characters: [
      {
        id: 'mehrunnisa_scribe',
        name: 'Mehrunnisa Begum',
        age: '22',
        role: 'Imperial Calligrapher',
        personality: 'Graceful, razor-sharp intellect, brave enough to defy palace conspirators.',
        speakingStyle: 'Poetic Hindustani-Urdu elegance.',
        relationshipToUser: 'Entrusted her life and secret scroll to you',
        portrait: '/src/assets/images/mehr_princess_portrait_1795516145467.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'dilawar_commander',
        name: 'Senapati Dilawar',
        age: '38',
        role: 'Corrupt Garrison Chief',
        personality: 'Cold conspirator orchestrating a coup inside the Red Fort.',
        speakingStyle: 'Icy, menacing authority.',
        relationshipToUser: 'Hunting whoever stole the scroll',
        portrait: '/src/assets/images/zafar_wazir_portrait_1795516148205.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'kavi_faiz',
        name: 'Shayar Faiz',
        age: '29',
        role: 'Royal Court Poet',
        personality: 'Observant confidant passing coded ghazals between corridors.',
        speakingStyle: 'Clever rhyming metaphors.',
        relationshipToUser: 'Keeps watch outside the darbar arch',
        portrait: '/src/assets/images/arjun_warrior_portrait_1795516087468.jpg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Ishq', emoji: '🌹', initialValue: 22, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Shahi Honor', emoji: '📜', initialValue: 45, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'Agra Fort Balcony — Intercepted Decree',
    playGuide: {
      hinglish: 'Mehrunnisa ke saath shahi sazish nakaam karo aur farz se upar ishq ka raasta chuno 📜🌹',
      hindi: 'मेहरुन्निसा के साथ शाही साज़िश नाकाम करो और फ़र्ज़ व इश्क़ की परीक्षा जीतो 📜🌹',
      english: 'Protect Mehrunnisa and expose the Red Fort conspiracy before the midnight court begins 📜🌹',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Yamuna nadi par suraj dhal raha hai aur peeche shahi mashalon ki roshni mein Mehrunnisa sunehre kaghaz par shahi mohar dekh kar kaamp uthti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Mehrunnisa Begum',
          text: 'Yeh shahi farmaan jhootha hai... Senapati Dilawar aaj raat Badshah ke khilaaf bagawat karne wala hai. Kya aap mere saath apni jaan daav par lagayenge?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'यमुना तट पर सूरज ढल रहा है और मशालों के बीच मेहरुन्निसा एक शाही फ़रमान देखकर सिहर उठती हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Mehrunnisa Begum',
          text: 'यह शाही मुहर नकली है... सेनापति दिलावर आज रात तख़्त पलटने वाले हैं। क्या आप मेरे साथ इस साज़िश को रोकेंगे?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'As dusk settles across the Yamuna, brass oil lamps illuminate Mehrunnisa’s trembling hands clutching an unsealed imperial parchment.',
        },
        {
          type: 'dialogue',
          speakerName: 'Mehrunnisa Begum',
          text: 'This seal is forged... Commander Dilawar plans to strike inside the Diwan-i-Khas tonight. Will you stand beside me and risk everything?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Talwar ki muth par haath rakho: "Jab tak saans hai, aapko aur is farmaan ko kuch nahi hoga."',
        'Shayar Faiz ko gupt darwaze par sandesh bhejne ka ishaara karo',
        'Unki aankhon mein dekho: "Aap hukum kijiye, par pehle wada karein khud ko khatre mein nahi dalengi."',
      ],
      hindi: [
        'तलवार की मूठ थामो: "मेरी जान रहते आप पर कोई आँच नहीं आएगी।"',
        'फ़ैज़ को गुप्त संदेश लेकर दीवान-ए-ख़ास भेजो',
        'विनम्रता से कहो: "आदेश दें, पर स्वयं महफूज़ रहें।"',
      ],
      english: [
        'Rest a steady hand on your hilt: "Not a shadow will touch you tonight, Mehrunnisa."',
        'Signal Poet Faiz to slip word toward the royal guard',
        'Look earnestly into her eyes: "Tell me your plan—only promise you’ll stay behind me."',
      ],
    },
    possibleEndings: ['Saved the Throne & Won Her Heart', 'Escape Down the Yamuna Boats'],
  },

  // 35. Manali School Trip
  {
    id: 'school_trip_manali',
    title: 'Manali School Trip ❄️',
    tagline: 'Snowfall mein atka wooden chalet, bonfire aur farewell trip ka pehla ishq!',
    about:
      'Snowed in at a cozy Manali wooden chalet on your final school farewell trip, late-night bonfire Truth-or-Dare sparks butterflies between you and secret crush Kriti—while loud buddy Aman and strict PT Sir Rawat keep turning up the chaos.',
    primaryCategory: 'School',
    categories: ['For You', 'New', 'School', 'Romance', 'Adventure'],
    tags: ['Roleplay', 'Winter Trip', 'First Love'],
    visualStyle: 'Snowy Bonfire DSLR',
    rating: 4.9,
    chatCountLabel: '188.9K',
    chatCountNumeric: 188900,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_manali_trip_1795801806845.jpg',
    mediaGallery: [
      {
        id: 'mst_1',
        url: '/src/assets/images/cover_manali_trip_1795801806845.jpg',
        caption: 'Bonfire ki garmahat mein laal cap pehne Kriti tumhari taraf dekh kar khilkhila uthi.',
      },
    ],
    setting: 'Snow-covered wooden mountain chalet courtyard around a crackling orange bonfire in Manali',
    characters: [
      {
        id: 'kriti_crush',
        name: 'Kriti Mehra',
        age: '18',
        role: 'Sweet Secret Crush',
        personality: 'Cheerful, warm-hearted, blushes furiously whenever Truth-or-Dare points her way.',
        speakingStyle: 'Cute, lively school Hinglish.',
        relationshipToUser: 'Sat next to you the whole bus ride up the mountains',
        portrait: '/src/assets/images/riya_school_portrait_1795516147210.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'aman_buddy',
        name: 'Aman Verma',
        age: '18',
        role: 'Chaotic Best Friend',
        personality: 'Always invents daring Truth-or-Dare questions to set you and Kriti up.',
        speakingStyle: 'Hilarious teasing bro-talk.',
        relationshipToUser: 'Your wingman turning the bonfire into a romance trap',
        portrait: '/src/assets/images/kabir_school_portrait_1795516205977.jpg',
        accentColor: '#38BDF8',
      },
      {
        id: 'rawat_sir',
        name: 'PT Sir Rawat',
        age: '44',
        role: 'Strict Trip Chaperone',
        personality: 'Whistle-blowing chaperone enforcing 10 PM curfew.',
        speakingStyle: 'Loud, comical discipline.',
        relationshipToUser: 'Checks cabins with a flashlight',
        portrait: '/src/assets/images/shinde_officer_portrait_1795516149253.jpg',
        accentColor: '#F59E0B',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'First Crush', emoji: '❄️', initialValue: 32, min: 0, max: 100, tone: 'love' },
      { id: 'friendship', label: 'Squad Fun', emoji: '🔥', initialValue: 70, min: 0, max: 100, tone: 'friendship' },
    ],
    openingScene: 'Manali Chalet Bonfire — Truth or Dare Spin',
    playGuide: {
      hinglish: 'Snowfall aur bonfire ke beech Kriti se apne dil ki baat kaho — aakhri school trip yaadgar banao ❄️🔥',
      hindi: 'बर्फ़बारी और बॉनफायर के बीच कृति से दिल की बात कहो — स्कूल ट्रिप यादगार बनाओ ❄️🔥',
      english: 'Confess during midnight Truth-or-Dare before the farewell snowfall melts away ❄️🔥',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Chalet ke bahar taazi barf gir rahi hai aur aag ke paas baithi Kriti apne haathon mein garam coffee mug pakde has rahi hai. Aman bottle ghumata hai—aur bottle seedha tumhari taraf rukti hai!',
        },
        {
          type: 'dialogue',
          speakerName: 'Aman Verma',
          text: 'Oye hoye! Bottle ruk gayi bhai par! Chal bata—agar aaj raat barf mein kisi ek ke saath walk pe jaana ho, toh kiska naam lega? Sacchai bolna, Kriti bhi sun rahi hai!',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'बर्फ़बारी के बीच लकड़ी की कुटिया के बाहर आग जल रही है। अमन ने बोतल घुमाई और वह सीधे तुम्हारी तरफ़ आकर रुकी!',
        },
        {
          type: 'dialogue',
          speakerName: 'Aman Verma',
          text: 'ओये होये! आज तो भाई फँस गया! सच बता—आज रात इस बर्फ़ में किसके साथ वॉक पर जाना चाहेगा?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Snowflakes drift past the glowing bonfire where Kriti sits laughing over hot cocoa. Aman spins the bottle—and it slows to a dead stop pointing straight at you.',
        },
        {
          type: 'dialogue',
          speakerName: 'Aman Verma',
          text: 'Jackpot! Truth time, buddy—if you could steal one person away for a snowy midnight walk tonight, who’s it gonna be?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Seedha Kriti ki aankhon mein dekho: "Jiske chehre par laal cap sabse pyaari lag rahi hai."',
        'Has kar dare maango: "Truth chhodo, Kriti ke saath ek duet song gaa kar dikhata hoon!"',
        'Kriti ke paas apna mug badhao: "Jisko thand sabse zyada lag rahi ho."',
      ],
      hindi: [
        'सीधे कृति को देखो: "जिसके चेहरे पर यह लाल टोपी सबसे प्यारी लग रही है।"',
        'हँसकर कहो: "डेयर दो, मैं कृति के साथ एक गाना गाऊँगा!"',
        'शरारत से मुस्कुराओ: "नाम लेने की ज़रूरत नहीं, सब जानते हैं।"',
      ],
      english: [
        'Look straight at Kriti: "The girl wearing the cutest red beanie around this fire."',
        'Laugh it off boldly: "Give me a Dare instead—I’ll sing a duet with Kriti!"',
        'Smile warmly toward Kriti: "Someone sitting right across from me with warm cocoa."',
      ],
    },
    possibleEndings: ['Snowfall Confession Under Pines', 'Sunrise Bus Ride Home Together'],
  },

  // 36. Kashi Ke Rakshak
  {
    id: 'demon_slayer_kashi',
    title: 'Kashi Ke Rakshak',
    tagline: 'Varanasi ke ghaaton par grahan ki raat jaagi divya shaktiyan aur asuron ka saaya!',
    about:
      'During a rare solar-midnight eclipse on the ancient ghats of Varanasi, immortal guardian warrior Rudrani rescues young scholar Madhav and awakens your hidden spiritual flame just as shadow-asura Kaalbhairav rises from the misty Ganga.',
    primaryCategory: 'Mythology',
    categories: ['For You', 'New', 'Mythology', 'Anime', 'Supernatural'],
    tags: ['Roleplay', 'Mythology', 'Dark Fantasy'],
    visualStyle: 'Mythic Varanasi Realism',
    rating: 4.9,
    chatCountLabel: '164.5K',
    chatCountNumeric: 164500,
    isNew: true,
    coverImage: '/src/assets/images/arjun_warrior_portrait_1795516087468.jpg',
    mediaGallery: [
      {
        id: 'kkr_1',
        url: '/src/assets/images/arjun_warrior_portrait_1795516087468.jpg',
        caption: 'Ganga ghat ki seedhiyon par Rudrani ka chamakta trishul neeli aag ugal raha hai.',
      },
    ],
    setting: 'Ancient stone steps of Dashashwamedh Ghat in Varanasi under an eerie celestial eclipse',
    characters: [
      {
        id: 'rudrani_warrior',
        name: 'Rudrani',
        age: 'Immortal',
        role: 'Celestial Ghat Protector',
        personality: 'Fierce, luminous warrior who fought for centuries alone until your aura resonated with hers.',
        speakingStyle: 'Commanding, mythic, heroic Hindi-Hinglish.',
        relationshipToUser: 'Sworn guardian choosing you as her mortal anchor',
        portrait: '/src/assets/images/devika_royal_portrait_1795516087327.jpg',
        accentColor: '#38BDF8',
      },
      {
        id: 'madhav_astrologer',
        name: 'Madhav Joshi',
        age: '21',
        role: 'Young Sanskrit Scholar',
        personality: 'Brilliant manuscript decoder terrified yet loyal under pressure.',
        speakingStyle: 'Urgent, scholarly chatter.',
        relationshipToUser: 'Deciphering the ancient sealing mantra beside you',
        portrait: '/src/assets/images/aarav_friend_portrait_1795516089434.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'kaalbhairav_asura',
        name: 'Asura Vritra',
        age: 'Ancient',
        role: 'Eclipse Shadow Demon',
        personality: 'Cunning dark entity emerging from submerged ghat ruins.',
        speakingStyle: 'Deep echoing intimidation.',
        relationshipToUser: 'Hunting the relic around your neck',
        portrait: '/src/assets/images/bhairav_shrine_portrait_1795516147050.jpg',
        accentColor: '#E5233D',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Divya Bond', emoji: '🔱', initialValue: 40, min: 0, max: 100, tone: 'trust' },
      { id: 'respect', label: 'Valor', emoji: '🔥', initialValue: 35, min: 0, max: 100, tone: 'respect' },
    ],
    openingScene: 'Varanasi Ghats — Celestial Eclipse Rise',
    playGuide: {
      hinglish: 'Rudrani ke saath Kashi ki raksha karo aur grahan ki kaali shaktiyon ko Ganga mein wapas bhejo 🔱🔥',
      hindi: 'रुद्राणी के साथ काशी की रक्षा करो और ग्रहण की काली शक्तियों को परास्त करो 🔱🔥',
      english: 'Wield your awakened spirit flame alongside Rudrani to defend Varanasi under the eclipse 🔱🔥',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Mandir ke ghante apne aap bajne lage hain aur Ganga ki lehron se neela dhuaan uth raha hai. Rudrani apne sunehre trishul ke saath tumhare aage khadi ho jaati hain.',
        },
        {
          type: 'dialogue',
          speakerName: 'Rudrani',
          text: 'Madhav, mantra padhna mat rokna! Aur tum—haath mein diya uthao, tumhare andar ka tej abhi jaaga hai. Mere saath kadam milane ko taiyaar ho?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'मंदिर के घंटे अपने आप बज उठे हैं और गंगा की लहरों से नीला धुआँ उठ रहा है। रुद्राणी अपने दमकते त्रिशूल के साथ तुम्हारे आगे खड़ी हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Rudrani',
          text: 'माधव, मंत्र पढ़ना जारी रखो! और तुम—तुम्हारे भीतर की दिव्य ज्वाला अभी जागी है। क्या मेरे साथ युद्ध करने को तैयार हो?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Bronze temple bells toll on their own as sapphire spirit flames erupt around Rudrani’s golden trident along the misty Varanasi ghats.',
        },
        {
          type: 'dialogue',
          speakerName: 'Rudrani',
          text: 'Keep chanting the seal, Madhav! And you—that ancient light inside your chest just awakened. Will you stand beside me before the shadow rises?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Agni diya hawa mein uthao: "Kashi par aanch nahi aane dunga, Rudrani!"',
        'Madhav ke patra padho taaki Asura ki kamzori mile',
        'Rudrani ki neeli aag se apni shakti jodo',
      ],
      hindi: [
        'दीया ऊपर उठाओ: "काशी पर आँच नहीं आने दूँगा, रुद्राणी!"',
        'माधव के पन्नों से असुर की कमज़ोरी खोजो',
        'अपनी आध्यात्मिक ऊर्जा रुद्राणी के त्रिशूल से जोड़ो',
      ],
      english: [
        'Raise the consecrated flame: "Varanasi won’t fall tonight—I stand with you, Rudrani!"',
        'Scan Madhav’s Sanskrit scroll for the shadow’s true name',
        'Channel your newly awakened pulse straight toward Rudrani’s trident',
      ],
    },
    possibleEndings: ['Eclipse Broken at Dawn', 'Eternal Guardians of Kashi'],
  },

  // 37. Midnight ICU: Secret Code
  {
    id: 'undercover_doctor',
    title: 'Midnight ICU: Secret Code',
    tagline: 'Raat 2 baje ICU Ward 4 ke peeche chhupa ek khatarnaak medical scam!',
    about:
      'During a chaotic 2 AM night shift at Mumbai’s most prestigious private hospital, fearless resident Dr. Naina discovers falsified donor charts linked to Chief Surgeon Dr. Malhotra. With loyal nurse Shreya watching the hall, can you smuggle the files out alive?',
    primaryCategory: 'Thriller',
    categories: ['For You', 'New', 'Thriller', 'Crime', 'Drama'],
    tags: ['Roleplay', 'Medical Thriller', 'Hospital Suspense'],
    visualStyle: 'Neon Hospital Suspense',
    rating: 4.8,
    chatCountLabel: '124.7K',
    chatCountNumeric: 124700,
    isNew: true,
    coverImage: '/src/assets/images/cover_midnight_icu_1795801807552.jpg',
    mediaGallery: [
      {
        id: 'micu_1',
        url: '/src/assets/images/cover_midnight_icu_1795801807552.jpg',
        caption: 'ICU 04 ke bahar Dr. Naina ne chupke se file tumhe thamaate hue kaha: "CCTV band hone mein 2 minute bache hain!"',
      },
    ],
    setting: 'Silent cyan-lit ICU corridor of Apex Specialty Hospital, Mumbai at 2:10 AM',
    characters: [
      {
        id: 'dr_naina',
        name: 'Dr. Naina Kulkarni',
        age: '26',
        role: 'Senior Surgical Resident',
        personality: 'Brilliant, compassionate, furious at hospital corruption, refuses to stay silent.',
        speakingStyle: 'Urgent, sharp medical Hinglish.',
        relationshipToUser: 'Trusted fellow resident risking her career beside you',
        portrait: '/src/assets/images/maya_counselor_portrait_1795516090021.jpg',
        accentColor: '#06B6D4',
      },
      {
        id: 'dr_malhotra',
        name: 'Dr. Malhotra',
        age: '50',
        role: 'Corrupt Chief of Surgery',
        personality: 'Silky, ruthless administrator who eliminates whistleblowers.',
        speakingStyle: 'Calm veiled threats.',
        relationshipToUser: 'Approaching the elevator toward ICU-04',
        portrait: '/src/assets/images/sanjay_broker_portrait_1795516089945.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'nurse_shreya',
        name: 'Nurse Shreya',
        age: '25',
        role: 'Night-Duty ICU Nurse',
        personality: 'Loyal, quick-thinking ally guiding patients to safety.',
        speakingStyle: 'Whispered ward alerts.',
        relationshipToUser: 'Keeping guard at the nurses station',
        portrait: '/src/assets/images/roshni_flatmate_portrait_1795516088415.jpg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Evidence Safe', emoji: '🩺', initialValue: 35, min: 0, max: 100, tone: 'trust' },
      { id: 'fear', label: 'Risk Level', emoji: '🚨', initialValue: 50, min: 0, max: 100, tone: 'fear' },
    ],
    openingScene: 'ICU 04 Glass Door — Stolen Donor Ledger',
    playGuide: {
      hinglish: 'Dr. Naina ke saath sachai bahar lao, Dr. Malhotra ke jaal se bach kar niklo 🩺🚨',
      hindi: 'डॉ. नैना के साथ सच्चाई सामने लाओ और डॉ. मल्होत्रा के जाल से सुरक्षित निकलो 🩺🚨',
      english: 'Expose the illegal donor ring with Dr. Naina before Dr. Malhotra locks down the night floor 🩺🚨',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'ICU Ward 4 ke bahar neeli emergency light farsh par chamak rahi hai. Dr. Naina jaldi se ek moti brown file tumhare lab coat ke neeche chhupa kar paas jhukti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Dr. Naina Kulkarni',
          text: 'Lift ka number dekho—Dr. Malhotra upar aa rahe hain! In papers mein 14 patients ke fake blood records hain. Basement exit se niklein ya ICU ke andar patient ko bachayein?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'आईसीयू वार्ड 4 के बाहर नीली रोशनी चमक रही है। डॉ. नैना जल्दी से एक भूरे रंग की फाइल तुम्हारे कोट के नीचे छिपा देती हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Dr. Naina Kulkarni',
          text: 'लिफ्ट का नंबर देखो—डॉ. मल्होत्रा ऊपर आ रहे हैं! इन कागज़ों में 14 मरीज़ों के फर्जी रिकॉर्ड हैं। बेसमेंट से निकलें या मरीज़ को बचाएँ?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Cold cyan light reflects down the deserted ICU corridor as Dr. Naina quickly slips a thick manila dossier against your chest.',
        },
        {
          type: 'dialogue',
          speakerName: 'Dr. Naina Kulkarni',
          text: 'Look at the elevator—Dr. Malhotra is coming up! That folder proves fourteen falsified donor charts. Do we bolt for the basement stairs or save Patient 4 first?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Phone se turant sabhi pages ki photo cloud par upload karo aur Shreya ko alert bhejo',
        'Dr. Naina ka haath pakdo: "Pehle Patient 4 ka chart check karenge, phir bhaagenge."',
        'Stairwell ki taraf badho: "Malhotra ka dhyaan bhatkane ka plan mere paas hai."',
      ],
      hindi: [
        'तुरंत फोन से हर पन्ने की फोटो खींचकर बैकअप भेजो',
        'नैना से कहो: "पहले मरीज़ की जान, फिर भागेंगे।"',
        'सीढ़ियों की तरफ़ चलो: "मल्होत्रा को मैं सँभाल लूँगा।"',
      ],
      english: [
        'Snap instant encrypted photos of every page to upload before moving',
        'Squeeze Naina’s shoulder: "Check Patient 4’s drip first—we don’t leave anyone behind."',
        'Guide her toward the fire stairs: "Follow me—I know a blind spot on the cameras."',
      ],
    },
    possibleEndings: ['Press Conference Triumph', 'Midnight Chase Through Rain'],
  },

  // 38. Arranged Marriage: Pehli Baarish
  {
    id: 'shaadi_ke_baad_pyar',
    title: 'Arranged Marriage: Pehli Baarish',
    tagline: 'Shaadi ke teesre din Jaipur ki chhat par do anjaan dilon ki pehli mulaqat...',
    about:
      'Three days after a whirlwind arranged marriage in Jaipur, shy watercolor artist Mahi still barely looks you in the eye. Over morning masala chai on the sandstone balcony during soft rain—while cheerful sister-in-law Ritu and strict Bua Ji keep the house lively—watch strangers slowly turn into soulmates.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Romance', 'Drama'],
    tags: ['Roleplay', 'Arranged Marriage', 'Slow Burn'],
    visualStyle: 'Jaipur Rainy Heritage',
    rating: 4.9,
    chatCountLabel: '192.0K',
    chatCountNumeric: 192000,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_arranged_marriage_1795801806341.jpg',
    mediaGallery: [
      {
        id: 'skbp_1',
        url: '/src/assets/images/cover_arranged_marriage_1795801806341.jpg',
        caption: 'Halki baarish mein mehendi wale haathon aur kullhad chai ke saath Mahi pehli baar khul kar muskurayi.',
      },
    ],
    setting: 'Sandstone haveli balcony overlooking pink Jaipur rooftops in gentle monsoon drizzle',
    characters: [
      {
        id: 'mahi_wife',
        name: 'Mahi Rathore',
        age: '23',
        role: 'Shy Newlywed Artist',
        personality: 'Gentle, deeply observant, hesitant around an unfamiliar husband yet melts completely at genuine patience and warmth.',
        speakingStyle: 'Soft, polite Rajasthani-Hinglish.',
        relationshipToUser: 'Your shy new wife learning to trust you day by day',
        portrait: '/src/assets/images/kiara_bride_portrait_1795516146637.jpg',
        accentColor: '#FB7185',
      },
      {
        id: 'ritu_sister',
        name: 'Ritu',
        age: '21',
        role: 'Playful Younger Sister',
        personality: 'Cheeky sister always teasing you both and hiding your shoes or phones.',
        speakingStyle: 'Bubbly teasing.',
        relationshipToUser: 'Constantly checking if you made Mahi smile',
        portrait: '/src/assets/images/priya_coaching_portrait_1795616640809.jpg',
        accentColor: '#38BDF8',
      },
      {
        id: 'bua_ji',
        name: 'Bua Ji',
        age: '58',
        role: 'Traditional Aunt',
        personality: 'Strict elder full of old customs who unexpectedly softens at sincere respect.',
        speakingStyle: 'Warm yet dramatic family scoldings.',
        relationshipToUser: 'Watching how well you care for Mahi',
        portrait: '/src/assets/images/kavita_mother_portrait_1795516091317.jpg',
        accentColor: '#F59E0B',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Affection', emoji: '❤️', initialValue: 24, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Comfort', emoji: '☕', initialValue: 38, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'Jaipur Balcony — First Morning Rain Together',
    playGuide: {
      hinglish: 'Mahi ki jhijhak pyaar aur sabr se door karo — dekho yeh arranged rishta kab sacha pyaar banta hai ❤️☕',
      hindi: 'माही की झिझक प्यार और अपनेपन से दूर करो — देखो यह रिश्ता कब सच्चा प्रेम बनता है ❤️☕',
      english: 'Earn shy Mahi’s smile through quiet patience, shared chai, and heartfelt care ❤️☕',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Peach colour ki saree aur haathon mein gehri mehendi liye Mahi balcony par khadi baarish dekh rahi hai. Jab tum do kullhad adrak chai lekar aate ho, toh woh halki si chauk kar muskurati hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Mahi Rathore',
          text: 'Aapne khud chai banayi? Ghar mein sab so rahe hain na... mujhe laga shayad aap abhi tak mujhse thode uncomfortable honge.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'पीच साड़ी और हाथों में गहरी मेहँदी रचाए माही बालकनी में बारिश निहार रही हैं। तुम्हें दो कुल्हड़ चाय लाते देख वह हल्का-सा चौंक कर मुस्कुराती हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Mahi Rathore',
          text: 'आपने खुद चाय बनाई? मुझे लगा शायद इस नई शादी में आप अभी तक थोड़ा संकोच कर रहे होंगे...',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Dressed in pastel peach silk with deep henna still fresh across her palms, Mahi turns gently on the rainy balcony as you bring out two steaming clay cups of masala chai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Mahi Rathore',
          text: 'You made chai yourself this early? I honestly thought... maybe you were still feeling awkward around me after the wedding.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Kullhad badhao aur softly bolo: "Shaadi arranged zaroor thi Mahi, par dosti toh hum khud kar sakte hain na?"',
        'Chudi aur mehendi ki taraf dekho: "Tumhara naam abhi tak dhundh raha hoon apni mehendi mein."',
        'Railing par baitho: "Agar tumhe waqt chahiye toh poori zindagi intezaar karunga—bas chai saath pee lo."',
      ],
      hindi: [
        'कुल्हड़ बढ़ाओ: "शादी भले घरवालों ने तय की हो, लेकिन दोस्ती तो हम खुद कर सकते हैं ना?"',
        'मुस्कुराओ: "बस एक मुस्कान दे दो, सारी झिझक दूर हो जाएगी।"',
        'प्यार से कहो: "कोई जल्दी नहीं है माही—जब मन करे, तब दिल खोलना।"',
      ],
      english: [
        'Hand over the warm cup gently: "Our marriage may have been arranged, Mahi—but becoming best friends is completely up to us."',
        'Smile warmly at her henna: "Give me a chance to make mornings like this your favorite part of the day."',
        'Lean calmly beside her: "Take all the time you need—I’m not going anywhere."',
      ],
    },
    possibleEndings: ['Jaipur Rooftop Love Confession', 'Art Studio Dream Together'],
  },

  // 39. Seoul Spotlight: Hidden Heart
  {
    id: 'kpop_idol_secret',
    title: 'Seoul Spotlight: Hidden Heart',
    tagline: '60,000 fans ke shor ke peeche ek superstar ka chhupa hua pyaar!',
    about:
      'During the final concert night at Seoul Olympic Stadium, global idol Hae-won slips behind the velvet backstage curtain straight into your arms—your secret sound producer sanctuary—while strict Manager Park and jealous co-star Min-ji search every hallway.',
    primaryCategory: 'Drama',
    categories: ['For You', 'New', 'Drama', 'Romance'],
    tags: ['Roleplay', 'Idol Secret', 'Backstage Romance'],
    visualStyle: 'Seoul Stadium Backstage',
    rating: 4.8,
    chatCountLabel: '169.3K',
    chatCountNumeric: 169300,
    isNew: true,
    coverImage: '/src/assets/images/cover_seoul_spotlight_1795801806662.jpg',
    mediaGallery: [
      {
        id: 'ssh_1',
        url: '/src/assets/images/cover_seoul_spotlight_1795801806662.jpg',
        caption: 'Spotlight ke peeche parde ke saaye mein Hae-won ne tumhare kaan mein aakhri encore se pehle kuch kaha.',
      },
    ],
    setting: 'Velvet backstage wing of a roaring sold-out Seoul stadium during concert encore',
    characters: [
      {
        id: 'haewon_idol',
        name: 'Jang Hae-won',
        age: '23',
        role: 'Global K-Pop Star',
        personality: 'Dazzling on stage yet deeply lonely off-camera; drops every mask the second she hears your voice.',
        speakingStyle: 'Breathless, affectionate English/Hinglish.',
        relationshipToUser: 'Secretly writing love tracks only for you',
        portrait: '/src/assets/images/yours_samaira_chauhan_1795804225638.jpg',
        accentColor: '#EC4899',
      },
      {
        id: 'manager_park',
        name: 'Manager Park',
        age: '42',
        role: 'Strict Agency Director',
        personality: 'Enforces the zero-dating clause ruthlessly.',
        speakingStyle: 'Clipped walkie-talkie orders.',
        relationshipToUser: 'Would fire you immediately if he sees you two close',
        portrait: '/src/assets/images/shinde_officer_portrait_1795516149253.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'minji_costar',
        name: 'Min-ji',
        age: '22',
        role: 'Rival Vocalist',
        personality: 'Knows something is brewing backstage and loves creating PR rumors.',
        speakingStyle: 'Sweetly poisoned curiosity.',
        relationshipToUser: 'Spying behind the soundboard',
        portrait: '/src/assets/images/sana_campus_portrait_1795516088958.jpg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Secret Heart', emoji: '🎤', initialValue: 35, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Privacy', emoji: '🔒', initialValue: 40, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'Velvet Backstage Curtain — 60 Seconds Before Encore',
    playGuide: {
      hinglish: 'Paparazzi aur Manager Park se apna secret romance bachao — backstage encore ko yaadgar banao 🎤💙',
      hindi: 'कैमरों और मैनेजर पार्क से अपना सीक्रेट रिश्ता बचाओ — बैकस्टेज मोमेंट को खास बनाओ 🎤💙',
      english: 'Keep your secret backstage romance hidden from cameras and Manager Park during the encore 🎤💙',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Stadium ke bahar hazaaron fans chillaa rahe hain. Chamakti jacket mein Hae-won parde ke peeche bhaag kar aati hai aur tumhare headphones ke paas ruk kar haanf rahi hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Jang Hae-won',
          text: 'Encore shuru hone mein sirf ek minute hai... Manager Park har jagah dhoondh raha hai. Bas ek second mera haath pakad lo—varna stage par wapas jaane ki himmat nahi hogi.',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'स्टेडियम में हज़ारों फैंस शोर मचा रहे हैं। चमकती जैकेट में हे-वॉन पर्दे के पीछे आकर तुम्हारे ठीक सामने रुकती हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Jang Hae-won',
          text: 'आख़िरी परफॉर्मेंस में बस एक मिनट बाकी है... मैनेजर पार्क हर तरफ़ ढूँढ रहे हैं। बस पल भर मेरा हाथ थाम लो—ताकि हिम्मत मिल जाए।',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Sixty thousand fans chant outside the velvet curtain as Hae-won slips backstage in sparkling stage lights, breathless and reaching for your sleeve.',
        },
        {
          type: 'dialogue',
          speakerName: 'Jang Hae-won',
          text: 'Sixty seconds until the encore... Manager Park is checking every corridor. Hold my hand for just three seconds—I can’t go back out there without you.',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Uska haath kas kar thamo aur fusfusao: "Poora stadium sirf meri sunne wali awaaz ka deewana hai—jaao chha jaao!"',
        'Soundboard ke peeche chhipne ka ishaara karo jab Manager Park aawaz de',
        'Kaan mein ear-monitor lagate hue: "Encore ke baad seedha rooftop car par milna."',
      ],
      hindi: [
        'हाथ थामो: "जाओ स्टेज पर छा जाओ—मैं यहीं तुम्हारे लिए इंतज़ार कर रहा हूँ।"',
        'मैनेजर के आते ही जल्दी से साउंड डेस्क के पीछे इशारा करो',
        'धीरे से बोलो: "शो के बाद सीधे रूफटॉप पर मिलना।"',
      ],
      english: [
        'Interlace your fingers briefly: "Go own that stage—I’m watching every second from right here."',
        'Pull her behind the sound racks before Manager Park’s flashlight swings past',
        'Adjust her earpiece with a whisper: "Meet me at the private elevator right after the final bow."',
      ],
    },
    possibleEndings: ['Midnight Escape Over Han River', 'Secret Duet Album Together'],
  },

  // 40. Bastar Ka Rahasya
  {
    id: 'jungle_expedition_bastar',
    title: 'Bastar Ka Rahasya',
    tagline: 'Chhattisgarh ke ghane jangalon mein khoya ek 1000 saal purana emerald khazana!',
    about:
      'Deep inside misty Bastar rainforest ruins, archaeologist Kiara hires you—an expedition survival specialist—to locate an ancient emerald crown using her grandfather’s compass, while suspicious guide Raghu and forest guardian Somnath guard deadly secrets.',
    primaryCategory: 'Adventure',
    categories: ['For You', 'New', 'Adventure', 'Thriller'],
    tags: ['Roleplay', 'Jungle Expedition', 'Lost Temple'],
    visualStyle: 'Emerald Rainforest Cinema',
    rating: 4.8,
    chatCountLabel: '131.5K',
    chatCountNumeric: 131500,
    isNew: true,
    coverImage: '/src/assets/images/cover_bastar_rahasya_1795801807306.jpg',
    mediaGallery: [
      {
        id: 'bkr_1',
        url: '/src/assets/images/cover_bastar_rahasya_1795801807306.jpg',
        caption: 'Ghane jangal ke patharile mandir mein Kiara ka brass compass achanak gol ghumne laga!',
      },
    ],
    setting: 'Sunbeam-pierced moss ruins deep inside Chhattisgarh rainforest',
    characters: [
      {
        id: 'kiara_explorer',
        name: 'Kiara Rao',
        age: '24',
        role: 'Fearless Archaeologist',
        personality: 'Brilliant, stubborn, refuses to sell artifacts to smugglers, deeply relies on your survival instincts.',
        speakingStyle: 'Adventurous, decisive Hinglish.',
        relationshipToUser: 'Expedition partner trusting you with the map',
        portrait: '/src/assets/images/kiara_bride_portrait_1795516146637.jpg',
        accentColor: '#10B981',
      },
      {
        id: 'raghu_guide',
        name: 'Raghu',
        age: '39',
        role: 'Treacherous Local Guide',
        personality: 'Carries a machete and secret satellite coordinates for black-market buyers.',
        speakingStyle: 'Sly, gruff warnings.',
        relationshipToUser: 'Pretends loyalty while eyeing Kiara’s compass',
        portrait: '/src/assets/images/aryan_hunter_portrait_1795516146597.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'somnath_elder',
        name: 'Somnath',
        age: '55',
        role: 'Sacred Forest Guardian',
        personality: 'Protects the temple’s trap mechanism and tests outsiders’ hearts.',
        speakingStyle: 'Calm, cryptic wisdom.',
        relationshipToUser: 'Emerges only to those who respect the forest',
        portrait: '/src/assets/images/bhairav_shrine_portrait_1795516147050.jpg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'trust', label: 'Expedition Trust', emoji: '🧭', initialValue: 40, min: 0, max: 100, tone: 'trust' },
      { id: 'love', label: 'Chemistry', emoji: '🌿', initialValue: 20, min: 0, max: 100, tone: 'love' },
    ],
    openingScene: 'Bastar Moss Ruins — Spinning Brass Compass',
    playGuide: {
      hinglish: 'Kiara ke saath prachin mandir ka rasta khojo aur gaddar Raghu se bach kar niklo 🧭🌿',
      hindi: 'कियारा के साथ प्राचीन मंदिर का रहस्य सुलझाओ और गद्दार रघु से सावधान रहो 🧭🌿',
      english: 'Navigate Bastar’s ancient ruins with Kiara before treacherous Raghu steals the relic 🧭🌿',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Kai so saal purane moss se dhake khambhon par dhoop ki kirnein pad rahi hain. Kiara ke haath mein brass compass ki sui achanak tezi se ghum kar ek dabi hui seedhiyon ki taraf rukti hai—aur peeche Raghu apni machete pakde ghoorta hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Kiara Rao',
          text: 'Rasta mil gaya! Par suno... mujhe lagta hai Raghu hamare peeche kisi smuggler gang ko message bhej raha hai. Neeche utarne se pehle hum kya karein?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'प्राचीन काई लगे पत्थरों पर सूरज की किरणें पड़ रही हैं। कियारा का पीतल का कंपास तेज़ी से घूमकर एक छिपी सीढ़ी की ओर रुकता है।',
        },
        {
          type: 'dialogue',
          speakerName: 'Kiara Rao',
          text: 'रास्ता मिल गया! लेकिन सुनो... मुझे शक है कि रघु किसी स्मगलर गैंग को खबर दे रहा है। नीचे उतरने से पहले क्या करें?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Sunbeams cut through emerald jungle mist onto moss-covered stone pillars. Kiara’s antique brass compass spins wildly before locking toward a hidden staircase—while Raghu grips his machete nearby.',
        },
        {
          type: 'dialogue',
          speakerName: 'Kiara Rao',
          text: 'There’s the vault entrance! Wait... I caught Raghu pinging coordinates on a hidden tracker. Do we confront him now or slip down fast?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Raghu ko ulta direction batao aur Kiara ko lekar seedhiyon mein chupke se utro',
        'Seedha Raghu ka phone maango: "Humari team mein gaddari nahi chalegi!"',
        'Aas-paas ki deewar par Somnath ke nishaan dekho pehle',
      ],
      hindi: [
        'रघु को दूसरी तरफ़ भेजकर कियारा के साथ नीचे उतरो',
        'सीधे रघु को पकड़ो: "अपना सैटेलाइट फोन अभी बाहर निकालो!"',
        'दीवार पर बने प्राचीन चिह्नों की जाँच करो',
      ],
      english: [
        'Send Raghu to scout the east ridge while you and Kiara slip down the vault stairs',
        'Confront Raghu firmly right now before he signals anyone',
        'Inspect the carved guardian symbols along the archway first',
      ],
    },
    possibleEndings: ['Emerald Crown Protected', 'Escape Down Bastar Waterfall'],
  },

  // 41. Rooftop Afterparty 3AM
  {
    id: 'midnight_dj_crush',
    title: 'Rooftop Afterparty 3AM',
    tagline: 'Pune ki chhat par fairy lights, ek acoustic guitar aur raat 3 baje ka jaadu!',
    about:
      'At 3 AM during a dreamy Pune terrace afterparty glowing with amber fairy lights, magnetic indie singer Tara Varma hands you a spare mic for an impromptu rooftop duet—right under the jealous eyes of her ex Yash and cheering wingman Kabir.',
    primaryCategory: 'Romance',
    categories: ['For You', 'New', 'Romance', 'College', 'Drama'],
    tags: ['Roleplay', 'Indie Music', '3AM Vibes'],
    visualStyle: 'Pune Rooftop Bokeh',
    rating: 4.9,
    chatCountLabel: '174.6K',
    chatCountNumeric: 174600,
    isNew: true,
    isTrending: true,
    coverImage: '/src/assets/images/cover_rooftop_afterparty_1795801806425.jpg',
    mediaGallery: [
      {
        id: 'm3am_1',
        url: '/src/assets/images/cover_rooftop_afterparty_1795801806425.jpg',
        caption: 'Fairy lights ke neeche acoustic guitar bajate hue Tara ne tumhari taraf dekh kar pehla chord chheda.',
      },
    ],
    setting: 'Fairy-lit Pune penthouse terrace overlooking twinkling 3 AM city skyline',
    characters: [
      {
        id: 'tara_singer',
        name: 'Tara Varma',
        age: '22',
        role: 'Indie Acoustic Singer',
        personality: 'Free-spirited, magnetic smile, fearless on the mic yet secretly tired of fake party crowds.',
        speakingStyle: 'Warm, teasing, soulful Hinglish.',
        relationshipToUser: 'Picked you out of the entire crowd for a 3 AM duet',
        portrait: '/src/assets/images/yours_zoya_glam_1795804144673.jpg',
        accentColor: '#F59E0B',
      },
      {
        id: 'yash_ex',
        name: 'Yashvardhan',
        age: '24',
        role: "Tara's Pushy Ex",
        personality: 'Rich show-off trying to hijack the party spotlight back.',
        speakingStyle: 'Smug interruptions.',
        relationshipToUser: 'Glaring from across the terrace bar',
        portrait: '/src/assets/images/portrait_vivaan_rival_1795460852271.jpg',
        accentColor: '#E5233D',
      },
      {
        id: 'kabir_host',
        name: 'Kabir',
        age: '22',
        role: 'Afterparty Host & Drummer',
        personality: 'Chill friend hyping every chord you play.',
        speakingStyle: 'Lively Pune slang.',
        relationshipToUser: 'Cheering for your duet with Tara',
        portrait: '/src/assets/images/kabir_coaching_portrait_1795616640551.jpg',
        accentColor: '#38BDF8',
      },
    ],
    relationshipMeters: [
      { id: 'love', label: 'Vibe', emoji: '🎸', initialValue: 34, min: 0, max: 100, tone: 'love' },
      { id: 'trust', label: 'Connection', emoji: '✨', initialValue: 40, min: 0, max: 100, tone: 'trust' },
    ],
    openingScene: 'Pune Terrace 3AM — Fairy Lights & Acoustic Duet',
    playGuide: {
      hinglish: 'Tara ke saath 3AM gaana gao, Yash ka ego shant karo aur raat ko subah tak le jaao 🎸✨',
      hindi: 'तारा के साथ रात 3 बजे गाना गाओ और इस रूफटॉप पार्टी को दिल के करीब ले आओ 🎸✨',
      english: 'Steal the 3 AM terrace spotlight with Tara and turn a late-night jam into magic 🎸✨',
    },
    openingBeats: {
      hinglish: [
        {
          type: 'narration',
          text: 'Shehar neeche so raha hai aur chhat par sunehri fairy lights hawa mein jhul rahi hain. Tara apni black jacket mein guitar thaame mic par aati hai aur seedha tumhe aankh maarti hai.',
        },
        {
          type: 'dialogue',
          speakerName: 'Tara Varma',
          text: 'Aakhri gaana sirf unke liye jo raat 3 baje bhi sachhe lagte hain... Oye, terrace ke kone wale! Yahan mic par aaoge ya bas door se taali bajaoge?',
        },
      ],
      hindi: [
        {
          type: 'narration',
          text: 'पुणे की छत पर सुनहरी लाइट्स चमक रही हैं। तारा गिटार थामे माइक के पास आती हैं और सीधे तुम्हारी तरफ़ देखकर मुस्कुराती हैं।',
        },
        {
          type: 'dialogue',
          speakerName: 'Tara Varma',
          text: 'आखिरी गाना उनके लिए जो रात के तीन बजे भी सच्चे लगते हैं... अरे, कोने में खड़े दोस्त! माइक पर आओगे या बस दूर से देखोगे?',
        },
      ],
      english: [
        {
          type: 'narration',
          text: 'Amber fairy lights sway above Pune’s sleeping skyline as Tara slings her acoustic guitar across her black leather jacket and winks straight at you.',
        },
        {
          type: 'dialogue',
          speakerName: 'Tara Varma',
          text: 'One last song for the only real soul left at 3 AM... Hey, leaning on that railing! Coming up to this mic or clapping from the dark?',
        },
      ],
    },
    initialChoices: {
      hinglish: [
        'Stage par chadho aur mic adjust karo: "Sirf tabhi jab gaana tumhari aankhon par ho!"',
        'Has kar baitho paas mein: "Guitar tum bajao, lyrics main sambhal leta hoon."',
        'Yash ki taraf bina dekhe Tara ko bolo: "Chalo, sabko dikhate hain asli magic kya hota hai."',
      ],
      hindi: [
        'स्टेज पर आओ: "गाना तभी गाऊँगा जब वह तुम्हारे नाम हो!"',
        'हँसकर पास आओ: "गिटार तुम बजाओ, सुर मैं मिला दूँगा।"',
        'मुस्कुराकर कहो: "चलो तारा, आज की रात यादगार बना दें।"',
      ],
      english: [
        'Step up to the mic with a grin: "Only if this duet is officially about you."',
        'Slide beside her guitar: "Play the first chord—I’ve got the harmony."',
        'Ignore Yash completely and smile: "Let’s wake the city up, Rockstar."',
      ],
    },
    possibleEndings: ['Sunrise Coffee After The Concert', 'Indie Band Tour Together'],
  },
];
