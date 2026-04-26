export type MissionType = "daily" | "weekly" | "monthly" | "special";

export interface Mission {
  id: string;
  name: string;
  type: MissionType;
  completed: boolean;
  failed: boolean;
  createdAt: string;
  deadline: string | null;
  completedAt: string | null;
  goldReward: number;
  crystalReward: number;
  goldPenalty: number;
  rewardClaimed: boolean;
  penaltyApplied: boolean;
}

export interface MissionRewards {
  gold: number;
  crystals: number;
  goldPenalty: number;
}

export const DEFAULT_REWARDS: Record<MissionType, MissionRewards> = {
  daily:   { gold: 50,   crystals: 0, goldPenalty: 25 },
  weekly:  { gold: 200,  crystals: 1, goldPenalty: 100 },
  monthly: { gold: 1000, crystals: 5, goldPenalty: 500 },
  special: { gold: 500,  crystals: 2, goldPenalty: 0 },
};

export const getDeadline = (type: MissionType): string | null => {
  if (type === "special") return null;
  const d = new Date();
  if (type === "daily") {
    d.setHours(23, 59, 59, 999);
  } else if (type === "weekly") {
    const day = d.getDay();
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + daysUntilSunday);
    d.setHours(23, 59, 59, 999);
  } else if (type === "monthly") {
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
  }
  return d.toISOString();
};

export interface ExpiryResult {
  missions: Mission[];
  newlyFailed: Mission[];
}

export const processMissionExpiry = (missions: Mission[]): ExpiryResult => {
  const now = new Date();
  const newlyFailed: Mission[] = [];
  const updated = missions.map((m) => {
    if (m.completed || m.failed || !m.deadline) return m;
    if (new Date(m.deadline) < now) {
      const next = { ...m, failed: true, penaltyApplied: true };
      newlyFailed.push(next);
      return next;
    }
    return m;
  });
  return { missions: updated, newlyFailed };
};

/** Backwards-compatible helper for mounting an old store */
export const checkAndFailMissions = (missions: Mission[]): Mission[] => {
  return processMissionExpiry(missions).missions;
};

export const formatCountdown = (deadlineMs: number): string => {
  const ms = deadlineMs - Date.now();
  if (ms <= 0) return "EXPIRED";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
  return `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
};
