import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Plus, Minus, Infinity as InfinityIcon } from "lucide-react";
import type { ShopItem, LimitScope } from "@/types/shop";
import CrystalIcon from "@/components/CrystalIcon";

interface AddShopItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ShopItem, "id">) => void;
}

const SCOPES: { key: LimitScope; label: string }[] = [
  { key: "unlimited", label: "∞" },
  { key: "daily",     label: "Day" },
  { key: "weekly",    label: "Week" },
  { key: "monthly",   label: "Month" },
];

const ACCENT = "hsl(45 93% 58%)";
const GOLD = "hsl(45 93% 58%)";
const CYAN = "hsl(187 92% 53%)";

const AddShopItemDialog = ({ open, onClose, onSubmit }: AddShopItemDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(100);
  const [currency, setCurrency] = useState<"gold" | "crystals">("gold");
  const [scope, setScope] = useState<LimitScope>("unlimited");
  const [limitCount, setLimitCount] = useState(1);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setPrice(100);
      setCurrency("gold");
      setScope("unlimited");
      setLimitCount(1);
    }
  }, [open]);

  const canSubmit = name.trim().length > 0 && price > 0 && (scope === "unlimited" || limitCount > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      price,
      currency,
      effect: "inventory",
      category: "consumable",
      limit: scope === "unlimited"
        ? { scope: "unlimited", count: 0 }
        : { scope, count: limitCount },
    });
  };

  const incPrice = () => setPrice((p) => p + 1);
  const decPrice = () => setPrice((p) => Math.max(1, p - 1));
  const incLimit = () => setLimitCount((p) => p + 1);
  const decLimit = () => setLimitCount((p) => Math.max(1, p - 1));
  const currencyColor = currency === "gold" ? GOLD : CYAN;

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
            className="w-80 panel-chamfer bg-card p-[1px]"
            style={{ boxShadow: `0 0 24px ${ACCENT}30` }}
          >
            <div className="panel-chamfer bg-card scanlines">
              {/* Header */}
              <div className="border-b border-primary/20 px-3 py-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rotate-45 animate-pulse" style={{ background: ACCENT }} />
                <span
                  className="text-[9px] font-semibold tracking-[0.2em] uppercase glow-text"
                  style={{ color: ACCENT }}
                >
                  Register Item
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
              </div>

              {/* Name */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Item Name
                </p>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
                  placeholder="e.g. Energy Drink"
                  className="w-full input-system font-rajdhani text-sm text-foreground placeholder:text-muted-foreground/40 px-0 py-1"
                />
              </div>

              {/* Description */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Description
                </p>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does it do?"
                  className="w-full input-system font-rajdhani text-xs text-foreground placeholder:text-muted-foreground/40 px-0 py-1"
                />
              </div>

              {/* Currency picker */}
              <div className="px-4 pt-3">
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Currency
                </p>
                <div className="flex border border-border">
                  <button
                    onClick={() => setCurrency("gold")}
                    className="flex-1 py-1.5 font-rajdhani font-bold text-[10px] tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-1.5"
                    style={{
                      color: currency === "gold" ? GOLD : "hsl(220 15% 42%)",
                      background: currency === "gold" ? GOLD + "18" : "transparent",
                    }}
                  >
                    <Coins size={11} /> Gold
                  </button>
                  <button
                    onClick={() => setCurrency("crystals")}
                    className="flex-1 py-1.5 font-rajdhani font-bold text-[10px] tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-1.5"
                    style={{
                      color: currency === "crystals" ? CYAN : "hsl(220 15% 42%)",
                      background: currency === "crystals" ? CYAN + "18" : "transparent",
                    }}
                  >
                    <CrystalIcon size={11} color={currency === "crystals" ? CYAN : "hsl(220 15% 42%)"} glow={false} /> Crystals
                  </button>
                </div>
              </div>

              {/* Price stepper */}
              <div className="px-4 pt-3">
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Price
                </p>
                <div className="flex items-center justify-between gap-2 py-1">
                  <div className="flex items-center gap-2">
                    {currency === "gold"
                      ? <Coins size={13} style={{ color: currencyColor }} />
                      : <CrystalIcon size={13} color={currencyColor} glow={false} />
                    }
                    <span className="font-rajdhani text-[11px] tracking-[0.15em] uppercase" style={{ color: currencyColor }}>
                      {currency === "gold" ? "Gold cost" : "Crystal cost"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={decPrice}
                      className="w-6 h-6 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all"
                    >
                      <Minus size={11} />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={String(price)}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^\d]/g, "");
                        const n = parseInt(cleaned || "0", 10);
                        setPrice(isNaN(n) ? 0 : n);
                      }}
                      onBlur={() => { if (price < 1) setPrice(1); }}
                      className="w-16 text-center font-rajdhani font-bold text-sm tabular-nums bg-transparent border border-border py-0.5 focus:outline-none focus:border-primary/60"
                      style={{ color: currencyColor }}
                    />
                    <button
                      onClick={incPrice}
                      className="w-6 h-6 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Purchase limit */}
              <div className="px-4 pt-3 pb-3">
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Purchase Limit
                </p>
                <div className="flex border border-border">
                  {SCOPES.map((s) => {
                    const active = scope === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setScope(s.key)}
                        className="flex-1 py-1.5 font-rajdhani font-bold text-[10px] tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-1"
                        style={{
                          color: active ? ACCENT : "hsl(220 15% 42%)",
                          background: active ? ACCENT + "18" : "transparent",
                        }}
                      >
                        {s.key === "unlimited" && <InfinityIcon size={12} />}
                        {s.key !== "unlimited" && s.label}
                        {s.key === "unlimited" && <span className="sr-only">Unlimited</span>}
                      </button>
                    );
                  })}
                </div>

                {scope !== "unlimited" && (
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <span className="font-rajdhani text-[11px] tracking-[0.15em] uppercase" style={{ color: ACCENT }}>
                      Times per {scope === "daily" ? "day" : scope === "weekly" ? "week" : "month"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={decLimit}
                        className="w-6 h-6 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all"
                      >
                        <Minus size={11} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={String(limitCount)}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^\d]/g, "");
                          const n = parseInt(cleaned || "0", 10);
                          setLimitCount(isNaN(n) ? 0 : n);
                        }}
                        onBlur={() => { if (limitCount < 1) setLimitCount(1); }}
                        className="w-14 text-center font-rajdhani font-bold text-sm tabular-nums bg-transparent border border-border py-0.5 focus:outline-none focus:border-primary/60"
                        style={{ color: ACCENT }}
                      />
                      <button
                        onClick={incLimit}
                        className="w-6 h-6 flex items-center justify-center border border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-all"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                )}
                {scope === "unlimited" && (
                  <p className="text-[9px] tracking-wider text-muted-foreground/60 italic mt-1">
                    Can be purchased any number of times.
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
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-1 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border py-2 transition-all disabled:opacity-40"
                  style={{
                    borderColor: ACCENT + "80",
                    color: ACCENT,
                    background: ACCENT + "1A",
                    boxShadow: `0 0 10px ${ACCENT}40`,
                  }}
                >
                  Add to Store
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

export default AddShopItemDialog;
