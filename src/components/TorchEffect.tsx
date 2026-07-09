import { useCallback, useEffect, useRef, useState } from "react";

const TEXT = {
  visible: { first: "Benji", second: "Peng" },
  hidden: { first: "Scientist", second: "Entrepreneur" },
};

/**
 * Dual-identity reveal: chalk name by default; pointer reveals
 * Scientist / Entrepreneur through a soft torch aperture.
 * Touch / reduced-motion: show both lines statically.
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

    const draw = () => {
      ctx.clearRect(0, 0, dims.w, dims.h);
      // Hidden identity layer
      ctx.fillStyle = "#E6E1D6";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const size = Math.min(dims.w * 0.14, 96);
      ctx.font = `800 ${size}px "Bricolage Grotesque", system-ui, sans-serif`;
      const cy = dims.h * 0.48;
      ctx.fillStyle = "#B8F000";
      ctx.fillText(TEXT.hidden.first, dims.w / 2, cy - size * 0.55);
      ctx.fillStyle = "#C4784A";
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
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(0.55, "rgba(0,0,0,0.85)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, dims.w, dims.h);
        ctx.globalCompositeOperation = "source-over";
      } else if (!finePointer || reduceMotion) {
        // keep full dual identity visible as soft underlay via low alpha overlay next layer
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#12141A";
        ctx.fillRect(0, 0, dims.w, dims.h);
        ctx.globalAlpha = 1;
      } else {
        // idle: hide dual layer
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
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-graphite"
      onPointerMove={onMove}
      onPointerLeave={() => setActive(false)}
    >
      {/* Ambient dual wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 30% 40%, rgba(184,240,0,0.10), transparent 70%),
            radial-gradient(ellipse 45% 35% at 70% 55%, rgba(196,120,74,0.10), transparent 70%)
          `,
        }}
      />

      {/* Hairline frame */}
      <div className="pointer-events-none absolute inset-6 sm:inset-10 border border-rule/80" />

      <div className="relative z-10 section-pad w-full max-w-content text-center">
        <p className="eyebrow mb-6 text-signal">Ph.D. · dual practice</p>

        {/* Visible name */}
        <h1 className="display leading-[0.92] select-none">
          <span className="block text-[clamp(2.75rem,12vw,7.5rem)]">
            {TEXT.visible.first}
          </span>
          <span className="block text-[clamp(2.75rem,12vw,7.5rem)] text-chalk/90">
            {TEXT.visible.second}
          </span>
        </h1>

        <p className="mt-8 max-w-xl mx-auto font-body text-mist text-base sm:text-lg leading-relaxed">
          Scientist and entrepreneur. Building systems where research rigor
          meets products people can actually run.
        </p>

        {finePointer && !reduceMotion && (
          <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist/80">
            Move to reveal the other name
          </p>
        )}
      </div>

      {/* Reveal canvas sits above ambient, under chrome */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
        style={{
          opacity: finePointer && !reduceMotion ? 1 : 0.35,
          mixBlendMode: "normal",
        }}
        aria-hidden
      />

      {/* Static dual labels for touch / reduced motion */}
      {(!finePointer || reduceMotion) && (
        <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center gap-8 section-pad">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
            {TEXT.hidden.first}
          </span>
          <span className="text-rule">/</span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-oxide">
            {TEXT.hidden.second}
          </span>
        </div>
      )}
    </section>
  );
}
