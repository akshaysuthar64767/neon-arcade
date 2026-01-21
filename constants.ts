import { GameMetadata, GameCategory, Difficulty, LeaderboardEntry } from './types';

export const GAMES_LIST: GameMetadata[] = [
  // --- CLASSIC ARCADE ---
  {
    id: 'retro-snake',
    name: 'Neon Snake',
    description: 'The classic growing serpent. Eat power-ups, avoid walls.',
    category: GameCategory.CLASSIC,
    difficulty: Difficulty.MEDIUM,
    thumbnailUrl: 'https://images.unsplash.com/photo-1628277613967-6ab58cf56736?w=800&q=80',
    engineType: 'grid'
  },
  {
    id: 'brick-breaker',
    name: 'Cosmic Breaker',
    description: 'Smash the neon bricks before they hit the floor.',
    category: GameCategory.CLASSIC,
    difficulty: Difficulty.EASY,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    engineType: 'physics'
  },
  {
    id: 'space-shooter',
    name: 'Star Defender',
    description: 'Blast incoming alien waves in deep space.',
    category: GameCategory.CLASSIC,
    difficulty: Difficulty.HARD,
    thumbnailUrl: 'https://images.unsplash.com/photo-1581822261290-991b73283543?w=800&q=80',
    engineType: 'shooter'
  },
  {
    id: 'neon-pong',
    name: 'Cyber Pong',
    description: 'Defeat the AI in this high-speed classic duel.',
    category: GameCategory.CLASSIC,
    difficulty: Difficulty.HARD,
    thumbnailUrl: 'https://images.unsplash.com/photo-1614727187346-ef3768cabd01?w=800&q=80',
    engineType: 'physics'
  },

  // --- VIRAL / ACTION ---
  {
    id: 'flappy-cyber',
    name: 'Cyber Flap',
    description: 'Navigate the drone through tight security pipes.',
    category: GameCategory.VIRAL,
    difficulty: Difficulty.HARD,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555679427-1f6dfcce943b?w=800&q=80',
    engineType: 'runner'
  },
  {
    id: 'doodle-hop',
    name: 'Sky Hopper',
    description: 'Jump forever on neon platforms. Don\'t fall!',
    category: GameCategory.VIRAL,
    difficulty: Difficulty.MEDIUM,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517480447816-3e0e7a2b9794?w=800&q=80',
    engineType: 'runner'
  },
  {
    id: 'subway-run',
    name: 'Metro Dash',
    description: 'Run, jump, and dodge obstacles on the cyber tracks.',
    category: GameCategory.VIRAL,
    difficulty: Difficulty.MEDIUM,
    thumbnailUrl: 'https://images.unsplash.com/photo-1495536485805-4d7a0499e900?w=800&q=80',
    engineType: 'runner'
  },
  {
    id: 'fruit-slice',
    name: 'Laser Slicer',
    description: 'Swipe your mouse to slice flying energy orbs.',
    category: GameCategory.ACTION,
    difficulty: Difficulty.EASY,
    thumbnailUrl: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=800&q=80',
    engineType: 'physics'
  },

  // --- PUZZLE & SKILL ---
  {
    id: 'tower-stack',
    name: 'Neon Stacker',
    description: 'Stack blocks perfectly to reach the sky.',
    category: GameCategory.PUZZLE,
    difficulty: Difficulty.HARD,
    thumbnailUrl: 'https://images.unsplash.com/photo-1476970986794-556372d62159?w=800&q=80',
    engineType: 'grid'
  },
  {
    id: 'aim-trainer',
    name: 'Reflex Aim',
    description: 'Test your reaction speed and accuracy.',
    category: GameCategory.ACTION,
    difficulty: Difficulty.HARD,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542129202-4f3ddf8b92d6?w=800&q=80',
    engineType: 'clicker'
  },
  {
    id: 'reaction-tap',
    name: 'Flash React',
    description: 'Wait for Green. Click instantly.',
    category: GameCategory.PUZZLE,
    difficulty: Difficulty.MEDIUM,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
    engineType: 'clicker'
  },
  {
    id: 'memory-seq',
    name: 'Memory Matrix',
    description: 'Watch the pattern and repeat it.',
    category: GameCategory.PUZZLE,
    difficulty: Difficulty.HARD,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80',
    engineType: 'clicker'
  }
];

export const AVATARS = [
  '👾', '🤖', '🦊', '💀', '👽', '🦄', '🐯', '🐼', '🐱', '🐲', '🎮', '🚀'
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', username: 'CyberNinja', avatar: '🤖', score: 15400, gameId: 'global' },
  { id: '2', username: 'RetroKing', avatar: '👾', score: 12250, gameId: 'global' },
  { id: '3', username: 'PixelDust', avatar: '🦄', score: 10890, gameId: 'global' },
  { id: '4', username: 'GlitchWalker', avatar: '👽', score: 9500, gameId: 'global' },
  { id: '5', username: 'NeonRider', avatar: '🚀', score: 8750, gameId: 'global' },
];

export const API_BASE_URL = "https://qta2nx5q11.execute-api.us-east-1.amazonaws.com/prod";

