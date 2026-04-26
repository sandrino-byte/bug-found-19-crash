import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import type { Resources } from "@/types/resources";
import { formatNumber } from "@/types/resources";

const ResourceCounter = ({
  value,
  label,
  color,
  icon,
}: {
  value: number;
  label: string;
  color: string;
  icon: React.ReactNode;
}) => {
  const prevRef = useRef(value);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    const diff = value - prevRef.current;
    if (diff !== 0) {
      setDelta(diff);
      const id = setTimeout(() => setDelta(null), 1100);
      prevRef.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);

  return (
    <div className="flex items-center gap-1 relative">
      {icon}
      <motion.span
        key={value}
        initial={{ scale: 1.18 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.18 }}
        className="font-rajdhani font-bold text-xs tracking-wider"
        style={{ color }}
        aria-label={label}
      >
        {formatNumber(value)}
      </motion.span>

      {/* Delta popup */}
      <AnimatePresence>
        {delta !== null && (
          <motion.span
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -14 }}
            exit={{ opacity: 0, y: -22 }}
            transition={{ duration: 0.9 }}
            className="absolute -top-1 right-0 font-rajdhani font-bold text-[10px] pointer-events-none"
            style={{ color: delta > 0 ? color : "hsl(0 84% 60%)" }}
          >
            {delta > 0 ? "+" : ""}{formatNumber(delta)}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

const GoldIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(45 93% 58%)" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 3px hsl(45 93% 58% / 0.6))" }}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9 9h4.5a2 2 0 0 1 0 4H9M9 13h5a2 2 0 0 1 0 4H9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrystalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="hsl(187 92% 53% / 0.25)" stroke="hsl(187 92% 53%)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 3px hsl(187 92% 53% / 0.7))" }}>
    <path d="M12 2 L20 9 L12 22 L4 9 Z" strokeLinejoin="round" />
    <path d="M4 9 H20 M12 2 V22" strokeLinejoin="round" />
  </svg>
);

const ResourcesDisplay = ({ resources }: { resources: Resources }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="fixed top-12 right-6 z-50 flex items-center gap-3 select-none"
    >
      <ResourceCounter value={resources.gold}     label="Gold"     color="hsl(45 93% 58%)"  icon={<GoldIcon />} />
      <div className="w-px h-3 bg-primary/20" />
      <ResourceCounter value={resources.crystals} label="Crystals" color="hsl(187 92% 53%)" icon={<CrystalIcon />} />
    </motion.div>
  );
};

export default ResourcesDisplay;
