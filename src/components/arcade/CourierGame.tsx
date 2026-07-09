import { useCallback, useEffect, useRef, useState } from "react";
import { useRafLoop } from "./useRafLoop";

const BEST_KEY = "benji-courier-best";
const W = 520;
const H = 300;
const GROUND = H - 56;
const GRAV = 1600;
const JUMP_V = -420;
const RUN_SPEED = 180;
const PX = 88;
const PH = 28;

type Obs = { x: number; w: number; h: number };
type Pkg = { x: number; y: number; taken: boolean };
type Phase = "menu" | "play" | "over";

/** Clean skyline blocks — editorial silhouette */
const FAR = [
  [0, 36, 48],
  [44, 22, 78],
  [74, 40, 42],
  [122, 18, 90],
  [150, 48, 38],
  [208, 28, 100],
  [248, 36, 55],
  [292, 24, 72],
  [328, 44, 46],
  [380, 20, 88],
  [412, 50, 40],
  [470, 26, 70],
] as const;

export default function CourierGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("menu");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const phaseRef = useRef<Phase>("menu");

  const worldX = useRef(0);
  const py = useRef(GROUND - PH);
  const pvy = useRef(0);
  const onGround = useRef(true);
  const obstacles = useRef<Obs[]>([]);
  const packages = useRef<Pkg[]>([]);
  const scoreRef = useRef(0);
  const spawnAt = useRef(400);
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

  const reset = () => {
    worldX.current = 0;
    py.current = GROUND - PH;
    pvy.current = 0;
    onGround.current = true;
    obstacles.current = [];
    packages.current = [];
    spawnAt.current = 380;
    scoreRef.current = 0;
    setScore(0);
  };

  const start = () => {
    reset();
    setPhase("play");
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

  const jump = () => {
    if (phaseRef.current !== "play" || !onGround.current) return;
    pvy.current = JUMP_V;
    onGround.current = false;
  };

  const spawn = (wx: number) => {
    if (Math.random() < 0.55) {
      obstacles.current.push({
        x: wx,
        w: 18 + Math.random() * 16,
        h: 16 + Math.random() * 26,
      });
    } else {
      packages.current.push({
        x: wx + 8,
        y: GROUND - 50 - Math.random() * 36,
        taken: false,
      });
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || W;
    const cssH = canvas.clientHeight || H;
    if (
      canvas.width !== Math.floor(cssW * dpr) ||
      canvas.height !== Math.floor(cssH * dpr)
    ) {
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.scale(cssW / W, cssH / H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const T = tSec.current;
    const cam = worldX.current;
    const running = phaseRef.current === "play";

    // —— sky: three quiet bands ——
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "#121110");
    sky.addColorStop(0.55, "#12141c");
    sky.addColorStop(1, "#1a1416");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // moon — one perfect disk + soft glow
    const mx = W * 0.82;
    const my = 52;
    const mg = ctx.createRadialGradient(mx, my, 2, mx, my, 56);
    mg.addColorStop(0, "rgba(230,225,214,0.14)");
    mg.addColorStop(1, "rgba(230,225,214,0)");
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(mx, my, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx, my, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#e0dbd0";
    ctx.fill();
    // crescent cut
    ctx.beginPath();
    ctx.arc(mx + 6, my - 2, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#0d0e14";
    ctx.fill();

    // three quiet stars
    for (const [sx, sy] of [
      [40, 36],
      [120, 70],
      [200, 28],
      [300, 55],
      [380, 90],
    ] as const) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(230,225,214,0.28)";
      ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // far skyline — flat silhouette, parallax
    const par = (cam * 0.12) % 520;
    ctx.fillStyle = "#10121a";
    for (let rep = -1; rep <= 1; rep++) {
      for (const [bx, bw, bh] of FAR) {
        const x = bx + rep * 520 - par;
        ctx.fillRect(x, GROUND - bh * 0.45 - 8, bw, bh * 0.45 + 8);
      }
    }

    // mid skyline — slightly warmer, still flat
    const par2 = (cam * 0.28) % 520;
    for (let rep = -1; rep <= 1; rep++) {
      for (const [bx, bw, bh] of FAR) {
        const x = bx * 1.02 + 16 + rep * 520 - par2;
        const h = bh * 0.62;
        const y = GROUND - h;
        ctx.fillStyle = "#16121c";
        ctx.fillRect(x, y, bw * 0.95, h);
        // single oxide roof tick
        ctx.fillStyle = "rgba(143,78,58,0.22)";
        ctx.fillRect(x, y, bw * 0.95, 1.5);
        // sparse window dots
        ctx.fillStyle = "rgba(250,248,243,0.1)";
        for (let row = y + 10; row < GROUND - 14; row += 14) {
          for (let col = x + 5; col < x + bw * 0.95 - 4; col += 10) {
            if ((col + row + Math.floor(cam * 0.1)) % 19 < 6) {
              ctx.fillRect(col, row, 2.5, 3);
            }
          }
        }
      }
    }

    // ground plane
    const floor = ctx.createLinearGradient(0, GROUND, 0, H);
    floor.addColorStop(0, "#1c1614");
    floor.addColorStop(1, "#0c0a0a");
    ctx.fillStyle = floor;
    ctx.fillRect(0, GROUND, W, H - GROUND);

    // horizon rule
    ctx.fillStyle = "rgba(143,78,58,0.55)";
    ctx.fillRect(0, GROUND - 1, W, 1.5);

    // road band
    ctx.fillStyle = "#151210";
    ctx.fillRect(0, GROUND, W, 12);

    // sparse road marks
    ctx.fillStyle = "rgba(230,225,214,0.08)";
    for (let i = 0; i < 10; i++) {
      const tx = ((i * 64 - (cam % 64)) + W + 64) % (W + 64) - 32;
      ctx.fillRect(tx, GROUND + 20, 28, 1.5);
    }

    // packages — diamond with restraint
    for (const pk of packages.current) {
      if (pk.taken) continue;
      const sx = pk.x - cam;
      if (sx < -30 || sx > W + 30) continue;
      const bob = Math.sin(T * 3.2 + pk.x * 0.04) * 2;
      const y = pk.y + bob;
      const g = ctx.createRadialGradient(sx, y + 7, 0, sx, y + 7, 16);
      g.addColorStop(0, "rgba(250,248,243,0.25)");
      g.addColorStop(1, "rgba(250,248,243,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, y + 7, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#E8E4D9";
      ctx.beginPath();
      ctx.moveTo(sx, y - 2);
      ctx.lineTo(sx + 9, y + 7);
      ctx.lineTo(sx, y + 16);
      ctx.lineTo(sx - 9, y + 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(18,20,26,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // crates — solid, quiet geometry
    for (const o of obstacles.current) {
      const sx = o.x - cam;
      if (sx < -50 || sx > W + 40) continue;
      const top = GROUND - o.h;
      // contact shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(sx + o.w / 2, GROUND, o.w * 0.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // body
      const cg = ctx.createLinearGradient(sx, top, sx, GROUND);
      cg.addColorStop(0, "#A86B52");
      cg.addColorStop(1, "#9a5632");
      ctx.fillStyle = cg;
      ctx.fillRect(sx, top, o.w, o.h);
      // one band only
      ctx.fillStyle = "rgba(30,22,18,0.4)";
      ctx.fillRect(sx, top + o.h * 0.4, o.w, 2.5);
      // top edge light
      ctx.fillStyle = "rgba(230,210,180,0.2)";
      ctx.fillRect(sx, top, o.w, 1.5);
    }

    // courier — geometric figure
    const ry = py.current;
    const stride =
      running && onGround.current ? Math.sin(T * 13) * 4 : 0;
    const lean = !onGround.current ? -0.1 : running ? 0.06 : 0;

    ctx.save();
    ctx.translate(PX, ry + PH);
    ctx.rotate(lean);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 1, 11, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // legs — two lines
    ctx.strokeStyle = "#E8E4D9";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-1.5, -12);
    ctx.lineTo(-3 + stride, 0);
    ctx.moveTo(2, -12);
    ctx.lineTo(4 - stride, 0);
    ctx.stroke();

    // body triangle
    ctx.fillStyle = "#E8E4D9";
    ctx.beginPath();
    ctx.moveTo(1, -PH);
    ctx.lineTo(8, -10);
    ctx.lineTo(-4, -9);
    ctx.closePath();
    ctx.fill();

    // pack
    ctx.fillStyle = "#8F4E3A";
    ctx.fillRect(-4, -PH - 1, 11, 13);
    ctx.fillStyle = "#C5C0B4";
    ctx.fillRect(-4, -PH - 1, 11, 1.5);

    // head
    ctx.beginPath();
    ctx.arc(2.5, -PH - 5, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#E8E4D9";
    ctx.fill();
    ctx.fillStyle = "#121110";
    ctx.fillRect(2.5, -PH - 6, 4.5, 2);

    ctx.restore();

    // gentle side vignette
    const vig = ctx.createLinearGradient(0, 0, W, 0);
    vig.addColorStop(0, "rgba(0,0,0,0.35)");
    vig.addColorStop(0.15, "rgba(0,0,0,0)");
    vig.addColorStop(0.85, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }, []);

  useRafLoop(true, (dt) => {
    tSec.current += dt / 1000;
    const t = dt / 1000;

    if (phaseRef.current === "play") {
      const speed = RUN_SPEED + scoreRef.current * 2.5;
      worldX.current += speed * t;

      pvy.current += GRAV * t;
      py.current += pvy.current * t;
      if (py.current >= GROUND - PH) {
        py.current = GROUND - PH;
        pvy.current = 0;
        onGround.current = true;
      }

      while (spawnAt.current < worldX.current + W + 80) {
        spawn(spawnAt.current);
        spawnAt.current += 170 + Math.random() * 110;
      }

      obstacles.current = obstacles.current.filter((o) => o.x > worldX.current - 80);
      packages.current = packages.current.filter(
        (p) => p.x > worldX.current - 80 && !p.taken,
      );

      const pr = { x: PX - 3, y: py.current, w: 12, h: PH };

      for (const o of obstacles.current) {
        const sx = o.x - worldX.current;
        const top = GROUND - o.h;
        if (
          pr.x < sx + o.w - 3 &&
          pr.x + pr.w > sx + 3 &&
          pr.y < GROUND &&
          pr.y + pr.h > top + 2
        ) {
          end();
          break;
        }
      }

      for (const pk of packages.current) {
        if (pk.taken) continue;
        const sx = pk.x - worldX.current;
        if (Math.hypot(pr.x + 5 - sx, pr.y + 12 - (pk.y + 8)) < 22) {
          pk.taken = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      }

      if (
        Math.floor(worldX.current / 200) >
        Math.floor((worldX.current - speed * t) / 200)
      ) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
    }
    draw();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        if (phaseRef.current === "play") jump();
      }
      if (
        (e.key === "Enter" || e.key === " ") &&
        (phaseRef.current === "menu" || phaseRef.current === "over")
      ) {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col items-stretch gap-3.5 w-full">
      <div className="flex items-end justify-between px-0.5">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mute mb-1">
            Score
          </p>
          <p className="font-display text-2xl font-bold text-ink tabular-nums leading-none">
            {score}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mute mb-1">
            Best
          </p>
          <p className="font-display text-lg font-semibold text-clay tabular-nums leading-none">
            {best}
          </p>
        </div>
      </div>

      <div
        className="relative w-full aspect-[520/300] overflow-hidden bg-[#121110] ring-1 ring-rule/70"
        style={{ borderRadius: "var(--radius)" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={() => {
            if (phaseRef.current === "play") jump();
          }}
        />

        {(phase === "menu" || phase === "over") && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-10 text-center bg-[#121110]/68 backdrop-blur-[2px]">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-clay mb-4">
              Night route
            </p>
            <p className="display text-[2rem] text-ink tracking-tight mb-3">
              {phase === "menu" ? "Courier" : "Ended"}
            </p>
            {phase === "menu" ? (
              <p className="font-body text-mute text-[0.9rem] leading-relaxed max-w-[14rem] mb-8">
                Jump. Collect. Keep the route.
              </p>
            ) : (
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mute mb-8">
                Score <span className="text-clay tabular-nums ml-2">{score}</span>
              </p>
            )}
            <button
              type="button"
              onClick={start}
              className="font-display font-bold text-sm tracking-wide text-paper bg-clay px-9 py-2.5 rounded-[var(--radius)] hover:brightness-110 transition"
            >
              {phase === "menu" ? "Begin" : "Again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
