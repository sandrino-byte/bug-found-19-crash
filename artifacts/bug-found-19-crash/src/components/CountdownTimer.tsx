import { useEffect, useState } from "react";
import { formatCountdown } from "@/types/mission";

interface CountdownTimerProps {
  deadline: string;
  color?: string;
  className?: string;
}

const CountdownTimer = ({ deadline, color, className }: CountdownTimerProps) => {
  const deadlineMs = new Date(deadline).getTime();
  const [, force] = useState(0);

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const text = formatCountdown(deadlineMs);
  const expired = text === "EXPIRED";

  return (
    <span
      className={`font-rajdhani font-semibold text-[10px] tracking-[0.18em] uppercase tabular-nums ${className ?? ""}`}
      style={{ color: expired ? "hsl(0 84% 60%)" : color }}
    >
      {text}
    </span>
  );
};

export default CountdownTimer;
