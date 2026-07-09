import { clamp, distance, normalizeAngle, type LogicalPoint } from "../shared/canvas.ts";

export type Material = "vellum" | "oxide" | "carbon" | "verdigris" | "chalk";

export type FragmentTransform = {
  x: number;
  y: number;
  angle: number;
  depth: number;
};

export type FragmentDefinition = {
  id: string;
  label: string;
  material: Material;
  points: LogicalPoint[];
  start: FragmentTransform;
  solution: FragmentTransform;
};

export type FragmentState = FragmentTransform & {
  id: string;
};

export type PalimpsestWork = {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  note: string;
  hint: string;
  motif: "index" | "botanical" | "weather" | "atlas";
  fragments: FragmentDefinition[];
};

export type Registration = {
  position: number;
  rotation: number;
  depth: number;
  overall: number;
  placed: boolean;
};

export function createWorkState(work: PalimpsestWork, solved = false): FragmentState[] {
  return work.fragments.map((fragment) => ({
    id: fragment.id,
    ...(solved ? fragment.solution : fragment.start),
  }));
}

export function copyWorkState(state: FragmentState[]) {
  return state.map((item) => ({ ...item }));
}

export function fragmentRegistration(
  definition: FragmentDefinition,
  state: FragmentState,
): Registration {
  const positionError = distance(state, definition.solution);
  const rotationError = Math.abs(normalizeAngle(state.angle - definition.solution.angle));
  const depthError = Math.abs(state.depth - definition.solution.depth);
  const position = 1 - clamp(positionError / 250, 0, 1);
  const rotation = 1 - clamp(rotationError / Math.PI, 0, 1);
  const depth = 1 - clamp(depthError / 2, 0, 1);
  const placed = positionError <= 18 && rotationError <= 0.12 && depthError === 0;
  return {
    position,
    rotation,
    depth,
    overall: position * 0.58 + rotation * 0.27 + depth * 0.15,
    placed,
  };
}

export function workAccuracy(work: PalimpsestWork, state: FragmentState[]) {
  if (!work.fragments.length) return 1;
  const byId = new Map(state.map((item) => [item.id, item]));
  const values = work.fragments.map((definition) => {
    const fragment = byId.get(definition.id);
    return fragment ? fragmentRegistration(definition, fragment).overall : 0;
  });
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function isWorkSolved(work: PalimpsestWork, state: FragmentState[]) {
  const byId = new Map(state.map((item) => [item.id, item]));
  return work.fragments.every((definition) => {
    const fragment = byId.get(definition.id);
    return fragment ? fragmentRegistration(definition, fragment).placed : false;
  });
}

export function snapFragment(
  work: PalimpsestWork,
  state: FragmentState[],
  id: string,
): FragmentState[] {
  const definition = work.fragments.find((item) => item.id === id);
  const current = state.find((item) => item.id === id);
  if (!definition || !current) return copyWorkState(state);
  const registration = fragmentRegistration(definition, current);
  const positionError = distance(current, definition.solution);
  const rotationError = Math.abs(normalizeAngle(current.angle - definition.solution.angle));
  const canSnap = positionError <= 34 && rotationError <= 0.24 && current.depth === definition.solution.depth;
  if (!canSnap && !registration.placed) return copyWorkState(state);
  return state.map((item) =>
    item.id === id ? { id, ...definition.solution } : { ...item },
  );
}

export function applyWorkHint(work: PalimpsestWork, state: FragmentState[]) {
  const next = copyWorkState(state);
  const byId = new Map(next.map((item) => [item.id, item]));
  const candidate = work.fragments
    .map((definition) => {
      const current = byId.get(definition.id);
      if (!current) return null;
      const registration = fragmentRegistration(definition, current);
      return { definition, current, registration };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.registration.overall - b.registration.overall)[0];
  if (!candidate || candidate.registration.placed) return next;

  const { current, definition } = candidate;
  current.x += (definition.solution.x - current.x) * 0.52;
  current.y += (definition.solution.y - current.y) * 0.52;
  current.angle = normalizeAngle(
    current.angle + normalizeAngle(definition.solution.angle - current.angle) * 0.52,
  );
  if (Math.abs(current.depth - definition.solution.depth) > 0) {
    current.depth += Math.sign(definition.solution.depth - current.depth);
  }
  return snapFragment(work, next, current.id);
}

export function transformPoint(point: LogicalPoint, transform: FragmentTransform): LogicalPoint {
  const cosine = Math.cos(transform.angle);
  const sine = Math.sin(transform.angle);
  return {
    x: transform.x + point.x * cosine - point.y * sine,
    y: transform.y + point.x * sine + point.y * cosine,
  };
}

export function pointInFragment(
  point: LogicalPoint,
  definition: FragmentDefinition,
  state: FragmentState,
) {
  const polygon = definition.points.map((item) => transformPoint(item, state));
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || 1) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}
