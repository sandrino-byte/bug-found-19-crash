/** Stat types that can be linked to a skill */
export type StatType = "STR" | "VIT" | "AGI" | "INT" | "PER" | "DIT";

export const ALL_STATS: StatType[] = ["STR", "VIT", "AGI", "INT", "PER", "DIT"];

export const STAT_LABELS: Record<StatType, string> = {
  STR: "Strength",
  VIT: "Vitality / HP",
  AGI: "Agility",
  INT: "Intelligence",
  PER: "Perception",
  DIT: "Diet / Food",
};

export const STAT_SHORT_LABELS: Record<StatType, string> = {
  STR: "Strength",
  VIT: "Vitality",
  AGI: "Agility",
  INT: "Intelligence",
  PER: "Perception",
  DIT: "Diet",
};

/** A single skill with calculation parameters and linked stats */
export interface Skill {
  id: string;
  name: string;
  result: number;
  base: string;
  rate: string;
  exponent: string;
  /** Single stat (legacy) or multiple stats */
  stat?: StatType;
  stats?: StatType[];
}

/** Get all active stats for a skill (handles both legacy and new format) */
export const getSkillStats = (skill: Skill): StatType[] => {
  if (skill.stats && skill.stats.length > 0) return skill.stats;
  if (skill.stat) return [skill.stat];
  return [];
};

/** Stats values stored persistently */
export type StatsData = Record<StatType, number>;

export const DEFAULT_STATS: StatsData = {
  STR: 0,
  VIT: 0,
  AGI: 0,
  INT: 0,
  PER: 0,
  DIT: 0,
};

/** Level XP formula: 10 × 1.122019^level (cumulative) */
export const XP_FOR_LEVEL = (level: number): number => {
  return 10 * Math.pow(1.122019, level);
};

/** Calculate total XP from all stats */
export const getTotalXP = (stats: StatsData): number => {
  return Object.values(stats).reduce((sum, v) => sum + v * 10, 0);
};

/** Get current level from total XP */
export const getLevelFromXP = (totalXP: number): { level: number; currentXP: number; nextLevelXP: number } => {
  let cumulativeXP = 0;
  for (let lvl = 1; lvl <= 100; lvl++) {
    const needed = XP_FOR_LEVEL(lvl);
    if (cumulativeXP + needed > totalXP) {
      return {
        level: lvl,
        currentXP: totalXP - cumulativeXP,
        nextLevelXP: needed,
      };
    }
    cumulativeXP += needed;
  }
  return { level: 100, currentXP: 0, nextLevelXP: 1 };
};
