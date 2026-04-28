import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Coins, ShoppingBag, Check, Package, Plus, Trash2 } from "lucide-react";
import type { Resources } from "@/types/resources";
import type { ShopItem, InventoryEntry, PurchaseRecord } from "@/types/shop";
import { SHOP_ITEMS, remainingPurchases } from "@/types/shop";
import { formatGold, formatCrystals } from "@/types/resources";
import CrystalIcon from "@/components/CrystalIcon";
import AddShopItemDialog from "@/components/AddShopItemDialog";
import UseItemDialog from "@/components/UseItemDialog";

const SWIPE_THRESHOLD = 100;

interface InventoryItemRowProps {
  item: ShopItem;
  quantity: number;
  onRequestUse: (item: ShopItem, max: number) => void;
}

const InventoryItemRow = ({ item, quantity, onRequestUse }: InventoryItemRowProps) => {
  const currencyColor = item.currency === "gold" ? "hsl(45 93% 58%)" : "hsl(187 92% 53%)";
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, -80, 0, 80, 150], [0.3, 0.7, 1, 0.7, 0.3]);
  const bg = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    [`${currencyColor.replace(")", " / 0.18)")}`, `${currencyColor.replace(")", " / 0)")}`, `${currencyColor.replace(")", " / 0.18)")}`]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      onRequestUse(item, quantity);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ layout: { type: "spring", stiffness: 300, damping: 28 } }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        className="bg-card border border-primary/20 px-3 py-2.5 flex items-center gap-3 relative overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
        style={{
          x,
          opacity,
          backgroundColor: bg,
          clipPath:
            "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none"
          style={{ background: currencyColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-rajdhani font-bold text-sm tracking-wider uppercase text-foreground truncate">
            {item.name}
          </p>
          <p className="text-[10px] text-muted-foreground/70 truncate">
            {item.description || "Swipe to use"}
          </p>
        </div>
        <div
          className="flex-shrink-0 font-rajdhani font-bold text-xs tabular-nums px-2 py-0.5 border"
          style={{
            borderColor: currencyColor + "60",
            color: currencyColor,
            background: currencyColor + "12",
          }}
        >
          ×{quantity}
        </div>
      </motion.div>
    </motion.div>
  );
};

const INVENTORY_KEY = "inventory_data";
const CUSTOM_SHOP_KEY = "custom_shop_items";
const PURCHASE_HISTORY_KEY = "shop_purchase_history";

interface ShopPageProps {
  resources: Resources;
  onPurchase: (item: ShopItem) => boolean;
}

const ShopPage = ({ resources, onPurchase }: ShopPageProps) => {
  const [inventory, setInventory] = useState<InventoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [customItems, setCustomItems] = useState<ShopItem[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_SHOP_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(PURCHASE_HISTORY_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const [recentlyPurchased, setRecentlyPurchased] = useState<string | null>(null);
  const [tab, setTab] = useState<"shop" | "inventory">("shop");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [useTarget, setUseTarget] = useState<{ item: ShopItem; max: number } | null>(null);
  const [, setNowTick] = useState(0);

  // Re-render once a minute so per-period limit counters refresh after midnight, etc.
  useEffect(() => {
    const id = setInterval(() => setNowTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_SHOP_KEY, JSON.stringify(customItems));
  }, [customItems]);

  useEffect(() => {
    localStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  const allItems = useMemo<ShopItem[]>(() => [...SHOP_ITEMS, ...customItems], [customItems]);

  const handleAddCustom = (data: Omit<ShopItem, "id">) => {
    const item: ShopItem = { ...data, id: `custom_${crypto.randomUUID()}` };
    setCustomItems((prev) => [...prev, item]);
    setShowAddDialog(false);
  };

  const handleDeleteCustom = (id: string) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
    setPurchaseHistory((prev) => prev.filter((r) => r.itemId !== id));
  };

  const handleBuy = (item: ShopItem) => {
    const remaining = remainingPurchases(item, purchaseHistory);
    if (remaining !== null && remaining <= 0) return;
    const ok = onPurchase(item);
    if (!ok) return;
    if (item.effect === "inventory") {
      setInventory((prev) => {
        const existing = prev.find((e) => e.itemId === item.id);
        if (existing) {
          return prev.map((e) => e.itemId === item.id ? { ...e, quantity: e.quantity + 1 } : e);
        }
        return [...prev, { itemId: item.id, quantity: 1 }];
      });
    }
    setPurchaseHistory((prev) => [...prev, { itemId: item.id, timestamp: new Date().toISOString() }]);
    setRecentlyPurchased(item.id);
    setTimeout(() => setRecentlyPurchased(null), 800);
  };

  const canAfford = (item: ShopItem): boolean => {
    const balance = item.currency === "gold" ? resources.gold : resources.crystals;
    return balance >= item.price;
  };

  const handleConfirmUse = (amount: number) => {
    if (!useTarget) return;
    const { item, max } = useTarget;
    const safeAmount = Math.min(Math.max(1, amount), max);
    setInventory((prev) =>
      prev
        .map((e) =>
          e.itemId === item.id ? { ...e, quantity: e.quantity - safeAmount } : e
        )
        .filter((e) => e.quantity > 0)
    );
    setUseTarget(null);
  };

  const limitLabel = (item: ShopItem): string | null => {
    const remaining = remainingPurchases(item, purchaseHistory);
    if (remaining === null) return null;
    const total = item.limit?.count ?? 0;
    const period = item.limit?.scope === "daily" ? "today"
      : item.limit?.scope === "weekly" ? "this week"
      : "this month";
    return `${remaining}/${total} ${period}`;
  };

  const inventoryItems = inventory
    .map((entry) => ({ entry, item: allItems.find((i) => i.id === entry.itemId) }))
    .filter((x) => x.item) as { entry: InventoryEntry; item: ShopItem }[];

  return (
    <div className="h-full w-full flex flex-col items-center pt-12 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(45 93% 58% / 0.10) 0%, transparent 80%)" }}
      />

      {/* Title */}
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/50" />
        <h1 className="font-rajdhani font-bold text-3xl tracking-[0.3em] uppercase glow-text" style={{ color: "hsl(45 93% 58%)" }}>
          Shop
        </h1>
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/50" />
      </div>

      {/* Tabs */}
      <div className="w-full max-w-sm flex mb-4 relative z-10 border border-border">
        <button
          onClick={() => setTab("shop")}
          className="flex-1 py-1.5 font-rajdhani font-bold text-[10px] tracking-[0.15em] uppercase transition-all relative flex items-center justify-center gap-1.5"
          style={{
            color: tab === "shop" ? "hsl(45 93% 58%)" : "hsl(220 15% 42%)",
            background: tab === "shop" ? "hsl(45 93% 58% / 0.10)" : "transparent",
          }}
        >
          <ShoppingBag size={11} />
          Store
          {tab === "shop" && <motion.div layoutId="shop-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "hsl(45 93% 58%)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
        </button>
        <button
          onClick={() => setTab("inventory")}
          className="flex-1 py-1.5 font-rajdhani font-bold text-[10px] tracking-[0.15em] uppercase transition-all relative flex items-center justify-center gap-1.5"
          style={{
            color: tab === "inventory" ? "hsl(45 93% 58%)" : "hsl(220 15% 42%)",
            background: tab === "inventory" ? "hsl(45 93% 58% / 0.10)" : "transparent",
          }}
        >
          <Package size={11} />
          Inventory
          {tab === "inventory" && <motion.div layoutId="shop-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "hsl(45 93% 58%)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
        </button>
      </div>

      <div className="w-full max-w-sm flex-1 overflow-y-auto relative z-10 pb-8 space-y-2">
        <AnimatePresence mode="wait">
          {tab === "shop" ? (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {allItems.length === 0 && (
                <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase text-center pt-16">
                  Store is empty — tap + to add an item
                </p>
              )}
              {allItems.map((item) => {
                const affordable = canAfford(item);
                const isPurchasedNow = recentlyPurchased === item.id;
                const currencyColor = item.currency === "gold" ? "hsl(45 93% 58%)" : "hsl(187 92% 53%)";
                const isGold = item.currency === "gold";
                const isCustom = item.id.startsWith("custom_");
                const limitText = limitLabel(item);
                const remaining = remainingPurchases(item, purchaseHistory);
                const limitReached = remaining !== null && remaining <= 0;

                return (
                  <div
                    key={item.id}
                    className="bg-card border border-primary/20 px-3 py-2.5 flex items-center gap-3 relative overflow-hidden"
                    style={{ clipPath: "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)" }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none" style={{ background: currencyColor }} />

                    <div className="flex-1 min-w-0">
                      <p className="font-rajdhani font-bold text-sm tracking-wider uppercase text-foreground truncate">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-[10px] text-muted-foreground/70 truncate">
                          {item.description}
                        </p>
                      )}
                      {limitText && (
                        <p
                          className="text-[9px] tracking-[0.15em] uppercase font-rajdhani font-semibold mt-0.5"
                          style={{ color: limitReached ? "hsl(0 75% 60%)" : "hsl(45 93% 58%)" }}
                        >
                          {limitReached ? `Sold out ${limitText.split(" ").slice(1).join(" ")}` : `${limitText} left`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isGold
                        ? <Coins size={11} style={{ color: currencyColor }} />
                        : <CrystalIcon size={12} color={currencyColor} glow={false} />
                      }
                      <span className="font-rajdhani font-bold text-xs tabular-nums" style={{ color: currencyColor }}>
                        {isGold ? formatGold(item.price) : formatCrystals(item.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!affordable || limitReached}
                      className="flex-shrink-0 font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border py-1 px-2.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        borderColor: currencyColor + "80",
                        color: currencyColor,
                        background: isPurchasedNow ? currencyColor + "30" : currencyColor + "12",
                      }}
                    >
                      {isPurchasedNow ? <Check size={11} /> : "Buy"}
                    </button>

                    {isCustom && (
                      <button
                        onClick={() => handleDeleteCustom(item.id)}
                        className="flex-shrink-0 text-muted-foreground/30 hover:text-destructive/70 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="inv"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {inventoryItems.length === 0 ? (
                <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase text-center pt-16">
                  Inventory is empty
                </p>
              ) : (
                <>
                  <p className="text-muted-foreground/50 text-[9px] tracking-[0.2em] uppercase text-center pb-1">
                    Swipe an item to use it
                  </p>
                  {inventoryItems.map(({ entry, item }) => (
                    <InventoryItemRow
                      key={item.id}
                      item={item}
                      quantity={entry.quantity}
                      onRequestUse={(it, max) => setUseTarget({ item: it, max })}
                    />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add custom item button — only on Store tab */}
      {tab === "shop" && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowAddDialog(true)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-2.5 font-rajdhani font-bold text-xs tracking-[0.2em] uppercase border panel-chamfer transition-all"
          style={{
            color: "hsl(45 93% 58%)",
            borderColor: "hsl(45 93% 58% / 0.6)",
            background: "hsl(45 93% 58% / 0.15)",
            boxShadow: "0 0 12px hsl(45 93% 58% / 0.3)",
          }}
        >
          <Plus size={14} />
          New item
        </motion.button>
      )}

      <AddShopItemDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddCustom}
      />

      <UseItemDialog
        open={useTarget !== null}
        item={useTarget?.item ?? null}
        maxQuantity={useTarget?.max ?? 1}
        onClose={() => setUseTarget(null)}
        onConfirm={handleConfirmUse}
      />
    </div>
  );
};

export default ShopPage;
