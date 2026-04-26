interface CrystalIconProps {
  size?: number;
  color?: string;
  glow?: boolean;
  className?: string;
}

/**
 * Single elongated raw crystal shard with multi-facet body.
 * Designed for "mine vibes" — pointed top, faceted sides, light highlight.
 */
const CrystalIcon = ({ size = 14, color = "hsl(187 92% 53%)", glow = true, className }: CrystalIconProps) => {
  const id = `cgrad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  const lighter = color.replace(/(\d+)%\)$/, (_, l) => `${Math.min(100, parseInt(l) + 25)}%)`);
  const darker  = color.replace(/(\d+)%\)$/, (_, l) => `${Math.max(15, parseInt(l) - 25)}%)`);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={glow ? { filter: `drop-shadow(0 0 ${size * 0.25}px ${color})` } : undefined}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lighter} stopOpacity="0.85" />
          <stop offset="55%"  stopColor={color}   stopOpacity="0.55" />
          <stop offset="100%" stopColor={darker}  stopOpacity="0.30" />
        </linearGradient>
      </defs>

      {/* Front face — elongated pointed crystal */}
      <path
        d="M11 2 L16 8 L15 18 L11 22 L7 18 L7 8 Z"
        fill={`url(#${id})`}
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Right side facet — gives 3D depth */}
      <path
        d="M11 2 L16 8 L18 7.5 L13 1.6 Z"
        fill={darker}
        fillOpacity="0.45"
        stroke={color}
        strokeWidth="0.7"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      <path
        d="M16 8 L15 18 L17 17 L18 7.5 Z"
        fill={darker}
        fillOpacity="0.40"
        stroke={color}
        strokeWidth="0.7"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      <path
        d="M15 18 L11 22 L13 22.4 L17 17 Z"
        fill={darker}
        fillOpacity="0.55"
        stroke={color}
        strokeWidth="0.7"
        strokeLinejoin="round"
        strokeOpacity="0.7"
      />

      {/* Internal facet line */}
      <path d="M7 8 L16 8" stroke={lighter} strokeWidth="0.55" strokeOpacity="0.65" />

      {/* Bright reflection highlight */}
      <path
        d="M9 9.5 L9 16"
        stroke={lighter}
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
    </svg>
  );
};

export default CrystalIcon;
