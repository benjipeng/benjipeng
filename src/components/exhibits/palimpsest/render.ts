import { distance, roundedRect, type ExhibitPalette, type LogicalPoint } from "../shared/canvas.ts";
import {
  fragmentRegistration,
  type FragmentDefinition,
  type FragmentState,
  type Material,
  type PalimpsestWork,
} from "./model.ts";

const W = 900;
const H = 620;

const MATERIALS: Record<Material, { fill: string; edge: string; ink: string }> = {
  vellum: {
    fill: "rgba(220,208,181,0.72)",
    edge: "rgba(245,235,211,0.68)",
    ink: "rgba(67,59,47,0.32)",
  },
  oxide: {
    fill: "rgba(155,75,48,0.73)",
    edge: "rgba(216,133,95,0.64)",
    ink: "rgba(55,27,22,0.42)",
  },
  carbon: {
    fill: "rgba(34,34,31,0.84)",
    edge: "rgba(160,155,143,0.48)",
    ink: "rgba(235,225,202,0.24)",
  },
  verdigris: {
    fill: "rgba(54,101,88,0.7)",
    edge: "rgba(123,174,151,0.58)",
    ink: "rgba(21,47,42,0.42)",
  },
  chalk: {
    fill: "rgba(203,197,180,0.64)",
    edge: "rgba(241,235,216,0.66)",
    ink: "rgba(86,82,71,0.28)",
  },
};

type RenderOptions = {
  work: PalimpsestWork;
  state: FragmentState[];
  selectedId: string | null;
  light: LogicalPoint;
  inspecting: boolean;
  solved: boolean;
  time: number;
  reducedMotion: boolean;
  palette: ExhibitPalette;
};

function fragmentPath(ctx: CanvasRenderingContext2D, definition: FragmentDefinition) {
  ctx.beginPath();
  definition.points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
}

function drawTable(ctx: CanvasRenderingContext2D, work: PalimpsestWork) {
  const table = ctx.createRadialGradient(450, 270, 0, 450, 310, 600);
  table.addColorStop(0, "#241b16");
  table.addColorStop(0.55, "#15110f");
  table.addColorStop(1, "#0c0b0a");
  ctx.fillStyle = table;
  ctx.fillRect(0, 0, W, H);

  // Archival mat.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.48)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;
  const mat = ctx.createLinearGradient(90, 70, 810, 550);
  mat.addColorStop(0, "#29251f");
  mat.addColorStop(0.5, "#24201b");
  mat.addColorStop(1, "#1b1916");
  ctx.fillStyle = mat;
  roundedRect(ctx, 86, 67, 728, 486, 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "rgba(223,211,184,0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(86.5, 67.5, 727, 485);
  ctx.strokeStyle = "rgba(223,211,184,0.07)";
  ctx.strokeRect(99.5, 80.5, 701, 459);

  // Conservation scale ticks.
  ctx.fillStyle = "rgba(230,220,196,0.28)";
  for (let x = 110; x <= 790; x += 20) {
    const major = (x - 110) % 100 === 0;
    ctx.fillRect(x, 68, 1, major ? 10 : 5);
    ctx.fillRect(x, 542, 1, major ? 10 : 5);
  }
  for (let y = 90; y <= 530; y += 20) {
    const major = (y - 90) % 100 === 0;
    ctx.fillRect(87, y, major ? 10 : 5, 1);
    ctx.fillRect(804 - (major ? 3 : 0), y, major ? 10 : 5, 1);
  }

  // Paper fibres and tiny pin holes.
  for (let index = 0; index < 130; index += 1) {
    const x = 103 + ((index * 79 + work.id.length * 23) % 694);
    const y = 83 + ((index * 131 + work.title.length * 29) % 452);
    ctx.fillStyle = index % 5 === 0 ? "rgba(233,219,187,0.075)" : "rgba(0,0,0,0.095)";
    ctx.fillRect(x, y, index % 4 === 0 ? 3 : 1, 0.7);
  }

  ctx.fillStyle = "rgba(229,218,193,0.38)";
  ctx.font = '500 9px "IBM Plex Mono", monospace';
  ctx.fillText(`ARCHIVE ${work.numeral} / ${work.id.toUpperCase().replaceAll("-", " ")}`, 105, 101);
  ctx.textAlign = "right";
  ctx.fillText("RAKING TABLE 04", 795, 101);
  ctx.textAlign = "start";
}

function drawRegistrationGhosts(
  ctx: CanvasRenderingContext2D,
  work: PalimpsestWork,
  light: LogicalPoint,
  inspecting: boolean,
) {
  if (!inspecting) return;
  ctx.save();
  ctx.setLineDash([3, 6]);
  work.fragments.forEach((definition) => {
    const proximity = 1 - Math.min(1, distance(light, definition.solution) / 430);
    const alpha = 0.08 + proximity * 0.28;
    ctx.save();
    ctx.translate(definition.solution.x, definition.solution.y);
    ctx.rotate(definition.solution.angle);
    fragmentPath(ctx, definition);
    ctx.strokeStyle = `rgba(229,218,193,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = `rgba(229,218,193,${alpha * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(definition.solution.x - 7, definition.solution.y);
    ctx.lineTo(definition.solution.x + 7, definition.solution.y);
    ctx.moveTo(definition.solution.x, definition.solution.y - 7);
    ctx.lineTo(definition.solution.x, definition.solution.y + 7);
    ctx.stroke();
  });
  ctx.restore();
}

function drawFragment(
  ctx: CanvasRenderingContext2D,
  definition: FragmentDefinition,
  state: FragmentState,
  selected: boolean,
  placed: boolean,
  light: LogicalPoint,
  inspecting: boolean,
  time: number,
) {
  const material = MATERIALS[definition.material];
  const dx = state.x - light.x;
  const dy = state.y - light.y;
  const length = Math.hypot(dx, dy) || 1;
  const depthLift = 2 + state.depth * 3.5;

  ctx.save();
  ctx.translate(state.x + (dx / length) * depthLift, state.y + (dy / length) * depthLift);
  ctx.rotate(state.angle);
  fragmentPath(ctx, definition);
  ctx.fillStyle = `rgba(0,0,0,${0.18 + state.depth * 0.08})`;
  ctx.shadowColor = "rgba(0,0,0,0.38)";
  ctx.shadowBlur = 8 + state.depth * 4;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.rotate(state.angle);
  fragmentPath(ctx, definition);
  ctx.globalAlpha = placed ? 0.96 : 0.88 + state.depth * 0.035;
  ctx.fillStyle = material.fill;
  ctx.fill();
  ctx.strokeStyle = placed ? "rgba(231,219,190,0.7)" : material.edge;
  ctx.lineWidth = selected ? 1.7 : 1;
  ctx.stroke();

  ctx.save();
  fragmentPath(ctx, definition);
  ctx.clip();
  ctx.globalAlpha = 1;
  if (definition.material === "carbon") {
    ctx.strokeStyle = material.ink;
    ctx.lineWidth = 1;
    for (let offset = -100; offset < 120; offset += 12) {
      ctx.beginPath();
      ctx.moveTo(-100, offset);
      ctx.lineTo(100, offset + 55);
      ctx.stroke();
    }
  } else if (definition.material === "oxide") {
    for (let index = 0; index < 28; index += 1) {
      const x = -60 + ((index * 31) % 120);
      const y = -46 + ((index * 47) % 92);
      ctx.beginPath();
      ctx.arc(x, y, index % 4 === 0 ? 2.2 : 1, 0, Math.PI * 2);
      ctx.fillStyle = material.ink;
      ctx.fill();
    }
  } else if (definition.material === "verdigris") {
    ctx.strokeStyle = material.ink;
    ctx.lineWidth = 1.1;
    for (let index = -3; index <= 3; index += 1) {
      ctx.beginPath();
      ctx.moveTo(-70, index * 15);
      ctx.bezierCurveTo(-20, index * 7 - 22, 18, index * 11 + 22, 70, index * 13);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = material.ink;
    ctx.lineWidth = 0.8;
    for (let offset = -80; offset < 100; offset += 18) {
      ctx.beginPath();
      ctx.moveTo(offset, -70);
      ctx.lineTo(offset + 22, 70);
      ctx.stroke();
    }
  }

  if (inspecting) {
    const sweep = Math.sin(time * 0.0014 + state.x * 0.01) * 18;
    const sheen = ctx.createLinearGradient(-80 + sweep, -70, 80 + sweep, 70);
    sheen.addColorStop(0.35, "rgba(255,244,215,0)");
    sheen.addColorStop(0.5, "rgba(255,244,215,0.16)");
    sheen.addColorStop(0.65, "rgba(255,244,215,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(-90, -80, 180, 160);
  }
  ctx.restore();

  if (selected) {
    const radius = Math.max(...definition.points.map((point) => Math.hypot(point.x, point.y))) + 15;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(240,228,202,0.82)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]);
    ctx.lineDashOffset = -time * 0.008;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(radius, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#e8dbc0";
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = selected ? "rgba(241,228,201,0.86)" : "rgba(225,211,181,0.42)";
  ctx.font = '500 8px "IBM Plex Mono", monospace';
  ctx.textAlign = "center";
  ctx.fillText(`${definition.label} · ${state.depth + 1}`, state.x, state.y + 72);
  ctx.textAlign = "start";
}

function drawRakingLight(ctx: CanvasRenderingContext2D, light: LogicalPoint, inspecting: boolean) {
  if (!inspecting) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 260);
  glow.addColorStop(0, "rgba(255,232,188,0.16)");
  glow.addColorStop(0.48, "rgba(210,154,102,0.075)");
  glow.addColorStop(1, "rgba(210,154,102,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(85, 66, 730, 488);
  ctx.beginPath();
  ctx.arc(light.x, light.y, 16, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,231,190,0.36)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(light.x - 23, light.y);
  ctx.lineTo(light.x + 23, light.y);
  ctx.moveTo(light.x, light.y - 23);
  ctx.lineTo(light.x, light.y + 23);
  ctx.strokeStyle = "rgba(255,231,190,0.18)";
  ctx.stroke();
  ctx.restore();
}

function drawLivingMotif(
  ctx: CanvasRenderingContext2D,
  work: PalimpsestWork,
  time: number,
  reducedMotion: boolean,
) {
  const phase = reducedMotion ? 0 : time * 0.00055;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgba(238,221,187,0.38)";
  ctx.lineWidth = 1;
  if (work.motif === "index") {
    for (let index = 0; index < 5; index += 1) {
      const offset = Math.sin(phase + index) * 8;
      ctx.beginPath();
      ctx.moveTo(300, 230 + index * 42 + offset);
      ctx.lineTo(625, 230 + index * 42 - offset);
      ctx.stroke();
    }
  } else if (work.motif === "botanical") {
    for (let index = -2; index <= 2; index += 1) {
      ctx.beginPath();
      ctx.moveTo(450, 485);
      ctx.bezierCurveTo(
        420 + index * 22,
        390,
        500 + Math.sin(phase + index) * 24,
        260,
        450 + index * 45,
        155,
      );
      ctx.stroke();
    }
  } else if (work.motif === "weather") {
    for (let ring = 0; ring < 5; ring += 1) {
      ctx.beginPath();
      ctx.arc(460, 310, 45 + ring * 38, phase + ring * 0.4, phase + Math.PI * 1.25 + ring * 0.4);
      ctx.stroke();
    }
  } else {
    for (let ring = 0; ring < 6; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(465, 315, 70 + ring * 43, 35 + ring * 20, phase * (ring % 2 ? -0.12 : 0.12), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(210, 315);
    ctx.bezierCurveTo(320, 250, 580, 380, 720, 285);
    ctx.strokeStyle = "rgba(111,174,151,0.52)";
    ctx.stroke();
  }
  ctx.restore();
}

export function renderPalimpsest(ctx: CanvasRenderingContext2D, options: RenderOptions) {
  const { work, state, selectedId, light, inspecting, solved, time, reducedMotion } = options;
  drawTable(ctx, work);
  drawRegistrationGhosts(ctx, work, light, inspecting && !solved);

  const definitions = new Map(work.fragments.map((item) => [item.id, item]));
  [...state]
    .sort((a, b) => a.depth - b.depth || a.id.localeCompare(b.id))
    .forEach((fragment) => {
      const definition = definitions.get(fragment.id);
      if (!definition) return;
      drawFragment(
        ctx,
        definition,
        fragment,
        selectedId === fragment.id,
        fragmentRegistration(definition, fragment).placed,
        light,
        inspecting,
        reducedMotion ? 0 : time,
      );
    });

  if (solved) drawLivingMotif(ctx, work, time, reducedMotion);
  drawRakingLight(ctx, light, inspecting && !solved);
}

export const PALIMPSEST_SIZE = { width: W, height: H } as const;
