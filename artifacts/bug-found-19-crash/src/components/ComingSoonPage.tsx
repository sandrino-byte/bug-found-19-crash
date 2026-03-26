import { motion } from "framer-motion";

const ComingSoonPage = () => (
  <div className="h-full w-full flex flex-col items-center justify-center px-4 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(260 60% 55% / 0.06) 0%, transparent 70%)" }} />

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-4 relative z-10"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
        <h1 className="font-rajdhani font-bold text-3xl tracking-[0.3em] uppercase text-primary glow-text">
          Archive
        </h1>
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
      </div>
      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="font-rajdhani text-sm tracking-[0.3em] uppercase text-muted-foreground"
      >
        Coming Soon
      </motion.p>
    </motion.div>
  </div>
);

export default ComingSoonPage;
