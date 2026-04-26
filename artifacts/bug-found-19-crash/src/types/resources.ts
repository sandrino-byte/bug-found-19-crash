export interface Resources {
  gold: number;
  crystals: number;
}

export const DEFAULT_RESOURCES: Resources = { gold: 0, crystals: 0 };

export const formatGold = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return Math.round(n).toLocaleString("en-US");
};

export const formatCrystals = (n: number): string => {
  if (n === 0) return "0";
  if (n >= 100 && n % 1 === 0) return n.toLocaleString("en-US");
  if (n % 1 === 0) return String(n);
  return n.toFixed(1);
};
