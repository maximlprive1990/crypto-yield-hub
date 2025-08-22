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
  // Armes Niveau 1-5
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
    id: "wooden_club",
    name: "Massue en Bois",
    type: "weapon", 
    rarity: "common",
    level: 1,
    description: "Arme primitive mais efficace",
    statsBonus: { attack: 8, speed: -2 }
  },
  {
    id: "bronze_dagger",
    name: "Dague de Bronze",
    type: "weapon",
    rarity: "common", 
    level: 2,
    description: "Lame rapide et précise",
    statsBonus: { attack: 6, attackSpeed: 8.5, dodge: 3 }
  },
  {
    id: "steel_bow",
    name: "Arc d'Acier",
    type: "weapon",
    rarity: "uncommon",
    level: 3,
    description: "Arc précis en acier trempé",
    statsBonus: { attack: 12, attackSpeed: 5.5, dodge: 5 }
  },
  {
    id: "silver_blade",
    name: "Lame d'Argent",
    type: "weapon",
    rarity: "uncommon",
    level: 4,
    description: "Épée bénie contre les créatures des ténèbres",
    statsBonus: { attack: 15, attackSpeed: 3.2, luck: 8 }
  },
  {
    id: "enchanted_staff",
    name: "Bâton Enchanté",
    type: "weapon",
    rarity: "rare",
    level: 5,
    description: "Bâton imprégné de magie ancienne",
    statsBonus: { attack: 18, mana: 35, luck: 12 }
  },

  // Armes Niveau 6-10
  {
    id: "crystal_sword",
    name: "Épée de Cristal",
    type: "weapon",
    rarity: "rare",
    level: 6,
    description: "Lame taillée dans un cristal magique",
    statsBonus: { attack: 22, attackSpeed: 4.8, mana: 15 }
  },
  {
    id: "demon_axe",
    name: "Hache Démoniaque",
    type: "weapon",
    rarity: "epic",
    level: 8,
    description: "Hache forgée dans les flammes infernales",
    statsBonus: { attack: 35, attackSpeed: -2.1, defense: 8 }
  },
  {
    id: "shadow_blade",
    name: "Lame des Ombres",
    type: "weapon",
    rarity: "epic",
    level: 10,
    description: "Lame maudite des ténèbres",
    statsBonus: { attack: 28, attackSpeed: 15.2, dodge: 15, speed: 12 }
  },

  // Armes Niveau 11-20
  {
    id: "phoenix_staff",
    name: "Bâton du Phénix",
    type: "weapon",
    rarity: "epic",
    level: 12,
    description: "Bâton imprégné du feu éternel",
    statsBonus: { attack: 32, mana: 80, luck: 18, attackSpeed: 6.5 }
  },
  {
    id: "void_bow",
    name: "Arc du Vide",
    type: "weapon",
    rarity: "epic",
    level: 15,
    description: "Arc tirant des flèches dimensionnelles",
    statsBonus: { attack: 40, attackSpeed: 12.8, dodge: 20, speed: 25 }
  },
  {
    id: "dragon_slayer",
    name: "Tueur de Dragon",
    type: "weapon",
    rarity: "legendary",
    level: 20,
    description: "Épée légendaire forgée dans le sang de dragon",
    statsBonus: { attack: 55, attackSpeed: 8.7, defense: 15, luck: 25, health: 50 }
  },

  // Armures Niveau 1-5
  {
    id: "cloth_robe",
    name: "Robe de Tissu",
    type: "armor",
    rarity: "common",
    level: 1,
    description: "Vêtement simple mais confortable",
    statsBonus: { defense: 3, mana: 10 }
  },
  {
    id: "leather_armor",
    name: "Armure de Cuir",
    type: "armor",
    rarity: "common",
    level: 1,
    description: "Protection basique en cuir",
    statsBonus: { defense: 8, dodge: 2, health: 15 }
  },
  {
    id: "studded_leather",
    name: "Cuir Clouté",
    type: "armor",
    rarity: "uncommon",
    level: 3,
    description: "Armure renforcée de clous métalliques",
    statsBonus: { defense: 12, dodge: 5, health: 25 }
  },
  {
    id: "chain_mail",
    name: "Cotte de Mailles",
    type: "armor",
    rarity: "uncommon",
    level: 4,
    description: "Armure flexible en mailles",
    statsBonus: { defense: 18, health: 40, speed: -3 }
  },
  {
    id: "scale_armor",
    name: "Armure d'Écailles",
    type: "armor",
    rarity: "rare",
    level: 5,
    description: "Protection faite d'écailles de dragon",
    statsBonus: { defense: 22, health: 50, luck: 8 }
  },

  // Armures Niveau 6-15
  {
    id: "steel_plate",
    name: "Armure de Plates d'Acier",
    type: "armor",
    rarity: "rare",
    level: 8,
    description: "Lourde armure en plaques d'acier",
    statsBonus: { defense: 35, health: 80, speed: -8, dodge: -5 }
  },
  {
    id: "mage_robes",
    name: "Robes de Mage Supérieur",
    type: "armor",
    rarity: "epic",
    level: 12,
    description: "Robes enchantées des arcanes",
    statsBonus: { defense: 25, mana: 120, luck: 20, speed: 8 }
  },
  {
    id: "celestial_armor",
    name: "Armure Céleste",
    type: "armor",
    rarity: "legendary",
    level: 15,
    description: "Armure bénie par les dieux",
    statsBonus: { defense: 50, health: 150, mana: 80, luck: 30, dodge: 10 }
  },

  // Bijoux Niveau 1-10
  {
    id: "copper_ring",
    name: "Anneau de Cuivre",
    type: "ring",
    rarity: "common",
    level: 1,
    description: "Simple anneau de cuivre",
    statsBonus: { attack: 2, health: 10 }
  },
  {
    id: "silver_ring",
    name: "Anneau d'Argent",
    type: "ring",
    rarity: "uncommon",
    level: 3,
    description: "Anneau poli brillant d'argent",
    statsBonus: { attack: 5, mana: 20, luck: 5 }
  },
  {
    id: "power_ring",
    name: "Anneau de Puissance",
    type: "ring",
    rarity: "rare",
    level: 6,
    description: "Anneau augmentant la force",
    statsBonus: { attack: 12, attackSpeed: 5.2, health: 30 }
  },
  {
    id: "master_ring",
    name: "Anneau de Maître",
    type: "ring",
    rarity: "epic",
    level: 10,
    description: "Anneau des grands maîtres",
    statsBonus: { attack: 18, defense: 12, luck: 25, mana: 50 }
  },

  // Amulettes Niveau 1-15
  {
    id: "bone_amulet",
    name: "Amulette d'Os",
    type: "amulet",
    rarity: "common",
    level: 1,
    description: "Amulette primitive sculptée dans l'os",
    statsBonus: { luck: 8, mana: 15 }
  },
  {
    id: "crystal_pendant",
    name: "Pendentif de Cristal",
    type: "amulet",
    rarity: "uncommon",
    level: 4,
    description: "Cristal amplifiant les énergies magiques",
    statsBonus: { mana: 40, luck: 12, speed: 5 }
  },
  {
    id: "luck_amulet",
    name: "Amulette de Chance Supreme",
    type: "amulet",
    rarity: "epic",
    level: 8,
    description: "Amulette portant une chance extraordinaire",
    statsBonus: { luck: 35, dodge: 15, speed: 12, attackSpeed: 8.5 }
  },
  {
    id: "soul_pendant",
    name: "Pendentif des Âmes",
    type: "amulet",
    rarity: "legendary",
    level: 15,
    description: "Amulette contenant le pouvoir des âmes anciennes",
    statsBonus: { mana: 200, luck: 50, health: 100, defense: 20, attack: 25 }
  },

  // Nouveaux équipements Premium
  
  // Armes Silver (Niveau 25-30)
  {
    id: "silver_excalibur",
    name: "Excalibur d'Argent",
    type: "weapon",
    rarity: "silver",
    level: 25,
    description: "Épée légendaire forgée dans l'argent pur des étoiles",
    priceType: "gold",
    customPrice: 15000,
    statsBonus: { attack: 75, attackSpeed: 12.5, defense: 20, luck: 35, health: 80 }
  },
  {
    id: "silver_bow_cosmos",
    name: "Arc Cosmique d'Argent",
    type: "weapon",
    rarity: "silver",
    level: 28,
    description: "Arc tirant des flèches stellaires argentées",
    priceType: "gold",
    customPrice: 18000,
    statsBonus: { attack: 85, attackSpeed: 25.8, dodge: 40, speed: 50, luck: 30 }
  },

  // Armes Gold (Niveau 35-40)
  {
    id: "golden_destroyer",
    name: "Destructeur Doré",
    type: "weapon",
    rarity: "gold",
    level: 35,
    description: "Masse de guerre dorée capable de briser les réalités",
    priceType: "diamonds",
    customPrice: 500,
    statsBonus: { attack: 120, attackSpeed: 8.2, defense: 35, health: 150, luck: 45 }
  },
  {
    id: "golden_staff_midas",
    name: "Bâton de Midas",
    type: "weapon",
    rarity: "gold",
    level: 38,
    description: "Bâton transformant tout en or magique",
    priceType: "diamonds",
    customPrice: 750,
    statsBonus: { attack: 95, mana: 300, luck: 80, speed: 25, attackSpeed: 15.5 }
  },

  // Armes Platinum (Niveau 45-50)
  {
    id: "platinum_divine_blade",
    name: "Lame Divine de Platine",
    type: "weapon",
    rarity: "platinum",
    level: 45,
    description: "Épée divine forgée dans le platine céleste",
    priceType: "diamonds", 
    customPrice: 1200,
    statsBonus: { attack: 180, attackSpeed: 18.7, defense: 50, health: 200, mana: 150, luck: 60 }
  },

  // Armes Sparkling (Niveau 55)
  {
    id: "sparkling_void_reaper",
    name: "Faucheuse du Vide Étincelante",
    type: "weapon",
    rarity: "sparkling",
    level: 55,
    description: "Arme étincelante déchirant l'espace-temps",
    priceType: "diamonds",
    customPrice: 2000,
    statsBonus: { attack: 250, attackSpeed: 35.2, dodge: 60, speed: 80, luck: 100, mana: 200 }
  },

  // Armes Elite (Niveau 60)
  {
    id: "elite_galaxy_crusher",
    name: "Briseur de Galaxie Élite",
    type: "weapon",
    rarity: "elite",
    level: 60,
    description: "Arme d'élite capable de détruire des galaxies entières",
    priceType: "diamonds",
    customPrice: 3500,
    statsBonus: { attack: 320, attackSpeed: 25.8, defense: 80, health: 300, mana: 250, luck: 120 }
  },

  // Armes Supreme Sparkling (Niveau 70)
  {
    id: "supreme_infinity_edge",
    name: "Lame de l'Infini Suprême",
    type: "weapon",
    rarity: "supreme_sparkling",
    level: 70,
    description: "L'arme ultime transcendant toutes les réalités",
    priceType: "diamonds",
    customPrice: 7500,
    statsBonus: { attack: 500, attackSpeed: 50.0, defense: 150, health: 500, mana: 400, luck: 200, speed: 120, dodge: 100 }
  },

  // Armures Premium
  {
    id: "silver_celestial_armor",
    name: "Armure Céleste d'Argent",
    type: "armor",
    rarity: "silver",
    level: 26,
    description: "Armure argentée bénie par les anges",
    priceType: "gold",
    customPrice: 20000,
    statsBonus: { defense: 90, health: 250, mana: 120, luck: 40, dodge: 25 }
  },
  {
    id: "golden_emperor_plate",
    name: "Armure Impériale Dorée",
    type: "armor",
    rarity: "gold",
    level: 36,
    description: "Armure des empereurs divins",
    priceType: "diamonds",
    customPrice: 800,
    statsBonus: { defense: 150, health: 400, mana: 200, luck: 60, speed: 15 }
  },
  {
    id: "platinum_titan_armor",
    name: "Armure de Titan en Platine",
    type: "armor",
    rarity: "platinum",
    level: 46,
    description: "Armure des titans de platine",
    priceType: "diamonds",
    customPrice: 1500,
    statsBonus: { defense: 220, health: 600, mana: 250, attack: 50, luck: 80 }
  },
  {
    id: "sparkling_void_armor",
    name: "Armure du Vide Étincelante",
    type: "armor",
    rarity: "sparkling",
    level: 56,
    description: "Armure forgée dans les étoiles scintillantes",
    priceType: "diamonds",
    customPrice: 2500,
    statsBonus: { defense: 300, health: 800, mana: 350, dodge: 50, speed: 40, luck: 120 }
  },
  {
    id: "elite_cosmos_armor",
    name: "Armure Cosmique Élite",
    type: "armor",
    rarity: "elite",
    level: 61,
    description: "Armure d'élite forgée avec la matière cosmique",
    priceType: "diamonds",
    customPrice: 4000,
    statsBonus: { defense: 400, health: 1000, mana: 400, attack: 80, luck: 150, dodge: 60 }
  },
  {
    id: "supreme_universe_armor",
    name: "Armure Universelle Suprême",
    type: "armor",
    rarity: "supreme_sparkling",
    level: 71,
    description: "L'armure ultime contenant la puissance de l'univers",
    priceType: "diamonds",
    customPrice: 8500,
    statsBonus: { defense: 600, health: 1500, mana: 600, attack: 150, luck: 250, dodge: 120, speed: 80 }
  },

  // Anneaux Premium
  {
    id: "silver_ring_power",
    name: "Anneau de Puissance d'Argent",
    type: "ring",
    rarity: "silver",
    level: 27,
    description: "Anneau amplifiant toutes les capacités",
    priceType: "gold",
    customPrice: 12000,
    statsBonus: { attack: 40, defense: 25, luck: 50, mana: 80, health: 120 }
  },
  {
    id: "golden_ring_mastery",
    name: "Anneau de Maîtrise Doré",
    type: "ring",
    rarity: "gold",
    level: 37,
    description: "Anneau doré de maîtrise absolue",
    priceType: "diamonds",
    customPrice: 600,
    statsBonus: { attack: 60, defense: 40, luck: 90, mana: 150, attackSpeed: 20.5, dodge: 30 }
  },
  {
    id: "platinum_ring_dominion",
    name: "Anneau de Domination en Platine",
    type: "ring",
    rarity: "platinum",
    level: 47,
    description: "Anneau de platine conférant la domination",
    priceType: "diamonds",
    customPrice: 1300,
    statsBonus: { attack: 90, defense: 60, luck: 120, mana: 200, health: 250, speed: 50 }
  },
  {
    id: "sparkling_ring_infinity",
    name: "Anneau de l'Infini Étincelant",
    type: "ring",
    rarity: "sparkling",
    level: 57,
    description: "Anneau étincelant aux pouvoirs infinis",
    priceType: "diamonds",
    customPrice: 2200,
    statsBonus: { attack: 120, defense: 80, luck: 180, mana: 300, health: 350, attackSpeed: 30.0, dodge: 70 }
  },
  {
    id: "elite_ring_transcendence",
    name: "Anneau de Transcendance Élite",
    type: "ring",
    rarity: "elite",
    level: 62,
    description: "Anneau d'élite transcendant les limites",
    priceType: "diamonds",
    customPrice: 3800,
    statsBonus: { attack: 150, defense: 100, luck: 220, mana: 400, health: 450, speed: 80, dodge: 90 }
  },
  {
    id: "supreme_ring_omnipotence",
    name: "Anneau d'Omnipotence Suprême",
    type: "ring",
    rarity: "supreme_sparkling",
    level: 72,
    description: "L'anneau ultime de l'omnipotence absolue",
    priceType: "diamonds",
    customPrice: 9000,
    statsBonus: { attack: 250, defense: 200, luck: 350, mana: 600, health: 700, attackSpeed: 60.0, dodge: 150, speed: 120 }
  },

  // Amulettes Premium
  {
    id: "silver_amulet_stars",
    name: "Amulette des Étoiles d'Argent",
    type: "amulet",
    rarity: "silver",
    level: 29,
    description: "Amulette capturant la lumière des étoiles",
    priceType: "gold",
    customPrice: 14000,
    statsBonus: { luck: 80, mana: 200, speed: 40, dodge: 35, attackSpeed: 15.2 }
  },
  {
    id: "golden_amulet_wisdom",
    name: "Amulette de Sagesse Dorée",
    type: "amulet",
    rarity: "gold",
    level: 39,
    description: "Amulette dorée de la sagesse éternelle",
    priceType: "diamonds",
    customPrice: 700,
    statsBonus: { luck: 120, mana: 350, speed: 60, dodge: 50, health: 200, defense: 35 }
  },
  {
    id: "platinum_amulet_destiny",
    name: "Amulette du Destin en Platine",
    type: "amulet",
    rarity: "platinum",
    level: 49,
    description: "Amulette de platine contrôlant le destin",
    priceType: "diamonds",
    customPrice: 1400,
    statsBonus: { luck: 180, mana: 450, speed: 80, dodge: 70, health: 300, attack: 60, defense: 50 }
  },
  {
    id: "sparkling_amulet_eternity",
    name: "Amulette de l'Éternité Étincelante",
    type: "amulet",
    rarity: "sparkling",
    level: 59,
    description: "Amulette étincelante de l'éternité",
    priceType: "diamonds",
    customPrice: 2300,
    statsBonus: { luck: 250, mana: 600, speed: 100, dodge: 100, health: 400, attack: 80, defense: 80, attackSpeed: 40.0 }
  },
  {
    id: "elite_amulet_creation",
    name: "Amulette de Création Élite",
    type: "amulet",
    rarity: "elite",
    level: 63,
    description: "Amulette d'élite de la création primordiale",
    priceType: "diamonds",
    customPrice: 4200,
    statsBonus: { luck: 320, mana: 750, speed: 120, dodge: 120, health: 500, attack: 120, defense: 100 }
  },
  {
    id: "supreme_amulet_reality",
    name: "Amulette de la Réalité Suprême",
    type: "amulet",
    rarity: "supreme_sparkling",
    level: 75,
    description: "L'amulette ultime qui façonne la réalité elle-même",
    priceType: "diamonds",
    customPrice: 10000,
    statsBonus: { luck: 500, mana: 1000, speed: 200, dodge: 200, health: 800, attack: 200, defense: 150, attackSpeed: 80.0 }
  }
];

// Prix de base pour chaque type et rareté
export const getEquipmentPrice = (equipment: Equipment): number => {
  // Si l'équipement a un prix personnalisé, l'utiliser
  if (equipment.customPrice && equipment.priceType) {
    return equipment.customPrice;
  }

  const basePrice = {
    weapon: 50,
    armor: 80,
    ring: 30,
    amulet: 40
  };

  const rarityMultiplier = {
    common: 1,
    uncommon: 2.5,
    rare: 6,
    epic: 15,
    legendary: 40,
    silver: 80,
    gold: 150,
    platinum: 250,
    sparkling: 400,
    elite: 600,
    supreme_sparkling: 1000
  };

  const levelMultiplier = 1 + (equipment.level - 1) * 0.3;
  
  return Math.floor(basePrice[equipment.type] * rarityMultiplier[equipment.rarity] * levelMultiplier);
};

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
  const baseMultiplier = randomType.multiplier * (0.5 + Math.random() * 0.3); // Réduit de 0.8-1.2 à 0.5-0.8

  return {
    id: `enemy_${Date.now()}_${Math.random()}`,
    name: `${randomType.name} Niveau ${enemyLevel}`,
    level: enemyLevel,
    icon: randomType.icon,
    stats: {
      attack: Math.floor(10 * enemyLevel * baseMultiplier), // Réduit de 15 à 10
      attackSpeed: Math.floor(35 * baseMultiplier), // Réduit de 40 à 35
      defense: Math.floor(6 * enemyLevel * baseMultiplier), // Réduit de 10 à 6
      dodge: Math.floor(15 * baseMultiplier), // Réduit de 20 à 15
      luck: Math.floor(20 * baseMultiplier), // Réduit de 25 à 20
      speed: Math.floor(25 * baseMultiplier), // Réduit de 30 à 25
      health: Math.floor(60 * enemyLevel * baseMultiplier), // Réduit de 80 à 60
      mana: Math.floor(40 * enemyLevel * baseMultiplier) // Réduit de 50 à 40
    },
    rewards: {
      experience: Math.floor(50 * enemyLevel * baseMultiplier), // Gardé identique pour progression
      gold: Math.floor(25 * enemyLevel * baseMultiplier), // Gardé identique pour récompenses
      dropChance: Math.random() < 0.3 ? generateRandomEquipment(enemyLevel) : null
    }
  };
}

function generateRandomEquipment(level: number): Equipment {
  const types: Equipment['type'][] = ['weapon', 'armor', 'ring', 'amulet'];
  const rarities: Equipment['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'silver', 'gold', 'platinum', 'sparkling', 'elite', 'supreme_sparkling'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const rarity = rarities[Math.floor(Math.random() * Math.min(rarities.length, Math.floor(level / 8) + 2))];
  
  const rarityMultipliers = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
    silver: 8,
    gold: 12,
    platinum: 18,
    sparkling: 25,
    elite: 35,
    supreme_sparkling: 50
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