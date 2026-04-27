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
  crystalPenalty: number;
  fatiguePenalty: string;
  rewardClaimed: boolean;
  penaltyApplied: boolean;
}

export interface MissionRewards {
  gold: number;
  crystals: number;
  goldPenalty: number;
  crystalPenalty: number;
  fatiguePenalty: string;
}

export const DEFAULT_REWARDS: Record<MissionType, MissionRewards> = {
  daily:   { gold: 50,   crystals: 0,   goldPenalty: 25,  crystalPenalty: 0,   fatiguePenalty: "" },
  weekly:  { gold: 200,  crystals: 1,   goldPenalty: 100, crystalPenalty: 0.5, fatiguePenalty: "" },
  monthly: { gold: 1000, crystals: 5,   goldPenalty: 500, crystalPenalty: 2,   fatiguePenalty: "" },
  special: { gold: 500,  crystals: 2,   goldPenalty: 0,   crystalPenalty: 0,   fatiguePenalty: "" },
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

/** Returns a string key identifying the current period for a recurring mission type. */
export const getPeriodKey = (type: MissionType, date: Date): string => {
  if (type === "daily") {
    return `D-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  if (type === "weekly") {
    // Anchor each week to its Sunday (end-of-week) date so all days Mon–Sun share a key.
    const d = new Date(date);
    const day = d.getDay();
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + daysUntilSunday);
    return `W-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
  if (type === "monthly") {
    return `M-${date.getFullYear()}-${date.getMonth()}`;
  }
  return "special";
};

/** Date used to determine which period a completed/failed mission belongs to. */
const missionPeriodAnchor = (m: Mission): Date | null => {
  if (m.completedAt) return new Date(m.completedAt);
  if (m.deadline) return new Date(m.deadline);
  return null;
};

export const processMissionExpiry = (missions: Mission[]): ExpiryResult => {
  const now = new Date();
  const currentKey = (type: MissionType) => getPeriodKey(type, now);
  const newlyFailed: Mission[] = [];

  const updated = missions.map((m) => {
    // 1) Active timed missions whose deadline passed → fail them.
    if (!m.completed && !m.failed && m.deadline && new Date(m.deadline) < now) {
      const next: Mission = { ...m, failed: true, penaltyApplied: true };
      newlyFailed.push(next);
      return next;
    }

    // 2) Recurring (non-special) completed/failed missions auto-respawn
    //    when the period rolls over (daily → next day, weekly → next week, monthly → next month).
    if (m.type !== "special" && (m.completed || m.failed)) {
      const anchor = missionPeriodAnchor(m);
      if (anchor) {
        const oldKey = getPeriodKey(m.type, anchor);
        if (oldKey !== currentKey(m.type)) {
          return {
            ...m,
            completed: false,
            failed: false,
            completedAt: null,
            rewardClaimed: false,
            penaltyApplied: false,
            deadline: getDeadline(m.type),
          };
        }
      }
    }

    return m;
  });

  return { missions: updated, newlyFailed };
};

/** Backfill missing fields from older stored missions */
export const normalizeMission = (m: Partial<Mission> & { id: string; name: string; type: MissionType }): Mission => ({
  id: m.id,
  name: m.name,
  type: m.type,
  completed: m.completed ?? false,
  failed: m.failed ?? false,
  createdAt: m.createdAt ?? new Date().toISOString(),
  deadline: m.deadline ?? null,
  completedAt: m.completedAt ?? null,
  goldReward: m.goldReward ?? 0,
  crystalReward: m.crystalReward ?? 0,
  goldPenalty: m.goldPenalty ?? 0,
  crystalPenalty: m.crystalPenalty ?? 0,
  fatiguePenalty: m.fatiguePenalty ?? "",
  rewardClaimed: m.rewardClaimed ?? false,
  penaltyApplied: m.penaltyApplied ?? false,
});

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

export const round1 = (n: number): number => Math.round(n * 10) / 10;
