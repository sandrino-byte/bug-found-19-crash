import React from "react";

interface GiorniInputProps {
  value: string;
  onChange: (value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

const GiorniInput: React.FC<GiorniInputProps> = ({ value, onChange, onIncrement, onDecrement }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-primary/70 text-[8px] font-semibold tracking-[0.2em] uppercase text-center">
        Days
      </label>
      <div className="flex items-center gap-1">
        <button
          onClick={onDecrement}
          className="flex-shrink-0 font-rajdhani font-bold text-xs text-primary border border-primary/30 bg-primary/5 px-1.5 py-1 hover:bg-primary/15 hover:border-primary/60 transition-all glow-text"
        >
          -1
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="1"
          className="input-system font-rajdhani text-lg font-semibold text-foreground bg-transparent w-full px-1 py-1 placeholder:text-muted-foreground/30 focus:text-primary transition-colors text-center min-w-0"
        />
        <button
          onClick={onIncrement}
          className="flex-shrink-0 font-rajdhani font-bold text-xs text-primary border border-primary/30 bg-primary/5 px-1.5 py-1 hover:bg-primary/15 hover:border-primary/60 transition-all glow-text"
        >
          +1
        </button>
      </div>
    </div>
  );
};

export default GiorniInput;
