import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DateDisplay = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const day = DAYS[now.getDay()];
  const date = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="fixed top-3 right-6 z-50 flex flex-col items-end select-none"
    >
      <span className="font-rajdhani font-semibold text-[10px] tracking-[0.2em] uppercase text-primary/50">
        {day}
      </span>
      <span className="font-rajdhani font-bold text-base leading-none tracking-widest text-primary glow-text">
        {String(date).padStart(2, "0")} {month} {year}
      </span>
    </motion.div>
  );
};

export default DateDisplay;
