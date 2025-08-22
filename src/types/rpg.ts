export interface PlayerStats {
  attack: number;
  attackSpeed: number;
  defense: number;
  dodge: number;
  luck: number;
  speed: number;
  health: number;
  mana: number;
}

export interface PlayerClass {
  id: string;
  name: string;
  description: string;
  baseStats: PlayerStats;
  icon: string;
  color: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'ring' | 'amulet';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'silver' | 'gold' | 'platinum' | 'sparkling' | 'elite' | 'supreme_sparkling';
  statsBonus: Partial<PlayerStats>;
  level: number;
  description: string;
  priceType?: 'gold' | 'diamonds';
  customPrice?: number;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  stats: PlayerStats;
  rewards: {
    experience: number;
    gold: number;
    dropChance: Equipment | null;
  };
  icon: string;
}

export interface Player {
  id: string;
  name: string;
  class: PlayerClass;
  level: number;
  experience: number;
  experienceToNext: number;
  baseStats: PlayerStats;
  currentStats: PlayerStats;
  equipment: {
    weapon?: Equipment;
    armor?: Equipment;
    ring?: Equipment;
    amulet?: Equipment;
  };
  inventory: Equipment[];
  gold: number;
  diamonds: number;
  statPoints: number;
  enemiesDefeated: number;
  zeroCoins: number;
}

export interface CombatResult {
  victory: boolean;
  experience: number;
  gold: number;
  zeroGain: number;
  equipment?: Equipment;
  damage: number;
  enemyDamage: number;
}