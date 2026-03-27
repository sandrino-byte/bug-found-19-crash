import { motion, AnimatePresence } from "framer-motion";

interface SkillUpdateDialogProps {
  open: boolean;
  skillName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const SkillUpdateDialog = ({ open, skillName, onClose, onConfirm }: SkillUpdateDialogProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ originY: 0.5, originX: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="panel-chamfer glow-border bg-card p-[1px]"
          >
            <div className="panel-chamfer bg-card scanlines relative w-72">
              <div className="border-b border-primary/20 px-3 py-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rotate-45 animate-pulse" />
                <span className="text-primary text-[9px] font-semibold tracking-[0.2em] uppercase glow-text">
                  Update Skill
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
              <div className="p-4 text-center">
                <p className="font-rajdhani text-xs text-muted-foreground tracking-wider uppercase mb-1">
                  Confirm update of
                </p>
                <p className="font-rajdhani font-bold text-sm text-primary glow-text tracking-wider uppercase">
                  {skillName}
                </p>
              </div>
              <div className="border-t border-primary/15 px-3 py-2 flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-muted-foreground/30 text-muted-foreground py-1.5 hover:bg-muted-foreground/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-primary/50 text-primary bg-primary/10 py-1.5 hover:bg-primary/20 hover:border-primary transition-all"
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SkillUpdateDialog;
