import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Info, ChevronUp, ChevronDown } from "lucide-react";
import SkillDeleteDialog from "@/components/SkillDeleteDialog";
import type { Skill } from "@/types/skill";
import { getSkillStats } from "@/types/skill";

interface SkillPageProps {
  skills: Skill[];
  onDelete?: (id: string) => void;
  onSkillClick?: (skill: Skill) => void;
  onReorder?: (skills: Skill[]) => void;
}

const SWIPE_THRESHOLD = 100;

const getCumulativeInt = (skill: Skill): number => {
  const b = parseFloat(skill.base?.replace(",", ".") || "0");
  const r = parseFloat(skill.rate?.replace(",", ".") || "0");
  const days = parseInt(skill.exponent?.replace(",", ".") || "0", 10);
  if (isNaN(b) || isNaN(r) || days < 0) return 0;
  let sum = 0;
  for (let i = 0; i <= days; i++) {
    sum += b * Math.pow(r, i);
  }
  return Math.floor(sum);
};

const SkillItem = ({
  skill,
  index,
  total,
  onRequestDelete,
  onClick,
  onMoveUp,
  onMoveDown,
}: {
  skill: Skill;
  index: number;
  total: number;
  onRequestDelete: (skill: Skill) => void;
  onClick: (skill: Skill) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, -80, 0, 80, 150], [0.3, 0.7, 1, 0.7, 0.3]);
  const bg = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    ["hsl(0 84% 55% / 0.15)", "hsl(0 84% 55% / 0)", "hsl(0 84% 55% / 0.15)"]
  );

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      onRequestDelete(skill);
    }
  };

  const cumulativeValue = getCumulativeInt(skill);
  const skillStats = getSkillStats(skill);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ layout: { type: "spring", stiffness: 300, damping: 28 } }}
    >
      <motion.div
        style={{ x, opacity, backgroundColor: bg }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        onClick={() => onClick(skill)}
        className="glow-border bg-card p-[1px] touch-pan-y cursor-pointer"
        whileTap={{ scale: 0.98 }}
      >
        <div className="bg-card px-2 py-2.5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, hsl(187 92% 53% / 0.02) 0%, transparent 50%)" }} />

          {/* Up / Down order buttons */}
          <div className="flex flex-col flex-shrink-0 relative z-10 mr-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="text-muted-foreground/40 hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed p-0.5"
            >
              <ChevronUp size={12} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="text-muted-foreground/40 hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed p-0.5"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-1 relative z-10">
            <div className="w-1.5 h-1.5 bg-primary rotate-45 flex-shrink-0"
              style={{ boxShadow: "0 0 4px hsl(187 92% 53% / 0.6)" }} />
            <span className="font-rajdhani font-semibold text-sm text-foreground tracking-wider uppercase truncate">
              {skill.name}
            </span>
            {skillStats.length > 0 && (
              <span className="text-primary/50 text-[8px] tracking-wider uppercase flex-shrink-0">
                {skillStats.join(" · ")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10">
            <span className="font-rajdhani font-bold text-primary glow-text text-sm">
              {skill.result.toFixed(6)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Info size={12} />
            </button>
          </div>
        </div>

        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 pb-2 border-t border-primary/10"
          >
            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground text-[9px] tracking-wider uppercase">Valore cumulativo</span>
              <span className="font-rajdhani font-bold text-foreground text-sm">{cumulativeValue}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const SkillPage = ({ skills, onDelete, onSkillClick, onReorder }: SkillPageProps) => {
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  const handleConfirmDelete = () => {
    if (deleteTarget && onDelete) onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  const moveSkill = (index: number, direction: -1 | 1) => {
    const newSkills = [...skills];
    const target = index + direction;
    if (target < 0 || target >= newSkills.length) return;
    [newSkills[index], newSkills[target]] = [newSkills[target], newSkills[index]];
    onReorder?.(newSkills);
  };

  return (
    <div className="h-full w-full flex flex-col items-center pt-12 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(260 60% 55% / 0.06) 0%, transparent 80%)" }} />

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/50" />
        <h1 className="font-rajdhani font-bold text-3xl tracking-[0.3em] uppercase text-primary glow-text">
          Skill
        </h1>
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/50" />
      </div>

      {skills.length === 0 ? (
        <div className="flex-1 flex items-start justify-center" style={{ paddingTop: "calc(50vh - 100px)" }}>
          <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
            Nessuna skill registrata
          </p>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-2 relative z-10">
          {skills.map((skill, i) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              index={i}
              total={skills.length}
              onRequestDelete={setDeleteTarget}
              onMoveUp={() => moveSkill(i, -1)}
              onMoveDown={() => moveSkill(i, 1)}
              onClick={(s) =>
                onSkillClick?.({
                  ...s,
                  base: s.base || "5",
                  rate: s.rate || "1.005",
                  exponent: s.exponent || "0",
                })
              }
            />
          ))}
        </div>
      )}

      <SkillDeleteDialog
        open={deleteTarget !== null}
        skillName={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SkillPage;
