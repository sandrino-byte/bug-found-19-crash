export interface Resources {
  gold: number;
  crystals: number;
}

export const DEFAULT_RESOURCES: Resources = { gold: 0, crystals: 0 };

export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString("en-US");
};
