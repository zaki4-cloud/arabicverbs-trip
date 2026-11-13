import { GameTrack, GameStage, StageNode, Question } from '../types/game';
import { LANDSCAPE_PRESETS, generateStageScenesWithLandmarks } from '../data/landmarkPresets';
import { INITIAL_GAME_TRACKS } from '../data/initialPackages';
import { cleanTenseLabel, cleanPersonLabel } from './grammarLabels';

export function migrateTrackMapImages(tracks: GameTrack[]): GameTrack[] {
  const defaultTrack = INITIAL_GAME_TRACKS[0];

  return (tracks || [])
    .filter((track) => track && typeof track === 'object' && track.id)
    .map((track) => {
      const safeQuestions = Array.isArray(track.questions) ? track.questions : [];
      const safeStages =
        Array.isArray(track.stages) && track.stages.length > 0 ? track.stages : defaultTrack.stages;

      // If track is missing questions from default (e.g. stages 3 & 4), merge them in
      const existingQIds = new Set(safeQuestions.map((q) => q.id));
      const mergedQuestions: Question[] = [...safeQuestions];
      if (defaultTrack && track.id === defaultTrack.id) {
        defaultTrack.questions.forEach((dq) => {
          if (!existingQIds.has(dq.id)) {
            mergedQuestions.push(dq);
          }
        });
      }

      const defaultAchievements =
        track.achievements && track.achievements.length > 0
          ? track.achievements
          : track.id.includes('basic') || track.title?.includes('בניין 1') || track.title?.includes('עבר')
          ? [
              'שליטה מלאה בזיהוי גופים וסיומות בפועל השלם בעבר',
              'הבחנה מדויקת במשמעות בניין 1 הבסיסי ותרגום שוטף',
              'הצלחה בהתאמת צמדים מורפולוגיים ומענה נכון על שאלות המסע',
            ]
          : [
              'שליטה מלאה בזיהוי גופים וזמנים בבניינים 1, 2 ו-5',
              'הבחנה בין פעולת גרימה לפעולה חוזרת ורפלקסיבית',
              'הצלחה בהתאמת צמדים מורפולוגיים ותרגום שוטף',
            ];

      const cleanedPackages = (track.packages || []).map((pkg) => ({
        ...pkg,
        tenses: (pkg.tenses || []).map(cleanTenseLabel).filter(Boolean),
        persons: (pkg.persons || []).map(cleanPersonLabel).filter(Boolean),
      }));

      return {
        ...track,
        achievements: defaultAchievements,
        packages: cleanedPackages,
        questions: mergedQuestions,
        stages: safeStages.map((stage, idx) => {
          const displacedPackageIds: string[] = [];
          const stageNodes = Array.isArray(stage.nodes) ? stage.nodes : [];

          // Clean nodes: remove confusing names, remove score on non-question landmarks, separate positions
          const cleanedNodes: StageNode[] = stageNodes.map((n) => {
            let title = n.title || '';
            if (title.includes('שער האבן')) {
              title = 'שער העץ העתיק';
            }

            // Distinct non-overlapping positions
            let pos = n.position || { x: 50, y: 50 };
            if (n.type === 'treasure') {
              pos = { x: 24, y: 72 };
            } else if (n.landmarkType === 'stone_gate') {
              pos = { x: 72, y: 44 };
            } else if (n.landmarkType === 'white_waterfalls') {
              pos = { x: 68, y: 44 };
            } else if (n.landmarkType === 'bat_cave') {
              pos = { x: 34, y: 56 };
            }

            let type = n.type;
            let questionId = n.questionId;
            let scoreReward = n.scoreReward;

            // If stage 3 or 4 lacks questions, assign them to key landmarks
            if (stage.id === 'stg-3' || stage.stageNumber === 3) {
              if (n.landmarkType === 'sun_pyramid' || n.id === 'stg3-s2') {
                type = 'question';
                questionId = 'q-t1-4';
                scoreReward = 120;
              } else if (n.landmarkType === 'volcano' || n.id === 'stg3-s5') {
                type = 'question';
                questionId = 'q-t1-5';
                scoreReward = 150;
              }
            } else if (stage.id === 'stg-4' || stage.stageNumber === 4) {
              if (n.landmarkType === 'turquoise_lake' || n.id === 'stg4-s3') {
                type = 'question';
                questionId = 'q-t1-6';
                scoreReward = 150;
              } else if (n.landmarkType === 'snow_peak' || n.id === 'stg4-s5') {
                type = 'question';
                questionId = 'q-t1-7';
                scoreReward = 200;
              }
            }

            // Strict separation: A question node must NEVER have packageId stuck on it!
            const isQuestion = type === 'question' || Boolean(questionId);
            let packageId = n.packageId;

            if (isQuestion) {
              type = 'question';
              if (packageId) {
                displacedPackageIds.push(packageId);
                packageId = undefined;
              }
            }

            const isTreasure = !isQuestion && (type === 'treasure' || Boolean(packageId));
            scoreReward = isQuestion ? (scoreReward || 100) : isTreasure ? (scoreReward || 50) : 0;

            return {
              ...n,
              title,
              type,
              questionId,
              packageId,
              position: pos,
              scoreReward,
            };
          });

          // Ensure any displaced packages have a dedicated treasure node in this stage
          displacedPackageIds.forEach((pkgId, pIdx) => {
            if (!cleanedNodes.some((n) => n.packageId === pkgId)) {
              cleanedNodes.unshift({
                id: `treasure-${stage.id}-${pkgId}`,
                type: 'treasure',
                title: `אוצר ידע דקדוקי #${pIdx + 1}`,
                packageId: pkgId,
                scoreReward: 50,
                position: { x: 24 + pIdx * 16, y: 72 },
              });
            }
          });

          // Find matching preset
          const preset =
            LANDSCAPE_PRESETS.find((p) => p.name === stage.landscapeName || p.id === stage.id) ||
            LANDSCAPE_PRESETS[Math.min(idx, LANDSCAPE_PRESETS.length - 1)];

          // Generate or refresh scenes so every scene has its dedicated visual landscape and question nodes
          const stageQuestionsCount = cleanedNodes.filter((n) => n.type === 'question').length;
          const currentScenesQuestionsCount = (stage.scenes || [])
            .flatMap((s) => s.nodes || [])
            .filter((n) => n.type === 'question').length;

          const hasCollidingPackageOnQuestion = stageNodes.some(
            (n) => (n.type === 'question' || n.questionId) && n.packageId
          );
          const hasCollidingScenes = (stage.scenes || []).some((sc) =>
            (sc.nodes || []).some((n) => (n.type === 'question' || n.questionId) && n.packageId)
          );

          const needsScenesRefresh =
            !stage.scenes ||
            stage.scenes.length === 0 ||
            hasCollidingPackageOnQuestion ||
            hasCollidingScenes ||
            displacedPackageIds.length > 0 ||
            stage.scenes.every((sc) => sc.backgroundImageUrl === stage.backgroundImageUrl) ||
            stage.scenes.some((sc) => (sc.nodes || []).some((n) => (n.title || '').includes('שער האבן'))) ||
            (stageQuestionsCount > 0 && currentScenesQuestionsCount === 0);

          const scenes = needsScenesRefresh
            ? generateStageScenesWithLandmarks(preset, cleanedNodes)
            : (stage.scenes || []).map((sc) => ({
                ...sc,
                nodes: (sc.nodes || []).map((n) => {
                  let title = n.title || '';
                  if (title.includes('שער האבן')) {
                    title = 'שער העץ העתיק';
                  }
                  let pos = n.position || { x: 50, y: 50 };
                  if (n.type === 'treasure') {
                    pos = { x: 24, y: 72 };
                  } else if (n.landmarkType === 'stone_gate') {
                    pos = { x: 72, y: 44 };
                  } else if (n.landmarkType === 'white_waterfalls') {
                    pos = { x: 68, y: 44 };
                  } else if (n.landmarkType === 'bat_cave') {
                    pos = { x: 34, y: 56 };
                  }
                  const isQuestion = n.type === 'question';
                  const isTreasure = n.type === 'treasure';
                  const scoreReward = isQuestion ? (n.scoreReward || 100) : isTreasure ? (n.scoreReward || 50) : 0;

                  return {
                    ...n,
                    title,
                    position: pos,
                    scoreReward,
                  };
                }),
              }));

      const activeBg = scenes && scenes.length > 0 ? scenes[0].backgroundImageUrl : preset.imageUrl;

      return {
        ...stage,
        backgroundImageUrl: activeBg,
        nodes: cleanedNodes,
        scenes,
      };
      }),
    };
  });
}
