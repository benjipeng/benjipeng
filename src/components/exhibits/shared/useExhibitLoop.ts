import { type RefObject, useEffect, useRef, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/** Animation loop that sleeps while its exhibit or browser tab is hidden. */
export function useExhibitLoop(
  rootRef: RefObject<Element | null>,
  running: boolean,
  tick: (deltaMs: number, elapsedMs: number) => void,
) {
  const tickRef = useRef(tick);
  tickRef.current = tick;
  const [intersecting, setIntersecting] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(
    () => document.visibilityState !== "hidden",
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry?.isIntersecting ?? false),
      { rootMargin: "160px 0px", threshold: 0.01 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  useEffect(() => {
    const sync = () => setDocumentVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (!running || !intersecting || !documentVisible) return;
    let frame = 0;
    let last = performance.now();
    let elapsed = 0;
    const loop = (now: number) => {
      const delta = Math.min(34, Math.max(0, now - last));
      last = now;
      elapsed += delta;
      tickRef.current(delta, elapsed);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, intersecting, documentVisible]);

  return intersecting && documentVisible;
}
