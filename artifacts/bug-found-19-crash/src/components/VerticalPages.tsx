import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VerticalPagesProps {
  children: React.ReactNode[];
  pageLabels?: string[];
  onPageChange?: (page: number) => void;
}

const VerticalPages = ({ children, pageLabels, onPageChange }: VerticalPagesProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [labelVisible, setLabelVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const labelTimerRef = useRef<number | null>(null);
  const totalPages = children.length;

  useEffect(() => {
    onPageChange?.(currentPage);

    // Show the label briefly on page change, then auto-hide
    setLabelVisible(true);
    if (labelTimerRef.current) window.clearTimeout(labelTimerRef.current);
    labelTimerRef.current = window.setTimeout(() => setLabelVisible(false), 1600);
    return () => {
      if (labelTimerRef.current) window.clearTimeout(labelTimerRef.current);
    };
  }, [currentPage, onPageChange]);

  // Detect current page by listening to scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const idx = Math.round(el.scrollTop / window.innerHeight);
        const clamped = Math.max(0, Math.min(totalPages - 1, idx));
        setCurrentPage((prev) => (prev === clamped ? prev : clamped));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [totalPages]);

  // Keyboard navigation: arrow up/down + page up/down
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      const el = scrollRef.current;
      if (!el) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (currentPage < totalPages - 1) {
          e.preventDefault();
          el.scrollTo({ top: (currentPage + 1) * window.innerHeight, behavior: "smooth" });
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (currentPage > 0) {
          e.preventDefault();
          el.scrollTo({ top: (currentPage - 1) * window.innerHeight, behavior: "smooth" });
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages]);

  const goTo = useCallback((i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: i * window.innerHeight, behavior: "smooth" });
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Native CSS scroll-snap — works on every touch device + desktop */}
      <div
        ref={scrollRef}
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children.map((child, i) => (
          <div key={i} className="h-screen w-screen snap-start snap-always shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Active page label — appears briefly when page changes, then fades out */}
      <AnimatePresence>
        {labelVisible && pageLabels?.[currentPage] && (
          <motion.div
            key={`label-${currentPage}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-[70] pointer-events-none select-none font-rajdhani font-bold text-[11px] tracking-[0.3em] uppercase whitespace-nowrap"
            style={{
              color: "hsl(187 92% 70%)",
              textShadow: "0 0 8px hsl(187 92% 53% / 0.6)",
              writingMode: "vertical-rl",
            }}
          >
            {pageLabels[currentPage]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerticalPages;
