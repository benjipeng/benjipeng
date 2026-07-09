import { useCallback, useEffect, useRef, useState } from "react";
import { useRafLoop } from "./useRafLoop";

const BEST_KEY = "benji-orbital-best";
const S = 480;
const CX = S / 2;
const CY = S / 2;
const PLANET_R = 40;
const START_R = 118;
const MU = 155 * 155 * START_R;
const R_MIN = PLANET_R + 10;
const R_MAX = 208;
const MIN_PULL = 18;
const MAX_PULL = 90;

type Phase = "menu" | "aim" | "fly" | "over";
type Pt = { x: number; y: number };

function circularSpeed(r: number) {
  return Math.sqrt(MU / Math.max(r, PLANET_R + 1));
}

function predictPath(p0: Pt, v0: Pt, steps = 110): Pt[] {
  const out: Pt[] = [];
  let x = p0.x;
  let y = p0.y;
  let vx = v0.x;
  let vy = v0.y;
  const dt = 1 / 60;
  for (let i = 0; i < steps; i++) {
    const dx = CX - x;
    const dy = CY - y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < R_MIN || dist > R_MAX * 1.05) break;
    const a = MU / (dist * dist);
    vx += (dx / dist) * a * dt;
    vy += (dy / dist) * a * dt;
    x += vx * dt;
    y += vy * dt;
    if (i % 2 === 0) out.push({ x, y });
  }
  return out;
}

function launchVelocity(from: Pt, to: Pt) {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const pull = Math.hypot(dx, dy);
  if (pull < MIN_PULL) return null;
  const t = Math.min(1, (pull - MIN_PULL) / (MAX_PULL - MIN_PULL));
  const speed = circularSpeed(START_R) * (0.82 + t * 0.55);
  const rLen = Math.hypot(from.x - CX, from.y - CY) || 1;
  const tang = { x: -(from.y - CY) / rLen, y: (from.x - CX) / rLen };
  const aimDir = { x: dx / pull, y: dy / pull };
  const dot = aimDir.x * tang.x + aimDir.y * tang.y;
  const tx = dot >= 0 ? tang.x : -tang.x;
  const ty = dot >= 0 ? tang.y : -tang.y;
  const blend = 0.55;
  let vx = aimDir.x * (1 - blend) + tx * blend;
  let vy = aimDir.y * (1 - blend) + ty * blend;
  const vLen = Math.hypot(vx, vy) || 1;
  return { vx: (vx / vLen) * speed, vy: (vy / vLen) * speed, pull };
}

/** Sparse, intentional star field — not noise */
const STARS = [
  [48, 56, 1],
  [92, 120, 0.6],
  [140, 38, 0.7],
  [210, 72, 0.5],
  [288, 44, 1.1],
  [340, 98, 0.6],
  [400, 62, 0.8],
  [420, 160, 0.5],
  [36, 200, 0.55],
  [70, 310, 0.7],
  [120, 400, 0.5],
  [380, 380, 0.9],
  [430, 300, 0.55],
  [300, 420, 0.6],
  [180, 440, 0.5],
  [50, 420, 0.65],
  [250, 28, 0.5],
  [360, 220, 0.45],
] as const;

/**
 * Orbital — planetarium plate aesthetic.
 * Few elements, exact light, one accent.
 */
export default function OrbitalGame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("menu");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const phaseRef = useRef<Phase>("menu");

  const pos = useRef<Pt>({ x: CX - START_R, y: CY });
  const vel = useRef<Pt>({ x: 0, y: 0 });
  const aim = useRef<Pt | null>(null);
  const dragging = useRef(false);
  const angleAcc = useRef(0);
  const lastAng = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const trail = useRef<Pt[]>([]);
  const pred = useRef<Pt[]>([]);
  const pullPower = useRef(0);
  const tSec = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY) || 0));
    } catch {
      /* ignore */
    }
  }, []);

  const resetProbe = () => {
    pos.current = { x: CX - START_R, y: CY };
    vel.current = { x: 0, y: 0 };
    angleAcc.current = 0;
    lastAng.current = null;
    trail.current = [];
    pred.current = [];
    aim.current = null;
    dragging.current = false;
    pullPower.current = 0;
    setHint(null);
  };

  const goAim = () => {
    resetProbe();
    scoreRef.current = 0;
    setScore(0);
    setPhase("aim");
    setHint(null);
  };

  const launch = (from: Pt, to: Pt) => {
    const lv = launchVelocity(from, to);
    if (!lv) {
      setHint("A little farther");
      return;
    }
    vel.current = { x: lv.vx, y: lv.vy };
    pos.current = { ...from };
    trail.current = [];
    pred.current = [];
    angleAcc.current = 0;
    lastAng.current = Math.atan2(from.y - CY, from.x - CX);
    setHint(null);
    setPhase("fly");
  };

  const end = () => {
    setPhase("over");
    const s = scoreRef.current;
    setBest((b) => {
      const n = Math.max(b, s);
      try {
        localStorage.setItem(BEST_KEY, String(n));
      } catch {
        /* ignore */
      }
      return n;
    });
  };

  const toLocal = (clientX: number, clientY: number): Pt => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * S,
      y: ((clientY - r.top) / r.height) * S,
    };
  };

  const updatePrediction = (from: Pt, to: Pt) => {
    const lv = launchVelocity(from, to);
    pullPower.current = Math.hypot(from.x - to.x, from.y - to.y);
    pred.current = lv ? predictPath(from, { x: lv.vx, y: lv.vy }) : [];
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const css = canvas.clientWidth || S;
    if (canvas.width !== Math.floor(css * dpr) || canvas.height !== Math.floor(css * dpr)) {
      canvas.width = Math.floor(css * dpr);
      canvas.height = Math.floor(css * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.scale(css / S, css / S);

    const T = tSec.current;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // —— field: near-black with quiet depth ——
    const voidG = ctx.createRadialGradient(CX, CY, 0, CX, CY, S * 0.7);
    voidG.addColorStop(0, "#141820");
    voidG.addColorStop(0.55, "#0c0e14");
    voidG.addColorStop(1, "#121110");
    ctx.fillStyle = voidG;
    ctx.fillRect(0, 0, S, S);

    // single cool wash (not multiple neon blobs)
    const wash = ctx.createRadialGradient(CX - 40, CY - 50, 20, CX, CY, 220);
    wash.addColorStop(0, "rgba(250,248,243,0.03)");
    wash.addColorStop(1, "rgba(250,248,243,0)");
    ctx.fillStyle = wash;
    ctx.beginPath();
    ctx.arc(CX, CY, 220, 0, Math.PI * 2);
    ctx.fill();

    // stars — calm, few
    for (const [sx, sy, sr] of STARS) {
      const tw = 0.55 + 0.45 * Math.sin(T * 1.1 + sx * 0.04);
      ctx.beginPath();
      ctx.fillStyle = `rgba(230,225,214,${0.28 * tw})`;
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // one fine reference ring at start radius
    ctx.beginPath();
    ctx.arc(CX, CY, START_R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(230,225,214,0.07)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // escape circle — hairline, oxide whisper
    ctx.beginPath();
    ctx.arc(CX, CY, R_MAX, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(143,78,58,0.14)";
    ctx.lineWidth = 1;
    ctx.setLineDash([1.5, 10]);
    ctx.lineDashOffset = -T * 6;
    ctx.stroke();
    ctx.setLineDash([]);

    // —— planet: single jewel ——
    // soft atmosphere (one ring only)
    const atmo = ctx.createRadialGradient(CX, CY, PLANET_R * 0.9, CX, CY, PLANET_R * 2.1);
    atmo.addColorStop(0, "rgba(250,248,243,0.08)");
    atmo.addColorStop(0.5, "rgba(140,160,190,0.04)");
    atmo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = atmo;
    ctx.beginPath();
    ctx.arc(CX, CY, PLANET_R * 2.1, 0, Math.PI * 2);
    ctx.fill();

    // sphere
    const sphere = ctx.createRadialGradient(CX - 14, CY - 16, 2, CX + 4, CY + 6, PLANET_R);
    sphere.addColorStop(0, "#4a5568");
    sphere.addColorStop(0.25, "#2a3344");
    sphere.addColorStop(0.65, "#151b26");
    sphere.addColorStop(1, "#090c12");
    ctx.beginPath();
    ctx.arc(CX, CY, PLANET_R, 0, Math.PI * 2);
    ctx.fillStyle = sphere;
    ctx.fill();

    // quiet latitude lines
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, PLANET_R - 0.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(230,225,214,0.05)";
    ctx.lineWidth = 1;
    for (const dy of [-14, 0, 14]) {
      ctx.beginPath();
      ctx.ellipse(CX, CY + dy, PLANET_R * 0.92, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // soft terminator
    const term = ctx.createLinearGradient(CX - 10, CY, CX + PLANET_R, CY);
    term.addColorStop(0, "rgba(0,0,0,0)");
    term.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = term;
    ctx.fillRect(CX - PLANET_R, CY - PLANET_R, PLANET_R * 2, PLANET_R * 2);
    ctx.restore();

    // rim light
    ctx.beginPath();
    ctx.arc(CX, CY, PLANET_R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(250,248,243,0.35)";
    ctx.lineWidth = 1.25;
    ctx.stroke();
    // specular crescent
    ctx.beginPath();
    ctx.arc(CX, CY, PLANET_R - 1.5, -2.2, -0.9);
    ctx.strokeStyle = "rgba(230,225,214,0.22)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // —— prediction: single glowing filament ——
    const pr = pred.current;
    if (pr.length > 1 && phaseRef.current === "aim") {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pos.current.x, pos.current.y);
      for (const q of pr) ctx.lineTo(q.x, q.y);
      ctx.strokeStyle = "rgba(250,248,243,0.12)";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.current.x, pos.current.y);
      for (const q of pr) ctx.lineTo(q.x, q.y);
      ctx.strokeStyle = "rgba(250,248,243,0.55)";
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 8]);
      ctx.lineDashOffset = -T * 22;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // —— trail: fading ribbon ——
    const tr = trail.current;
    if (tr.length > 2) {
      ctx.lineCap = "round";
      for (let i = 1; i < tr.length; i++) {
        const a = (i / tr.length) ** 1.4;
        ctx.beginPath();
        ctx.moveTo(tr[i - 1].x, tr[i - 1].y);
        ctx.lineTo(tr[i].x, tr[i].y);
        ctx.strokeStyle = `rgba(250,248,243,${a * 0.7})`;
        ctx.lineWidth = 0.8 + a * 1.6;
        ctx.stroke();
      }
    }

    // —— aim ——
    if (phaseRef.current === "aim" && aim.current && dragging.current) {
      const p = pos.current;
      const a = aim.current;
      const pull = Math.hypot(p.x - a.x, p.y - a.y);
      const ok = pull >= MIN_PULL;
      const col = ok ? "250,248,243" : "143,78,58";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(a.x, a.y);
      ctx.strokeStyle = `rgba(${col},0.85)`;
      ctx.lineWidth = 1.25;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(a.x, a.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${col})`;
      ctx.fill();
      const t = Math.min(1, Math.max(0, (pull - MIN_PULL) / (MAX_PULL - MIN_PULL)));
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12 + t * 16, -Math.PI * 0.8, -Math.PI * 0.8 + Math.PI * 1.6 * t);
      ctx.strokeStyle = `rgba(250,248,243,${0.3 + t * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // —— probe: small precise craft ——
    const p = pos.current;
    let ang = 0;
    if (phaseRef.current === "fly") {
      ang = Math.atan2(vel.current.y, vel.current.x || 0.01);
    } else if (phaseRef.current === "aim" && aim.current && dragging.current) {
      ang = Math.atan2(p.y - aim.current.y, p.x - aim.current.x);
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);

    // halo
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
    halo.addColorStop(0, "rgba(250,248,243,0.28)");
    halo.addColorStop(1, "rgba(250,248,243,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    if (phaseRef.current === "fly") {
      const flick = 0.4 + 0.3 * Math.sin(T * 36);
      ctx.fillStyle = `rgba(250,248,243,${flick})`;
      ctx.beginPath();
      ctx.moveTo(-5, -2.2);
      ctx.lineTo(-11 - Math.sin(T * 48) * 2, 0);
      ctx.lineTo(-5, 2.2);
      ctx.closePath();
      ctx.fill();
    }

    if (phaseRef.current === "aim" && !dragging.current) {
      const pulse = 11 + Math.sin(T * 2.4) * 1.5;
      ctx.strokeStyle = "rgba(250,248,243,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // craft body
    ctx.fillStyle = "#FAF8F3";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-5.5, 5.5);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5.5, -5.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1C3D36";
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.lineTo(-1, 1.8);
    ctx.lineTo(-1, -1.8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // soft outer vignette — gallery frame feel
    const vig = ctx.createRadialGradient(CX, CY, S * 0.28, CX, CY, S * 0.72);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, S, S);
  }, []);

  useRafLoop(true, (dt) => {
    tSec.current += dt / 1000;
    if (phaseRef.current === "fly") {
      const steps = 2;
      const t = dt / 1000 / steps;
      for (let s = 0; s < steps; s++) {
        const p = pos.current;
        const v = vel.current;
        const dx = CX - p.x;
        const dy = CY - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < R_MIN || dist > R_MAX) {
          end();
          break;
        }
        const a = MU / (dist * dist);
        v.x += (dx / dist) * a * t;
        v.y += (dy / dist) * a * t;
        p.x += v.x * t;
        p.y += v.y * t;
        trail.current.push({ x: p.x, y: p.y });
        if (trail.current.length > 130) trail.current.shift();
        const ang = Math.atan2(p.y - CY, p.x - CX);
        if (lastAng.current != null) {
          let d = ang - lastAng.current;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          angleAcc.current += d;
          if (Math.abs(angleAcc.current) >= Math.PI * 2) {
            angleAcc.current -= Math.sign(angleAcc.current) * Math.PI * 2;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        }
        lastAng.current = ang;
      }
    }
    draw();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (phaseRef.current === "menu" || phaseRef.current === "over") {
          e.preventDefault();
          goAim();
        }
      }
      if ((e.key === "r" || e.key === "R") && (phaseRef.current === "over" || phaseRef.current === "fly")) {
        goAim();
      }
      if (e.key === "Escape" && phaseRef.current !== "menu") {
        setPhase("menu");
        resetProbe();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div className="flex flex-col items-stretch gap-3.5 w-full">
      <div className="flex items-end justify-between px-0.5">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mute mb-1">
            Orbits
          </p>
          <p className="font-display text-2xl font-bold text-ink tabular-nums leading-none">
            {score}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mute mb-1">
            Best
          </p>
          <p className="font-display text-lg font-semibold text-mark tabular-nums leading-none">
            {best}
          </p>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative w-full aspect-square overflow-hidden bg-[#121110] ring-1 ring-rule/70"
        style={{ borderRadius: "var(--radius)" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
          onPointerDown={(e) => {
            if (phaseRef.current !== "aim") return;
            dragging.current = true;
            const a = toLocal(e.clientX, e.clientY);
            aim.current = a;
            updatePrediction(pos.current, a);
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragging.current || phaseRef.current !== "aim") return;
            const a = toLocal(e.clientX, e.clientY);
            aim.current = a;
            updatePrediction(pos.current, a);
          }}
          onPointerUp={(e) => {
            if (!dragging.current || phaseRef.current !== "aim") return;
            dragging.current = false;
            const a = toLocal(e.clientX, e.clientY);
            aim.current = null;
            pred.current = [];
            launch(pos.current, a);
          }}
        />

        {phase === "menu" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-10 text-center bg-[#121110]/70 backdrop-blur-[2px]">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-mark mb-4">
              Gravity well
            </p>
            <p className="display text-[2rem] text-ink tracking-tight mb-3">Orbital</p>
            <p className="font-body text-mute text-[0.9rem] leading-relaxed max-w-[14rem] mb-8">
              Drag the probe. Release. Hold the orbit.
            </p>
            <button
              type="button"
              onClick={goAim}
              className="font-display font-bold text-sm tracking-wide text-paper bg-mark px-9 py-2.5 rounded-[var(--radius)] hover:brightness-110 transition"
            >
              Begin
            </button>
          </div>
        )}

        {phase === "aim" && !dragging.current && (
          <p className="pointer-events-none absolute bottom-6 inset-x-0 text-center font-mono text-[0.6rem] uppercase tracking-[0.22em] text-mute">
            {hint ?? "Drag · release"}
          </p>
        )}

        {phase === "aim" && dragging.current && pullPower.current < MIN_PULL && (
          <p className="pointer-events-none absolute bottom-6 inset-x-0 text-center font-mono text-[0.6rem] uppercase tracking-[0.22em] text-clay">
            Farther
          </p>
        )}

        {phase === "over" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-10 text-center bg-[#121110]/72 backdrop-blur-[2px]">
            <p className="display text-[2rem] text-ink tracking-tight mb-2">Lost</p>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mute mb-8">
              Orbits <span className="text-mark tabular-nums ml-2">{score}</span>
            </p>
            <button
              type="button"
              onClick={goAim}
              className="font-display font-bold text-sm tracking-wide text-paper bg-mark px-9 py-2.5 rounded-[var(--radius)] hover:brightness-110 transition"
            >
              Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
