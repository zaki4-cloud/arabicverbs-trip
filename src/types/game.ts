export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

export interface ArabicExample {
  arabic: string;
  transliteration?: string;
  hebrew: string;
  note?: string;
}

export interface KnowledgePackage {
  id: string;
  title: string;
  binyanim: string[];
  tenses: string[];
  persons: string[];
  explanation: string;
  examples: ArabicExample[];
  imageUrl: string;
  createdAt: number;
}

export type QuestionType = 'multiple_choice' | 'matching_pairs';

export interface BaseQuestion {
  id: string;
  packageId: string;
  topic: string;
  prompt: string;
  explanation: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  arabicSample?: string;
  correctAnswer: string;
  distractors: string[];
}

export interface MatchingPairItem {
  id: string;
  arabic: string;
  target: string;
}

export interface MatchingPairsQuestion extends BaseQuestion {
  type: 'matching_pairs';
  pairs: MatchingPairItem[];
}

export type Question = MultipleChoiceQuestion | MatchingPairsQuestion;

export type LandmarkType =
  | 'stone_gate'
  | 'bridge_trail'
  | 'secret_waterfall'
  | 'wild_horses'
  | 'hot_springs'
  | 'bat_cave'
  | 'black_rock'
  | 'white_waterfalls'
  | 'heaven_stairs'
  | 'rope_bridge'
  | 'oasis'
  | 'volcano'
  | 'ancient_ruins'
  | 'sun_pyramid'
  | 'ghost_valley'
  | 'snow_peak'
  | 'turquoise_lake'
  | 'abyss_trail'
  | 'dark_forest'
  | 'cliff_climb'
  | 'generic_landmark';

export interface StageNode {
  id: string;
  type: 'treasure' | 'question' | 'landmark';
  title: string;
  landmarkType?: LandmarkType;
  description?: string;
  packageId?: string;
  questionId?: string;
  scoreReward: number;
  position: { x: number; y: number }; // percentage 0-100 on landscape
  isCompleted?: boolean;
}

export interface StageScene {
  id: string;
  title: string;
  landscapeName: string;
  backgroundImageUrl: string;
  description?: string;
  nodes: StageNode[];
}

export interface GameStage {
  id: string;
  stageNumber: number;
  title: string;
  landscapeName: string;
  backgroundImageUrl: string;
  packageIds?: string[]; // Up to 3 packages assigned to this stage
  nodes: StageNode[];
  scenes?: StageScene[]; // Subdivided connected scenes with ~2 attractions each
}

export interface GameTrack {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  description: string;
  packages: KnowledgePackage[];
  questions: Question[];
  stages: GameStage[];
  shareCode?: string;
  achievements?: string[]; // Custom level learning achievements / goals
}

export interface StudentProgressRecord {
  id: string;
  studentName: string;
  gameTrackId: string;
  gameTrackTitle: string;
  currentStageNumber: number;
  totalStages: number;
  score: number;
  gemsCount: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: number;
  timeSpentSeconds?: number; // Cumulative game usage duration in seconds
}

