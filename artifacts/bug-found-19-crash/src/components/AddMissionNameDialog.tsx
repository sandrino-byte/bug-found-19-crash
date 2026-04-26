import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { MissionType } from "@/types/mission";

interface AddMissionNameDialogProps {
  open: boolean;
  type: MissionType;
  color: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const AddMissionNameDialog = ({ open, type, color, onClose, onSubmit }: AddMissionNameDialogProps) => {
  const [name, setName] = useState("");

  useEffect(() => { if (open) setName(""); }, [open]);

  const handleSubmit = () => {
    if (name.trim()) onSubmit(name.trim());
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
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.14 }}
            onClick={(e) => e.stopPropagation()}
            className="w-72 panel-chamfer bg-card p-[1px]"
            style={{ boxShadow: `0 0 20px ${color}33` }}
          >
            <div className="panel-chamfer bg-card p-4 space-y-3">
              <p className="font-rajdhani font-semibold text-xs tracking-[0.2em] uppercase text-center" style={{ color }}>
                New {type} mission
              </p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onClose(); }}
                className="w-full input-system font-rajdhani text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-1"
                placeholder="Mission name..."
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-muted-foreground/30 text-muted-foreground py-1.5 hover:bg-muted-foreground/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border py-1.5 transition-all disabled:opacity-40"
                  style={{ borderColor: color + "80", color, background: color + "1A" }}
                >
                  Next
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

export default AddMissionNameDialog;
