// src/lib/data/avatars.ts
// This file contains all available avatar options for users to choose from

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  category: 'animals' | 'tech' | 'nature' | 'gaming' | 'cosmic' | 'mystical';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockLevel?: number; // Optional level requirement
}

export const avatars: Avatar[] = [
  // Common Avatars (Available to all)
  { id: 'bear', emoji: '🐻', name: 'Bear', category: 'animals', rarity: 'common' },
  { id: 'cat', emoji: '🐱', name: 'Cat', category: 'animals', rarity: 'common' },
  { id: 'dog', emoji: '🐶', name: 'Dog', category: 'animals', rarity: 'common' },
  { id: 'fox', emoji: '🦊', name: 'Fox', category: 'animals', rarity: 'common' },
  { id: 'panda', emoji: '🐼', name: 'Panda', category: 'animals', rarity: 'common' },
  { id: 'koala', emoji: '🐨', name: 'Koala', category: 'animals', rarity: 'common' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', category: 'animals', rarity: 'common' },
  { id: 'owl', emoji: '🦉', name: 'Owl', category: 'animals', rarity: 'common' },
  
  // Tech Avatars
  { id: 'robot', emoji: '🤖', name: 'Robot', category: 'tech', rarity: 'common' },
  { id: 'computer', emoji: '💻', name: 'Laptop', category: 'tech', rarity: 'common' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', category: 'tech', rarity: 'rare', unlockLevel: 5 },
  { id: 'satellite', emoji: '🛸', name: 'UFO', category: 'tech', rarity: 'rare', unlockLevel: 10 },
  
  // Nature Avatars
  { id: 'tree', emoji: '🌳', name: 'Tree', category: 'nature', rarity: 'common' },
  { id: 'flower', emoji: '🌸', name: 'Flower', category: 'nature', rarity: 'common' },
  { id: 'mountain', emoji: '🏔️', name: 'Mountain', category: 'nature', rarity: 'common' },
  { id: 'volcano', emoji: '🌋', name: 'Volcano', category: 'nature', rarity: 'rare', unlockLevel: 8 },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', category: 'nature', rarity: 'rare', unlockLevel: 12 },
  
  // Gaming Avatars
  { id: 'gamepad', emoji: '🎮', name: 'Gamepad', category: 'gaming', rarity: 'common' },
  { id: 'dice', emoji: '🎲', name: 'Dice', category: 'gaming', rarity: 'common' },
  { id: 'chess', emoji: '♟️', name: 'Chess', category: 'gaming', rarity: 'common' },
  { id: 'trophy', emoji: '🏆', name: 'Trophy', category: 'gaming', rarity: 'rare', unlockLevel: 15 },
  { id: 'crown', emoji: '👑', name: 'Crown', category: 'gaming', rarity: 'epic', unlockLevel: 20 },
  
  // Cosmic Avatars
  { id: 'star', emoji: '⭐', name: 'Star', category: 'cosmic', rarity: 'common' },
  { id: 'moon', emoji: '🌙', name: 'Moon', category: 'cosmic', rarity: 'common' },
  { id: 'sun', emoji: '☀️', name: 'Sun', category: 'cosmic', rarity: 'rare', unlockLevel: 7 },
  { id: 'planet', emoji: '🪐', name: 'Saturn', category: 'cosmic', rarity: 'rare', unlockLevel: 10 },
  { id: 'comet', emoji: '☄️', name: 'Comet', category: 'cosmic', rarity: 'epic', unlockLevel: 18 },
  { id: 'galaxy', emoji: '🌌', name: 'Galaxy', category: 'cosmic', rarity: 'legendary', unlockLevel: 30 },
  
  // Mystical Avatars
  { id: 'wizard', emoji: '🧙', name: 'Wizard', category: 'mystical', rarity: 'rare', unlockLevel: 10 },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', category: 'mystical', rarity: 'epic', unlockLevel: 25 },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', category: 'mystical', rarity: 'epic', unlockLevel: 22 },
  { id: 'phoenix', emoji: '🔥', name: 'Phoenix', category: 'mystical', rarity: 'legendary', unlockLevel: 35 },
  { id: 'crystal', emoji: '💎', name: 'Crystal', category: 'mystical', rarity: 'legendary', unlockLevel: 40 },
  
  // Special Security/Hacker themed
  { id: 'shield', emoji: '🛡️', name: 'Shield', category: 'tech', rarity: 'common' },
  { id: 'key', emoji: '🔑', name: 'Key', category: 'tech', rarity: 'common' },
  { id: 'lock', emoji: '🔒', name: 'Lock', category: 'tech', rarity: 'common' },
  { id: 'bug', emoji: '🐛', name: 'Bug', category: 'tech', rarity: 'rare', unlockLevel: 5 },
  { id: 'spider', emoji: '🕷️', name: 'Spider', category: 'tech', rarity: 'rare', unlockLevel: 8 },
  { id: 'skull', emoji: '💀', name: 'Skull', category: 'mystical', rarity: 'epic', unlockLevel: 20 },
  { id: 'ninja', emoji: '🥷', name: 'Ninja', category: 'mystical', rarity: 'epic', unlockLevel: 25 },
  { id: 'alien', emoji: '👽', name: 'Alien', category: 'cosmic', rarity: 'legendary', unlockLevel: 50 },
];

// Helper functions
export function getAvatarById(id: string): Avatar | undefined {
  return avatars.find(avatar => avatar.id === id);
}

export function getAvailableAvatars(userLevel: number): Avatar[] {
  return avatars.filter(avatar => !avatar.unlockLevel || avatar.unlockLevel <= userLevel);
}

export function getAvatarsByCategory(category: Avatar['category']): Avatar[] {
  return avatars.filter(avatar => avatar.category === category);
}

export function getAvatarsByRarity(rarity: Avatar['rarity']): Avatar[] {
  return avatars.filter(avatar => avatar.rarity === rarity);
}

// Default avatar for new users
export const DEFAULT_AVATAR_ID = 'cat';