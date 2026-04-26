import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface VerticalPagesProps {
  children: React.ReactNode[];
  pageLabels?: string[];
  onPageChange?: (page: number) => void;
}

const DRAG_THRESHOLD = 80;

const VerticalPages = ({ children, pageLabels, onPageChange }: VerticalPagesProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
  const y = useMotionValue(0);
  const totalPages = children.length;

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  const handleDragEnd = useCallback(
    (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
      const { y: offsetY } = info.offset;
      const { y: velocityY } = info.velocity;

      if ((offsetY < -DRAG_THRESHOLD || velocityY < -300) && currentPage < totalPages - 1) {
        setCurrentPage((p) => p + 1);
      } else if ((offsetY > DRAG_THRESHOLD || velocityY > 300) && currentPage > 0) {
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
    setTimeout(() => { wheelLockRef.current = false; }, 650);

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

      {/* Page navigation menu — clearly visible labeled buttons */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 z-[70] flex flex-col gap-1.5 select-none">
        {children.map((_, i) => {
          const isActive = i === currentPage;
          const label = pageLabels?.[i] ?? `Page ${i + 1}`;
          return (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-label={`Go to ${label}`}
              className="group flex items-center gap-2 cursor-pointer"
            >
              {/* Label — always visible for active, fades in on hover for inactive */}
              <span
                className={`font-rajdhani font-semibold text-[9px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-1 group-hover:opacity-80 group-hover:translate-x-0"
                }`}
                style={{
                  color: isActive ? "hsl(187 92% 65%)" : "hsl(220 15% 70%)",
                  textShadow: isActive ? "0 0 6px hsl(187 92% 53% / 0.5)" : "none",
                }}
              >
                {label}
              </span>
              {/* Diamond pip */}
              <div
                className="rotate-45 transition-all duration-200"
                style={{
                  width:  isActive ? 10 : 7,
                  height: isActive ? 10 : 7,
                  background: isActive ? "hsl(187 92% 53% / 0.35)" : "transparent",
                  border: `1.5px solid ${isActive ? "hsl(187 92% 53%)" : "hsl(220 15% 35%)"}`,
                  boxShadow: isActive ? "0 0 10px hsl(187 92% 53% / 0.8)" : "none",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalPages;
