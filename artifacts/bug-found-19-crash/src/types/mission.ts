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
}

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

export const checkAndFailMissions = (missions: Mission[]): Mission[] => {
  const now = new Date();
  return missions.map((m) => {
    if (m.completed || m.failed || !m.deadline) return m;
    if (new Date(m.deadline) < now) return { ...m, failed: true };
    return m;
  });
};
