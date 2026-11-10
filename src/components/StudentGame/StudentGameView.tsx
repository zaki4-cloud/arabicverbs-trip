import React, { useState, useEffect } from 'react';
import { GameHud } from './GameHud';
import { AdventureTrail } from './AdventureTrail';
import { KnowledgePopup } from './KnowledgePopup';
import { MultipleChoiceStation } from './MultipleChoiceStation';
import { MatchingPairsStation } from './MatchingPairsStation';
import { StagePassModal } from './StagePassModal';
import { CelebrationModal } from './CelebrationModal';
import { StudentNameModal } from './StudentNameModal';
import {
  GameTrack,
  StageNode,
  KnowledgePackage,
  Question,
  MultipleChoiceQuestion,
  MatchingPairsQuestion,
  StudentProgressRecord,
} from '../../types/game';
import { LogOut } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { saveStudentRecordToFirestore } from '../../firebase/firestoreService';
import { resolveImageUrl } from '../../utils/imageUrl';

interface StudentGameViewProps {
  activeTrack: GameTrack;
  tracks?: GameTrack[];
  onSelectTrack?: (trackId: string) => void;
  studentName?: string;
  onOpenTeacherStudio: () => void;
  onOpenGDevelopSpec: () => void;
}

export const StudentGameView: React.FC<StudentGameViewProps> = ({
  activeTrack,
  tracks = [],
  onSelectTrack,
  studentName = 'תלמיד תיכון',
  onOpenTeacherStudio,
  onOpenGDevelopSpec,
}) => {
  // Storage keys scoped to active track
  const stageKey = `arabic_adv_stage_idx_${activeTrack.id}`;
  const completedKey = `arabic_adv_completed_nodes_${activeTrack.id}`;
  const scoreKey = `arabic_adv_score_${activeTrack.id}`;
  const gemsKey = `arabic_adv_gems_${activeTrack.id}`;
  const totalQKey = `arabic_adv_total_q_${activeTrack.id}`;
  const correctQKey = `arabic_adv_correct_q_${activeTrack.id}`;

  // Persistent student game state
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(stageKey);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < activeTrack.stages.length) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return 0;
  });

  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(completedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [score, setScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(scoreKey);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return 0;
  });

  const [gemsCount, setGemsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(gemsKey);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return 0;
  });

  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(totalQKey);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return 0;
  });

  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(correctQKey);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return 0;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(stageKey, currentStageIndex.toString());
      localStorage.setItem(completedKey, JSON.stringify(completedNodeIds));
      localStorage.setItem(scoreKey, score.toString());
      localStorage.setItem(gemsKey, gemsCount.toString());
      localStorage.setItem(totalQKey, totalQuestionsAnswered.toString());
      localStorage.setItem(correctQKey, correctAnswersCount.toString());
    } catch {
      // Storage unavailable
    }
  }, [currentStageIndex, completedNodeIds, score, gemsCount, totalQuestionsAnswered, correctAnswersCount, activeTrack.id]);

  // When activeTrack.id changes, load state corresponding to the new track
  useEffect(() => {
    const sIdxKey = `arabic_adv_stage_idx_${activeTrack.id}`;
    const compKey = `arabic_adv_completed_nodes_${activeTrack.id}`;
    const scKey = `arabic_adv_score_${activeTrack.id}`;
    const gmKey = `arabic_adv_gems_${activeTrack.id}`;
    const totQKey = `arabic_adv_total_q_${activeTrack.id}`;
    const corQKey = `arabic_adv_correct_q_${activeTrack.id}`;

    try {
      const savedStage = localStorage.getItem(sIdxKey);
      setCurrentStageIndex(
        savedStage !== null
          ? Math.min(Math.max(0, parseInt(savedStage, 10) || 0), Math.max(0, activeTrack.stages.length - 1))
          : 0
      );

      const savedComp = localStorage.getItem(compKey);
      setCompletedNodeIds(savedComp ? JSON.parse(savedComp) : []);

      const savedScore = localStorage.getItem(scKey);
      setScore(savedScore !== null ? parseInt(savedScore, 10) || 0 : 0);

      const savedGems = localStorage.getItem(gmKey);
      setGemsCount(savedGems !== null ? parseInt(savedGems, 10) || 0 : 0);

      const savedTot = localStorage.getItem(totQKey);
      setTotalQuestionsAnswered(savedTot !== null ? parseInt(savedTot, 10) || 0 : 0);

      const savedCor = localStorage.getItem(corQKey);
      setCorrectAnswersCount(savedCor !== null ? parseInt(savedCor, 10) || 0 : 0);
    } catch {
      // Ignore
    }
    setIsGameCompleted(false);
    setShowCelebration(false);
    setShowStagePassModal(false);
    setActiveQuestion(null);
    setActiveTreasurePkg(null);
  }, [activeTrack.id]);

  // Modals state
  const [activeTreasurePkg, setActiveTreasurePkg] = useState<KnowledgePackage | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [showStagePassModal, setShowStagePassModal] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [floatingScore, setFloatingScore] = useState<{ points: number; x: number; y: number } | null>(null);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);

  // Student Identification State
  const [currentStudentName, setCurrentStudentName] = useState<string>(() => {
    try {
      return localStorage.getItem('arabic_adventure_student_name') || '';
    } catch {
      return '';
    }
  });
  const [showNameModal, setShowNameModal] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('arabic_adventure_student_name');
    } catch {
      return false;
    }
  });

  const handleSaveStudentName = (name: string, trackId?: string, isFreshStart?: boolean) => {
    setCurrentStudentName(name);
    const targetTrackId = trackId || activeTrack.id;
    if (trackId && onSelectTrack && trackId !== activeTrack.id) {
      onSelectTrack(trackId);
    }
    setShowNameModal(false);

    try {
      localStorage.setItem('arabic_adventure_student_name', name);
    } catch {
      // Storage unavailable
    }

    // When starting a fresh journey (new student or checked fresh start), reset all previous session state
    if (isFreshStart) {
      setCurrentStageIndex(0);
      setCompletedNodeIds([]);
      setScore(0);
      setGemsCount(0);
      setTotalQuestionsAnswered(0);
      setCorrectAnswersCount(0);
      setIsGameCompleted(false);
      setShowCelebration(false);
      setShowStagePassModal(false);
      setActiveQuestion(null);
      setActiveTreasurePkg(null);

      try {
        localStorage.removeItem(`arabic_adv_stage_idx_${targetTrackId}`);
        localStorage.removeItem(`arabic_adv_completed_nodes_${targetTrackId}`);
        localStorage.removeItem(`arabic_adv_score_${targetTrackId}`);
        localStorage.removeItem(`arabic_adv_gems_${targetTrackId}`);
        localStorage.removeItem(`arabic_adv_total_q_${targetTrackId}`);
        localStorage.removeItem(`arabic_adv_correct_q_${targetTrackId}`);
      } catch {
        // Storage unavailable
      }
    }
  };

  const currentStageRaw = activeTrack.stages[currentStageIndex] || activeTrack.stages[0];

  // Dynamically place up to 3 treasure nodes based on packages assigned to this stage
  const currentStage = React.useMemo(() => {
    if (!currentStageRaw) return activeTrack.stages[0];
    
    // Find packages for this stage
    const stagePkgIds = currentStageRaw.packageIds || [];
    const relevantPackages = stagePkgIds.length > 0
      ? activeTrack.packages.filter((p) => stagePkgIds.includes(p.id))
      : activeTrack.packages.slice(0, 1);

    const nodes = [...currentStageRaw.nodes];

    // If there are packages without a corresponding node, add them dynamically (up to 3)
    relevantPackages.slice(0, 3).forEach((pkg, idx) => {
      const alreadyHas = nodes.some((t) => t.packageId === pkg.id);
      if (!alreadyHas) {
        const xPositions = [18, 58, 102];
        const yPositions = [72, 66, 74];
        nodes.unshift({
          id: `dyn-treasure-${currentStageRaw.id}-${pkg.id}`,
          type: 'treasure',
          title: `אוצר: ${pkg.title}`,
          packageId: pkg.id,
          scoreReward: 50,
          position: { x: xPositions[idx] || 25, y: yPositions[idx] || 70 },
        });
      }
    });

    return {
      ...currentStageRaw,
      nodes,
    };
  }, [currentStageRaw, activeTrack.packages]);

  const avatarImgUrl = resolveImageUrl('/assets/images/adventurer_explorer_character_1793466160555.jpg');

  const saveStudentProgress = () => {
    try {
      const recordsJson = localStorage.getItem('arabic_adventure_student_records');
      const records: StudentProgressRecord[] = recordsJson ? JSON.parse(recordsJson) : [];

      const newRecord: StudentProgressRecord = {
        id: `prog-${Date.now()}`,
        studentName: currentStudentName.trim() || studentName || 'תלמיד תיכון',
        gameTrackId: activeTrack.id,
        gameTrackTitle: activeTrack.title,
        currentStageNumber: currentStageIndex + 1,
        totalStages: activeTrack.stages.length,
        score,
        gemsCount,
        correctAnswers: correctAnswersCount,
        totalQuestions: totalQuestionsAnswered,
        completedAt: Date.now(),
      };

      const updated = [newRecord, ...records.slice(0, 49)];
      localStorage.setItem('arabic_adventure_student_records', JSON.stringify(updated));

      // Asynchronously sync to Firebase Firestore for teacher live tracking
      saveStudentRecordToFirestore(newRecord).catch((err) => {
        console.warn('Could not sync student progress to Firestore:', err);
      });
    } catch {
      // Storage unavailable
    }
  };

  // Node Click Handlers
  const handleOpenNode = (node: StageNode) => {
    // 1. Question stations ALWAYS take absolute priority when clicked or approached
    if (node.type === 'question' || node.questionId) {
      const q = activeTrack.questions.find((item) => item.id === node.questionId) || activeTrack.questions[0];
      setActiveQuestion(q);
    } else if (node.type === 'treasure' || node.packageId) {
      const pkg =
        activeTrack.packages.find((p) => p.id === node.packageId) ||
        activeTrack.packages.find((p) => (currentStageRaw.packageIds || []).includes(p.id)) ||
        activeTrack.packages[0];
      setActiveTreasurePkg(pkg);
    } else if (node.type === 'landmark') {
      // Natural landscape waypoint without questions: no popup, no modal, no points
      soundManager.playStep();
    }
  };

  // Diamond / Treasure "הבנתי!" Click
  const handleUnderstoodKnowledge = (bonusPoints: number) => {
    setActiveTreasurePkg(null);

    const treasureNode =
      currentStage.nodes.find((n) => n.packageId === activeTreasurePkg?.id) ||
      currentStage.nodes.find((n) => n.type === 'treasure');

    const isAlreadyCompleted = Boolean(
      treasureNode && completedNodeIds.includes(treasureNode.id)
    );

    // Only award points and diamonds if this treasure package hasn't been opened yet
    if (!isAlreadyCompleted) {
      setScore((prev) => prev + bonusPoints);
      setGemsCount((prev) => prev + 1);

      if (treasureNode) {
        setCompletedNodeIds((prev) => [...prev, treasureNode.id]);
        setFloatingScore({
          points: bonusPoints,
          x: treasureNode.position.x,
          y: treasureNode.position.y,
        });
      } else {
        setFloatingScore({
          points: bonusPoints,
          x: 35,
          y: 60,
        });
      }
    }
  };

  // Answer Submit
  const handleAnswerSubmit = (isCorrect: boolean) => {
    setTotalQuestionsAnswered((prev) => prev + 1);
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      setScore((prev) => prev + 100);

      if (activeQuestion) {
        const currentMatchingNode = currentStage.nodes.find((n) => n.questionId === activeQuestion.id);
        if (currentMatchingNode) {
          setFloatingScore({
            points: 100,
            x: currentMatchingNode.position.x,
            y: currentMatchingNode.position.y,
          });
        }
      }
    }

    if (activeQuestion) {
      const currentMatchingNode = currentStage.nodes.find((n) => n.questionId === activeQuestion.id);
      if (currentMatchingNode) {
        const updatedCompleted = completedNodeIds.includes(currentMatchingNode.id)
          ? completedNodeIds
          : [...completedNodeIds, currentMatchingNode.id];

        if (!completedNodeIds.includes(currentMatchingNode.id)) {
          setCompletedNodeIds(updatedCompleted);
        }

        // Check if all questions in the current stage are answered now
        const stageQuestions = currentStage.nodes.filter((n) => n.type === 'question');
        const allStageAnswered =
          stageQuestions.length > 0 &&
          stageQuestions.every((q) => updatedCompleted.includes(q.id));

        if (allStageAnswered) {
          // Check if all questions across the entire track are done
          const allTrackQuestionNodes = activeTrack.stages
            .flatMap((s) => s.nodes)
            .filter((n) => n.type === 'question');
          const allTrackAnswered =
            allTrackQuestionNodes.length > 0 &&
            allTrackQuestionNodes.every((q) => updatedCompleted.includes(q.id));

          setTimeout(() => {
            if (allTrackAnswered || currentStageIndex >= activeTrack.stages.length - 1) {
              setIsGameCompleted(true);
              setShowCelebration(true);
            } else {
              setShowStagePassModal(true);
            }
            saveStudentProgress();
          }, 800);
        }
      }
    }
  };

  const handleContinueAfterQuestion = () => {
    setActiveQuestion(null);
  };

  // Proceed to Next Stage
  const handleProceedToNextStage = () => {
    setShowStagePassModal(false);
    if (currentStageIndex < activeTrack.stages.length - 1) {
      setCurrentStageIndex((prev) => prev + 1);
    }
  };

  // Restart game
  const handleRestart = () => {
    setCurrentStageIndex(0);
    setCompletedNodeIds([]);
    setScore(0);
    setGemsCount(0);
    setTotalQuestionsAnswered(0);
    setCorrectAnswersCount(0);
    setShowCelebration(false);
    setShowStagePassModal(false);
    setActiveQuestion(null);
    setActiveTreasurePkg(null);
    setIsGameCompleted(false);

    try {
      localStorage.removeItem(stageKey);
      localStorage.removeItem(completedKey);
      localStorage.removeItem(scoreKey);
      localStorage.removeItem(gemsKey);
      localStorage.removeItem(totalQKey);
      localStorage.removeItem(correctQKey);
    } catch {
      // Ignore
    }
  };

  // Prompt exit game via in-app modal (no blocked window.confirm)
  const handleTriggerExit = () => {
    setShowExitConfirmModal(true);
  };

  // Confirm exit: save progress, reset state, and return to entrance modal
  const handleConfirmExit = () => {
    saveStudentProgress();
    try {
      localStorage.removeItem(stageKey);
      localStorage.removeItem(completedKey);
      localStorage.removeItem(scoreKey);
      localStorage.removeItem(gemsKey);
      localStorage.removeItem(totalQKey);
      localStorage.removeItem(correctQKey);
    } catch {
      // Ignore
    }

    setCurrentStageIndex(0);
    setCompletedNodeIds([]);
    setScore(0);
    setGemsCount(0);
    setTotalQuestionsAnswered(0);
    setCorrectAnswersCount(0);
    setShowCelebration(false);
    setShowStagePassModal(false);
    setActiveQuestion(null);
    setActiveTreasurePkg(null);
    setIsGameCompleted(false);
    setShowExitConfirmModal(false);

    // Open identification / topic selection modal for the next student / session
    setShowNameModal(true);
  };

  const nextStage = activeTrack.stages[currentStageIndex + 1];

  return (
    <div className="flex flex-col h-[calc(100dvh-52px)] w-full max-w-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* HUD Header */}
      <GameHud
        score={score}
        gemsCount={gemsCount}
        currentStageNumber={currentStageIndex + 1}
        totalStages={activeTrack.stages.length}
        stageTitle={currentStage?.title || 'שלב המסע'}
        landscapeName={currentStage?.landscapeName || 'שביל הטבע'}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        studentName={currentStudentName}
        onEditStudentName={() => setShowNameModal(true)}
        onExitGame={handleTriggerExit}
        isGameCompleted={isGameCompleted}
        onSelectStage={(stageIdx) => setCurrentStageIndex(stageIdx)}
        trackTitle={activeTrack.title}
        onChangeTrack={() => setShowNameModal(true)}
      />

      {/* Trail Completed Exploration Top Banner */}
      {isGameCompleted && !showCelebration && (
        <div className="bg-gradient-to-r from-purple-950/95 via-slate-900/95 to-indigo-950/95 border-b border-purple-500/40 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-lg text-xs sm:text-sm text-slate-100 z-20 shrink-0 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🎉</span>
            <span className="font-bold text-white text-xs sm:text-sm">
              המסע הושלם בהצלחה! סיימתם את כל השאלות והתחנות.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCelebration(true)}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>סיכום הישגים ומדליות</span>
            </button>
            <button
              onClick={handleTriggerExit}
              className="px-3 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>יציאה מהמסע</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Playable Stage */}
      <main className="flex-1 w-full max-w-full flex items-center justify-center p-1 sm:p-3 overflow-hidden">
        <AdventureTrail
          currentStage={currentStage}
          completedNodeIds={completedNodeIds}
          onOpenNode={handleOpenNode}
          avatarImgUrl={avatarImgUrl}
          floatingScore={floatingScore}
          onClearFloatingScore={() => setFloatingScore(null)}
          hasNextStage={currentStageIndex < activeTrack.stages.length - 1}
          onNextStage={handleProceedToNextStage}
          hasPrevStage={currentStageIndex > 0}
          onPrevStage={() => setCurrentStageIndex((prev) => Math.max(0, prev - 1))}
          onCompleteTrack={() => {
            setIsGameCompleted(true);
            setShowCelebration(true);
            saveStudentProgress();
          }}
        />
      </main>

      {/* 1. Knowledge Treasure Modal */}
      {activeTreasurePkg && (
        <KnowledgePopup
          pkg={activeTreasurePkg}
          onUnderstood={handleUnderstoodKnowledge}
          onClose={() => setActiveTreasurePkg(null)}
        />
      )}

      {/* 2. Multiple Choice Question Modal */}
      {activeQuestion && activeQuestion.type === 'multiple_choice' && (
        <MultipleChoiceStation
          key={activeQuestion.id}
          question={activeQuestion as MultipleChoiceQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          onContinue={handleContinueAfterQuestion}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      {/* 3. Matching Pairs Question Modal */}
      {activeQuestion && activeQuestion.type === 'matching_pairs' && (
        <MatchingPairsStation
          key={activeQuestion.id}
          question={activeQuestion as MatchingPairsQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          onContinue={handleContinueAfterQuestion}
          onClose={() => setActiveQuestion(null)}
        />
      )}

      {/* 5. Stage Pass Celebration Modal */}
      {showStagePassModal && nextStage && (
        <StagePassModal
          completedStageNumber={currentStageIndex + 1}
          nextStageTitle={nextStage.title}
          nextStageLandscape={nextStage.landscapeName}
          onProceed={handleProceedToNextStage}
        />
      )}

      {/* 6. Final Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          score={score}
          gemsCount={gemsCount}
          totalQuestions={totalQuestionsAnswered}
          correctAnswersCount={correctAnswersCount}
          onRestart={handleRestart}
          onExit={handleTriggerExit}
          onExploreTrail={() => setShowCelebration(false)}
        />
      )}

      {/* 7. Student Name & Game Topic Selection Modal */}
      {showNameModal && (
        <StudentNameModal
          currentName={currentStudentName}
          onSaveName={handleSaveStudentName}
          canCloseWithoutSaving={!!currentStudentName}
          onClose={() => setShowNameModal(false)}
          tracks={tracks}
          selectedTrackId={activeTrack.id}
          onSelectTrack={onSelectTrack}
        />
      )}

      {/* 8. Exit Game Confirmation Modal (Safe, in-app without window.confirm) */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl max-w-sm w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <LogOut className="w-7 h-7 text-rose-400" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              יציאה מהמסע
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              האם ברצונכם לצאת מהמסע הנוכחי?
              <br />
              ההתקדמות והניקוד יישמרו ותוכלו לבחור נושא/סוג משחק חדש או להחליף שחקן.
            </p>

            <div className="flex flex-col sm:flex-row-reverse gap-2.5">
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-600/30 cursor-pointer active:scale-98"
              >
                כן, יציאה מהמסע
              </button>
              <button
                onClick={() => setShowExitConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all border border-slate-700 cursor-pointer"
              >
                המשך לשחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
