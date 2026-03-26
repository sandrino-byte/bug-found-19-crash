import React from "react";

interface SystemButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

const SystemButton: React.FC<SystemButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
}) => {
  const variantClasses = {
    primary: "border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 hover:border-primary",
    secondary: "border-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/10",
    danger: "border-destructive/50 text-destructive bg-destructive/10 hover:bg-destructive/20 hover:border-destructive",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-rajdhani font-bold text-[10px] tracking-[0.1em] uppercase border py-1.5 px-3 transition-all disabled:opacity-40 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default SystemButton;
