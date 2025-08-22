import { Enemy } from "@/types/rpg";

export const generateEnemy = (playerLevel: number): Enemy => {
  // Niveau de l'ennemi proche du joueur (±2 niveaux)
  const enemyLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 5) - 2);
  
  const enemies = [
    {
      name: "Gobelin Sauvage",
      icon: "👹",
      baseStats: { attack: 20, defense: 15, speedAttack: 25, speedDefense: 20, agility: 30, dodge: 25, luck: 15, energy: 80, health: 80, mana: 20 }
    },
    {
      name: "Squelette Guerrier",
      icon: "💀",
      baseStats: { attack: 25, defense: 20, speedAttack: 20, speedDefense: 25, agility: 15, dodge: 20, luck: 10, energy: 70, health: 90, mana: 0 }
    },
    {
      name: "Orc Brutal",
      icon: "👺",
      baseStats: { attack: 35, defense: 25, speedAttack: 15, speedDefense: 30, agility: 10, dodge: 10, luck: 5, energy: 60, health: 120, mana: 10 }
    },
    {
      name: "Sorcier Noir",
      icon: "🧙‍♀️",
      baseStats: { attack: 40, defense: 12, speedAttack: 35, speedDefense: 15, agility: 25, dodge: 30, luck: 45, energy: 100, health: 70, mana: 150 }
    },
    {
      name: "Loup-Garou",
      icon: "🐺",
      baseStats: { attack: 30, defense: 18, speedAttack: 45, speedDefense: 20, agility: 55, dodge: 40, luck: 25, energy: 90, health: 100, mana: 30 }
    },
    {
      name: "Dragon Mineur",
      icon: "🐲",
      baseStats: { attack: 50, defense: 40, speedAttack: 30, speedDefense: 35, agility: 20, dodge: 15, luck: 30, energy: 120, health: 200, mana: 80 }
    },
    {
      name: "Démon Inférieur",
      icon: "😈",
      baseStats: { attack: 45, defense: 22, speedAttack: 40, speedDefense: 25, agility: 35, dodge: 35, luck: 40, energy: 110, health: 130, mana: 100 }
    },
    {
      name: "Golem de Pierre",
      icon: "🗿",
      baseStats: { attack: 40, defense: 50, speedAttack: 10, speedDefense: 45, agility: 5, dodge: 5, luck: 10, energy: 80, health: 180, mana: 0 }
    },
    {
      name: "Assassin des Ombres",
      icon: "🥷",
      baseStats: { attack: 55, defense: 15, speedAttack: 60, speedDefense: 20, agility: 70, dodge: 65, luck: 50, energy: 100, health: 85, mana: 40 }
    },
    {
      name: "Liche Ancienne",
      icon: "☠️",
      baseStats: { attack: 60, defense: 30, speedAttack: 50, speedDefense: 35, agility: 40, dodge: 45, luck: 70, energy: 150, health: 160, mana: 250 }
    }
  ];

  const enemyTemplate = enemies[Math.floor(Math.random() * enemies.length)];
  
  // Scale stats based on level
  const levelMultiplier = 1 + (enemyLevel - 1) * 0.15;
  
  const scaledStats = {
    attack: Math.floor(enemyTemplate.baseStats.attack * levelMultiplier),
    defense: Math.floor(enemyTemplate.baseStats.defense * levelMultiplier),
    speedAttack: Math.floor(enemyTemplate.baseStats.speedAttack * levelMultiplier),
    speedDefense: Math.floor(enemyTemplate.baseStats.speedDefense * levelMultiplier),
    agility: Math.floor(enemyTemplate.baseStats.agility * levelMultiplier),
    dodge: Math.floor(enemyTemplate.baseStats.dodge * levelMultiplier),
    luck: Math.floor(enemyTemplate.baseStats.luck * levelMultiplier),
    energy: Math.floor(enemyTemplate.baseStats.energy * levelMultiplier),
    health: Math.floor(enemyTemplate.baseStats.health * levelMultiplier),
    mana: Math.floor(enemyTemplate.baseStats.mana * levelMultiplier)
  };

  // Generate random experience between 0.1 and 3.0
  const experience = Math.random() * 2.9 + 0.1;
  
  // Gold reward based on level
  const gold = Math.floor((10 + Math.random() * 20) * levelMultiplier);

  return {
    id: `enemy_${Date.now()}_${Math.random()}`,
    name: enemyTemplate.name,
    level: enemyLevel,
    stats: scaledStats,
    rewards: {
      experience: Math.round(experience * 100) / 100, // Round to 2 decimals
      gold,
      dropChance: Math.random() < 0.15 ? null : null // 15% drop chance, equipment TBD
    },
    icon: enemyTemplate.icon
  };
};