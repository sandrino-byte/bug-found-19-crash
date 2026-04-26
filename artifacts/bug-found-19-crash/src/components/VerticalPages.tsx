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

      {/* Vertical navigation menu — pips always visible, label fades in on change/hover */}
      <nav
        className="fixed right-3 top-1/2 -translate-y-1/2 z-[70] flex flex-col gap-2 select-none"
        aria-label="Page navigation"
      >
        {children.map((_, i) => {
          const isActive = i === currentPage;
          const label = pageLabels?.[i] ?? `Page ${i + 1}`;
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to ${label}`}
              className="group flex items-center gap-2 cursor-pointer"
            >
              {/* Label — fades in on hover for any button, OR briefly when active page changes */}
              <AnimatePresence>
                {((isActive && labelVisible)) && (
                  <motion.span
                    key="active-label"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="font-rajdhani font-bold text-[10px] tracking-[0.22em] uppercase whitespace-nowrap"
                    style={{
                      color: "hsl(187 92% 70%)",
                      textShadow: "0 0 6px hsl(187 92% 53% / 0.6)",
                    }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Hover-only label (any button) — separate so it can coexist */}
              {!(isActive && labelVisible) && (
                <span
                  className="font-rajdhani font-bold text-[10px] tracking-[0.22em] uppercase whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-80 group-hover:translate-x-0 transition-all duration-200"
                  style={{ color: isActive ? "hsl(187 92% 70%)" : "hsl(220 15% 65%)" }}
                  aria-hidden="true"
                >
                  {label}
                </span>
              )}
              {/* Diamond pip — always visible */}
              <span
                className="rotate-45 transition-all duration-200 group-hover:scale-110"
                style={{
                  width:  isActive ? 10 : 7,
                  height: isActive ? 10 : 7,
                  background: isActive ? "hsl(187 92% 53% / 0.35)" : "transparent",
                  border: `1.5px solid ${isActive ? "hsl(187 92% 53%)" : "hsl(220 15% 38%)"}`,
                  boxShadow: isActive ? "0 0 9px hsl(187 92% 53% / 0.85)" : "none",
                }}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default VerticalPages;
