import { useEffect, useRef } from "react";

/** Fixed-ish rAF loop: calls `tick(dtMs)` while `running` is true. */
export function useRafLoop(running: boolean, tick: (dt: number) => void) {
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!running) return;
    let id = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      tickRef.current(dt);
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [running]);
}
