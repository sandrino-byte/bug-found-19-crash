import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface VerticalPagesProps {
  children: React.ReactNode[];
  onPageChange?: (page: number) => void;
}

const DRAG_THRESHOLD = 80;

const VerticalPages = ({ children, onPageChange }: VerticalPagesProps) => {
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

  // Wheel navigation: respects nested scrollable areas first
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

      {/* Page indicators — clickable cyan dots */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        {children.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to page ${i + 1}`}
            className={`w-1 cursor-pointer transition-all duration-300 ${
              i === currentPage ? "h-5 bg-primary" : "h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:h-3"
            }`}
            style={{
              boxShadow: i === currentPage ? "0 0 8px hsl(187 92% 53% / 0.6)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VerticalPages;
