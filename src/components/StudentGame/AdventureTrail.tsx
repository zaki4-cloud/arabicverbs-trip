import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  HelpCircle,
  Check,
  Compass,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Hand,
  Gem,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Flag,
  Trophy
} from 'lucide-react';
import { StageNode, GameStage, StageScene } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { FloatingScoreBadge } from './CelebrationEffects';
import { LANDSCAPE_PRESETS, generateStageScenesWithLandmarks } from '../../data/landmarkPresets';
import { resolveImageUrl } from '../../utils/imageUrl';

interface AdventureTrailProps {
  currentStage: GameStage;
  completedNodeIds: string[];
  onOpenNode: (node: StageNode) => void;
  avatarImgUrl: string;
  floatingScore?: { points: number; x: number; y: number } | null;
  onClearFloatingScore?: () => void;
  onNextStage?: () => void;
  hasNextStage?: boolean;
  onPrevStage?: () => void;
  hasPrevStage?: boolean;
  onCompleteTrack?: () => void;
}

export const AdventureTrail: React.FC<AdventureTrailProps> = ({
  currentStage,
  completedNodeIds,
  onOpenNode,
  avatarImgUrl,
  floatingScore,
  onClearFloatingScore,
  onNextStage,
  hasNextStage,
  onPrevStage,
  hasPrevStage,
  onCompleteTrack,
}) => {
  // Always guarantee distinct, breathtaking multi-scenes for each stage
  const scenes: StageScene[] = useMemo(() => {
    // If the stage already has multiple scenes with distinct background artworks, use them
    if (
      currentStage.scenes &&
      currentStage.scenes.length > 1 &&
      !currentStage.scenes.every((s) => s.backgroundImageUrl === currentStage.scenes![0].backgroundImageUrl)
    ) {
      return currentStage.scenes;
    }

    // Otherwise, generate the scenes directly from presets matching this stage
    const preset =
      LANDSCAPE_PRESETS.find((p) => p.name === currentStage.landscapeName || p.id === currentStage.id) ||
      LANDSCAPE_PRESETS[Math.min(Math.max(0, currentStage.stageNumber - 1), LANDSCAPE_PRESETS.length - 1)];

    return generateStageScenesWithLandmarks(preset, currentStage.nodes);
  }, [currentStage]);

  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 50, y: 84 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [gleamingNodeId, setGleamingNodeId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const worldCanvasRef = useRef<HTMLDivElement>(null);
  const lastSoundTimeRef = useRef<number>(0);

  // Active scene & safety check
  const safeSceneIndex = Math.min(Math.max(0, currentSceneIndex), scenes.length - 1);
  const activeScene = scenes[safeSceneIndex] || scenes[0];
  const activeNodes = activeScene.nodes || [];

  // Reset to first scene when the stage changes
  useEffect(() => {
    setCurrentSceneIndex(0);
    setPlayerPos({ x: 50, y: 84 });
    setIsDragging(false);
    setGleamingNodeId(null);
  }, [currentStage.id]);

  // Global pointer release listener so the character NEVER gets stuck dragging
  useEffect(() => {
    const handleGlobalRelease = () => {
      setIsDragging(false);
    };
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    window.addEventListener('blur', handleGlobalRelease);
    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      window.removeEventListener('blur', handleGlobalRelease);
    };
  }, []);

  // Navigate to scene with smooth transition
  const handleGoToScene = (nextIdx: number, entranceY: number = 84) => {
    if (nextIdx < 0 || nextIdx >= scenes.length || nextIdx === currentSceneIndex) return;

    soundManager.playStep();
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSceneIndex(nextIdx);
      setPlayerPos({ x: 50, y: entranceY });
      setIsTransitioning(false);
    }, 280);
  };

  // Convert pointer event to percentage coordinate inside world canvas
  const getCoordinatesFromEvent = (clientX: number, clientY: number) => {
    if (!worldCanvasRef.current) return null;
    const rect = worldCanvasRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(12, Math.min(88, y)),
    };
  };

  // Check proximity to trigger interactive questions or treasures/knowledge stations
  const checkProximityTrigger = (coords: { x: number; y: number }) => {
    const nearNode = activeNodes.find((n) => {
      // Do not trigger landmarks without question or package
      if (n.type === 'landmark' && !n.packageId) return false;
      const dist = Math.hypot(n.position.x - coords.x, n.position.y - coords.y);
      return dist < 12;
    });
    if (nearNode) {
      handleTriggerNode(nearNode);
    }
  };

  // Trigger node action
  const handleTriggerNode = (node: StageNode) => {
    // 1. Question stations ALWAYS trigger question first!
    if (node.type === 'question' || node.questionId) {
      onOpenNode(node);
    } else if (node.type === 'treasure' || node.packageId) {
      setGleamingNodeId(node.id);
      soundManager.playGleam();
      setTimeout(() => {
        setGleamingNodeId(null);
        onOpenNode(node);
      }, 380);
    }
    // Landmarks without questions or packages are passive visual scenery
  };

  const playStepThrottled = () => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 220) {
      soundManager.playStep();
      lastSoundTimeRef.current = now;
    }
  };

  // Tap-to-walk on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const coords = getCoordinatesFromEvent(e.clientX, e.clientY);
    if (!coords) return;

    setPlayerPos(coords);
    playStepThrottled();
    checkProximityTrigger(coords);
  };

  // Pointer dragging on canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!worldCanvasRef.current) return;
    const coords = getCoordinatesFromEvent(e.clientX, e.clientY);
    if (!coords) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setIsDragging(true);
    setPlayerPos(coords);
    playStepThrottled();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const coords = getCoordinatesFromEvent(e.clientX, e.clientY);
    if (!coords) return;

    setPlayerPos(coords);
    playStepThrottled();

    // Natural scene transition: dragging to the top exit or bottom entrance
    if (coords.y <= 14 && safeSceneIndex < scenes.length - 1 && !isTransitioning) {
      setIsDragging(false);
      handleGoToScene(safeSceneIndex + 1, 82);
    } else if (coords.y >= 86 && safeSceneIndex > 0 && !isTransitioning) {
      setIsDragging(false);
      handleGoToScene(safeSceneIndex - 1, 22);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const coords = getCoordinatesFromEvent(e.clientX, e.clientY);
    if (coords) {
      checkProximityTrigger(coords);
    }
  };

  // Directional nudge buttons (up, down, left, right)
  const handleNudge = (dx: number, dy: number) => {
    const nextX = Math.max(8, Math.min(92, playerPos.x + dx));
    const nextY = Math.max(12, Math.min(88, playerPos.y + dy));
    setPlayerPos({ x: nextX, y: nextY });
    soundManager.playStep();
    checkProximityTrigger({ x: nextX, y: nextY });

    if (nextY <= 14 && safeSceneIndex < scenes.length - 1) {
      handleGoToScene(safeSceneIndex + 1, 82);
    } else if (nextY >= 86 && safeSceneIndex > 0) {
      handleGoToScene(safeSceneIndex - 1, 22);
    }
  };

  // Questions status for the whole stage
  const allQuestionNodes = currentStage.nodes.filter((n) => n.type === 'question');
  const totalAnswered = allQuestionNodes.filter((n) => completedNodeIds.includes(n.id)).length;
  const isStageReady = totalAnswered === allQuestionNodes.length && allQuestionNodes.length > 0;

  const hasNextScene = safeSceneIndex < scenes.length - 1;
  const hasPrevScene = safeSceneIndex > 0;
  const nextSceneTitle = hasNextScene ? scenes[safeSceneIndex + 1].title : '';
  const prevSceneTitle = hasPrevScene ? scenes[safeSceneIndex - 1].title : '';

  return (
    <div className="flex flex-col items-center w-full h-full max-w-2xl mx-auto select-none">
      {/* Scene Journey Header (Breadcrumbs & Step navigation) */}
      <div className="w-full mb-2 bg-slate-900/90 border border-purple-500/40 rounded-2xl px-3 py-2 shadow-lg backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '18s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-purple-300">
                קטע {safeSceneIndex + 1} מתוך {scenes.length}:
              </span>
              <span className="text-xs font-black text-white">{activeScene.title}</span>
            </div>
            {activeScene.description && (
              <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[280px]">
                {activeScene.description}
              </p>
            )}
          </div>
        </div>

        {/* Stepper Dots to Jump Across Scenes */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 px-2 py-1 rounded-xl border border-purple-500/30">
          {scenes.map((sc, sIdx) => {
            const isCurrent = sIdx === safeSceneIndex;
            const scQuestions = sc.nodes.filter((n) => n.type === 'question');
            const isScDone =
              scQuestions.length > 0 && scQuestions.every((q) => completedNodeIds.includes(q.id));

            return (
              <button
                key={sc.id || sIdx}
                type="button"
                onClick={() => handleGoToScene(sIdx)}
                className={`relative px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-md scale-105'
                    : isScDone
                    ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title={sc.title}
              >
                {isScDone ? (
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                ) : (
                  <span>{sIdx + 1}</span>
                )}
                <span className="hidden md:inline">{sc.landscapeName.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Outer Viewport Frame with relative positioning */}
      <div className="relative w-full flex-1 min-h-[64vh] max-h-[82vh] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-2xl bg-slate-950">
        {/* World Canvas: Renders only current scene's high-res background & non-overlapping attractions */}
        <div
          ref={worldCanvasRef}
          dir="ltr"
          onClick={handleCanvasClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setIsDragging(false)}
          style={{ touchAction: 'none' }}
          className={`relative w-full h-full cursor-pointer select-none transition-opacity duration-300 ${
            isTransitioning ? 'opacity-30' : 'opacity-100'
          }`}
        >
          {/* Active Landscape Scene Artwork - Transforms completely per scene */}
          <img
            key={activeScene.backgroundImageUrl}
            src={resolveImageUrl(activeScene.backgroundImageUrl)}
            alt={activeScene.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 pointer-events-none transition-all duration-500"
          />

          {/* Atmospheric Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/45 pointer-events-none" />

          {/* Top Floating Badge inside Scene */}
          <div className="absolute top-2.5 right-3 left-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-md border border-purple-500/40 px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 pointer-events-auto">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-white truncate max-w-[160px]">
                {activeScene.landscapeName}
              </span>
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md border border-purple-500/40 px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 pointer-events-auto">
              <ShieldCheck className={`w-3.5 h-3.5 ${isStageReady ? 'text-emerald-400' : 'text-purple-300'}`} />
              <span className={`text-xs font-bold tabular-nums ${isStageReady ? 'text-emerald-400' : 'text-purple-200'}`}>
                משימות שלב: {totalAnswered}/{allQuestionNodes.length}
              </span>
            </div>
          </div>

          {/* Floating Forward Navigation Arrow (to Next Scene) */}
          {hasNextScene && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsDragging(false);
                handleGoToScene(safeSceneIndex + 1, 84);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 group p-2 sm:px-3 sm:py-2 rounded-2xl bg-purple-900/90 hover:bg-purple-800 border-2 border-purple-400 text-white shadow-2xl backdrop-blur-md flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
              title={`המשך לקטע הבא: ${nextSceneTitle}`}
            >
              <ChevronLeft className="w-5 h-5 text-amber-300 drop-shadow" />
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-purple-200 font-bold leading-tight">המשך במסע ➔</div>
                <div className="text-xs font-black text-amber-300 truncate max-w-[120px]">
                  {nextSceneTitle.split(' ')[0]}
                </div>
              </div>
            </button>
          )}

          {/* Floating Backward Navigation Arrow (to Prev Scene) */}
          {hasPrevScene && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsDragging(false);
                handleGoToScene(safeSceneIndex - 1, 26);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 group p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/60 text-slate-200 shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title={`חזרה לקטע הקודם: ${prevSceneTitle}`}
            >
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400 font-bold leading-tight">➔ חזרה</div>
                <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                  {prevSceneTitle.split(' ')[0]}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-300" />
            </button>
          )}

          {/* Stage Completion Banner when on final scene and ready */}
          {!hasNextScene && isStageReady && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-25 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-1.5 rounded-full border border-emerald-300 shadow-2xl flex items-center gap-2 animate-bounce pointer-events-none">
              <Flag className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-black">השלב הושלם בהצלחה! לחצו 'ממשיכים במסע' למעלה</span>
            </div>
          )}

          {/* Waypoint Nodes: strictly positioned far apart to prevent ANY overlap */}
          {activeNodes.map((node) => {
            const isCompleted = completedNodeIds.includes(node.id);
            const isQuestion = node.type === 'question' || Boolean(node.questionId);
            const isTreasure = !isQuestion && (node.type === 'treasure' || Boolean(node.packageId));
            const isLandmarkOnly = !isQuestion && !isTreasure;
            const isGleaming = gleamingNodeId === node.id;
            const displayTitle = node.title.replace('שער האבן', 'שער העץ העתיק').replace('(שער עץ)', '').trim();

            return (
              <div
                key={node.id}
                style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none"
              >
                {/* Pulsing Aura if interactive and not yet completed */}
                {!isCompleted && !isLandmarkOnly && (
                  <span
                    className={`absolute w-16 h-16 rounded-full animate-ping opacity-40 pointer-events-none ${
                      isTreasure ? 'bg-amber-400' : 'bg-purple-500'
                    }`}
                  />
                )}

                {/* Radiant Gleam Burst Effect */}
                {isGleaming && (
                  <div className="absolute inset-0 -m-10 flex items-center justify-center pointer-events-none z-30">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 opacity-95 animate-gleam blur-[1px] shadow-2xl" />
                    <Sparkles className="w-14 h-14 text-white absolute animate-spin" />
                  </div>
                )}

                {/* Node Interactive Object */}
                {isTreasure ? (
                  /* Elegant Large Wooden Treasure Chest on Trail */
                  <div className="flex flex-col items-center pointer-events-auto">
                    {/* Trigger Button Above Chest */}
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDragging(false);
                        setPlayerPos({ x: node.position.x, y: node.position.y + 4 });
                        handleTriggerNode(node);
                      }}
                      className={`relative z-20 px-3 py-1 rounded-full border shadow-xl transition-all cursor-pointer flex items-center gap-1.5 transform active:scale-95 -mb-2 ${
                        isCompleted
                          ? 'bg-slate-900/90 border-purple-500/80 text-purple-300 scale-95'
                          : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-yellow-200 text-slate-950 ring-2 ring-amber-400/40 hover:scale-105 shadow-amber-500/40'
                      }`}
                      title="לחצו לפתיחת האוצר וההסבר הדקדוקי"
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                          <span className="text-[10px] font-bold">אוצר נפתח ✓</span>
                        </>
                      ) : (
                        <>
                          <Gem className="w-3.5 h-3.5 text-slate-950 fill-amber-900 animate-pulse" />
                          <span className="text-xs font-black">פתח אוצר 💎</span>
                        </>
                      )}
                    </button>

                    {/* Clear Wooden Chest Artwork */}
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDragging(false);
                        setPlayerPos({ x: node.position.x, y: node.position.y + 4 });
                        handleTriggerNode(node);
                      }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden relative shadow-2xl transition-all transform cursor-pointer border-2 bg-slate-950/80 backdrop-blur-sm ${
                        isCompleted
                          ? 'border-purple-500/60 opacity-85 scale-95'
                          : 'border-amber-400 ring-4 ring-amber-400/35 hover:scale-110 shadow-amber-500/50'
                      } ${isGleaming ? 'scale-125 brightness-125 ring-8 ring-amber-300' : ''}`}
                      title={displayTitle}
                    >
                      <img
                        src={resolveImageUrl('/assets/images/wooden_treasure_chest_1793483057106.jpg')}
                        alt="תיבת עץ ואוצר מטבעות"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isCompleted && (
                        <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center">
                          <Check className="w-7 h-7 text-emerald-400 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : isQuestion ? (
                  /* Interactive Question Waypoint Disc */
                  <div className="flex flex-col items-center pointer-events-auto">
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDragging(false);
                        setPlayerPos({ x: node.position.x, y: node.position.y + 2 });
                        handleTriggerNode(node);
                      }}
                      className={`relative group cursor-pointer transition-all transform active:scale-95 flex items-center justify-center ${
                        !isCompleted ? 'hover:scale-110' : 'hover:scale-105'
                      }`}
                      title={node.description || displayTitle}
                    >
                      {/* Status Label on Top */}
                      {!isCompleted && (
                        <div className="absolute -top-4 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-yellow-200 shadow-md whitespace-nowrap animate-pulse">
                          שאלת מסע ⭐
                        </div>
                      )}

                      {/* Waypoint Portal Ring */}
                      <div
                        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 shadow-2xl backdrop-blur-md transition-all ${
                          isCompleted
                            ? 'bg-slate-950/85 border-emerald-500/80 shadow-emerald-500/30 ring-2 ring-emerald-500/20'
                            : 'bg-purple-950/90 border-amber-400 ring-4 ring-amber-400/40 shadow-purple-500/50 animate-pulse'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 text-emerald-400 stroke-[3]" />
                        ) : (
                          <HelpCircle className="w-6 h-6 text-amber-300 drop-shadow animate-bounce" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Natural Landscape Scenery Marker (NO MODAL, NO SCORE, NON-CLICKABLE) */
                  <div className="flex flex-col items-center pointer-events-none select-none opacity-90">
                    <div className="w-7 h-7 rounded-full bg-slate-950/80 border border-teal-400/60 flex items-center justify-center shadow-lg">
                      <MapPin className="w-4 h-4 text-teal-300" />
                    </div>
                  </div>
                )}

                {/* Station Title Tag directly beneath waypoint */}
                <div className="mt-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 px-2 py-0.5 rounded-xl text-[11px] font-bold text-white whitespace-nowrap shadow-xl max-w-[130px] truncate text-center flex items-center justify-center gap-1">
                  <span>{displayTitle.split(':')[0]}</span>
                  {isTreasure && <span className="text-amber-400 font-normal">💎</span>}
                </div>
              </div>
            );
          })}

          {/* Floating Points Reward Notification (+50 💎) */}
          {floatingScore && (
            <FloatingScoreBadge
              points={floatingScore.points}
              x={floatingScore.x}
              y={floatingScore.y}
              onComplete={onClearFloatingScore || (() => {})}
            />
          )}

          {/* Animated Player Character Avatar */}
          <div
            style={{
              left: `${playerPos.x}%`,
              top: `${playerPos.y}%`,
              transition: isDragging ? 'none' : 'left 0.28s ease-out, top 0.28s ease-out',
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center"
          >
            {/* Player Name Tag */}
            <div className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md mb-0.5 whitespace-nowrap">
              אתם כאן
            </div>

            {/* Avatar Disc */}
            <div
              className={`w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 bg-slate-900 shadow-2xl ring-2 ring-purple-400/30 ${
                isDragging ? 'scale-110 ring-4 ring-purple-400' : ''
              }`}
            >
              <img
                src={resolveImageUrl(avatarImgUrl)}
                alt="דמות הרפתקן"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Drag & Discover Hint at Bottom */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-sm border border-slate-800/80 px-3.5 py-1 rounded-full text-[11px] text-slate-200 pointer-events-none whitespace-nowrap shadow-lg">
            <Hand className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>הקליקו או גררו להזזת הדמות בשביל</span>
          </div>
        </div>
      </div>

      {/* External Controls & Scene Switcher Bar */}
      <div className="w-full mt-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between text-xs text-slate-300 shadow-lg">
        {/* Next / Prev Scene & Stage Navigation Buttons */}
        <div className="flex items-center gap-2">
          {/* Previous Button: Moves to Previous Section or Previous Stage */}
          <button
            type="button"
            disabled={!hasPrevScene && (!hasPrevStage || !onPrevStage)}
            onClick={() => {
              if (hasPrevScene) {
                handleGoToScene(safeSceneIndex - 1, 26);
              } else if (hasPrevStage && onPrevStage) {
                onPrevStage();
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              hasPrevScene || (hasPrevStage && onPrevStage)
                ? 'bg-slate-850 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-purple-400 cursor-pointer active:scale-95'
                : 'bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-40'
            }`}
            title={hasPrevScene ? `חזרה לקטע הקודם: ${prevSceneTitle}` : 'חזרה לשלב הקודם במסע'}
          >
            <ChevronRight className="w-4 h-4 text-purple-300" />
            <span>{hasPrevScene ? 'הקטע הקודם' : 'השלב הקודם'}</span>
          </button>

          {/* Section Indicator Badge */}
          <div className="px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-[11px] font-bold text-purple-200">
            קטע {safeSceneIndex + 1}/{scenes.length}
          </div>

          {/* Next Button: Moves to Next Section, Next Stage, or Completion */}
          {hasNextScene ? (
            <button
              type="button"
              onClick={() => handleGoToScene(safeSceneIndex + 1, 84)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95"
              title={`מעבר לקטע הבא: ${nextSceneTitle}`}
            >
              <span>הקטע הבא</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : hasNextStage && onNextStage ? (
            <button
              type="button"
              onClick={onNextStage}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer active:scale-95 animate-pulse"
              title="מעבר לשלב הבא במסע"
            >
              <span>לשלב הבא</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : onCompleteTrack ? (
            <button
              type="button"
              onClick={onCompleteTrack}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 cursor-pointer active:scale-95 animate-bounce font-black"
              title="סיום המסלול וקבלת מדליה"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>סיום המסלול!</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>סוף המסלול</span>
            </button>
          )}
        </div>

        {/* Direction Pad */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNudge(0, -8)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 transition-colors cursor-pointer"
            title="מעלה"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNudge(0, 8)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 transition-colors cursor-pointer"
            title="מטה"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNudge(-8, 0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 transition-colors cursor-pointer"
            title="שמאלה"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNudge(8, 0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-slate-200 transition-colors cursor-pointer"
            title="ימינה"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
