import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="fixed top-3 left-3 z-50 flex items-center gap-0.5 select-none"
    >
      <span className="font-rajdhani font-bold text-lg leading-none text-primary glow-text tracking-widest">
        {hh}
      </span>
      <motion.span
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "steps(1)" }}
        className="font-rajdhani font-bold text-lg leading-none text-primary/60 mx-px"
      >
        :
      </motion.span>
      <span className="font-rajdhani font-bold text-lg leading-none text-primary glow-text tracking-widest">
        {mm}
      </span>
      <motion.span
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "steps(1)" }}
        className="font-rajdhani font-bold text-lg leading-none text-primary/60 mx-px"
      >
        :
      </motion.span>
      <span className="font-rajdhani font-semibold text-sm leading-none text-primary/60 tracking-widest self-end mb-px">
        {ss}
      </span>
    </motion.div>
  );
};

export default Clock;
