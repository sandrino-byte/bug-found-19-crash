import React from "react";

interface SystemInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SystemInput: React.FC<SystemInputProps> = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-primary/70 text-[8px] font-semibold tracking-[0.2em] uppercase">
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-system font-rajdhani text-lg font-semibold text-foreground bg-transparent w-full px-1 py-1 placeholder:text-muted-foreground/30 focus:text-primary transition-colors"
      />
    </div>
  );
};

export default SystemInput;
