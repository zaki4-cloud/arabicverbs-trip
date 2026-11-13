import { LandmarkType, StageNode } from '../types/game';

export interface LandmarkMeta {
  type: LandmarkType;
  title: string;
  hebrewName: string;
  description: string;
  defaultPosition: { x: number; y: number };
}

export interface LandscapeSceneTemplate {
  idSuffix: string;
  title: string;
  landscapeName: string;
  imageUrl: string;
  description: string;
  stationTypes: LandmarkType[];
  includeTreasure?: boolean;
}

export interface LandscapePreset {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  description: string;
  stations: LandmarkMeta[];
  scenesTemplate?: LandscapeSceneTemplate[];
}

export const LANDSCAPE_PRESETS: LandscapePreset[] = [
  {
    id: 'green_mountain_pass',
    name: 'מעבר ההרים הירוק',
    title: 'שלב 1: מעבר ההרים הירוק ושבילי הטבע',
    imageUrl: '/assets/images/map_green_mountain_pass_1793535543245.jpg',
    description: 'עמק ירוק פורח עם שער עץ עתיק, מפל ומערה סודית, בקתת סוסי פרא ומעיינות חמים מרגיעים המצוירים ישירות במפה.',
    stations: [
      {
        type: 'stone_gate',
        title: 'שער העץ העתיק',
        hebrewName: 'שער העץ העתיק',
        description: 'שער עץ קורות עתיק ומרשים המצויר בפתח המסלול ומהווה את נקודת הפתיחה למסע.',
        defaultPosition: { x: 72, y: 44 },
      },
      {
        type: 'secret_waterfall',
        title: 'מפל המערה הסודית',
        hebrewName: 'מפל המערה הסודית',
        description: 'מפל מים שוצף הזורם אל תוך מערה נסתרת בצלע ההר.',
        defaultPosition: { x: 50, y: 52 },
      },
      {
        type: 'wild_horses',
        title: 'בקתת סוסי הפרא',
        hebrewName: 'בקתת סוסי הפרא (מרחבי אחו)',
        description: 'בקתת עץ כפרית עם מרעה פתוח בו משוטטים סוסי פרא אצילים.',
        defaultPosition: { x: 50, y: 48 },
      },
      {
        type: 'hot_springs',
        title: 'עמק המעיינות החמים',
        hebrewName: 'עמק המעיינות החמים',
        description: 'בריכות תרמיות טבעיות הפולטות אדי מרגוע בראש העמק.',
        defaultPosition: { x: 50, y: 46 },
      },
    ],
    scenesTemplate: [
      {
        idSuffix: 'sc1',
        title: 'שער העץ העתיק ושביל הפרחים',
        landscapeName: 'מבואת שער העץ',
        imageUrl: '/assets/images/scene_wooden_gate_trail_1793612278485.jpg',
        description: 'שער עץ קורות עתיק ומרשים המצויר בפתח המסלול עם שביל פסטורלי ופרחי בר.',
        stationTypes: ['stone_gate'],
        includeTreasure: true,
      },
      {
        idSuffix: 'sc2',
        title: 'מפל המערה הסודית',
        landscapeName: 'מפל המערה הסודית',
        imageUrl: '/assets/images/scene_secret_cavern_waterfall_1793612279783.jpg',
        description: 'מפל מים שוצף הזורם בנקיק סלעים אל תוך מערה נסתרת ומסתורית.',
        stationTypes: ['secret_waterfall'],
      },
      {
        idSuffix: 'sc3',
        title: 'בקתת סוסי הפרא',
        landscapeName: 'בקתת סוסי הפרא',
        imageUrl: '/assets/images/scene_wild_horses_cabin_1793612280320.jpg',
        description: 'בקתת עץ כפרית עם גדר קורות וסוסי פרא אצילים הרועים באחו הירוק.',
        stationTypes: ['wild_horses'],
      },
      {
        idSuffix: 'sc4',
        title: 'עמק המעיינות החמים',
        landscapeName: 'עמק המעיינות החמים',
        imageUrl: '/assets/images/scene_hot_springs_valley_1793612279814.jpg',
        description: 'מעיינות תרמיים טבעיים מבעבעים עם אדי חום מרגיעים בין סלעי העמק.',
        stationTypes: ['hot_springs'],
      },
    ],
  },
  {
    id: 'river_canyon',
    name: 'קניון הנהר הגועש',
    title: 'שלב 2: קניון הנהר ואבני המדרך',
    imageUrl: '/assets/images/map_rushing_river_canyon_1793535544870.jpg',
    description: 'קניון עמוק עם זרמי מים אדירים, גשר חבלים, מערת עטלפים, מעבר סלעים שחורים ומדרגות שמיים המצוירים במפה.',
    stations: [
      {
        type: 'rope_bridge',
        title: 'גשר החבלים',
        hebrewName: 'גשר החבלים התלוי',
        description: 'גשר חבלים מתנדנד בעוז מעל מימיו השוצפים של הקניון.',
        defaultPosition: { x: 50, y: 54 },
      },
      {
        type: 'black_rock',
        title: 'מעבר הסלע השחור',
        hebrewName: 'מעבר הסלע השחור (עמודי בזלת)',
        description: 'מעבר צר ומפותל בין גושי סלע בזלת שחורים ומרשימים.',
        defaultPosition: { x: 74, y: 35 },
      },
      {
        type: 'white_waterfalls',
        title: 'המפלים הלבנים',
        hebrewName: 'המפלים הלבנים הרב-שלביים',
        description: 'מפלי מים קוצפים ומלבינים הזורמים במורד מדרגות הסלע.',
        defaultPosition: { x: 68, y: 44 },
      },
      {
        type: 'bat_cave',
        title: 'מערת העטלפים',
        hebrewName: 'מערת העטלפים המסתורית',
        description: 'מערה אפלולית בצלע ההר שממנה מגיחים עטלפים בין הצללים.',
        defaultPosition: { x: 34, y: 56 },
      },
      {
        type: 'heaven_stairs',
        title: 'גרם המדרגות לגן עדן',
        hebrewName: 'גרם המדרגות לגן עדן (מעלה הסלע)',
        description: 'מדרגות אבן עתיקות תלולות החצובות בסלע ומובילות היישר אל פסגת המצוק.',
        defaultPosition: { x: 54, y: 48 },
      },
    ],
    scenesTemplate: [
      {
        idSuffix: 'sc1',
        title: 'גשר החבלים ומעבר הסלע השחור',
        landscapeName: 'גשר החבלים ועמודי הבזלת',
        imageUrl: '/assets/images/scene_river_bridge_basalt_1793612398221.jpg',
        description: 'גשר חבלים מרשים מעל מימי הנהר הגועשים ועמודי בזלת שחורים המיתמרים אל על.',
        stationTypes: ['rope_bridge', 'black_rock'],
        includeTreasure: true,
      },
      {
        idSuffix: 'sc2',
        title: 'המפלים הלבנים ומערת העטלפים',
        landscapeName: 'המפלים הלבנים והמערה',
        imageUrl: '/assets/images/scene_waterfalls_bat_cave_1793612410715.jpg',
        description: 'מפלים לבנים אדירים הנשפכים ברעש, ופתח מערת עטלפים מסתורית בסלע ההר.',
        stationTypes: ['white_waterfalls', 'bat_cave'],
      },
      {
        idSuffix: 'sc3',
        title: 'גרם המדרגות לגן עדן',
        landscapeName: 'המדרגות לפסגה',
        imageUrl: '/assets/images/scene_heaven_stairs_1793612422980.jpg',
        description: 'גרם מדרגות אבן עתיק ומפואר החצוב ברכס ההר ועולה ישירות אל העננים והשמש.',
        stationTypes: ['heaven_stairs'],
      },
    ],
  },
  {
    id: 'desert_volcano',
    name: 'שלב המדבר והר הגעש',
    title: 'שלב 3: מרחבי המדבר וטיפוס להר הגעש',
    imageUrl: '/assets/images/map_desert_volcano_ruins_1793535545676.jpg',
    description: 'דיונות זהובות, נווה מדבר שופע, עיר עתיקה, פירמידת שמש ומסלול טיפוס להר געש חי המצוירים כולם במפה.',
    stations: [
      {
        type: 'oasis',
        title: 'נווה מדבר',
        hebrewName: 'נווה מדבר (מעיין ועצי דקל)',
        description: 'מעיין מים צלול ומרענן מוקף בעצי דקל תמירים, שיחים וצל נעים בלב החולות.',
        defaultPosition: { x: 44, y: 58 },
      },
      {
        type: 'ancient_ruins',
        title: 'העיר העתיקה',
        hebrewName: 'חורבות העיר העתיקה',
        description: 'שרידי עמודי אבן, קשתות מפוארות ומקדשים קדומים מאבן חול.',
        defaultPosition: { x: 74, y: 38 },
      },
      {
        type: 'sun_pyramid',
        title: 'פירמידת השמש',
        hebrewName: 'פירמידת השמש המלכותית',
        description: 'פירמידת מדרגות מוזהבת ענקית הזורחת באור מרהיב תחת השמש המדברית.',
        defaultPosition: { x: 50, y: 50 },
      },
      {
        type: 'ghost_valley',
        title: 'עמק הרפאים',
        hebrewName: 'עמק הרפאים (ואדי מצוקי בזלת)',
        description: 'ואדי עמוק עם מצוקי בזלת שחורים וחדים משני צידיו.',
        defaultPosition: { x: 28, y: 64 },
      },
      {
        type: 'volcano',
        title: 'טיפוס להר הגעש',
        hebrewName: 'שביל הטיפוס להר הגעש',
        description: 'שביל מפותל המוביל היישר אל לוע הר הגעש והלבה הרוחשת.',
        defaultPosition: { x: 72, y: 22 },
      },
    ],
    scenesTemplate: [
      {
        idSuffix: 'sc1',
        title: 'נווה המדבר והעיר העתיקה',
        landscapeName: 'נווה המדבר והחורבות',
        imageUrl: '/assets/images/scene_oasis_ancient_ruins_1793612437882.jpg',
        description: 'מעיין מים טורקיז מוקף דקלים פורחים, לצד שרידי עיר עתיקה עם קשתות אבן קדומות.',
        stationTypes: ['oasis', 'ancient_ruins'],
        includeTreasure: true,
      },
      {
        idSuffix: 'sc2',
        title: 'פירמידת השמש ועמק הרפאים אל הר הגעש',
        landscapeName: 'פירמידת השמש והר הגעש',
        imageUrl: '/assets/images/scene_pyramid_volcano_1793612452275.jpg',
        description: 'פירמידת שמש מונומנטלית בעמק מצוקי בזלת ודרך מתפתלת אל עבר הר געש פעיל.',
        stationTypes: ['sun_pyramid', 'ghost_valley', 'volcano'],
      },
    ],
  },
  {
    id: 'alps_frost',
    name: 'שלב האלפים והיער הקסום',
    title: 'שלב 4: רכס האלפים ופסגת השלג',
    imageUrl: '/assets/images/map_alpine_snow_peaks_1793535545561.jpg',
    description: 'פסגות מושלגות מרהיבות, אגמי טורקיז, שבילי תהום עוצרי נשימה, יער חשוך וטיפוס צוקים המצוירים בתוך המפה.',
    stations: [
      {
        type: 'dark_forest',
        title: 'היער החשוך',
        hebrewName: 'היער החשוך המכושף',
        description: 'יער אורנים עבות ומסתורי עם צללים קסומים בתחילת הרכס.',
        defaultPosition: { x: 62, y: 46 },
      },
      {
        type: 'turquoise_lake',
        title: 'אגם הטורקיז',
        hebrewName: 'אגם הטורקיז הקרחוני',
        description: 'אגם קרחוני שקט בצבע טורקיז בוהק המשקף את הרי השלג.',
        defaultPosition: { x: 42, y: 60 },
      },
      {
        type: 'abyss_trail',
        title: 'שביל התהום',
        hebrewName: 'שביל התהום על פי הפחת',
        description: 'שביל סלעי צר התלוי בגובה מעל תהום ללא תחתית.',
        defaultPosition: { x: 44, y: 66 },
      },
      {
        type: 'cliff_climb',
        title: 'טיפוס לצוק',
        hebrewName: 'טיפוס לצוק הגרניט',
        description: 'קיר טיפוס סלעי מאתגר עם חבלי טיפוס ויתדות פלדה.',
        defaultPosition: { x: 66, y: 45 },
      },
      {
        type: 'snow_peak',
        title: 'פסגת השלג',
        hebrewName: 'פסגת השלג המנצחת',
        description: 'הנקודה הגבוהה ביותר ברכס, עטופה שלג עד וקרח זוהר תחת שמי התכלת.',
        defaultPosition: { x: 52, y: 20 },
      },
    ],
    scenesTemplate: [
      {
        idSuffix: 'sc1',
        title: 'אגם הטורקיז והיער החשוך',
        landscapeName: 'אגם הטורקיז והיער',
        imageUrl: '/assets/images/scene_turquoise_forest_1793612466995.jpg',
        description: 'אגם קרחוני בצבע טורקיז בוהק שסביבו יער אורנים עתיק ושביל אבנים מרוצף.',
        stationTypes: ['turquoise_lake', 'dark_forest'],
        includeTreasure: true,
      },
      {
        idSuffix: 'sc2',
        title: 'שביל התהום ופסגת השלג',
        landscapeName: 'שביל המצוק והפסגה',
        imageUrl: '/assets/images/scene_cliff_snow_summit_1793612481461.jpg',
        description: 'שביל צר על פי תהום עמוקה העולה עד לפסגת השלג המנצחת מעל העננים.',
        stationTypes: ['abyss_trail', 'cliff_climb', 'snow_peak'],
      },
    ],
  },
];

/**
 * Build stage nodes ensuring up to 3 treasure packages are placed,
 * plus all landmark stations (with or without questions attached).
 */
export function generateStageNodesWithLandmarks(
  stagePreset: LandscapePreset,
  packageIds: string[],
  stageQuestions: { questionId: string; stationType: LandmarkType }[] = []
): StageNode[] {
  const nodes: StageNode[] = [];

  // Up to 3 packages placed as treasures
  packageIds.slice(0, 3).forEach((pkgId, idx) => {
    const xOffsets = [30, 50, 72];
    const yOffsets = [74, 72, 74];
    nodes.push({
      id: `treasure-${stagePreset.id}-${idx}`,
      type: 'treasure',
      title: `אוצר ידע דקדוקי #${idx + 1}`,
      packageId: pkgId,
      scoreReward: 50,
      position: { x: xOffsets[idx] || 30, y: yOffsets[idx] || 70 },
    });
  });

  // Add the landmark stations
  stagePreset.stations.forEach((st) => {
    const matchedQ = stageQuestions.find((q) => q.stationType === st.type);
    nodes.push({
      id: `station-${stagePreset.id}-${st.type}`,
      type: matchedQ ? 'question' : 'landmark',
      landmarkType: st.type,
      title: st.title,
      description: st.description,
      questionId: matchedQ ? matchedQ.questionId : undefined,
      scoreReward: matchedQ ? 100 : 0,
      position: st.defaultPosition,
    });
  });

  return nodes;
}

/**
 * Build stage scenes partitioned cleanly with ~2 attractions per scene
 */
import { StageScene } from '../types/game';

export function generateStageScenesWithLandmarks(
  stagePreset: LandscapePreset,
  allNodes: StageNode[]
): StageScene[] {
  if (!stagePreset.scenesTemplate || stagePreset.scenesTemplate.length === 0) {
    // Fallback: chunk nodes by 2
    const scenes: StageScene[] = [];
    const chunkSize = 2;
    for (let i = 0; i < allNodes.length; i += chunkSize) {
      const chunk = allNodes.slice(i, i + chunkSize);
      const idx = Math.floor(i / chunkSize) + 1;
      scenes.push({
        id: `${stagePreset.id}-sc-${idx}`,
        title: chunk.map((n) => n.title.split(':')[0]).join(' ו-') || `קטע ${idx}`,
        landscapeName: stagePreset.name,
        backgroundImageUrl: stagePreset.imageUrl,
        description: chunk[0]?.description,
        nodes: chunk,
      });
    }
    return scenes;
  }

  const totalScenes = stagePreset.scenesTemplate.length;

  return stagePreset.scenesTemplate.map((tmpl, sceneIdx) => {
    const sceneNodes: StageNode[] = [];

    // Distribute dedicated treasures to appropriate scene (scene 0 for start, 1 for mid, 2 for end)
    const treasures = allNodes.filter((n) => n.type === 'treasure');
    treasures.forEach((tr, tIdx) => {
      let targetSceneIdx = 0;
      if (tr.id.includes('-mid') || (tr.position && tr.position.x >= 40 && tr.position.x < 65)) {
        targetSceneIdx = Math.min(1, totalScenes - 1);
      } else if (tr.id.includes('-end') || (tr.position && tr.position.x >= 65)) {
        targetSceneIdx = Math.max(0, totalScenes - 1);
      } else if (tr.id.includes('-start') || (tr.position && tr.position.x < 40)) {
        targetSceneIdx = 0;
      } else {
        // Fallback: distribute evenly
        targetSceneIdx = Math.min(tIdx, totalScenes - 1);
      }

      if (sceneIdx === targetSceneIdx) {
        sceneNodes.push({
          ...tr,
          position: tr.position || { x: 24, y: 72 },
        });
      }
    });

    // Include landmarks & stations matching this template's station types
    tmpl.stationTypes.forEach((stType, stIdx) => {
      const matchedNode = allNodes.find((n) => n.landmarkType === stType);
      if (matchedNode) {
        // Preserve position or use clean template layout
        const hasTreasureInThisScene = sceneNodes.some((n) => n.type === 'treasure');
        let pos = matchedNode.position;
        if (hasTreasureInThisScene && stIdx === 0) {
          pos = { x: 72, y: 44 };
        } else if (tmpl.stationTypes.length === 1) {
          pos = matchedNode.position || { x: 50, y: 50 };
        } else if (tmpl.stationTypes.length === 2) {
          pos = matchedNode.position || (stIdx === 0 ? { x: 34, y: 56 } : { x: 68, y: 44 });
        }

        sceneNodes.push({
          ...matchedNode,
          position: pos,
        });
      }
    });

    return {
      id: `${stagePreset.id}-${tmpl.idSuffix}`,
      title: tmpl.title,
      landscapeName: tmpl.landscapeName,
      backgroundImageUrl: tmpl.imageUrl,
      description: tmpl.description,
      nodes: sceneNodes,
    };
  });
}
