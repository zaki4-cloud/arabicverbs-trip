import { GameTrack } from '../types/game';

export const INITIAL_GAME_TRACKS: GameTrack[] = [
  // TRACK 1 - BASIC LEVEL (רמת יסוד)
  {
    id: 'track-basic-binyan1',
    title: 'רמה 1: בניין 1 בלבד - פעלים שלמים בזמן עבר (רמת יסוד)',
    difficulty: 'basic',
    description: 'התמקדות מוחלטת בבניין 1 הפשוט (فَعَلَ), זיהוי שורש וסיומות הגופים בעבר (תֻ, תַ, תִ, נַא, תֻם, וּ).',
    shareCode: 'ARB-B1-EASY',
    packages: [
      {
        id: 'pkg-t1-p1',
        title: 'בניין 1 (فَعَلَ) - היסוד של הפועל השלם בעבר',
        binyanim: ['בניין 1 (فَعَلَ)'],
        tenses: ['עבר (الماضي)'],
        persons: ['מדבר (أَنَا)', 'נוכח (أَنْتَ)', 'נוכחת (أَنْتِ)', 'נסתר (هُوَ)', 'רבים (نَحْنُ / هُمْ)'],
        explanation:
          '### מבנה הבניין הבסיסי וניקוד השורש\nבניין 1 (فَعَلَ) הוא הבניין הבסיסי ביותר בשפה הערבית. בזמן עבר כל אותיות השורש מנוקדות לרוב בפתחה (כמו כַּתַבַּ كَتَبَ = כָּתַב).\n\n### סיומות הגופים בעבר\nשימו לב לסיומות הפעלים לפי הגוף:\n• כַּתַבְּתֻ (أَنَا كَتَبْتُ) - אני כתבתי (מדבר/ת)\n• כַּתַבְתַ (أَنْتَ كَتَبْتَ) - אתה כתבת (נוכח)\n• כַּתַבְתִ (أَنْتِ كَتَبْتِ) - את כתבת (נוכחת)\n• כַּתַבַּ (هُوَ كَتَبَ) - הוא כתב (נסתר)\n• כַּתַבְנַא (نَحْنُ كَتَبْنَا) - אנחנו כתבנו (מדברים)\n• כַּתַבُوا (هُمْ كَتَبُوا) - הם כתבו (נסתרים)\n\n💡 דגש חשוב להטיה נכונה:\nהאות האחרונה של השורש לפני סיומת נטויה (כמו תֻ או נַא) מקבלת תמיד סוּכּוּן (שְווא נח)!',
        examples: [
          { arabic: 'كَتَبَ', transliteration: 'כַּתַבַּ', hebrew: 'הוא כתב (נסתר, עבר)', note: 'שלוש אותיות השורש מנוקדות בפתחה' },
          { arabic: 'كَتَبْتُ', transliteration: 'כַּתַבְּתֻ', hebrew: 'אני כתבתי (מדבר/ת, עבר)', note: 'סיומת תֻ מציינת מדבר' },
          { arabic: 'دَرَسْنَا', transliteration: 'דַרַסְנַא', hebrew: 'אנחנו למדנו (מדברים, עבר)', note: 'סיומת נַא מציינת רבים' }
        ],
        imageUrl: '/assets/images/arabic_grammar_scroll_1793466159684.jpg',
        createdAt: Date.now() - 300000
      },
      {
        id: 'pkg-t1-p2',
        title: 'נטיות גוף הנוכחים והנסתרים בעבר',
        binyanim: ['בניין 1 (فَعَلَ)'],
        tenses: ['עבר (الماضي)'],
        persons: ['נוכחים (أَنْتُمْ)', 'נסתרים (هُمْ)'],
        explanation:
          '### הבחנה קריטית בין נוכחים לנסתרים\nההבדל בין סיומת נוכחים לסיומת נסתרים בעבר הוא מהחשובים ביותר בדקדוק הערבי:\n• סיומת ـْتُمْ (תֻם) - מייצגת תמיד נוכחים (אתם): אַנְתֻם כַּתַבְתֻם = אתם כתבתם\n• סיומת ـُوا (וּא עם אליף נחה) - מייצגת נסתרים (הם): הֻם כַּתַבּוּ = הם כתבו\n\n💡 שימו לב לאליף השקטה (אל-אליף אל-פאריקה):\nהאליף בסוף הסיומת ـُوا אינה נהגית כלל, ותפקידה רק להבדיל בין ו\' של רבים לו\' שורשית!',
        examples: [
          { arabic: 'شَرِبْتُمْ', transliteration: 'שַׁרִבְּתֻם', hebrew: 'שתיתם (אתם)', note: 'סיומת תֻם' },
          { arabic: 'شَرِبُوا', transliteration: 'שַׁרִבּוּ', hebrew: 'הם שתו (נסתרים)', note: 'סיומת וּא' }
        ],
        imageUrl: '/assets/images/treasure_gem_chest_1793466160391.jpg',
        createdAt: Date.now() - 250000
      }
    ],
    questions: [
      {
        id: 'q-t1-1',
        packageId: 'pkg-t1-p1',
        topic: 'בניין 1 (فَعَلَ)',
        type: 'multiple_choice',
        prompt: 'באיזה גוף מנוטה הפועל שלפניכם?',
        arabicSample: 'كَتَبْتُمْ',
        correctAnswer: 'נוכחים (אַנְתֻם - אַתֶּם)',
        distractors: ['מדברים (נַחְנוּ - אֲנַחְנוּ)', 'נסתרים (הֻם - הֵם)', 'נוכח (אַנְתַ - אַתָּה)'],
        explanation: 'הסיומת תֻם (ـْتُمْ) בערבית מציינת תמיד את גוף הנוכחים (אַנְתֻם) בזמן עבר.'
      },
      {
        id: 'q-t1-2',
        packageId: 'pkg-t1-p1',
        topic: 'בניין 1 (فَعَلَ)',
        type: 'matching_pairs',
        prompt: 'התאימו בין הפועל בערבית לגוף בעברית:',
        explanation: 'זיהוי סיומות: תֻ = מדבר, נַא = מדברים, תַ = נוכח, וּ = נסתרים.',
        pairs: [
          { id: 'p1', arabic: 'كَتَبْتُ', target: 'אני כתבתי' },
          { id: 'p2', arabic: 'كَتَبْنَا', target: 'אנחנו כתבנו' },
          { id: 'p3', arabic: 'كَتَبُوا', target: 'הם כתבו' },
          { id: 'p4', arabic: 'كَتَبَتْ', target: 'היא כתבה' }
        ]
      },
      {
        id: 'q-t1-3',
        packageId: 'pkg-t1-p1',
        topic: 'בניין 1 (فَعَلَ)',
        type: 'multiple_choice',
        prompt: 'איזו צורה בערבית משמעה "אנחנו למדנו" מתוך שורש ד.ר.ס?',
        arabicSample: 'دَرَسَ',
        correctAnswer: 'دَرَسْنَا',
        distractors: ['دَرَسْتَ', 'دَرَسُوا', 'دَرَسْتُ'],
        explanation: 'הסיומת נַא (ـْنَا) בזמן עבר מייצגת את גוף המדברים (נַחְנוּ = אנחנו).'
      },
      {
        id: 'q-t1-4',
        packageId: 'pkg-t1-p1',
        topic: 'בניין 1 (فَعَلَ)',
        type: 'multiple_choice',
        prompt: 'איזו צורה בערבית משמעה "הִיא עָבְדָה" (גוף נסתרת בעבר)?',
        arabicSample: 'عَمِلَ',
        correctAnswer: 'عَمِلَتْ',
        distractors: ['عَمِلْتِ', 'عَمِلُوا', 'عَمِلْنَا'],
        explanation: 'סיומת תּ (ـَتْ) עם סוכון מציינת תמיד את גוף הנסתרת (הִיא) בזמן עבר בבניין 1.'
      },
      {
        id: 'q-t1-5',
        packageId: 'pkg-t1-p1',
        topic: 'בניין 1 (فَعَلَ)',
        type: 'matching_pairs',
        prompt: 'התאימו בין פועל העבר בבניין 1 למשמעותו בעברית:',
        explanation: 'זיהוי שורשים וסיומות עבר: עַמִלַ = עבד, שַׁרִבַּ = שתה, עַלִמַ = ידע, דַחַ\'לַ = נכנס.',
        pairs: [
          { id: 'p5-1', arabic: 'عَمِلُوا', target: 'הם עבדו' },
          { id: 'p5-2', arabic: 'شَرِبْنَا', target: 'אנחנו שתינו' },
          { id: 'p5-3', arabic: 'عَلِمْتُمْ', target: 'אתם ידעתם' },
          { id: 'p5-4', arabic: 'دَخَلَتْ', target: 'היא נכנסה' }
        ]
      },
      {
        id: 'q-t1-6',
        packageId: 'pkg-t1-p1',
        topic: 'בניין 1 (فَعَلَ)',
        type: 'multiple_choice',
        prompt: 'איזו צורה משמעה "אַתֶּם שְׁמַעְתֶּם" (גוף נוכחים בעבר מתוך שורש ס.מ.ע)?',
        arabicSample: 'سَمِعَ',
        correctAnswer: 'سَمِعْتُمْ',
        distractors: ['سَمِعُوا', 'سَمِعْنَا', 'سَمِعْتَ'],
        explanation: 'סיומת תֻם (ـْتُمْ) היא הסיומת הייחודית לגוף נוכחים (אַנְתֻם) בזמן עבר.'
      },
      {
        id: 'q-t1-7',
        packageId: 'pkg-t1-p1',
        topic: 'בניין 1 (فَعَلَ)',
        type: 'matching_pairs',
        prompt: 'אתגר הפסגה: התאימו בין כינויי הגוף לפועל המתאים בעבר:',
        explanation: 'זיהוי כינויי גוף וסיומות עבר: אֲנַא כַּתַבְּתֻ, אַנְתַ כַּתַבְּתַ, הֻוַ כַּתַבַּ, הֻם כַּתַבּוּ.',
        pairs: [
          { id: 'p7-1', arabic: 'أَنَا (אני)', target: 'كَتَبْتُ' },
          { id: 'p7-2', arabic: 'أَنْتَ (אתה)', target: 'كَتَبْتَ' },
          { id: 'p7-3', arabic: 'هُوَ (הוא)', target: 'كَتَبَ' },
          { id: 'p7-4', arabic: 'هُمْ (הם)', target: 'كَتَبُوا' }
        ]
      }
    ],
    stages: [
      {
        id: 'stg-1',
        stageNumber: 1,
        title: 'שלב 1: שביל עמק ההרים הירוק',
        landscapeName: 'מעבר ההרים הירוק',
        backgroundImageUrl: '/assets/images/scene_wooden_gate_trail_1793612278485.jpg',
        packageIds: ['pkg-t1-p1'],
        nodes: [
          {
            id: 'stg1-gem',
            type: 'treasure',
            title: 'אוצר הידע: סודות בניין 1',
            packageId: 'pkg-t1-p1',
            scoreReward: 50,
            position: { x: 24, y: 72 }
          },
          {
            id: 'stg1-s1',
            type: 'question',
            landmarkType: 'stone_gate',
            title: 'שער העץ העתיק',
            description: 'שער עץ קורות עתיק ומרשים המצויר בפתח המסלול.',
            packageId: 'pkg-t1-p1',
            questionId: 'q-t1-1',
            scoreReward: 100,
            position: { x: 72, y: 44 }
          },
          {
            id: 'stg1-s2',
            type: 'question',
            landmarkType: 'secret_waterfall',
            title: 'מפל המערה הסודית',
            description: 'מפל מים שוצף הזורם אל תוך נקיק סלע נסתר.',
            packageId: 'pkg-t1-p1',
            questionId: 'q-t1-2',
            scoreReward: 150,
            position: { x: 50, y: 52 }
          },
          {
            id: 'stg1-s3',
            type: 'landmark',
            landmarkType: 'wild_horses',
            title: 'בקתת סוסי הפרא',
            description: 'בקתה כפרית עם שטח פתוח שבו סוסי פרא רועים בשלווה.',
            scoreReward: 0,
            position: { x: 50, y: 48 }
          },
          {
            id: 'stg1-s4',
            type: 'landmark',
            landmarkType: 'hot_springs',
            title: 'עמק המעיינות החמים',
            description: 'מעיינות תרמיים טבעיים עם אדי חום מרפאים בין הסלעים בראש העמק.',
            scoreReward: 0,
            position: { x: 50, y: 46 }
          }
        ],
        scenes: [
          {
            id: 'stg1-scene1',
            title: 'שער העץ העתיק ושביל הפרחים',
            landscapeName: 'מבואת שער העץ',
            backgroundImageUrl: '/assets/images/scene_wooden_gate_trail_1793612278485.jpg',
            description: 'שער עץ קורות עתיק ומרשים המצויר בפתח המסלול עם שביל פסטורלי ופרחי בר.',
            nodes: [
              {
                id: 'stg1-gem',
                type: 'treasure',
                title: 'אוצר הידע: סודות בניין 1',
                packageId: 'pkg-t1-p1',
                scoreReward: 50,
                position: { x: 24, y: 72 }
              },
              {
                id: 'stg1-s1',
                type: 'question',
                landmarkType: 'stone_gate',
                title: 'שער העץ העתיק',
                description: 'שער עץ קורות עתיק ומרשים המצויר בפתח המסלול.',
                packageId: 'pkg-t1-p1',
                questionId: 'q-t1-1',
                scoreReward: 100,
                position: { x: 72, y: 44 }
              }
            ]
          },
          {
            id: 'stg1-scene2',
            title: 'מפל המערה הסודית',
            landscapeName: 'מפל המערה הסודית',
            backgroundImageUrl: '/assets/images/scene_secret_cavern_waterfall_1793612279783.jpg',
            description: 'מפל מים שוצף הזורם בנקיק סלעים אל תוך מערה נסתרת ומסתורית.',
            nodes: [
              {
                id: 'stg1-s2',
                type: 'question',
                landmarkType: 'secret_waterfall',
                title: 'מפל המערה הסודית',
                description: 'מפל מים שוצף הזורם אל תוך נקיק סלע נסתר.',
                packageId: 'pkg-t1-p1',
                questionId: 'q-t1-2',
                scoreReward: 150,
                position: { x: 50, y: 52 }
              }
            ]
          },
          {
            id: 'stg1-scene3',
            title: 'בקתת סוסי הפרא',
            landscapeName: 'בקתת סוסי הפרא',
            backgroundImageUrl: '/assets/images/scene_wild_horses_cabin_1793612280320.jpg',
            description: 'בקתת עץ כפרית עם גדר קורות וסוסי פרא אצילים הרועים באחו הירוק.',
            nodes: [
              {
                id: 'stg1-s3',
                type: 'landmark',
                landmarkType: 'wild_horses',
                title: 'בקתת סוסי הפרא',
                description: 'בקתה כפרית עם שטח פתוח שבו סוסי פרא רועים בשלווה.',
                scoreReward: 20,
                position: { x: 50, y: 48 }
              }
            ]
          },
          {
            id: 'stg1-scene4',
            title: 'עמק המעיינות החמים',
            landscapeName: 'עמק המעיינות החמים',
            backgroundImageUrl: '/assets/images/scene_hot_springs_valley_1793612279814.jpg',
            description: 'מעיינות תרמיים טבעיים מבעבעים עם אדי חום מרגיעים בין סלעי העמק.',
            nodes: [
              {
                id: 'stg1-s4',
                type: 'landmark',
                landmarkType: 'hot_springs',
                title: 'עמק המעיינות החמים',
                description: 'מעיינות תרמיים טבעיים עם אדי חום מרפאים בין הסלעים בראש העמק.',
                scoreReward: 20,
                position: { x: 50, y: 46 }
              }
            ]
          }
        ]
      },
      {
        id: 'stg-2',
        stageNumber: 2,
        title: 'שלב 2: קניון הנהר ואבני המדרך',
        landscapeName: 'קניון הנהר הגועש',
        backgroundImageUrl: '/assets/images/scene_river_bridge_basalt_1793612398221.jpg',
        packageIds: ['pkg-t1-p1'],
        nodes: [
          {
            id: 'stg2-gem',
            type: 'treasure',
            title: 'יהלום המים: שורש ד.ר.ס',
            packageId: 'pkg-t1-p1',
            scoreReward: 50,
            position: { x: 28, y: 76 }
          },
          {
            id: 'stg2-s1',
            type: 'question',
            landmarkType: 'rope_bridge',
            title: 'גשר החבלים',
            description: 'גשר חבלים מתנדנד התלוי מעל המים הגועשים.',
            packageId: 'pkg-t1-p1',
            questionId: 'q-t1-3',
            scoreReward: 120,
            position: { x: 50, y: 54 }
          },
          {
            id: 'stg2-s2',
            type: 'landmark',
            landmarkType: 'black_rock',
            title: 'מעבר הסלע השחור',
            description: 'מעבר צר בין עמודי בזלת שחורים המיתמרים אל על.',
            scoreReward: 20,
            position: { x: 74, y: 35 }
          },
          {
            id: 'stg2-s3',
            type: 'landmark',
            landmarkType: 'white_waterfalls',
            title: 'המפלים הלבנים',
            description: 'מפלי מים לבנים שוצפים המתנפצים על גבי אבני המדרך.',
            scoreReward: 20,
            position: { x: 34, y: 56 }
          },
          {
            id: 'stg2-s4',
            type: 'landmark',
            landmarkType: 'bat_cave',
            title: 'מערת העטלפים',
            description: 'מערה מסתורית בצלע ההר ממנה מתעופפים עטלפים בשקיעה.',
            scoreReward: 20,
            position: { x: 64, y: 44 }
          },
          {
            id: 'stg2-s5',
            type: 'landmark',
            landmarkType: 'heaven_stairs',
            title: 'גרם המדרגות לגן עדן',
            description: 'מדרגות אבן עתיקות החצובות בסלע ומובילות אל עבר הרכס.',
            scoreReward: 20,
            position: { x: 54, y: 48 }
          }
        ],
        scenes: [
          {
            id: 'stg2-scene1',
            title: 'גשר החבלים ומעבר הסלע השחור',
            landscapeName: 'גשר החבלים ועמודי הבזלת',
            backgroundImageUrl: '/assets/images/scene_river_bridge_basalt_1793612398221.jpg',
            description: 'גשר חבלים מרשים מעל מימי הנהר הגועשים ועמודי בזלת שחורים המיתמרים אל על.',
            nodes: [
              {
                id: 'stg2-gem',
                type: 'treasure',
                title: 'יהלום המים: שורש ד.ר.ס',
                packageId: 'pkg-t1-p1',
                scoreReward: 50,
                position: { x: 28, y: 76 }
              },
              {
                id: 'stg2-s1',
                type: 'question',
                landmarkType: 'rope_bridge',
                title: 'גשר החבלים',
                description: 'גשר חבלים מתנדנד התלוי מעל המים הגועשים.',
                packageId: 'pkg-t1-p1',
                questionId: 'q-t1-3',
                scoreReward: 120,
                position: { x: 50, y: 54 }
              },
              {
                id: 'stg2-s2',
                type: 'landmark',
                landmarkType: 'black_rock',
                title: 'מעבר הסלע השחור',
                description: 'מעבר צר בין עמודי בזלת שחורים המיתמרים אל על.',
                scoreReward: 20,
                position: { x: 74, y: 35 }
              }
            ]
          },
          {
            id: 'stg2-scene2',
            title: 'המפלים הלבנים ומערת העטלפים',
            landscapeName: 'המפלים הלבנים והמערה',
            backgroundImageUrl: '/assets/images/scene_waterfalls_bat_cave_1793612410715.jpg',
            description: 'מפלים לבנים אדירים הנשפכים ברעש, ופתח מערת עטלפים מסתורית בסלע ההר.',
            nodes: [
              {
                id: 'stg2-s3',
                type: 'landmark',
                landmarkType: 'white_waterfalls',
                title: 'המפלים הלבנים',
                description: 'מפלי מים לבנים שוצפים המתנפצים על גבי אבני המדרך.',
                scoreReward: 20,
                position: { x: 34, y: 56 }
              },
              {
                id: 'stg2-s4',
                type: 'landmark',
                landmarkType: 'bat_cave',
                title: 'מערת העטלפים',
                description: 'מערה מסתורית בצלע ההר ממנה מתעופפים עטלפים בשקיעה.',
                scoreReward: 20,
                position: { x: 64, y: 44 }
              }
            ]
          },
          {
            id: 'stg2-scene3',
            title: 'גרם המדרגות לגן עדן',
            landscapeName: 'המדרגות לפסגה',
            backgroundImageUrl: '/assets/images/scene_heaven_stairs_1793612422980.jpg',
            description: 'גרם מדרגות אבן עתיק ומפואר החצוב ברכס ההר ועולה ישירות אל העננים והשמש.',
            nodes: [
              {
                id: 'stg2-s5',
                type: 'landmark',
                landmarkType: 'heaven_stairs',
                title: 'גרם המדרגות לגן עדן',
                description: 'מדרגות אבן עתיקות החצובות בסלע ומובילות אל עבר הרכס.',
                scoreReward: 20,
                position: { x: 54, y: 48 }
              }
            ]
          }
        ]
      },
      {
        id: 'stg-3',
        stageNumber: 3,
        title: 'שלב 3: מרחבי המדבר וטיפוס להר הגעש',
        landscapeName: 'שלב המדבר והר הגעש',
        backgroundImageUrl: '/assets/images/scene_oasis_ancient_ruins_1793612437882.jpg',
        packageIds: ['pkg-t1-p1'],
        nodes: [
          {
            id: 'stg3-gem',
            type: 'treasure',
            title: 'אוצר נווה המדבר',
            packageId: 'pkg-t1-p1',
            scoreReward: 50,
            position: { x: 30, y: 74 }
          },
          {
            id: 'stg3-s1',
            type: 'landmark',
            landmarkType: 'oasis',
            title: 'נווה מדבר',
            description: 'מעיין קטן מוקף בעצי דקל ומעט שיחים בלב החולות.',
            scoreReward: 20,
            position: { x: 44, y: 58 }
          },
          {
            id: 'stg3-s2',
            type: 'question',
            landmarkType: 'sun_pyramid',
            title: 'פירמידת השמש',
            description: 'פירמידת מדרגות מלכותית הזוהרת תחת השמש המדברית.',
            packageId: 'pkg-t1-p1',
            questionId: 'q-t1-4',
            scoreReward: 120,
            position: { x: 50, y: 50 }
          },
          {
            id: 'stg3-s3',
            type: 'landmark',
            landmarkType: 'ancient_ruins',
            title: 'העיר העתיקה',
            description: 'חורבות עיר עתיקה עשויה אבן חול ועמודים קדומים.',
            scoreReward: 0,
            position: { x: 74, y: 38 }
          },
          {
            id: 'stg3-s4',
            type: 'landmark',
            landmarkType: 'ghost_valley',
            title: 'עמק הרפאים',
            description: 'ואדי עמוק עם מצוקי בזלת חדים משני צידיו וערפילי ערב.',
            scoreReward: 0,
            position: { x: 28, y: 64 }
          },
          {
            id: 'stg3-s5',
            type: 'question',
            landmarkType: 'volcano',
            title: 'טיפוס להר הגעש',
            description: 'דרך מפותלת המובילה אל הר הגעש והלבה הרוחשת.',
            packageId: 'pkg-t1-p1',
            questionId: 'q-t1-5',
            scoreReward: 150,
            position: { x: 72, y: 22 }
          }
        ],
        scenes: [
          {
            id: 'stg3-scene1',
            title: 'נווה המדבר והעיר העתיקה',
            landscapeName: 'נווה המדבר והחורבות',
            backgroundImageUrl: '/assets/images/scene_oasis_ancient_ruins_1793612437882.jpg',
            description: 'מעיין מים טורקיז מוקף דקלים פורחים, לצד שרידי עיר עתיקה עם קשתות אבן קדומות.',
            nodes: [
              {
                id: 'stg3-gem',
                type: 'treasure',
                title: 'אוצר נווה המדבר',
                packageId: 'pkg-t1-p1',
                scoreReward: 50,
                position: { x: 30, y: 74 }
              },
              {
                id: 'stg3-s1',
                type: 'landmark',
                landmarkType: 'oasis',
                title: 'נווה מדבר',
                description: 'מעיין קטן מוקף בעצי דקל ומעט שיחים בלב החולות.',
                scoreReward: 20,
                position: { x: 44, y: 58 }
              },
              {
                id: 'stg3-s3',
                type: 'landmark',
                landmarkType: 'ancient_ruins',
                title: 'העיר העתיקה',
                description: 'חורבות עיר עתיקה עשויה אבן חול ועמודים קדומים.',
                scoreReward: 20,
                position: { x: 74, y: 38 }
              }
            ]
          },
          {
            id: 'stg3-scene2',
            title: 'פירמידת השמש ועמק הרפאים אל הר הגעש',
            landscapeName: 'פירמידת השמש והר הגעש',
            backgroundImageUrl: '/assets/images/scene_pyramid_volcano_1793612452275.jpg',
            description: 'פירמידת שמש מונומנטלית בעמק מצוקי בזלת ודרך מתפתלת אל עבר הר געש פעיל.',
            nodes: [
              {
                id: 'stg3-s2',
                type: 'landmark',
                landmarkType: 'sun_pyramid',
                title: 'פירמידת השמש',
                description: 'פירמידת מדרגות מלכותית הזוהרת תחת השמש המדברית.',
                scoreReward: 20,
                position: { x: 50, y: 50 }
              },
              {
                id: 'stg3-s4',
                type: 'landmark',
                landmarkType: 'ghost_valley',
                title: 'עמק הרפאים',
                description: 'ואדי עמוק עם מצוקי בזלת חדים משני צידיו וערפילי ערב.',
                scoreReward: 20,
                position: { x: 28, y: 64 }
              },
              {
                id: 'stg3-s5',
                type: 'landmark',
                landmarkType: 'volcano',
                title: 'טיפוס להר הגעש',
                description: 'דרך מפותלת המובילה אל הר הגעש והלבה הרוחשת.',
                scoreReward: 20,
                position: { x: 72, y: 22 }
              }
            ]
          }
        ]
      },
      {
        id: 'stg-4',
        stageNumber: 4,
        title: 'שלב 4: רכס האלפים ופסגת השלג',
        landscapeName: 'שלב האלפים והיער הקסום',
        backgroundImageUrl: '/assets/images/scene_turquoise_forest_1793612466995.jpg',
        packageIds: ['pkg-t1-p1'],
        nodes: [
          {
            id: 'stg4-gem',
            type: 'treasure',
            title: 'קריסטל הפסגה הקפואה',
            packageId: 'pkg-t1-p1',
            scoreReward: 50,
            position: { x: 28, y: 76 }
          },
          {
            id: 'stg4-s1',
            type: 'landmark',
            landmarkType: 'dark_forest',
            title: 'היער החשוך',
            description: 'יער אורנים עבות עם צללים קסומים וגחליליות מאירות.',
            scoreReward: 20,
            position: { x: 62, y: 46 }
          },
          {
            id: 'stg4-s2',
            type: 'landmark',
            landmarkType: 'abyss_trail',
            title: 'שביל התהום',
            description: 'שביל מצוק צר ועוצר נשימה התלוי מעל תהום פעורה.',
            scoreReward: 0,
            position: { x: 44, y: 66 }
          },
          {
            id: 'stg4-s3',
            type: 'question',
            landmarkType: 'turquoise_lake',
            title: 'אגם הטורקיז',
            description: 'אגם קרחוני שקט בצבע טורקיז עמוק בלב ההרים.',
            packageId: 'pkg-t1-p1',
            questionId: 'q-t1-6',
            scoreReward: 150,
            position: { x: 42, y: 60 }
          },
          {
            id: 'stg4-s4',
            type: 'landmark',
            landmarkType: 'cliff_climb',
            title: 'טיפוס לצוק',
            description: 'קיר טיפוס סלעי מאתגר עם יתדות וחבלי טיפוס.',
            scoreReward: 0,
            position: { x: 66, y: 45 }
          },
          {
            id: 'stg4-s5',
            type: 'question',
            landmarkType: 'snow_peak',
            title: 'פסגת השלג',
            description: 'הפסגה הגבוהה ביותר ברכס, עטופה קרח ונוף פנורמי מרהיב.',
            packageId: 'pkg-t1-p1',
            questionId: 'q-t1-7',
            scoreReward: 200,
            position: { x: 52, y: 20 }
          }
        ],
        scenes: [
          {
            id: 'stg4-scene1',
            title: 'אגם הטורקיז והיער החשוך',
            landscapeName: 'אגם הטורקיז והיער',
            backgroundImageUrl: '/assets/images/scene_turquoise_forest_1793612466995.jpg',
            description: 'אגם קרחוני בצבע טורקיז בוהק שסביבו יער אורנים עתיק ושביל אבנים מרוצף.',
            nodes: [
              {
                id: 'stg4-gem',
                type: 'treasure',
                title: 'קריסטל הפסגה הקפואה',
                packageId: 'pkg-t1-p1',
                scoreReward: 50,
                position: { x: 28, y: 76 }
              },
              {
                id: 'stg4-s1',
                type: 'landmark',
                landmarkType: 'dark_forest',
                title: 'היער החשוך',
                description: 'יער אורנים עבות עם צללים קסומים וגחליליות מאירות.',
                scoreReward: 20,
                position: { x: 62, y: 46 }
              },
              {
                id: 'stg4-s3',
                type: 'landmark',
                landmarkType: 'turquoise_lake',
                title: 'אגם הטורקיז',
                description: 'אגם קרחוני שקט בצבע טורקיז עמוק בלב ההרים.',
                scoreReward: 20,
                position: { x: 42, y: 60 }
              }
            ]
          },
          {
            id: 'stg4-scene2',
            title: 'שביל התהום ופסגת השלג',
            landscapeName: 'שביל המצוק והפסגה',
            backgroundImageUrl: '/assets/images/scene_cliff_snow_summit_1793612481461.jpg',
            description: 'שביל צר על פי תהום עמוקה העולה עד לפסגת השלג המנצחת מעל העננים.',
            nodes: [
              {
                id: 'stg4-s2',
                type: 'landmark',
                landmarkType: 'abyss_trail',
                title: 'שביל התהום',
                description: 'שביל מצוק צר ועוצר נשימה התלוי מעל תהום פעורה.',
                scoreReward: 20,
                position: { x: 44, y: 66 }
              },
              {
                id: 'stg4-s4',
                type: 'landmark',
                landmarkType: 'cliff_climb',
                title: 'טיפוס לצוק',
                description: 'קיר טיפוס סלעי מאתגר עם יתדות וחבלי טיפוס.',
                scoreReward: 20,
                position: { x: 66, y: 45 }
              },
              {
                id: 'stg4-s5',
                type: 'landmark',
                landmarkType: 'snow_peak',
                title: 'פסגת השלג',
                description: 'הפסגה הגבוהה ביותר ברכס, עטופה קרח ונוף פנורמי מרהיב.',
                scoreReward: 20,
                position: { x: 52, y: 20 }
              }
            ]
          }
        ]
      }
    ]
  },

  // TRACK 2 - INTERMEDIATE LEVEL (רמת ביניים)
  {
    id: 'track-inter-binyan2-5',
    title: 'רמה 2: בניינים 1, 2 ו-5 - פעלים פעילים ורפלקסיביים (רמת ביניים)',
    difficulty: 'intermediate',
    description: 'הבנת ההבדל בין בניין 1 (יסוד), בניין 2 (גרימה/העצמה) ובניין 5 (פעולה חוזרת/התרחשות עצמית).',
    shareCode: 'ARB-B2-5-MID',
    packages: [
      {
        id: 'pkg-t2-p2',
        title: 'בניין 2 (فَعَّلَ) מול בניין 5 (تَفَعَّلَ) - פעולה גורמת מול חוזרת',
        binyanim: ['בניין 2 (فَعَّلَ)', 'בניין 5 (تَفَعَّلَ)'],
        tenses: ['עבר (الماضي)', 'עתיד (المضارع)'],
        persons: ['מדבר (أَنَا)', 'נוכח (أَنْتَ)', 'נסתר (هُوَ)', 'רבים (نَحْنُ / هُمْ)'],
        explanation:
          'בניין 2 מאופיין בדגש חזק (שדה) על ע הפועל: פַעַלַּ (فَعَّلَ). משמעותו העיקרית היא פעולה גורמת (קאוזטיבית). למשל: עַלִמַ (בניין 1) = ידע; עַלַּםַ (בניין 2) = לימד (גרם לדעת!). לעומתו, בניין 5 תַפַעַלַּ (تَفَعَّلَ) נוצר בהוספת תַ תחילית ומציין פעולה חוזרת או עצמית: תַעַלַּםַ (تَعَلَّمَ) = למד בעצמו!',
        examples: [
          { arabic: 'عَلَّمَ', transliteration: 'עַלַּםַ', hebrew: 'הוא לימד (בניין 2, עבר)', note: 'גרימה והוראה' },
          { arabic: 'تَعَلَّمَ', transliteration: 'תַעַלַּםַ', hebrew: 'הוא למד (בניין 5, עבר)', note: 'פעולה חוזרת/עצמית' },
          { arabic: 'يُعَلِّمُ', transliteration: 'יֻעַלִּםֻ', hebrew: 'הוא מלמד (בניין 2, עתיד)', note: 'דמה בתחילית וכסרה תחת ע הפועל' },
          { arabic: 'يَتَعَلَّمُ', transliteration: 'יַתַעַלַּםֻ', hebrew: 'הוא לומד (בניין 5, עתיד)', note: 'פתחה בתחילית ודגש על ע הפועל' }
        ],
        imageUrl: '/assets/images/treasure_gem_chest_1793466160391.jpg',
        createdAt: Date.now() - 200000
      }
    ],
    questions: [
      {
        id: 'q-t2-1',
        packageId: 'pkg-t2-p2',
        topic: 'בניין 2 (فَعَّلَ)',
        type: 'multiple_choice',
        prompt: 'מה המשמעות של הפועל عَلَّمَ לעומת עַלִמַ (בניין 1)?',
        arabicSample: 'عَلَّمَ الْمُعَلِّمُ التَّلَامِيذَ',
        correctAnswer: 'לימד (פעולת גרימה)',
        distractors: ['למד בעצמו (רפלקסיבי)', 'הודיע לכולם', 'שתק והקשיב'],
        explanation: 'בניין 2 מציין גרימה: עַלַּםַ = גרם למישהו לדעת, כלומר "לימד".'
      },
      {
        id: 'q-t2-2',
        packageId: 'pkg-t2-p2',
        topic: 'השוואת בניין 2 ובניין 5',
        type: 'matching_pairs',
        prompt: 'התאימו בין הפועל לבניין ולמשמעות המדויקת:',
        explanation: 'בניין 2 = גורם/מלמד. בניין 5 = לומד בעצמו.',
        pairs: [
          { id: 'p2-1', arabic: 'عَلَّمَ', target: 'בניין 2 - הוא לימד' },
          { id: 'p2-2', arabic: 'تَعَلَّمَ', target: 'בניין 5 - הוא למד בעצמו' },
          { id: 'p2-3', arabic: 'يُعَلِّمُ', target: 'בניין 2 עתיד - הוא ילמד' },
          { id: 'p2-4', arabic: 'يَتَعَلَّمُ', target: 'בניין 5 עתיד - הוא ילמד' }
        ]
      }
    ],
    stages: [
      {
        id: 'stg-inter-1',
        stageNumber: 1,
        title: 'שלב 1: שביל הקניון והגשרים',
        landscapeName: 'קניון הנהר הגועש',
        backgroundImageUrl: '/assets/images/map_rushing_river_canyon_1793535544870.jpg',
        packageIds: ['pkg-t2-p2'],
        nodes: [
          {
            id: 'node-inter-gem1',
            type: 'treasure',
            title: 'תיבת הגרימה: סודות בניין 2',
            packageId: 'pkg-t2-p2',
            scoreReward: 50,
            position: { x: 24, y: 86 }
          },
          {
            id: 'node-inter-s1',
            type: 'question',
            landmarkType: 'rope_bridge',
            title: 'גשר החבלים: פענוח עַלַּםַ',
            description: 'גשר חבלים מעל המים הגועשים.',
            packageId: 'pkg-t2-p2',
            questionId: 'q-t2-1',
            scoreReward: 100,
            position: { x: 44, y: 72 }
          },
          {
            id: 'node-inter-s2',
            type: 'landmark',
            landmarkType: 'black_rock',
            title: 'מעבר הסלע השחור',
            description: 'מעבר בין עמודי בזלת קדומים.',
            scoreReward: 20,
            position: { x: 58, y: 50 }
          },
          {
            id: 'node-inter-s3',
            type: 'landmark',
            landmarkType: 'white_waterfalls',
            title: 'המפלים הלבנים',
            description: 'מפלי מים לבנים ושוצפים.',
            scoreReward: 20,
            position: { x: 74, y: 48 }
          },
          {
            id: 'node-inter-s4',
            type: 'landmark',
            landmarkType: 'bat_cave',
            title: 'מערת העטלפים',
            description: 'מערת סלע בצלע ההר.',
            scoreReward: 20,
            position: { x: 28, y: 38 }
          },
          {
            id: 'node-inter-s5',
            type: 'landmark',
            landmarkType: 'heaven_stairs',
            title: 'גרם המדרגות לגן עדן',
            description: 'מדרגות אבן המטפסות לעננים.',
            scoreReward: 20,
            position: { x: 66, y: 22 }
          }
        ]
      },
      {
        id: 'stg-inter-2',
        stageNumber: 2,
        title: 'שלב 2: סולמות הצוק והר הגעש',
        landscapeName: 'שלב המדבר והר הגעש',
        backgroundImageUrl: '/assets/images/map_desert_volcano_ruins_1793535545676.jpg',
        packageIds: ['pkg-t2-p2'],
        nodes: [
          {
            id: 'node-inter-gem2',
            type: 'treasure',
            title: 'קריסטל בניין 5 הרפלקסיבי',
            packageId: 'pkg-t2-p2',
            scoreReward: 50,
            position: { x: 54, y: 84 }
          },
          {
            id: 'node-inter-s6',
            type: 'landmark',
            landmarkType: 'oasis',
            title: 'נווה מדבר',
            description: 'מעיין צלול מוקף בעצי דקל.',
            scoreReward: 20,
            position: { x: 28, y: 80 }
          },
          {
            id: 'node-inter-s7',
            type: 'question',
            landmarkType: 'sun_pyramid',
            title: 'פירמידת השמש: בניין 2 ובניין 5',
            description: 'פירמידת מדרגות מלכותית.',
            packageId: 'pkg-t2-p2',
            questionId: 'q-t2-2',
            scoreReward: 150,
            position: { x: 70, y: 60 }
          },
          {
            id: 'node-inter-s8',
            type: 'landmark',
            landmarkType: 'ancient_ruins',
            title: 'העיר העתיקה',
            description: 'עמודי מקדש עתיקים מאבן חול.',
            scoreReward: 20,
            position: { x: 30, y: 48 }
          },
          {
            id: 'node-inter-s9',
            type: 'landmark',
            landmarkType: 'ghost_valley',
            title: 'עמק הרפאים',
            description: 'ואדי עמוק עם מצוקי בזלת.',
            scoreReward: 20,
            position: { x: 54, y: 34 }
          },
          {
            id: 'node-inter-s10',
            type: 'landmark',
            landmarkType: 'volcano',
            title: 'טיפוס להר הגעש',
            description: 'שביל אפר ולבה המוביל אל לוע ההר.',
            scoreReward: 20,
            position: { x: 72, y: 18 }
          }
        ]
      }
    ]
  },

  // TRACK 3 - ADVANCED LEVEL (רמת מתקדמים לבגרות)
  {
    id: 'track-adv-binyan3-8-weak',
    title: 'רמה 3: בניינים 3, 8 וגזרות מורכבות (רמת מתקדמים - 5 יח"ל)',
    difficulty: 'advanced',
    description: 'שליטה מתקדמת בבנייני שותפות ומאמץ (3 ו-8), זיהוי אותיות תבנית מוחדרות ושורשים מורכבים.',
    shareCode: 'ARB-B3-8-ADV',
    packages: [
      {
        id: 'pkg-t3-p3',
        title: 'בניינים 3 (فَاعَلَ) ו-8 (اِفْتَعَلَ) - שותפות, מאמץ ותבניות מוחדרות',
        binyanim: ['בניין 3 (فَاعَلَ)', 'בניין 8 (اِفْتَعَلَ)'],
        tenses: ['עבר (الماضي)', 'עתיד (المضارع)'],
        persons: ['נסתר (هُوَ)', 'נוכח (أَنْتَ)', 'רבים (הֻם)'],
        explanation:
          'בניין 3 (فَاعَلَ) כולל אליף מאריכה אחרי פ הפועל, ומציין פעולה הדדית או ניסיון (כְּמוֹ סַאפַרַ سَافَرَ = נסע, שַׁארַכַּ شَارَكَ = שיתף פעולה). בניין 8 (اِفْتَعَلَ) כולל המזת וַצל בראשיתו ותא מוחדרת אחרי פ הפועל (כְּמוֹ אִשְׁתַרַכַּ اِشْتَرَكَ = השתתף משורש ש.ר.כ). בבחינת הבגרות חשוב לזהות שהתא בבניין 8 אינה חלק מהשורש אלא מוספית!',
        examples: [
          { arabic: 'سَافَرَ', transliteration: 'סַאפַרַ', hebrew: 'הוא נסע (בניין 3, עבר)', note: 'אליף מאריכה אחרי האות הראשונה' },
          { arabic: 'اِشْتَرَكَ', transliteration: 'אִשְׁתַרַכַּ', hebrew: 'הוא השתתף (בניין 8, עבר)', note: 'אות ת מוחדרת' },
          { arabic: 'يَشْتَرِكُونَ', transliteration: 'יַשְׁתַרִכּוּנַ', hebrew: 'הם משתתפים (עתיד, נסתרים)', note: 'סיומת וּנַ' }
        ],
        imageUrl: '/assets/images/portrait_stage4_summit_1793470790553.jpg',
        createdAt: Date.now() - 100000
      }
    ],
    questions: [
      {
        id: 'q-t3-1',
        packageId: 'pkg-t3-p3',
        topic: 'בניין 8 (اِفْتَعَلَ)',
        type: 'multiple_choice',
        prompt: 'מהו השורש האמיתי של הפועל اِشْتَرَكَ ובאיזה בניין הוא נמצא?',
        arabicSample: 'اِشْتَرَكَ فِي الْمُسَابَقَةِ',
        correctAnswer: 'שורש ש.ר.כ, בניין 8 (اِفْتَعَلَ)',
        distractors: [
          'שורש ת.ר.כ, בניין 1 (فَعَلَ)',
          'שורש ש.ת.ר, בניין 2 (فَعَّلَ)',
          'שורש ש.ר.כ, בניין 5 (تَفَعَّلَ)'
        ],
        explanation: 'האות ת בבניין 8 (اِفْتَعَلَ) היא מוספית תבניתית. השורש הוא ש.ר.כ (שִרְכַּה = חברה/שותפות).'
      },
      {
        id: 'q-t3-2',
        packageId: 'pkg-t3-p3',
        topic: 'פעלים גזורים ומשמעויותיהם',
        type: 'matching_pairs',
        prompt: 'התאימו בין הפועל בערבית לתרגום ולבניין המדויק:',
        explanation: 'זכרו: סַאפַרַ = בניין 3 (אליף מאריכה), אִשְׁתַרַכַּ = בניין 8 (תא מוחדרת).',
        pairs: [
          { id: 'p3-1', arabic: 'سَافَرَ', target: 'נסע (בניין 3)' },
          { id: 'p3-2', arabic: 'اِشْتَرَكَ', target: 'השתתף (בניין 8)' },
          { id: 'p3-3', arabic: 'تَكَلَّمَ', target: 'דיבר (בניין 5)' },
          { id: 'p3-4', arabic: 'عَلَّمَ', target: 'לימד (בניין 2)' }
        ]
      }
    ],
    stages: [
      {
        id: 'stg-adv-1',
        stageNumber: 1,
        title: 'שלב 1: שביל המדבר והרי הגעש',
        landscapeName: 'שלב המדבר והר הגעש',
        backgroundImageUrl: '/assets/images/map_desert_volcano_ruins_1793535545676.jpg',
        packageIds: ['pkg-t3-p3'],
        nodes: [
          {
            id: 'node-adv-gem1',
            type: 'treasure',
            title: 'מערת הבניינים המורכבים',
            packageId: 'pkg-t3-p3',
            scoreReward: 50,
            position: { x: 54, y: 84 }
          },
          {
            id: 'node-adv-s1',
            type: 'landmark',
            landmarkType: 'oasis',
            title: 'נווה מדבר',
            description: 'מעיין מים צלול ורענן.',
            scoreReward: 20,
            position: { x: 28, y: 80 }
          },
          {
            id: 'node-adv-s2',
            type: 'question',
            landmarkType: 'sun_pyramid',
            title: 'פירמידת השמש: זיהוי שורש בבניין 8',
            description: 'פירמידת ענק עתיקה.',
            packageId: 'pkg-t3-p3',
            questionId: 'q-t3-1',
            scoreReward: 120,
            position: { x: 70, y: 60 }
          },
          {
            id: 'node-adv-s3',
            type: 'landmark',
            landmarkType: 'ancient_ruins',
            title: 'העיר העתיקה',
            description: 'חורבות עיר קדומה באבן חול.',
            scoreReward: 20,
            position: { x: 30, y: 48 }
          },
          {
            id: 'node-adv-s4',
            type: 'landmark',
            landmarkType: 'ghost_valley',
            title: 'עמק הרפאים',
            description: 'ואדי עמוק עם מצוקי בזלת.',
            scoreReward: 20,
            position: { x: 54, y: 34 }
          },
          {
            id: 'node-adv-s5',
            type: 'landmark',
            landmarkType: 'volcano',
            title: 'טיפוס להר הגעש',
            description: 'נתיב לבה מעשן אל פסגת ההר.',
            scoreReward: 20,
            position: { x: 72, y: 18 }
          }
        ]
      },
      {
        id: 'stg-adv-2',
        stageNumber: 2,
        title: 'שלב 2: שער הניצחון ברכס האלפים',
        landscapeName: 'שלב האלפים והיער הקסום',
        backgroundImageUrl: '/assets/images/map_alpine_snow_peaks_1793535545561.jpg',
        packageIds: ['pkg-t3-p3'],
        nodes: [
          {
            id: 'node-adv-gem2',
            type: 'treasure',
            title: 'קריסטל המאסטר הדקדוקי',
            packageId: 'pkg-t3-p3',
            scoreReward: 50,
            position: { x: 34, y: 88 }
          },
          {
            id: 'node-adv-s6',
            type: 'landmark',
            landmarkType: 'dark_forest',
            title: 'היער החשוך',
            description: 'יער עבות קסום עם עצי אורן.',
            scoreReward: 20,
            position: { x: 28, y: 78 }
          },
          {
            id: 'node-adv-s7',
            type: 'landmark',
            landmarkType: 'abyss_trail',
            title: 'שביל התהום',
            description: 'מצוק תלוי מעל תהום.',
            scoreReward: 20,
            position: { x: 64, y: 62 }
          },
          {
            id: 'node-adv-s8',
            type: 'landmark',
            landmarkType: 'turquoise_lake',
            title: 'אגם הטורקיז',
            description: 'אגם קרחוני שקט וטורקיז.',
            scoreReward: 20,
            position: { x: 35, y: 50 }
          },
          {
            id: 'node-adv-s9',
            type: 'question',
            landmarkType: 'snow_peak',
            title: 'פסגת השלג: התאמת פעלים מתקדמים',
            description: 'הפסגה הגבוהה ביותר ברכס.',
            packageId: 'pkg-t3-p3',
            questionId: 'q-t3-2',
            scoreReward: 160,
            position: { x: 50, y: 16 }
          },
          {
            id: 'node-adv-s10',
            type: 'landmark',
            landmarkType: 'cliff_climb',
            title: 'טיפוס לצוק',
            description: 'קיר טיפוס סלעי מאתגר.',
            scoreReward: 20,
            position: { x: 78, y: 38 }
          }
        ]
      }
    ]
  }
];
