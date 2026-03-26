import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
  visible: boolean;
  onDismiss: () => void;
}

const WelcomeScreen = ({ visible, onDismiss }: WelcomeScreenProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onClick={onDismiss}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background cursor-pointer overflow-hidden"
        >
          {/* Ambient purple glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle, hsl(260 60% 55% / 0.12) 0%, transparent 70%)" }} />
          </div>

          {/* Vertical data lines */}
          <div className="absolute inset-0 pointer-events-none flex justify-between px-12 opacity-20">
            <div className="w-px h-full system-data-line" />
            <div className="w-px h-full system-data-line" />
            <div className="w-px h-full system-data-line" />
          </div>

          <div className="flex flex-col items-center relative" style={{ marginTop: "-12.5vh" }}>
            {/* Top accent line */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-6" />

            {/* Diamond icon */}
            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 45 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="w-5 h-5 border-2 border-primary mb-6"
              style={{
                backgroundColor: "hsl(187 92% 53% / 0.1)",
                boxShadow: "0 0 12px hsl(187 92% 53% / 0.5), 0 0 30px hsl(187 92% 53% / 0.2)"
              }}
            />

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-rajdhani font-bold text-5xl tracking-[0.3em] uppercase text-primary glow-text mb-2"
            >
              Welcome
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="font-rajdhani font-semibold text-xl tracking-[0.5em] uppercase text-accent glow-text-purple"
            >
              Player
            </motion.p>

            {/* Bottom accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="w-40 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-8"
            />

            {/* Tap hint */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
              className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mt-8"
            >
              Tap to continue
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
