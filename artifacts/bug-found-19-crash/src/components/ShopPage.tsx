import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ShoppingBag, Check, Package, Plus, Trash2 } from "lucide-react";
import type { Resources } from "@/types/resources";
import type { ShopItem, InventoryEntry } from "@/types/shop";
import { SHOP_ITEMS } from "@/types/shop";
import { formatGold, formatCrystals } from "@/types/resources";
import CrystalIcon from "@/components/CrystalIcon";
import AddShopItemDialog from "@/components/AddShopItemDialog";

const INVENTORY_KEY = "inventory_data";
const CUSTOM_SHOP_KEY = "custom_shop_items";

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
  const [recentlyPurchased, setRecentlyPurchased] = useState<string | null>(null);
  const [tab, setTab] = useState<"shop" | "inventory">("shop");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_SHOP_KEY, JSON.stringify(customItems));
  }, [customItems]);

  const allItems = useMemo<ShopItem[]>(() => [...SHOP_ITEMS, ...customItems], [customItems]);

  const handleAddCustom = (data: Omit<ShopItem, "id">) => {
    const item: ShopItem = { ...data, id: `custom_${crypto.randomUUID()}` };
    setCustomItems((prev) => [...prev, item]);
    setShowAddDialog(false);
  };

  const handleDeleteCustom = (id: string) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleBuy = (item: ShopItem) => {
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
    setRecentlyPurchased(item.id);
    setTimeout(() => setRecentlyPurchased(null), 800);
  };

  const canAfford = (item: ShopItem): boolean => {
    const balance = item.currency === "gold" ? resources.gold : resources.crystals;
    return balance >= item.price;
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
                      disabled={!affordable}
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
                inventoryItems.map(({ entry, item }) => {
                  const currencyColor = item.currency === "gold" ? "hsl(45 93% 58%)" : "hsl(187 92% 53%)";
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
                        <p className="text-[10px] text-muted-foreground/70 truncate">{item.description}</p>
                      </div>
                      <div
                        className="flex-shrink-0 font-rajdhani font-bold text-xs tabular-nums px-2 py-0.5 border"
                        style={{ borderColor: currencyColor + "60", color: currencyColor, background: currencyColor + "12" }}
                      >
                        ×{entry.quantity}
                      </div>
                    </div>
                  );
                })
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
    </div>
  );
};

export default ShopPage;
