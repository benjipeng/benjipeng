import { clamp, distance, normalizeAngle, type LogicalPoint } from "../shared/canvas.ts";

export type BeamColor = "white" | "cool" | "warm" | "green";
export type OpticKind = "mirror" | "lens" | "prism" | "filter" | "aperture";

export type Transform = {
  x: number;
  y: number;
  angle: number;
};

export type OpticDefinition = {
  id: string;
  kind: OpticKind;
  label: string;
  radius: number;
  movable?: boolean;
  rotatable?: boolean;
  color?: BeamColor;
  split?: number;
  start: Transform;
  solution: Transform;
};

export type OpticState = Transform & {
  id: string;
};

export type LightTarget = {
  id: string;
  x: number;
  y: number;
  radius: number;
  color?: BeamColor;
  label: string;
};

export type LumenPlate = {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  note: string;
  hint: string;
  emitter: Transform;
  elements: OpticDefinition[];
  targets: LightTarget[];
};

export type BeamSegment = {
  from: LogicalPoint;
  to: LogicalPoint;
  color: BeamColor;
  energy: number;
};

export type TraceResult = {
  segments: BeamSegment[];
  illuminated: Set<string>;
};

type Ray = {
  origin: LogicalPoint;
  angle: number;
  color: BeamColor;
  energy: number;
  visited: Set<string>;
};

const FIELD = { left: 38, top: 38, right: 862, bottom: 582 };

export function createPlateState(plate: LumenPlate, solved = false): OpticState[] {
  return plate.elements.map((element) => ({
    id: element.id,
    ...(solved ? element.solution : element.start),
  }));
}

export function copyPlateState(state: OpticState[]) {
  return state.map((item) => ({ ...item }));
}

function rayCircleDistance(origin: LogicalPoint, angle: number, center: LogicalPoint, radius: number) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const ox = origin.x - center.x;
  const oy = origin.y - center.y;
  const b = 2 * (ox * dx + oy * dy);
  const c = ox * ox + oy * oy - radius * radius;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  const near = (-b - root) / 2;
  const far = (-b + root) / 2;
  if (near > 3) return near;
  if (far > 3) return far;
  return null;
}

function rayBoundaryDistance(origin: LogicalPoint, angle: number) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const distances = [
    dx > 0 ? (FIELD.right - origin.x) / dx : Number.POSITIVE_INFINITY,
    dx < 0 ? (FIELD.left - origin.x) / dx : Number.POSITIVE_INFINITY,
    dy > 0 ? (FIELD.bottom - origin.y) / dy : Number.POSITIVE_INFINITY,
    dy < 0 ? (FIELD.top - origin.y) / dy : Number.POSITIVE_INFINITY,
  ].filter((value) => value > 0);
  return Math.min(...distances);
}

function segmentHitsTarget(from: LogicalPoint, to: LogicalPoint, target: LightTarget) {
  const vx = to.x - from.x;
  const vy = to.y - from.y;
  const lengthSquared = vx * vx + vy * vy || 1;
  const t = clamp(((target.x - from.x) * vx + (target.y - from.y) * vy) / lengthSquared, 0, 1);
  const closest = { x: from.x + vx * t, y: from.y + vy * t };
  return distance(closest, target) <= target.radius;
}

export function tracePlate(plate: LumenPlate, state: OpticState[]): TraceResult {
  const states = new Map(state.map((item) => [item.id, item]));
  const segments: BeamSegment[] = [];
  const illuminated = new Set<string>();
  const queue: Ray[] = [
    {
      origin: { x: plate.emitter.x, y: plate.emitter.y },
      angle: plate.emitter.angle,
      color: "white",
      energy: 1,
      visited: new Set(),
    },
  ];

  while (queue.length && segments.length < 40) {
    const ray = queue.shift();
    if (!ray || ray.energy < 0.12) continue;

    let current = ray;
    for (let interaction = 0; interaction < 10; interaction += 1) {
      let nearest:
        | { definition: OpticDefinition; state: OpticState; distance: number }
        | undefined;

      for (const definition of plate.elements) {
        if (current.visited.has(definition.id)) continue;
        const opticState = states.get(definition.id);
        if (!opticState) continue;
        const hitDistance = rayCircleDistance(
          current.origin,
          current.angle,
          opticState,
          definition.radius,
        );
        if (hitDistance == null) continue;
        if (!nearest || hitDistance < nearest.distance) {
          nearest = { definition, state: opticState, distance: hitDistance };
        }
      }

      const boundaryDistance = rayBoundaryDistance(current.origin, current.angle);
      const travel = Math.min(boundaryDistance, nearest?.distance ?? boundaryDistance);
      const end = {
        x: current.origin.x + Math.cos(current.angle) * travel,
        y: current.origin.y + Math.sin(current.angle) * travel,
      };
      segments.push({
        from: { ...current.origin },
        to: end,
        color: current.color,
        energy: current.energy,
      });

      for (const target of plate.targets) {
        const colorMatches = !target.color || target.color === current.color;
        if (colorMatches && segmentHitsTarget(current.origin, end, target)) {
          illuminated.add(target.id);
        }
      }

      if (!nearest || nearest.distance >= boundaryDistance) break;

      const definition = nearest.definition;
      const optic = nearest.state;
      const visited = new Set(current.visited).add(definition.id);
      const placeAfterOptic = (angle: number) => ({
        x: optic.x + Math.cos(angle) * (definition.radius + 4),
        y: optic.y + Math.sin(angle) * (definition.radius + 4),
      });

      if (definition.kind === "prism") {
        const spread = definition.split ?? 0.22;
        const branches: Array<{ angle: number; color: BeamColor }> = [
          { angle: optic.angle - spread, color: "cool" },
          { angle: optic.angle + spread, color: "warm" },
        ];
        branches.forEach((branch) => {
          queue.push({
            origin: placeAfterOptic(branch.angle),
            angle: branch.angle,
            color: branch.color,
            energy: current.energy * 0.72,
            visited: new Set(visited),
          });
        });
        break;
      }

      let nextAngle = current.angle;
      let nextColor = current.color;
      if (definition.kind === "mirror") {
        nextAngle = normalizeAngle(2 * optic.angle - current.angle);
      } else if (definition.kind === "lens") {
        nextAngle = optic.angle;
      } else if (definition.kind === "filter") {
        nextColor = definition.color ?? "warm";
      }

      current = {
        origin: placeAfterOptic(nextAngle),
        angle: nextAngle,
        color: nextColor,
        energy: current.energy * (definition.kind === "filter" ? 0.82 : 0.9),
        visited,
      };
    }
  }

  return { segments, illuminated };
}

export function isPlateSolved(plate: LumenPlate, state: OpticState[]) {
  const trace = tracePlate(plate, state);
  return plate.targets.every((target) => trace.illuminated.has(target.id));
}

export function plateAccuracy(plate: LumenPlate, state: OpticState[]) {
  if (!plate.elements.length) return 1;
  const byId = new Map(state.map((item) => [item.id, item]));
  const errors = plate.elements.map((definition) => {
    const current = byId.get(definition.id);
    if (!current) return 1;
    const positionError = definition.movable
      ? clamp(distance(current, definition.solution) / 220, 0, 1)
      : 0;
    const angleError = definition.rotatable
      ? clamp(Math.abs(normalizeAngle(current.angle - definition.solution.angle)) / Math.PI, 0, 1)
      : 0;
    return Math.max(positionError, angleError);
  });
  return 1 - errors.reduce((sum, error) => sum + error, 0) / errors.length;
}

export function applyPlateHint(plate: LumenPlate, state: OpticState[]) {
  const next = copyPlateState(state);
  const candidates = plate.elements
    .map((definition) => {
      const current = next.find((item) => item.id === definition.id);
      if (!current) return null;
      const positionError = definition.movable ? distance(current, definition.solution) : 0;
      const angleError = definition.rotatable
        ? Math.abs(normalizeAngle(current.angle - definition.solution.angle)) * 100
        : 0;
      return { definition, current, error: positionError + angleError };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => b.error - a.error);
  const candidate = candidates[0];
  if (!candidate || candidate.error < 0.01) return next;
  const { definition, current } = candidate;
  if (definition.movable) {
    current.x += (definition.solution.x - current.x) * 0.46;
    current.y += (definition.solution.y - current.y) * 0.46;
  }
  if (definition.rotatable) {
    current.angle = normalizeAngle(
      current.angle + normalizeAngle(definition.solution.angle - current.angle) * 0.46,
    );
  }
  return next;
}
