import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import SystemInput from "@/components/SystemInput";
import GiorniInput from "@/components/GiorniInput";
import SkillNameDialog from "@/components/SkillNameDialog";
import type { Skill, StatType } from "@/types/skill";
import { ALL_STATS, getSkillStats } from "@/types/skill";

const GIORNI_KEY = "giorni_value";
const BUTTON_SIZE = 56;
const EDGE_MARGIN = 12;
const POPUP_WIDTH = 320;
const POPUP_HEIGHT = 280;
const PAD = 8;

interface CalculatorProps {
  visible: boolean;
  onSkillAdd?: (skill: Skill) => void;
  onSkillUpdate?: (skill: Skill) => void;
  onGiorniChange?: (skillId: string, stats: StatType[], delta: number) => void;
  skills: Skill[];
  loadedSkill?: Skill | null;
  onClearLoaded?: () => void;
}

const snapToEdge = (x: number, y: number): { x: number; y: number } => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const snappedX = (x + BUTTON_SIZE / 2) < vw / 2 ? EDGE_MARGIN : vw - BUTTON_SIZE - EDGE_MARGIN;
  const clampedY = Math.max(EDGE_MARGIN, Math.min(y, vh - BUTTON_SIZE - EDGE_MARGIN));
  return { x: snappedX, y: clampedY };
};

const clampPopup = (left: number, top: number) => ({
  left: Math.max(PAD, Math.min(left, window.innerWidth - POPUP_WIDTH - PAD)),
  top: Math.max(PAD, Math.min(top, window.innerHeight - POPUP_HEIGHT - PAD)),
});

const Calculator = ({
  visible,
  onSkillAdd,
  onSkillUpdate,
  onGiorniChange,
  skills,
  loadedSkill,
  onClearLoaded,
}: CalculatorProps) => {
  const [base, setBase] = useState("5");
  const [rate, setRate] = useState("1.005");
  const [exponent, setExponent] = useState(() => localStorage.getItem(GIORNI_KEY) || "0");
  const [result, setResult] = useState<number | null>(null);
  const [selectedStats, setSelectedStats] = useState<StatType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [btnPos, setBtnPos] = useState(() =>
    snapToEdge(window.innerWidth - BUTTON_SIZE - EDGE_MARGIN, window.innerHeight - BUTTON_SIZE - 24)
  );
  const [popupPos, setPopupPos] = useState({ left: 0, top: 0 });
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);

  const didDrag = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const isDraggingPopup = useRef(false);

  const calcPopupPos = useCallback((bx: number, by: number) => {
    const isLeft = bx < window.innerWidth / 2;
    const left = isLeft ? bx : bx + BUTTON_SIZE - POPUP_WIDTH;
    let top = by - POPUP_HEIGHT - 8;
    if (top < PAD) top = by + BUTTON_SIZE + 8;
    return clampPopup(left, top);
  }, []);

  const openPopup = useCallback(() => {
    setPopupPos(calcPopupPos(btnPos.x, btnPos.y));
    setIsOpen(true);
  }, [btnPos, calcPopupPos]);

  const closePopup = () => {
    setIsOpen(false);
    setEditingSkill(null);
    setSelectedStats([]);
  };

  useEffect(() => {
    if (loadedSkill) {
      setBase(loadedSkill.base);
      setRate(loadedSkill.rate);
      setExponent(loadedSkill.exponent);
      setEditingSkill(loadedSkill);
      setSelectedStats(getSkillStats(loadedSkill));
      setPopupPos(calcPopupPos(btnPos.x, btnPos.y));
      setIsOpen(true);
      onClearLoaded?.();
    }
  }, [loadedSkill, onClearLoaded, btnPos, calcPopupPos]);

  useEffect(() => {
    if (!editingSkill) return;
    const oldStats = getSkillStats(editingSkill);
    const changed =
      base !== editingSkill.base ||
      rate !== editingSkill.rate ||
      exponent !== editingSkill.exponent ||
      JSON.stringify([...selectedStats].sort()) !== JSON.stringify([...oldStats].sort());
    if (!changed) return;

    const b = parseFloat(base.replace(",", "."));
    const r = parseFloat(rate.replace(",", "."));
    const e = parseFloat(exponent.replace(",", "."));
    if (isNaN(b) || isNaN(r) || isNaN(e)) return;

    const newResult = b * Math.pow(r, e);
    const updated: Skill = {
      ...editingSkill,
      result: newResult,
      base,
      rate,
      exponent,
      stats: selectedStats.length > 0 ? selectedStats : undefined,
    };
    onSkillUpdate?.(updated);
    setEditingSkill(updated);
  }, [base, rate, exponent, selectedStats, editingSkill, onSkillUpdate]);

  useEffect(() => {
    localStorage.setItem(GIORNI_KEY, exponent);
  }, [exponent]);

  useEffect(() => {
    const b = parseFloat(base.replace(",", "."));
    const r = parseFloat(rate.replace(",", "."));
    const e = parseFloat(exponent.replace(",", "."));
    if (!isNaN(b) && !isNaN(r) && !isNaN(e)) {
      setResult(b * Math.pow(r, e));
      setAnimKey((k) => k + 1);
    } else {
      setResult(null);
    }
  }, [base, rate, exponent]);

  const handleIncrement = useCallback(() => {
    setExponent((prev) => {
      const next = String((parseFloat(prev.replace(",", ".")) || 0) + 1);
      if (editingSkill) {
        const stats = getSkillStats(editingSkill);
        if (stats.length > 0) {
          onGiorniChange?.(editingSkill.id, stats, +1);
        }
      }
      return next;
    });
  }, [editingSkill, onGiorniChange]);

  const handleDecrement = useCallback(() => {
    setExponent((prev) => {
      const val = parseFloat(prev.replace(",", ".")) || 0;
      if (val <= 0) return prev;
      if (editingSkill) {
        const stats = getSkillStats(editingSkill);
        if (stats.length > 0) {
          onGiorniChange?.(editingSkill.id, stats, -1);
        }
      }
      return String(Math.max(0, val - 1));
    });
  }, [editingSkill, onGiorniChange]);

  const handleAddSkill = (name: string) => {
    if (result !== null && onSkillAdd) {
      onSkillAdd({
        id: crypto.randomUUID(),
        name,
        result,
        base,
        rate,
        exponent,
        stats: selectedStats.length > 0 ? selectedStats : undefined,
      });
    }
    setShowNameDialog(false);
  };

  const handleBtnDragEnd = (_: any, info: PanInfo) => {
    didDrag.current = true;
    const newPos = snapToEdge(btnPos.x + info.offset.x, btnPos.y + info.offset.y);
    setBtnPos(newPos);
  };

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isDraggingPopup.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, left: popupPos.left, top: popupPos.top };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onHeaderPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPopup.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPopupPos(clampPopup(dragStart.current.left + dx, dragStart.current.top + dy));
  };

  const onHeaderPointerUp = () => {
    isDraggingPopup.current = false;
  };

  if (!visible) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="calc-btn"
            initial={false}
            animate={{ x: btnPos.x, y: btnPos.y, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            drag
            dragMomentum={false}
            onDragStart={() => { didDrag.current = false; }}
            onDragEnd={handleBtnDragEnd}
            onTap={() => { if (!didDrag.current) openPopup(); didDrag.current = false; }}
            style={{ position: "fixed", top: 0, left: 0 }}
            className="z-50 cursor-grab active:cursor-grabbing"
          >
            <motion.div
              whileTap={{ scale: 0.92 }}
              className="w-14 h-14 flex items-center justify-center border border-primary/50 bg-card hover:bg-primary/15 hover:border-primary/80 glow-border panel-chamfer transition-colors active:border-primary active:bg-primary/20"
            >
              <span className="font-rajdhani font-bold text-2xl text-primary glow-text">C</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="calc-popup"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.125, ease: "easeOut" }}
            className="fixed z-50"
            style={{ left: popupPos.left, top: popupPos.top, width: POPUP_WIDTH }}
          >
            <div className="panel-chamfer glow-border bg-card p-[1px]">
              <div className="panel-chamfer bg-card relative scanlines">
                <div
                  onPointerDown={onHeaderPointerDown}
                  onPointerMove={onHeaderPointerMove}
                  onPointerUp={onHeaderPointerUp}
                  onPointerCancel={onHeaderPointerUp}
                  className="border-b border-primary/20 px-4 py-1.5 flex items-center gap-2 cursor-grab active:cursor-grabbing touch-none select-none"
                >
                  <div className="w-1.5 h-1.5 bg-primary rotate-45 animate-pulse" />
                  <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase glow-text">
                    System
                  </span>
                  {editingSkill && (
                    <span className="text-primary/50 text-[8px] tracking-wider uppercase">
                      — {editingSkill.name}
                    </span>
                  )}
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                  <button
                    onClick={closePopup}
                    className="text-muted-foreground hover:text-primary transition-colors text-xs tracking-wider"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <SystemInput label="Base" value={base} onChange={setBase} placeholder="5" />
                    <SystemInput label="%" value={rate} onChange={setRate} placeholder="1.005" />
                    <GiorniInput
                      value={exponent}
                      onChange={setExponent}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-primary/70 text-[8px] font-semibold tracking-[0.2em] uppercase">
                      Stat
                    </span>
                    <div className="flex-1 grid grid-cols-6 gap-0.5">
                      {ALL_STATS.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedStats((prev) =>
                            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                          )}
                          className={`font-rajdhani font-bold text-[8px] tracking-wider py-1 border transition-all ${
                            selectedStats.includes(s)
                              ? "text-primary border-primary/50 bg-primary/15"
                              : "text-muted-foreground/50 border-muted-foreground/20 bg-transparent hover:border-muted-foreground/40"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {result !== null && (
                    <div className="border-t border-primary/15 pt-2">
                      <div className="flex items-center gap-2">
                        <motion.div
                          key={animKey}
                          initial={{ opacity: 0.5, x: -2 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex-1 font-rajdhani font-bold text-2xl text-primary glow-text text-center animate-glitch"
                        >
                          {result.toFixed(6)}
                        </motion.div>
                        <button
                          onClick={() => setShowNameDialog(true)}
                          className="flex-shrink-0 w-7 h-7 flex items-center justify-center font-rajdhani font-bold text-lg text-primary border border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary/60 transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-primary/10 px-3 py-1 flex items-center justify-center gap-1.5">
                  <div className="w-1 h-1 bg-primary/30 rotate-45" />
                  <span className="text-primary/20 text-[8px] tracking-[0.3em] uppercase">System</span>
                  <div className="w-1 h-1 bg-primary/30 rotate-45" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SkillNameDialog open={showNameDialog} onClose={() => setShowNameDialog(false)} onSave={handleAddSkill} />
    </>
  );
};

export default Calculator;
