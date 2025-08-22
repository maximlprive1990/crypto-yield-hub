// Utility to convert old equipment stats to new format
export const convertOldEquipmentStats = (statsBonus: any) => {
  const converted = { ...statsBonus };
  
  // Convert old attackSpeed to speedAttack
  if (converted.attackSpeed !== undefined) {
    converted.speedAttack = converted.attackSpeed;
    delete converted.attackSpeed;
  }
  
  // Convert old speed to agility  
  if (converted.speed !== undefined) {
    converted.agility = converted.speed;
    delete converted.speed;
  }
  
  return converted;
};