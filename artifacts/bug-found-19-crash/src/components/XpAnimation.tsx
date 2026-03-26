import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StatType } from "@/types/skill";

interface XpEvent {
  id: string;
  stat: StatType;
  delta: number;
}

interface XpAnimationProps {
  events: XpEvent[];
}

const XpAnimation = ({ events }: XpAnimationProps) => {
  const [visible, setVisible] = useState<XpEvent[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[events.length - 1];
      setVisible((prev) => [...prev, latest]);
      setTimeout(() => {
        setVisible((prev) => prev.filter((e) => e.id !== latest.id));
      }, 1500);
    }
  }, [events]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none flex flex-col items-center gap-1">
      <AnimatePresence>
        {visible.map((ev) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.6 }}
            transition={{ duration: 0.4 }}
            className="font-rajdhani font-bold text-lg tracking-wider"
            style={{
              color: ev.delta > 0 ? "#00FFD1" : "#FF3838",
              textShadow: ev.delta > 0
                ? "0 0 12px rgba(0,255,209,0.8), 0 0 30px rgba(0,255,209,0.4)"
                : "0 0 12px rgba(255,56,56,0.8), 0 0 30px rgba(255,56,56,0.4)",
            }}
          >
            {ev.stat} {ev.delta > 0 ? "+" : ""}{(ev.delta * 0.1).toFixed(1)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export type { XpEvent };
export default XpAnimation;
