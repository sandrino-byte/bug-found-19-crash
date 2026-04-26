import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Coins, Gem, Skull, Trophy } from "lucide-react";
import type { MissionType, MissionRewards } from "@/types/mission";
import { DEFAULT_REWARDS } from "@/types/mission";

interface MissionRewardDialogProps {
  open: boolean;
  type: MissionType;
  missionName: string;
  onClose: () => void;
  onConfirm: (rewards: MissionRewards) => void;
  color: string;
}

const StepperRow = ({
  label,
  value,
  onChange,
  step,
  color,
  icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  color: string;
  icon: React.ReactNode;
}) => {
  const handleInput = (raw: string) => {
    const cleaned = raw.replace(/[^\d]/g, "");
    onChange(cleaned === "" ? 0 : parseInt(cleaned, 10));
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className="font-rajdhani text-[11px] tracking-[0.15em] uppercase truncate" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(0, value - step))}
          className="w-6 h-6 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all"
        >
          <Minus size={11} />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          className="w-14 text-center font-rajdhani font-bold text-sm tabular-nums bg-transparent border border-border py-0.5 focus:outline-none focus:border-primary/60"
          style={{ color }}
        />
        <button
          onClick={() => onChange(value + step)}
          className="w-6 h-6 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
};

const MissionRewardDialog = ({
  open,
  type,
  missionName,
  onClose,
  onConfirm,
  color,
}: MissionRewardDialogProps) => {
  const defaults = DEFAULT_REWARDS[type];
  const [gold, setGold] = useState(defaults.gold);
  const [crystals, setCrystals] = useState(defaults.crystals);
  const [penalty, setPenalty] = useState(defaults.goldPenalty);

  useEffect(() => {
    if (open) {
      setGold(defaults.gold);
      setCrystals(defaults.crystals);
      setPenalty(defaults.goldPenalty);
    }
  }, [open, defaults]);

  const handleConfirm = () => {
    onConfirm({ gold, crystals, goldPenalty: penalty });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-80 panel-chamfer bg-card p-[1px]"
            style={{ boxShadow: `0 0 30px ${color}30` }}
          >
            <div className="panel-chamfer bg-card scanlines">
              {/* Header */}
              <div className="border-b border-primary/20 px-3 py-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rotate-45 animate-pulse" style={{ background: color }} />
                <span
                  className="text-[9px] font-semibold tracking-[0.2em] uppercase glow-text"
                  style={{ color }}
                >
                  Mission Contract
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              </div>

              {/* Mission name */}
              <div className="px-4 pt-3 pb-2 text-center border-b border-primary/10">
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-0.5">
                  {type} Mission
                </p>
                <p className="font-rajdhani font-bold text-base tracking-wider uppercase glow-text truncate" style={{ color }}>
                  {missionName}
                </p>
              </div>

              {/* Rewards section */}
              <div className="px-4 pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={12} style={{ color: "hsl(142 76% 50%)" }} />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-green-400/80 font-semibold">
                    Rewards on Completion
                  </span>
                  <div className="flex-1 h-px bg-green-400/20" />
                </div>
                <StepperRow
                  label="Gold"
                  value={gold}
                  onChange={setGold}
                  step={50}
                  color="hsl(45 93% 58%)"
                  icon={<Coins size={12} style={{ color: "hsl(45 93% 58%)" }} />}
                />
                <StepperRow
                  label="Blue Crystals"
                  value={crystals}
                  onChange={setCrystals}
                  step={1}
                  color="hsl(187 92% 53%)"
                  icon={<Gem size={12} style={{ color: "hsl(187 92% 53%)" }} />}
                />
              </div>

              {/* Penalty section */}
              <div className="px-4 pt-3 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Skull size={12} style={{ color: "hsl(0 84% 55%)" }} />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-destructive/80 font-semibold">
                    Penalty on Failure
                  </span>
                  <div className="flex-1 h-px bg-destructive/20" />
                </div>
                <StepperRow
                  label="Gold Lost"
                  value={penalty}
                  onChange={setPenalty}
                  step={25}
                  color="hsl(0 84% 60%)"
                  icon={<Coins size={12} style={{ color: "hsl(0 84% 60%)" }} />}
                />
                {type === "special" && (
                  <p className="text-[9px] tracking-wider text-muted-foreground/60 italic mt-1">
                    Special missions have no time limit — penalty triggers only if you mark it failed.
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 px-4 pb-4 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-muted-foreground/30 text-muted-foreground py-2 hover:bg-muted-foreground/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border py-2 transition-all"
                  style={{
                    borderColor: color + "80",
                    color,
                    background: color + "1A",
                    boxShadow: `0 0 10px ${color}40`,
                  }}
                >
                  Accept Contract
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

export default MissionRewardDialog;
