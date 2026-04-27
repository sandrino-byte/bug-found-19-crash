import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Circle, Plus, Trash2, Coins, Skull, Dumbbell } from "lucide-react";
import type { Mission, MissionType, MissionRewards } from "@/types/mission";
import { getDeadline, processMissionExpiry, normalizeMission } from "@/types/mission";
import { formatCrystals } from "@/types/resources";
import AddMissionNameDialog from "@/components/AddMissionNameDialog";
import MissionRewardDialog from "@/components/MissionRewardDialog";
import CountdownTimer from "@/components/CountdownTimer";
import CrystalIcon from "@/components/CrystalIcon";

const MISSIONS_KEY = "missions_data";

const TABS: { key: MissionType; label: string }[] = [
  { key: "daily",   label: "Daily" },
  { key: "weekly",  label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "special", label: "Special" },
];

const TAB_COLORS: Record<MissionType, string> = {
  daily:   "hsl(187 92% 53%)",
  weekly:  "hsl(260 60% 65%)",
  monthly: "hsl(45 93% 58%)",
  special: "hsl(0 84% 60%)",
};

interface MissionsPageProps {
  onReward: (gold: number, crystals: number) => void;
  onPenalty: (gold: number, crystals: number) => void;
}

const MissionItem = ({
  mission,
  color,
  onComplete,
  onDelete,
}: {
  mission: Mission;
  color: string;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const isFailed    = mission.failed;
  const isCompleted = mission.completed;
  const isActive    = !isFailed && !isCompleted;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ layout: { type: "spring", stiffness: 300, damping: 28 } }}
      className="glow-border bg-card p-[1px]"
      style={{
        clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)",
        opacity: isFailed ? 0.6 : 1,
      }}
    >
      <div
        className="bg-card px-3 py-2.5 flex items-start gap-3 relative overflow-hidden"
        style={{
          clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)",
        }}
      >
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none"
          style={{ background: isFailed ? "hsl(0 84% 55%)" : isCompleted ? "hsl(142 76% 42%)" : color }} />

        {/* Checkbox */}
        <button
          onClick={() => isActive && onComplete(mission.id)}
          disabled={!isActive}
          className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110 active:scale-95"
        >
          {isCompleted ? (
            <CheckCircle2 size={18} style={{ color: "hsl(142 76% 42%)" }} />
          ) : isFailed ? (
            <XCircle size={18} style={{ color: "hsl(0 84% 55%)" }} />
          ) : (
            <Circle size={18} style={{ color }} />
          )}
        </button>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <p className={`font-rajdhani font-semibold text-sm tracking-wider uppercase truncate ${
            isCompleted ? "line-through text-muted-foreground/50" : isFailed ? "text-destructive/80" : "text-foreground"
          }`}>
            {mission.name}
          </p>

          {/* Countdown — only for active timed missions */}
          {isActive && mission.deadline && (
            <div className="mt-1">
              <CountdownTimer deadline={mission.deadline} color={color} />
            </div>
          )}

          {/* Status badges */}
          {isFailed && (
            <p className="text-[9px] tracking-[0.2em] uppercase text-destructive/70 mt-1 font-semibold">Failed</p>
          )}
          {isCompleted && (
            <p className="text-[9px] tracking-[0.2em] uppercase text-green-400/70 mt-1 font-semibold">Completed</p>
          )}

          {/* Reward chips */}
          {isActive && (mission.goldReward > 0 || mission.crystalReward > 0) && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {mission.goldReward > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] tabular-nums" style={{ color: "hsl(45 93% 58%)" }}>
                  <Coins size={9} /> +{mission.goldReward}
                </span>
              )}
              {mission.crystalReward > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] tabular-nums" style={{ color: "hsl(187 92% 53%)" }}>
                  <CrystalIcon size={10} color="hsl(187 92% 53%)" glow={false} /> +{formatCrystals(mission.crystalReward)}
                </span>
              )}
            </div>
          )}

          {/* Penalty chips on active card */}
          {isActive && (mission.goldPenalty > 0 || mission.crystalPenalty > 0 || mission.fatiguePenalty) && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {mission.goldPenalty > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] tabular-nums" style={{ color: "hsl(0 84% 60%)" }}>
                  <Skull size={9} /> -{mission.goldPenalty}
                </span>
              )}
              {mission.crystalPenalty > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] tabular-nums" style={{ color: "hsl(0 84% 60%)" }}>
                  <CrystalIcon size={10} color="hsl(0 84% 60%)" glow={false} /> -{formatCrystals(mission.crystalPenalty)}
                </span>
              )}
              {mission.fatiguePenalty && (
                <span className="flex items-center gap-0.5 text-[9px]" style={{ color: "hsl(25 90% 60%)" }}>
                  <Dumbbell size={9} /> {mission.fatiguePenalty}
                </span>
              )}
            </div>
          )}

          {/* Fatigue alert on failed card */}
          {isFailed && mission.fatiguePenalty && (
            <div
              className="mt-1.5 px-2 py-1 border flex items-center gap-1.5"
              style={{
                background: "hsl(25 90% 60% / 0.10)",
                borderColor: "hsl(25 90% 60% / 0.4)",
                color: "hsl(25 90% 65%)",
              }}
            >
              <Dumbbell size={11} />
              <span className="font-rajdhani font-semibold text-[10px] tracking-wider uppercase">
                Fatigue: {mission.fatiguePenalty}
              </span>
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(mission.id)}
          className="flex-shrink-0 mt-1 text-muted-foreground/30 hover:text-destructive/70 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
};

const MissionsPage = ({ onReward, onPenalty }: MissionsPageProps) => {
  const [activeTab, setActiveTab] = useState<MissionType>("daily");

  // Two-step dialog state
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [showRewardDialog, setShowRewardDialog] = useState(false);

  const onPenaltyRef = useRef(onPenalty);
  useEffect(() => { onPenaltyRef.current = onPenalty; }, [onPenalty]);

  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem(MISSIONS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map(normalizeMission) : [];
    } catch { return []; }
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
  }, [missions]);

  // Tick every second: check expiries + apply penalties
  useEffect(() => {
    const tick = () => {
      setMissions((prev) => {
        const { missions: updated, newlyFailed } = processMissionExpiry(prev);
        if (newlyFailed.length > 0) {
          for (const m of newlyFailed) {
            if (m.goldPenalty > 0 || m.crystalPenalty > 0) {
              onPenaltyRef.current(m.goldPenalty, m.crystalPenalty);
            }
          }
        }
        return updated;
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Step 1: name confirmed
  const handleNameSubmit = useCallback((name: string) => {
    setPendingName(name);
    setShowNameDialog(false);
    setShowRewardDialog(true);
  }, []);

  // Step 2: rewards confirmed → create mission
  const handleRewardConfirm = useCallback((rewards: MissionRewards) => {
    if (!pendingName) return;
    const mission: Mission = {
      id: crypto.randomUUID(),
      name: pendingName,
      type: activeTab,
      completed: false,
      failed: false,
      createdAt: new Date().toISOString(),
      deadline: getDeadline(activeTab),
      completedAt: null,
      goldReward: rewards.gold,
      crystalReward: rewards.crystals,
      goldPenalty: rewards.goldPenalty,
      crystalPenalty: rewards.crystalPenalty,
      fatiguePenalty: rewards.fatiguePenalty,
      rewardClaimed: false,
      penaltyApplied: false,
    };
    setMissions((prev) => [...prev, mission]);
    setPendingName(null);
    setShowRewardDialog(false);
  }, [pendingName, activeTab]);

  const handleComplete = useCallback((id: string) => {
    setMissions((prev) => prev.map((m) => {
      if (m.id !== id || m.completed || m.failed) return m;
      if (!m.rewardClaimed) {
        onReward(m.goldReward, m.crystalReward);
      }
      return {
        ...m,
        completed: true,
        completedAt: new Date().toISOString(),
        rewardClaimed: true,
      };
    }));
  }, [onReward]);

  const handleDelete = useCallback((id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const filtered = missions.filter((m) => m.type === activeTab);
  const active    = filtered.filter((m) => !m.completed && !m.failed);
  const completed = filtered.filter((m) => m.completed);
  const failed    = filtered.filter((m) => m.failed);

  const color = TAB_COLORS[activeTab];

  return (
    <div className="h-full w-full flex flex-col items-center pt-12 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}14 0%, transparent 80%)` }} />

      {/* Title */}
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/50" />
        <h1 className="font-rajdhani font-bold text-3xl tracking-[0.3em] uppercase glow-text" style={{ color }}>
          Missions
        </h1>
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/50" />
      </div>

      {/* Tab bar */}
      <div className="w-full max-w-sm flex mb-4 relative z-10 border border-border">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-1.5 font-rajdhani font-bold text-[10px] tracking-[0.15em] uppercase transition-all relative"
              style={{
                color: isActive ? TAB_COLORS[tab.key] : "hsl(220 15% 42%)",
                background: isActive ? TAB_COLORS[tab.key] + "18" : "transparent",
              }}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: TAB_COLORS[tab.key] }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mission list */}
      <div className="w-full max-w-sm flex-1 overflow-y-auto relative z-10 pb-20 space-y-2">
        <AnimatePresence>
          {active.length === 0 && completed.length === 0 && failed.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground text-xs tracking-[0.2em] uppercase text-center pt-16"
            >
              No {activeTab} missions
            </motion.p>
          )}

          {active.map((m) => (
            <MissionItem key={m.id} mission={m} color={color} onComplete={handleComplete} onDelete={handleDelete} />
          ))}
        </AnimatePresence>

        {/* Completed section */}
        {completed.length > 0 && (
          <div className="pt-2">
            <p className="text-[8px] tracking-[0.2em] uppercase text-green-400/50 mb-2">Completed</p>
            <AnimatePresence>
              {completed.map((m) => (
                <MissionItem key={m.id} mission={m} color={color} onComplete={handleComplete} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Failed section */}
        {failed.length > 0 && (
          <div className="pt-2">
            <p className="text-[8px] tracking-[0.2em] uppercase text-destructive/50 mb-2">Failed</p>
            <AnimatePresence>
              {failed.map((m) => (
                <MissionItem key={m.id} mission={m} color={color} onComplete={handleComplete} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowNameDialog(true)}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-2.5 font-rajdhani font-bold text-xs tracking-[0.2em] uppercase border panel-chamfer transition-all"
        style={{
          color,
          borderColor: color + "60",
          background: color + "15",
          boxShadow: `0 0 12px ${color}30`,
        }}
      >
        <Plus size={14} />
        New {activeTab} mission
      </motion.button>

      {/* Step 1: name dialog */}
      <AddMissionNameDialog
        open={showNameDialog}
        type={activeTab}
        color={color}
        onClose={() => setShowNameDialog(false)}
        onSubmit={handleNameSubmit}
      />

      {/* Step 2: rewards/penalty dialog */}
      <MissionRewardDialog
        open={showRewardDialog}
        type={activeTab}
        missionName={pendingName ?? ""}
        color={color}
        onClose={() => { setShowRewardDialog(false); setPendingName(null); }}
        onConfirm={handleRewardConfirm}
      />
    </div>
  );
};

export default MissionsPage;
