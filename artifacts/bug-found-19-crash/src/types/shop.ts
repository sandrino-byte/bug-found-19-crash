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

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "gold_pack_small",
    name: "Gold Pack",
    description: "Instantly receive 1,000 Gold",
    price: 1,
    currency: "crystals",
    effect: "instant_gold",
    effectValue: 1000,
    category: "currency",
  },
  {
    id: "gold_pack_large",
    name: "Gold Vault",
    description: "Instantly receive 5,000 Gold",
    price: 4,
    currency: "crystals",
    effect: "instant_gold",
    effectValue: 5000,
    category: "currency",
  },
  {
    id: "mission_shield",
    name: "Mission Shield",
    description: "Stored for future use against penalties",
    price: 250,
    currency: "gold",
    effect: "inventory",
    category: "consumable",
  },
  {
    id: "xp_boost",
    name: "XP Booster",
    description: "Stored — for next skill update boost",
    price: 400,
    currency: "gold",
    effect: "inventory",
    category: "boost",
  },
  {
    id: "stat_elixir",
    name: "Stat Elixir",
    description: "Stored — instant +1 to chosen stat",
    price: 3,
    currency: "crystals",
    effect: "inventory",
    category: "consumable",
  },
  {
    id: "lucky_charm",
    name: "Lucky Charm",
    description: "Stored — +50% rewards on next mission",
    price: 750,
    currency: "gold",
    effect: "inventory",
    category: "boost",
  },
];
