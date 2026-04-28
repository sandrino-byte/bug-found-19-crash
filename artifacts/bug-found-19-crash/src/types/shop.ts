export type CurrencyType = "gold" | "crystals";

export type ShopItemEffect = "instant_gold" | "inventory";

export type LimitScope = "unlimited" | "daily" | "weekly" | "monthly";

export interface PurchaseLimit {
  scope: LimitScope;
  count: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: CurrencyType;
  effect: ShopItemEffect;
  effectValue?: number;
  category: "currency" | "boost" | "consumable";
  limit?: PurchaseLimit;
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export interface PurchaseRecord {
  itemId: string;
  timestamp: string;
}

export const SHOP_ITEMS: ShopItem[] = [];

const DEFAULT_LIMIT: PurchaseLimit = { scope: "unlimited", count: 0 };

/** Returns the period key for a given limit scope. Mirrors the mission period logic. */
const getLimitPeriodKey = (scope: LimitScope, date: Date): string => {
  if (scope === "daily") return `D-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (scope === "weekly") {
    const d = new Date(date);
    const day = d.getDay();
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + daysUntilSunday);
    return `W-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
  if (scope === "monthly") return `M-${date.getFullYear()}-${date.getMonth()}`;
  return "unlimited";
};

/** Number of times this item has been purchased in the current period. */
export const purchasesInCurrentPeriod = (
  itemId: string,
  scope: LimitScope,
  history: PurchaseRecord[]
): number => {
  if (scope === "unlimited") return 0;
  const nowKey = getLimitPeriodKey(scope, new Date());
  return history.filter(
    (r) => r.itemId === itemId && getLimitPeriodKey(scope, new Date(r.timestamp)) === nowKey
  ).length;
};

/** Returns remaining purchases for this period, or null if unlimited. */
export const remainingPurchases = (
  item: ShopItem,
  history: PurchaseRecord[]
): number | null => {
  const limit = item.limit ?? DEFAULT_LIMIT;
  if (limit.scope === "unlimited") return null;
  const used = purchasesInCurrentPeriod(item.id, limit.scope, history);
  return Math.max(0, limit.count - used);
};

