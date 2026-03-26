import { motion } from "framer-motion";
import { Sword, Heart, Wind, Brain, Eye, Apple } from "lucide-react";
import type { StatsData, StatType } from "@/types/skill";
import { STAT_SHORT_LABELS, getTotalXP, getLevelFromXP } from "@/types/skill";

interface StatsPageProps {
  stats: StatsData;
}

const LEFT_STATS: StatType[] = ["STR", "VIT", "AGI"];
const RIGHT_STATS: StatType[] = ["INT", "PER", "DIT"];

const STAT_ICONS: Record<StatType, React.ElementType> = {
  STR: Sword,
  VIT: Heart,
  AGI: Wind,
  INT: Brain,
  PER: Eye,
  DIT: Apple,
};

const StatCard = ({ type, value, delay }: { type: StatType; value: number; delay: number }) => {
  const Icon = STAT_ICONS[type];
  const isPositive = value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glow-border bg-card p-[1px]"
      style={{
        clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)",
      }}
    >
      <div
        className="bg-card px-3 py-3 flex flex-col items-center gap-1 relative overflow-hidden"
        style={{
          clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(187 92% 53% / 0.05) 0%, transparent 70%)" }} />

        <Icon className="w-5 h-5 text-primary relative z-10" />
        <span className="font-rajdhani font-bold text-base text-primary tracking-[0.15em] glow-text relative z-10">
          {type}
        </span>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent relative z-10" />
        <span className={`font-rajdhani font-bold text-2xl relative z-10 ${isPositive ? "text-foreground" : "text-destructive"}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-muted-foreground text-[8px] tracking-[0.15em] uppercase relative z-10">
          {STAT_SHORT_LABELS[type]}
        </span>
      </div>
    </motion.div>
  );
};

const StatsPage = ({ stats }: StatsPageProps) => {
  const totalXP = getTotalXP(stats);
  const { level, currentXP, nextLevelXP } = getLevelFromXP(Math.max(0, totalXP));
  const progress = totalXP <= 0 ? 0 : Math.min((currentXP / nextLevelXP) * 100, 100);

  return (
    <div className="h-full w-full flex flex-col items-center pt-12 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(260 60% 55% / 0.08) 0%, transparent 80%)" }} />

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/50" />
        <h1 className="font-rajdhani font-bold text-3xl tracking-[0.3em] uppercase text-primary glow-text">
          Status
        </h1>
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mb-6 relative z-10"
      >
        <div className="glow-border bg-card p-[1px] panel-chamfer">
          <div className="panel-chamfer bg-card px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-rajdhani font-bold text-sm text-primary tracking-[0.2em] uppercase glow-text">
                Lv. {level}
              </span>
              <span className="font-rajdhani text-[10px] text-muted-foreground tracking-wider">
                {Math.floor(Math.max(0, currentXP))} / {Math.floor(nextLevelXP)} XP
              </span>
            </div>
            <div className="w-full h-2 bg-secondary overflow-hidden"
              style={{ clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 50%, calc(100% - 4px) 100%, 4px 100%, 0% 50%)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full"
                style={{
                  background: "linear-gradient(90deg, hsl(187 92% 53%), hsl(200 90% 60%))",
                  boxShadow: "0 0 10px hsl(187 92% 53% / 0.8), 0 0 20px hsl(187 92% 53% / 0.4)"
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-sm grid grid-cols-2 gap-3 relative z-10">
        <div className="flex flex-col gap-3">
          {LEFT_STATS.map((type, i) => (
            <StatCard key={type} type={type} value={stats[type]} delay={i * 0.08} />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {RIGHT_STATS.map((type, i) => (
            <StatCard key={type} type={type} value={stats[type]} delay={(i + 3) * 0.08} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
