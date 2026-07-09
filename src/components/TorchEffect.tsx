import { useCallback, useEffect, useRef, useState } from "react";

const TEXT = {
  visible: { first: "Benji", second: "Peng" },
  hidden: { first: "Scientist", second: "Entrepreneur" },
};

/**
 * Dual-identity reveal on gallery paper.
 * Name in ink; pointer reveals institutional mark / clay poles.
 */
export default function TorchEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.45 });
  const [active, setActive] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [finePointer, setFinePointer] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mqPointer = window.matchMedia("(pointer: fine)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setFinePointer(mqPointer.matches);
      setReduceMotion(mqMotion.matches);
    };
    sync();
    mqPointer.addEventListener("change", sync);
    mqMotion.addEventListener("change", sync);
    return () => {
      mqPointer.removeEventListener("change", sync);
      mqMotion.removeEventListener("change", sync);
    };
  }, []);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDims({ w: width, h: height });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dims.w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const styles = getComputedStyle(document.documentElement);
    const mark = styles.getPropertyValue("--mark").trim() || "#1C3D36";
    const clay = styles.getPropertyValue("--clay").trim() || "#8F4E3A";
    const paper = styles.getPropertyValue("--paper").trim() || "#F1EEE6";
    const isDark =
      document.documentElement.classList.contains("dark") ||
      (!document.documentElement.classList.contains("light") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const draw = () => {
      ctx.clearRect(0, 0, dims.w, dims.h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const size = Math.min(dims.w * 0.14, 96);
      ctx.font = `600 ${size}px "Cormorant Garamond", Georgia, serif`;
      const cy = dims.h * 0.48;
      ctx.fillStyle = mark;
      ctx.fillText(TEXT.hidden.first, dims.w / 2, cy - size * 0.55);
      ctx.fillStyle = clay;
      ctx.fillText(TEXT.hidden.second, dims.w / 2, cy + size * 0.55);

      if (finePointer && !reduceMotion && active) {
        const r = Math.min(dims.w, dims.h) * 0.22;
        ctx.globalCompositeOperation = "destination-in";
        const g = ctx.createRadialGradient(
          pos.x * dims.w,
          pos.y * dims.h,
          0,
          pos.x * dims.w,
          pos.y * dims.h,
          r,
        );
        // Mask: visible inside torch (works on light & dark paper)
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.55, "rgba(0,0,0,0.85)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, dims.w, dims.h);
        ctx.globalCompositeOperation = "source-over";
      } else if (!finePointer || reduceMotion) {
        ctx.globalAlpha = isDark ? 0.2 : 0.15;
        ctx.fillStyle = paper;
        ctx.fillRect(0, 0, dims.w, dims.h);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = "destination-in";
        ctx.clearRect(0, 0, dims.w, dims.h);
        ctx.globalCompositeOperation = "source-over";
      }
    };
    draw();
  }, [dims, pos, active, finePointer, reduceMotion]);

  const onMove = (e: React.MouseEvent | React.PointerEvent) => {
    if (!containerRef.current || !finePointer) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
    setActive(true);
  };

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-paper"
      onPointerMove={onMove}
      onPointerLeave={() => setActive(false)}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 28% 42%, rgba(28,61,54,0.05), transparent 70%),
            radial-gradient(ellipse 50% 40% at 72% 58%, rgba(143,78,58,0.045), transparent 70%)
          `,
        }}
      />

      {/* Gallery frame — quiet, institutional */}
      <div className="pointer-events-none absolute inset-5 sm:inset-10 border border-rule" />

      <div className="relative z-10 section-pad w-full max-w-content text-center">
        <p className="eyebrow mb-8 text-mark">Ph.D. · AI products</p>

        <h1 className="font-display font-semibold leading-[0.9] select-none tracking-[-0.02em]">
          <span className="block text-[clamp(3rem,13vw,8rem)] text-ink">
            {TEXT.visible.first}
          </span>
          <span className="block text-[clamp(3rem,13vw,8rem)] text-ink/85">
            {TEXT.visible.second}
          </span>
        </h1>

        <p className="mt-10 max-w-lg mx-auto font-body text-mute text-base sm:text-lg leading-relaxed">
          AI products people like, love to use, and actually find useful.
        </p>

        {finePointer && !reduceMotion && (
          <p className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-mute/80">
            Move to reveal the other name
          </p>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
        style={{
          opacity: finePointer && !reduceMotion ? 1 : 0.28,
        }}
        aria-hidden
      />

      {(!finePointer || reduceMotion) && (
        <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center gap-8 section-pad">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-mark">
            {TEXT.hidden.first}
          </span>
          <span className="text-rule">/</span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-clay">
            {TEXT.hidden.second}
          </span>
        </div>
      )}
    </section>
  );
}
