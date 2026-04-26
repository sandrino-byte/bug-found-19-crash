import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Coins, Gem, Skull, Trophy, Dumbbell } from "lucide-react";
import type { MissionType, MissionRewards } from "@/types/mission";
import { DEFAULT_REWARDS, round1 } from "@/types/mission";

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
  decimal,
  color,
  icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  decimal?: boolean;
  color: string;
  icon: React.ReactNode;
}) => {
  // Local string state allows typing partial decimals like "0."
  const [text, setText] = useState<string>(decimal ? (value % 1 === 0 ? String(value) : value.toFixed(1)) : String(value));

  useEffect(() => {
    setText(decimal ? (value % 1 === 0 ? String(value) : value.toFixed(1)) : String(value));
  }, [value, decimal]);

  const commit = (raw: string) => {
    const cleaned = raw.replace(decimal ? /[^\d.]/g : /[^\d]/g, "");
    const parts = cleaned.split(".");
    const finalStr = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
    setText(finalStr);
    if (finalStr === "" || finalStr === ".") return;
    const parsed = parseFloat(finalStr);
    if (!isNaN(parsed)) onChange(decimal ? round1(parsed) : Math.floor(parsed));
  };

  const inc = () => onChange(decimal ? round1(value + step) : value + step);
  const dec = () => onChange(decimal ? Math.max(0, round1(value - step)) : Math.max(0, value - step));

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
          onClick={dec}
          className="w-6 h-6 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all"
        >
          <Minus size={11} />
        </button>
        <input
          type="text"
          inputMode={decimal ? "decimal" : "numeric"}
          value={text}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => {
            if (text === "" || text === ".") {
              setText("0");
              onChange(0);
            }
          }}
          className="w-14 text-center font-rajdhani font-bold text-sm tabular-nums bg-transparent border border-border py-0.5 focus:outline-none focus:border-primary/60"
          style={{ color }}
        />
        <button
          onClick={inc}
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
  const [goldPenalty, setGoldPenalty] = useState(defaults.goldPenalty);
  const [crystalPenalty, setCrystalPenalty] = useState(defaults.crystalPenalty);
  const [fatiguePenalty, setFatiguePenalty] = useState(defaults.fatiguePenalty);

  useEffect(() => {
    if (open) {
      setGold(defaults.gold);
      setCrystals(defaults.crystals);
      setGoldPenalty(defaults.goldPenalty);
      setCrystalPenalty(defaults.crystalPenalty);
      setFatiguePenalty(defaults.fatiguePenalty);
    }
  }, [open, defaults]);

  const handleConfirm = () => {
    onConfirm({
      gold,
      crystals,
      goldPenalty,
      crystalPenalty,
      fatiguePenalty: fatiguePenalty.trim(),
    });
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
            className="w-80 max-h-[88vh] overflow-y-auto panel-chamfer bg-card p-[1px]"
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
                  step={1}
                  color="hsl(45 93% 58%)"
                  icon={<Coins size={12} style={{ color: "hsl(45 93% 58%)" }} />}
                />
                <StepperRow
                  label="Blue Crystals"
                  value={crystals}
                  onChange={setCrystals}
                  step={0.1}
                  decimal
                  color="hsl(187 92% 53%)"
                  icon={<Gem size={12} style={{ color: "hsl(187 92% 53%)" }} />}
                />
              </div>

              {/* Penalty: Fatigue */}
              <div className="px-4 pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell size={12} style={{ color: "hsl(25 90% 60%)" }} />
                  <span className="text-[9px] tracking-[0.2em] uppercase font-semibold" style={{ color: "hsl(25 90% 60%)" }}>
                    Fatigue Penalty
                  </span>
                  <div className="flex-1 h-px" style={{ background: "hsl(25 90% 60% / 0.2)" }} />
                </div>
                <input
                  type="text"
                  value={fatiguePenalty}
                  onChange={(e) => setFatiguePenalty(e.target.value)}
                  placeholder="e.g. 50 push-ups, 5 km run..."
                  className="w-full input-system font-rajdhani text-xs text-foreground placeholder:text-muted-foreground/40 px-0 py-1"
                />
                <p className="text-[8px] tracking-wider text-muted-foreground/60 italic mt-0.5">
                  Physical task you must complete if the mission fails
                </p>
              </div>

              {/* Penalty: Economic */}
              <div className="px-4 pt-3 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Skull size={12} style={{ color: "hsl(0 84% 55%)" }} />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-destructive/80 font-semibold">
                    Economic Penalty
                  </span>
                  <div className="flex-1 h-px bg-destructive/20" />
                </div>
                <StepperRow
                  label="Gold Lost"
                  value={goldPenalty}
                  onChange={setGoldPenalty}
                  step={1}
                  color="hsl(0 84% 60%)"
                  icon={<Coins size={12} style={{ color: "hsl(0 84% 60%)" }} />}
                />
                <StepperRow
                  label="Crystals Lost"
                  value={crystalPenalty}
                  onChange={setCrystalPenalty}
                  step={0.1}
                  decimal
                  color="hsl(0 84% 60%)"
                  icon={<Gem size={12} style={{ color: "hsl(0 84% 60%)" }} />}
                />
                {type === "special" && (
                  <p className="text-[9px] tracking-wider text-muted-foreground/60 italic mt-1">
                    Special missions have no time limit — penalties trigger only if you mark it failed.
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
