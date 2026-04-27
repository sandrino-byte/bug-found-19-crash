export type CurrencyType = "gold" | "crystals";

export type ShopItemEffect = "instant_gold" | "inventory";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: CurrencyType;
  effect: ShopItemEffect;
  effectValue?: number;
  category: "currency" | "boost" | "consumable";
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export const SHOP_ITEMS: ShopItem[] = [];
