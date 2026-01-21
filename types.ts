
export enum GameCategory {
  CLASSIC = 'Classic',
  ACTION = 'Action',
  PUZZLE = 'Puzzle',
  VIRAL = 'Viral',
  PHYSICS = 'Physics'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hardcore'
}

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  difficulty: Difficulty;
  thumbnailUrl: string; 
  engineType: 'runner' | 'grid' | 'physics' | 'shooter' | 'clicker';
}

export interface GameState {
  score: number;
  gameOver: boolean;
  paused: boolean;
  highScore: number;
}

export interface GameEngineProps {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  setScore: (score: number) => void;
  setGameOver: (isOver: boolean) => void;
  inputState: InputState;
  difficulty: Difficulty;
}

export interface InputState {
  keys: Set<string>;
  touch: { x: number; y: number; active: boolean };
  click: boolean;
}

export type Theme = 'neon' | 'retro' | 'zen';

export interface PlayerProfile {
  username: string;
  avatar: string;
  totalScore: number;
  gamesPlayed: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  score: number;
  gameId: string;
}