import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(target, duration = 1500, decimals = 2) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    startTime.current = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return Number(count.toFixed(decimals));
}
