import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Circle, Plus, Trash2 } from "lucide-react";
import type { Mission, MissionType } from "@/types/mission";
import { getDeadline, checkAndFailMissions } from "@/types/mission";

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

const formatDeadline = (deadline: string | null, type: MissionType): string => {
  if (!deadline || type === "special") return "";
  const d = new Date(deadline);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return "expired";
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  if (type === "daily") return `${diffH}h ${diffM}m left`;
  const diffDays = Math.floor(diffMs / 86400000);
  if (type === "weekly") return `${diffDays}d left`;
  return `${diffDays}d left`;
};

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
        opacity: isFailed ? 0.55 : 1,
      }}
    >
      <div
        className="bg-card px-3 py-2.5 flex items-center gap-3 relative overflow-hidden"
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
          className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
        >
          {isCompleted ? (
            <CheckCircle2 size={18} style={{ color: "hsl(142 76% 42%)" }} />
          ) : isFailed ? (
            <XCircle size={18} style={{ color: "hsl(0 84% 55%)" }} />
          ) : (
            <Circle size={18} style={{ color }} />
          )}
        </button>

        {/* Name + deadline */}
        <div className="flex-1 min-w-0">
          <p className={`font-rajdhani font-semibold text-sm tracking-wider uppercase truncate ${
            isCompleted ? "line-through text-muted-foreground/50" : isFailed ? "text-destructive/70" : "text-foreground"
          }`}>
            {mission.name}
          </p>
          {mission.deadline && isActive && (
            <p className="text-[9px] tracking-wider uppercase mt-0.5" style={{ color }}>
              {formatDeadline(mission.deadline, mission.type)}
            </p>
          )}
          {isFailed && (
            <p className="text-[9px] tracking-wider uppercase text-destructive/60 mt-0.5">Failed</p>
          )}
          {isCompleted && (
            <p className="text-[9px] tracking-wider uppercase text-green-400/60 mt-0.5">Completed</p>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(mission.id)}
          className="flex-shrink-0 text-muted-foreground/30 hover:text-destructive/70 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
};

const AddMissionDialog = ({
  open,
  type,
  onClose,
  onAdd,
}: {
  open: boolean;
  type: MissionType;
  onClose: () => void;
  onAdd: (name: string) => void;
}) => {
  const [name, setName] = useState("");
  const color = TAB_COLORS[type];

  const handleAdd = () => {
    if (name.trim()) { onAdd(name.trim()); setName(""); }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.125 }}
            onClick={(e) => e.stopPropagation()}
            className="w-72 panel-chamfer bg-card p-[1px]"
            style={{ boxShadow: `0 0 20px ${color}33` }}
          >
            <div className="panel-chamfer bg-card p-4 space-y-3">
              <p className="font-rajdhani font-semibold text-xs tracking-[0.2em] uppercase text-center"
                style={{ color }}>
                New {type} mission
              </p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") onClose(); }}
                className="w-full input-system font-rajdhani text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-1"
                placeholder="Mission name..."
              />
              <div className="flex gap-2 pt-1">
                <button onClick={onClose}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-muted-foreground/30 text-muted-foreground py-1.5 hover:bg-muted-foreground/10 transition-all">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={!name.trim()}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border py-1.5 transition-all disabled:opacity-40"
                  style={{ borderColor: color + "80", color, background: color + "1A" }}>
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const MissionsPage = () => {
  const [activeTab, setActiveTab] = useState<MissionType>("daily");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem(MISSIONS_KEY);
      const parsed: Mission[] = saved ? JSON.parse(saved) : [];
      return checkAndFailMissions(parsed);
    } catch { return []; }
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
  }, [missions]);

  // Check for failures every minute
  useEffect(() => {
    const id = setInterval(() => {
      setMissions((prev) => checkAndFailMissions(prev));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const handleAdd = useCallback((name: string) => {
    const mission: Mission = {
      id: crypto.randomUUID(),
      name,
      type: activeTab,
      completed: false,
      failed: false,
      createdAt: new Date().toISOString(),
      deadline: getDeadline(activeTab),
      completedAt: null,
    };
    setMissions((prev) => [...prev, mission]);
    setShowAddDialog(false);
  }, [activeTab]);

  const handleComplete = useCallback((id: string) => {
    setMissions((prev) => prev.map((m) =>
      m.id === id ? { ...m, completed: true, completedAt: new Date().toISOString() } : m
    ));
  }, []);

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

      {/* Add button — absolute so it stays inside the missions page only */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowAddDialog(true)}
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

      <AddMissionDialog
        open={showAddDialog}
        type={activeTab}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default MissionsPage;
