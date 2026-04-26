import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface VerticalPagesProps {
  children: React.ReactNode[];
  pageLabels?: string[];
  onPageChange?: (page: number) => void;
}

const DRAG_THRESHOLD = 45;
const VELOCITY_THRESHOLD = 200;

const VerticalPages = ({ children, pageLabels, onPageChange }: VerticalPagesProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
  const y = useMotionValue(0);
  const totalPages = children.length;

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  // Keyboard navigation: arrow up/down + page up/down
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (currentPage < totalPages - 1) { e.preventDefault(); setCurrentPage((p) => p + 1); }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (currentPage > 0) { e.preventDefault(); setCurrentPage((p) => p - 1); }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages]);

  const handleDragEnd = useCallback(
    (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
      const { y: offsetY } = info.offset;
      const { y: velocityY } = info.velocity;

      if ((offsetY < -DRAG_THRESHOLD || velocityY < -VELOCITY_THRESHOLD) && currentPage < totalPages - 1) {
        setCurrentPage((p) => p + 1);
      } else if ((offsetY > DRAG_THRESHOLD || velocityY > VELOCITY_THRESHOLD) && currentPage > 0) {
        setCurrentPage((p) => p - 1);
      }

      animate(y, 0, { type: "spring", stiffness: 400, damping: 35 });
    },
    [currentPage, totalPages, y]
  );

  const resistedY = useTransform(y, (val) => {
    const maxDrag = 150;
    if (val > 0 && currentPage === 0) return val * 0.2;
    if (val < 0 && currentPage === totalPages - 1) return val * 0.2;
    const sign = val > 0 ? 1 : -1;
    const abs = Math.abs(val);
    return sign * Math.min(abs, maxDrag) * (1 - (Math.min(abs, maxDrag) / maxDrag) * 0.5);
  });

  // Wheel navigation with nested scroll respect
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) < 8) return;
    let el: HTMLElement | null = e.target as HTMLElement;
    while (el && el !== e.currentTarget) {
      const overflow = window.getComputedStyle(el).overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        const canScrollDown = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
        const canScrollUp = el.scrollTop > 1;
        if (e.deltaY > 0 && canScrollDown) return;
        if (e.deltaY < 0 && canScrollUp) return;
      }
      el = el.parentElement;
    }

    if (wheelLockRef.current) return;
    wheelLockRef.current = true;
    setTimeout(() => { wheelLockRef.current = false; }, 600);

    if (e.deltaY > 0 && currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else if (e.deltaY < 0 && currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage, totalPages]);

  const goTo = useCallback((i: number) => setCurrentPage(i), []);

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden relative"
      onWheel={handleWheel}
    >
      <motion.div
        style={{ y: resistedY }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="h-screen w-screen touch-none"
      >
        <motion.div
          animate={{ y: -currentPage * window.innerHeight }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full"
        >
          {children.map((child, i) => (
            <div key={i} className="h-screen w-screen">
              {child}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Vertical navigation menu — uniform, always-labeled buttons */}
      <nav
        className="fixed right-2.5 top-1/2 -translate-y-1/2 z-[70] flex flex-col gap-1 select-none"
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
              onPointerDown={(e) => e.stopPropagation()}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to ${label}`}
              className="group flex items-center gap-2 px-2 py-1.5 w-[112px] justify-end transition-all duration-200 hover:bg-primary/5"
              style={{
                background: isActive ? "hsl(187 92% 53% / 0.08)" : undefined,
                clipPath: "polygon(8px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 8px)",
              }}
            >
              <span
                className="font-rajdhani font-bold text-[10px] tracking-[0.22em] uppercase whitespace-nowrap transition-colors duration-200"
                style={{
                  color: isActive ? "hsl(187 92% 70%)" : "hsl(220 15% 55%)",
                  textShadow: isActive ? "0 0 6px hsl(187 92% 53% / 0.6)" : "none",
                }}
              >
                {label}
              </span>
              <span
                className="rotate-45 transition-all duration-200 group-hover:scale-110"
                style={{
                  width:  isActive ? 9 : 7,
                  height: isActive ? 9 : 7,
                  background: isActive ? "hsl(187 92% 53%)" : "transparent",
                  border: `1.5px solid ${isActive ? "hsl(187 92% 53%)" : "hsl(220 15% 40%)"}`,
                  boxShadow: isActive ? "0 0 8px hsl(187 92% 53% / 0.9)" : "none",
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
