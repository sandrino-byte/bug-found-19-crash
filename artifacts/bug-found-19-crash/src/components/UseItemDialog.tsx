import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Coins } from "lucide-react";
import type { ShopItem } from "@/types/shop";
import CrystalIcon from "@/components/CrystalIcon";

interface UseItemDialogProps {
  open: boolean;
  item: ShopItem | null;
  maxQuantity: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

const UseItemDialog = ({ open, item, maxQuantity, onClose, onConfirm }: UseItemDialogProps) => {
  const [step, setStep] = useState<"amount" | "confirm">("amount");
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    if (open) {
      setAmount(1);
      // If only one available, skip the quantity picker entirely.
      setStep(maxQuantity > 1 ? "amount" : "confirm");
    }
  }, [open, maxQuantity]);

  if (!item) return null;

  const accent = item.currency === "gold" ? "hsl(45 93% 58%)" : "hsl(187 92% 53%)";

  const inc = () => setAmount((a) => Math.min(maxQuantity, a + 1));
  const dec = () => setAmount((a) => Math.max(1, a - 1));

  const handleNext = () => {
    if (amount < 1) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (amount < 1 || amount > maxQuantity) return;
    onConfirm(amount);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ originY: 0.5, originX: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="panel-chamfer bg-card p-[1px]"
          >
            <div
              className="panel-chamfer bg-card scanlines relative w-72"
              style={{ boxShadow: `0 0 24px ${accent}30` }}
            >
              {/* Header */}
              <div className="border-b border-primary/20 px-3 py-1.5 flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rotate-45 animate-pulse"
                  style={{ background: accent }}
                />
                <span
                  className="text-[9px] font-semibold tracking-[0.2em] uppercase glow-text"
                  style={{ color: accent }}
                >
                  {step === "amount" ? "Use Item" : "Confirm Use"}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              </div>

              {step === "amount" ? (
                <>
                  {/* Item name */}
                  <div className="px-4 pt-3 text-center">
                    <p className="font-rajdhani font-bold text-sm tracking-wider uppercase text-foreground">
                      {item.name}
                    </p>
                    <p className="font-rajdhani text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
                      Available: ×{maxQuantity}
                    </p>
                  </div>

                  {/* Quantity stepper */}
                  <div className="px-4 pt-3 pb-3">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1 text-center">
                      How many?
                    </p>
                    <div className="flex items-center justify-center gap-2 py-1">
                      <button
                        onClick={dec}
                        disabled={amount <= 1}
                        className="w-7 h-7 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all disabled:opacity-30"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={String(amount)}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^\d]/g, "");
                          const n = parseInt(cleaned || "0", 10);
                          if (isNaN(n)) {
                            setAmount(0);
                          } else {
                            setAmount(Math.min(maxQuantity, Math.max(0, n)));
                          }
                        }}
                        onBlur={() => {
                          if (amount < 1) setAmount(1);
                        }}
                        className="w-20 text-center font-rajdhani font-bold text-base tabular-nums bg-transparent border border-border py-1 focus:outline-none focus:border-primary/60"
                        style={{ color: accent }}
                      />
                      <button
                        onClick={inc}
                        disabled={amount >= maxQuantity}
                        className="w-7 h-7 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all disabled:opacity-30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="border-t border-primary/15 px-3 py-2 flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-muted-foreground/30 text-muted-foreground py-1.5 hover:bg-muted-foreground/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={amount < 1}
                      className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border py-1.5 transition-all disabled:opacity-40"
                      style={{
                        borderColor: accent + "80",
                        color: accent,
                        background: accent + "1A",
                        boxShadow: `0 0 10px ${accent}40`,
                      }}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirm step */}
                  <div className="p-4 text-center">
                    <p className="font-rajdhani text-xs text-muted-foreground tracking-wider uppercase mb-1">
                      Are you sure you want to use
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      {item.currency === "gold" ? (
                        <Coins size={12} style={{ color: accent }} />
                      ) : (
                        <CrystalIcon size={12} color={accent} glow={false} />
                      )}
                      <p
                        className="font-rajdhani font-bold text-sm glow-text tracking-wider uppercase"
                        style={{ color: accent }}
                      >
                        {item.name} × {amount}
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="border-t border-primary/15 px-3 py-2 flex items-center gap-2">
                    <button
                      onClick={maxQuantity > 1 ? () => setStep("amount") : onClose}
                      className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border border-muted-foreground/30 text-muted-foreground py-1.5 hover:bg-muted-foreground/10 transition-all"
                    >
                      {maxQuantity > 1 ? "Back" : "Cancel"}
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border py-1.5 transition-all"
                      style={{
                        borderColor: accent + "80",
                        color: accent,
                        background: accent + "1A",
                        boxShadow: `0 0 10px ${accent}40`,
                      }}
                    >
                      Use
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default UseItemDialog;
