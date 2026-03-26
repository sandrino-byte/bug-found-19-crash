import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SkillNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const SkillNameDialog = ({ open, onClose, onSave }: SkillNameDialogProps) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
    }
  };

  const handleCancel = () => {
    setName("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.125 }}
            onClick={(e) => e.stopPropagation()}
            className="w-72 panel-chamfer glow-border bg-card p-[1px]"
          >
            <div className="panel-chamfer bg-card p-4 space-y-3">
              <p className="font-rajdhani font-semibold text-xs tracking-[0.2em] uppercase text-primary glow-text text-center">
                Inserire nome skill
              </p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                className="w-full input-system font-rajdhani text-sm text-foreground placeholder:text-muted-foreground/50 px-0 py-1"
                placeholder="Nome..."
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancel}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-muted-foreground/30 text-muted-foreground py-1.5 hover:bg-muted-foreground/10 transition-all"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-primary/50 text-primary bg-primary/10 py-1.5 hover:bg-primary/20 hover:border-primary transition-all disabled:opacity-40"
                >
                  Salva
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SkillNameDialog;
