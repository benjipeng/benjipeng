import { roundedRect, type ExhibitPalette } from "../shared/canvas.ts";
import type {
  BeamColor,
  LumenPlate,
  OpticDefinition,
  OpticState,
  TraceResult,
} from "./model.ts";

const W = 900;
const H = 620;

const BEAM_COLORS: Record<BeamColor, string> = {
  white: "239,235,220",
  cool: "126,190,208",
  warm: "207,121,83",
  green: "128,173,151",
};

type RenderOptions = {
  plate: LumenPlate;
  state: OpticState[];
  trace: TraceResult;
  selectedId: string | null;
  time: number;
  solved: boolean;
  reducedMotion: boolean;
  palette: ExhibitPalette;
};

function drawBackground(
  ctx: CanvasRenderingContext2D,
  plate: LumenPlate,
  time: number,
  solved: boolean,
  reducedMotion: boolean,
) {
  const field = ctx.createRadialGradient(W * 0.5, H * 0.42, 30, W * 0.5, H * 0.5, W * 0.68);
  field.addColorStop(0, "#18201f");
  field.addColorStop(0.52, "#0d1212");
  field.addColorStop(1, "#080a09");
  ctx.fillStyle = field;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, 310);
  glow.addColorStop(0, "rgba(98,133,121,0.07)");
  glow.addColorStop(1, "rgba(98,133,121,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Engraved technical grid.
  ctx.save();
  ctx.strokeStyle = "rgba(226,222,208,0.042)";
  ctx.lineWidth = 1;
  for (let x = 60; x <= W - 60; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 42);
    ctx.lineTo(x, H - 42);
    ctx.stroke();
  }
  for (let y = 50; y <= H - 50; y += 40) {
    ctx.beginPath();
    ctx.moveTo(42, y);
    ctx.lineTo(W - 42, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(226,222,208,0.095)";
  ctx.setLineDash([2, 10]);
  ctx.beginPath();
  ctx.moveTo(42, H / 2);
  ctx.lineTo(W - 42, H / 2);
  ctx.moveTo(W / 2, 42);
  ctx.lineTo(W / 2, H - 42);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Sparse fixed grain: deterministic and cheap.
  ctx.fillStyle = "rgba(244,239,222,0.065)";
  for (let index = 0; index < 88; index += 1) {
    const x = 47 + ((index * 83 + plate.id.length * 31) % 805);
    const y = 45 + ((index * 137 + plate.title.length * 17) % 530);
    ctx.fillRect(x, y, index % 7 === 0 ? 1.3 : 0.7, index % 7 === 0 ? 1.3 : 0.7);
  }

  ctx.strokeStyle = "rgba(230,225,210,0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(38.5, 38.5, W - 77, H - 77);

  for (const [x, y] of [
    [38, 38],
    [W - 38, 38],
    [38, H - 38],
    [W - 38, H - 38],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(230,225,210,0.28)";
    ctx.fill();
  }

  if (solved) {
    const phase = reducedMotion ? 0.5 : (Math.sin(time * 0.0012) + 1) / 2;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let ring = 0; ring < 6; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(
        W / 2,
        H / 2,
        90 + ring * 42 + phase * 8,
        35 + ring * 22,
        ring % 2 ? -0.18 : 0.18,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = `rgba(${ring % 2 ? BEAM_COLORS.cool : BEAM_COLORS.warm},${0.045 + ring * 0.008})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawBeams(ctx: CanvasRenderingContext2D, trace: TraceResult, time: number, solved: boolean) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";
  for (const segment of trace.segments) {
    const rgb = BEAM_COLORS[segment.color];
    ctx.beginPath();
    ctx.moveTo(segment.from.x, segment.from.y);
    ctx.lineTo(segment.to.x, segment.to.y);
    ctx.strokeStyle = `rgba(${rgb},${0.055 * segment.energy})`;
    ctx.lineWidth = 15;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(segment.from.x, segment.from.y);
    ctx.lineTo(segment.to.x, segment.to.y);
    ctx.strokeStyle = `rgba(${rgb},${0.19 * segment.energy})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(segment.from.x, segment.from.y);
    ctx.lineTo(segment.to.x, segment.to.y);
    ctx.strokeStyle = `rgba(${rgb},${0.75 * segment.energy})`;
    ctx.lineWidth = solved ? 1.6 : 1.15;
    ctx.stroke();

    const length = Math.hypot(segment.to.x - segment.from.x, segment.to.y - segment.from.y);
    const count = Math.min(8, Math.floor(length / 80));
    for (let index = 0; index < count; index += 1) {
      const progress = ((time * 0.00016 + index / Math.max(1, count)) % 1 + 1) % 1;
      const x = segment.from.x + (segment.to.x - segment.from.x) * progress;
      const y = segment.from.y + (segment.to.y - segment.from.y) * progress;
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${0.45 * segment.energy})`;
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawEmitter(ctx: CanvasRenderingContext2D, plate: LumenPlate, time: number) {
  ctx.save();
  ctx.translate(plate.emitter.x, plate.emitter.y);
  ctx.rotate(plate.emitter.angle);
  const pulse = 0.65 + Math.sin(time * 0.003) * 0.15;
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 34);
  halo.addColorStop(0, `rgba(236,231,213,${0.25 * pulse})`);
  halo.addColorStop(1, "rgba(236,231,213,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8e2d3";
  roundedRect(ctx, -18, -9, 30, 18, 3);
  ctx.fill();
  ctx.fillStyle = "#101817";
  ctx.beginPath();
  ctx.arc(10, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(232,226,211,0.46)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-23, -14);
  ctx.lineTo(-23, 14);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(232,226,211,0.48)";
  ctx.font = '500 10px "IBM Plex Mono", monospace';
  ctx.letterSpacing = "0.18em";
  ctx.fillText("SOURCE", plate.emitter.x - 28, plate.emitter.y + 34);
}

function drawTarget(
  ctx: CanvasRenderingContext2D,
  target: LumenPlate["targets"][number],
  illuminated: boolean,
  time: number,
) {
  const rgb = BEAM_COLORS[target.color ?? "white"];
  if (illuminated) {
    const pulse = 0.76 + Math.sin(time * 0.004 + target.x) * 0.14;
    const glow = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, 62);
    glow.addColorStop(0, `rgba(${rgb},${0.24 * pulse})`);
    glow.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 62, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.strokeStyle = illuminated ? `rgba(${rgb},0.92)` : "rgba(226,221,207,0.3)";
  ctx.lineWidth = illuminated ? 1.8 : 1;
  ctx.beginPath();
  ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, target.radius - 7, 0, Math.PI * 2);
  ctx.strokeStyle = illuminated ? `rgba(${rgb},0.38)` : "rgba(226,221,207,0.12)";
  ctx.stroke();
  ctx.fillStyle = illuminated ? `rgba(${rgb},0.9)` : "rgba(226,221,207,0.24)";
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = illuminated ? `rgba(${rgb},0.75)` : "rgba(226,221,207,0.35)";
  ctx.font = '500 9px "IBM Plex Mono", monospace';
  ctx.textAlign = "center";
  ctx.fillText(target.label, target.x, target.y + target.radius + 19);
  ctx.textAlign = "start";
}

function drawOptic(
  ctx: CanvasRenderingContext2D,
  definition: OpticDefinition,
  state: OpticState,
  selected: boolean,
  time: number,
) {
  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.rotate(state.angle);

  if (definition.kind === "mirror") {
    const metal = ctx.createLinearGradient(-34, 0, 34, 0);
    metal.addColorStop(0, "#736f68");
    metal.addColorStop(0.45, "#ece5d4");
    metal.addColorStop(0.52, "#88837a");
    metal.addColorStop(1, "#d5cdbd");
    ctx.fillStyle = metal;
    roundedRect(ctx, -40, -4, 80, 8, 2);
    ctx.fill();
    ctx.fillStyle = "rgba(12,17,16,0.8)";
    ctx.fillRect(-34, 4, 68, 3);
    ctx.strokeStyle = "rgba(236,230,214,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-45, 0);
    ctx.lineTo(45, 0);
    ctx.stroke();
  } else if (definition.kind === "lens") {
    const glass = ctx.createLinearGradient(-18, 0, 18, 0);
    glass.addColorStop(0, "rgba(89,145,150,0.08)");
    glass.addColorStop(0.5, "rgba(180,221,216,0.42)");
    glass.addColorStop(1, "rgba(89,145,150,0.08)");
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 37, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(177,215,210,0.62)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(232,226,211,0.28)";
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.moveTo(-48, 0);
    ctx.lineTo(48, 0);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (definition.kind === "prism") {
    const prism = ctx.createLinearGradient(-25, -20, 25, 26);
    prism.addColorStop(0, "rgba(137,194,205,0.16)");
    prism.addColorStop(0.5, "rgba(237,231,215,0.38)");
    prism.addColorStop(1, "rgba(198,112,76,0.18)");
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(-23, 30);
    ctx.lineTo(-23, -30);
    ctx.closePath();
    ctx.fillStyle = prism;
    ctx.fill();
    ctx.strokeStyle = "rgba(231,225,211,0.62)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-43, 0);
    ctx.lineTo(45, 0);
    ctx.strokeStyle = "rgba(231,225,211,0.2)";
    ctx.setLineDash([2, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (definition.kind === "filter") {
    const rgb = BEAM_COLORS[definition.color ?? "warm"];
    const pulse = 0.16 + Math.sin(time * 0.0025) * 0.025;
    ctx.fillStyle = `rgba(${rgb},${pulse})`;
    roundedRect(ctx, -19, -40, 38, 80, 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${rgb},0.66)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = "rgba(231,225,211,0.18)";
    ctx.fillRect(-25, -34, 4, 68);
    ctx.fillRect(21, -34, 4, 68);
  } else {
    ctx.fillStyle = "rgba(6,9,8,0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(226,221,207,0.42)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(226,221,207,0.72)";
    ctx.stroke();
  }

  if (selected) {
    ctx.beginPath();
    ctx.arc(0, 0, definition.radius + 14, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(230,225,210,0.72)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]);
    ctx.lineDashOffset = -time * 0.01;
    ctx.stroke();
    ctx.setLineDash([]);
    if (definition.rotatable) {
      ctx.beginPath();
      ctx.moveTo(definition.radius + 10, 0);
      ctx.lineTo(definition.radius + 28, 0);
      ctx.strokeStyle = "rgba(230,225,210,0.72)";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(definition.radius + 31, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#e8e2d3";
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.fillStyle = selected ? "rgba(236,230,214,0.86)" : "rgba(236,230,214,0.42)";
  ctx.font = '500 9px "IBM Plex Mono", monospace';
  ctx.textAlign = "center";
  ctx.fillText(definition.label, state.x, state.y + definition.radius + 21);
  ctx.textAlign = "start";
}

export function renderLumen(ctx: CanvasRenderingContext2D, options: RenderOptions) {
  const { plate, state, trace, selectedId, time, solved, reducedMotion } = options;
  drawBackground(ctx, plate, time, solved, reducedMotion);
  drawBeams(ctx, trace, reducedMotion ? 0 : time, solved);
  drawEmitter(ctx, plate, reducedMotion ? 0 : time);
  plate.targets.forEach((target) =>
    drawTarget(ctx, target, trace.illuminated.has(target.id), reducedMotion ? 0 : time),
  );
  const byId = new Map(state.map((item) => [item.id, item]));
  plate.elements.forEach((definition) => {
    const opticState = byId.get(definition.id);
    if (opticState) {
      drawOptic(
        ctx,
        definition,
        opticState,
        selectedId === definition.id,
        reducedMotion ? 0 : time,
      );
    }
  });

  ctx.fillStyle = "rgba(232,226,211,0.42)";
  ctx.font = '500 9px "IBM Plex Mono", monospace';
  ctx.fillText(`PLATE ${plate.numeral}`, 58, 67);
  ctx.textAlign = "right";
  ctx.fillText("LUMEN CABINET / 2026", W - 58, 67);
  ctx.textAlign = "start";
}

export const LUMEN_SIZE = { width: W, height: H } as const;
