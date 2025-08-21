import { PlayerClass, Equipment, Enemy } from "@/types/rpg";

export const playerClasses: PlayerClass[] = [
  {
    id: "warrior",
    name: "Guerrier",
    description: "Combattant puissant avec une forte défense",
    baseStats: {
      attack: 25,
      attackSpeed: 45.2,
      defense: 30,
      dodge: 15,
      luck: 20,
      speed: 25,
      health: 120,
      mana: 30
    },
    icon: "⚔️",
    color: "from-red-600 to-red-800"
  },
  {
    id: "mage",
    name: "Magicien",
    description: "Maître des arts magiques avec haute intelligence",
    baseStats: {
      attack: 35,
      attackSpeed: 65.8,
      defense: 12,
      dodge: 25,
      luck: 40,
      speed: 30,
      health: 80,
      mana: 150
    },
    icon: "🧙‍♂️",
    color: "from-blue-600 to-purple-800"
  },
  {
    id: "archer",
    name: "Archer",
    description: "Expert du tir à distance avec grande précision",
    baseStats: {
      attack: 30,
      attackSpeed: 85.4,
      defense: 18,
      dodge: 45,
      luck: 35,
      speed: 50,
      health: 90,
      mana: 60
    },
    icon: "🏹",
    color: "from-green-600 to-green-800"
  },
  {
    id: "monk",
    name: "Moine",
    description: "Combattant équilibré maîtrisant corps et esprit",
    baseStats: {
      attack: 22,
      attackSpeed: 75.6,
      defense: 25,
      dodge: 55,
      luck: 45,
      speed: 65,
      health: 100,
      mana: 100
    },
    icon: "🙏",
    color: "from-orange-600 to-yellow-800"
  },
  {
    id: "berserker",
    name: "Berserker",
    description: "Guerrier sauvage sacrifiant défense pour attaque",
    baseStats: {
      attack: 45,
      attackSpeed: 95.2,
      defense: 8,
      dodge: 20,
      luck: 25,
      speed: 40,
      health: 110,
      mana: 20
    },
    icon: "🪓",
    color: "from-red-800 to-orange-900"
  },
  {
    id: "necromancer",
    name: "Nécromancien",
    description: "Maître des arts sombres et de la mort",
    baseStats: {
      attack: 40,
      attackSpeed: 55.3,
      defense: 15,
      dodge: 30,
      luck: 80,
      speed: 35,
      health: 70,
      mana: 180
    },
    icon: "💀",
    color: "from-purple-900 to-black"
  },
  {
    id: "paladin",
    name: "Paladin",
    description: "Guerrier saint avec défense et magie",
    baseStats: {
      attack: 28,
      attackSpeed: 50.7,
      defense: 35,
      dodge: 20,
      luck: 30,
      speed: 28,
      health: 130,
      mana: 90
    },
    icon: "🛡️",
    color: "from-yellow-500 to-white"
  },
  {
    id: "assassin",
    name: "Assassin",
    description: "Tueur silencieux privilégiant vitesse et esquive",
    baseStats: {
      attack: 38,
      attackSpeed: 120.8,
      defense: 10,
      dodge: 70,
      luck: 55,
      speed: 85,
      health: 75,
      mana: 40
    },
    icon: "🗡️",
    color: "from-gray-800 to-black"
  }
];

export const baseEquipment: Equipment[] = [
  // Armes
  {
    id: "iron_sword",
    name: "Épée de Fer",
    type: "weapon",
    rarity: "common",
    level: 1,
    description: "Une épée basique en fer",
    statsBonus: { attack: 5, attackSpeed: 2.1 }
  },
  {
    id: "steel_bow",
    name: "Arc d'Acier",
    type: "weapon",
    rarity: "uncommon",
    level: 3,
    description: "Arc précis en acier trempé",
    statsBonus: { attack: 8, attackSpeed: 5.5, dodge: 3 }
  },
  {
    id: "magic_staff",
    name: "Bâton Magique",
    type: "weapon",
    rarity: "rare",
    level: 5,
    description: "Bâton imprégné de magie",
    statsBonus: { attack: 12, mana: 25, luck: 8 }
  },
  {
    id: "shadow_blade",
    name: "Lame des Ombres",
    type: "weapon",
    rarity: "epic",
    level: 10,
    description: "Lame maudite des ténèbres",
    statsBonus: { attack: 20, attackSpeed: 15.2, dodge: 10, speed: 12 }
  },
  {
    id: "dragon_slayer",
    name: "Tueur de Dragon",
    type: "weapon",
    rarity: "legendary",
    level: 20,
    description: "Épée légendaire forgée dans le sang de dragon",
    statsBonus: { attack: 35, attackSpeed: 8.7, defense: 5, luck: 15 }
  },

  // Armures
  {
    id: "leather_armor",
    name: "Armure de Cuir",
    type: "armor",
    rarity: "common",
    level: 1,
    description: "Protection basique en cuir",
    statsBonus: { defense: 8, dodge: 2 }
  },
  {
    id: "chain_mail",
    name: "Cotte de Mailles",
    type: "armor",
    rarity: "uncommon",
    level: 4,
    description: "Armure flexible en mailles",
    statsBonus: { defense: 15, health: 20, speed: -2 }
  },
  {
    id: "plate_armor",
    name: "Armure de Plates",
    type: "armor",
    rarity: "rare",
    level: 8,
    description: "Lourde armure en plaques d'acier",
    statsBonus: { defense: 25, health: 40, speed: -8, dodge: -5 }
  },
  {
    id: "mage_robes",
    name: "Robes de Mage",
    type: "armor",
    rarity: "epic",
    level: 12,
    description: "Robes enchantées des arcanes",
    statsBonus: { defense: 12, mana: 50, luck: 12, speed: 5 }
  },

  // Bijoux
  {
    id: "power_ring",
    name: "Anneau de Puissance",
    type: "ring",
    rarity: "rare",
    level: 6,
    description: "Anneau augmentant la force",
    statsBonus: { attack: 10, attackSpeed: 3.2 }
  },
  {
    id: "luck_amulet",
    name: "Amulette de Chance",
    type: "amulet",
    rarity: "epic",
    level: 15,
    description: "Amulette portant bonheur",
    statsBonus: { luck: 25, dodge: 8, speed: 6 }
  },
  {
    id: "health_ring",
    name: "Anneau de Vitalité",
    type: "ring",
    rarity: "uncommon",
    level: 5,
    description: "Anneau renforçant la vitalité",
    statsBonus: { health: 35, defense: 5 }
  }
];

export function generateEnemy(playerLevel: number): Enemy {
  const enemyTypes = [
    { name: "Gobelin", icon: "👹", multiplier: 0.8 },
    { name: "Orc", icon: "🧌", multiplier: 1.0 },
    { name: "Troll", icon: "👹", multiplier: 1.2 },
    { name: "Dragon", icon: "🐲", multiplier: 1.5 },
    { name: "Liche", icon: "💀", multiplier: 1.3 },
    { name: "Démon", icon: "👿", multiplier: 1.4 },
    { name: "Spectre", icon: "👻", multiplier: 1.1 },
    { name: "Golem", icon: "🗿", multiplier: 1.6 }
  ];

  const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const enemyLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);
  const baseMultiplier = randomType.multiplier * (0.8 + Math.random() * 0.4);

  return {
    id: `enemy_${Date.now()}_${Math.random()}`,
    name: `${randomType.name} Niveau ${enemyLevel}`,
    level: enemyLevel,
    icon: randomType.icon,
    stats: {
      attack: Math.floor(15 * enemyLevel * baseMultiplier),
      attackSpeed: Math.floor(40 * baseMultiplier),
      defense: Math.floor(10 * enemyLevel * baseMultiplier),
      dodge: Math.floor(20 * baseMultiplier),
      luck: Math.floor(25 * baseMultiplier),
      speed: Math.floor(30 * baseMultiplier),
      health: Math.floor(80 * enemyLevel * baseMultiplier),
      mana: Math.floor(50 * enemyLevel * baseMultiplier)
    },
    rewards: {
      experience: Math.floor(50 * enemyLevel * baseMultiplier),
      gold: Math.floor(25 * enemyLevel * baseMultiplier),
      dropChance: Math.random() < 0.3 ? generateRandomEquipment(enemyLevel) : null
    }
  };
}

function generateRandomEquipment(level: number): Equipment {
  const types: Equipment['type'][] = ['weapon', 'armor', 'ring', 'amulet'];
  const rarities: Equipment['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const rarity = rarities[Math.floor(Math.random() * Math.min(rarities.length, Math.floor(level / 3) + 2))];
  
  const rarityMultipliers = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5
  };

  const multiplier = rarityMultipliers[rarity];
  const baseStat = Math.floor(5 * level * multiplier);

  return {
    id: `generated_${Date.now()}_${Math.random()}`,
    name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${type}`,
    type,
    rarity,
    level,
    description: `${rarity} ${type} de niveau ${level}`,
    statsBonus: {
      attack: type === 'weapon' ? baseStat : Math.floor(baseStat * 0.3),
      defense: type === 'armor' ? baseStat : Math.floor(baseStat * 0.2),
      health: type === 'armor' ? baseStat * 2 : 0,
      luck: type === 'amulet' || type === 'ring' ? baseStat : 0,
      dodge: type === 'ring' ? Math.floor(baseStat * 0.5) : 0
    }
  };
}