import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  clamp,
  distance,
  pointerToLogical,
  prepareCanvas,
  readExhibitPalette,
  type LogicalPoint,
} from "../shared/canvas.ts";
import { useExhibitLoop, useReducedMotion } from "../shared/useExhibitLoop.ts";
import {
  copyPlateState,
  type LumenPlate,
  type OpticDefinition,
  type OpticState,
  type TraceResult,
} from "./model.ts";
import { LUMEN_SIZE, renderLumen } from "./render.ts";

type LumenCanvasProps = {
  plate: LumenPlate;
  state: OpticState[];
  trace: TraceResult;
  selectedId: string | null;
  solved: boolean;
  onSelect: (id: string | null) => void;
  onChange: (state: OpticState[]) => void;
  onCommit: (before: OpticState[]) => void;
  onActivity?: (kind: "select" | "move") => void;
};

type DragState = {
  definition: OpticDefinition;
  before: OpticState[];
  startPointer: LogicalPoint;
  startState: OpticState;
  moved: boolean;
};

export default function LumenCanvas({
  plate,
  state,
  trace,
  selectedId,
  solved,
  onSelect,
  onChange,
  onCommit,
  onActivity,
}: LumenCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const paletteRef = useRef(readExhibitPalette());
  const timeRef = useRef(0);
  const reducedMotion = useReducedMotion();

  const definitions = useMemo(
    () => new Map(plate.elements.map((element) => [element.id, element])),
    [plate],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const surface = prepareCanvas(canvas, LUMEN_SIZE.width, LUMEN_SIZE.height);
    if (!surface) return;
    renderLumen(surface.ctx, {
      plate,
      state,
      trace,
      selectedId,
      solved,
      time: timeRef.current,
      reducedMotion,
      palette: paletteRef.current,
    });
  }, [plate, reducedMotion, selectedId, solved, state, trace]);

  useExhibitLoop(rootRef, true, (delta) => {
    if (!reducedMotion) timeRef.current += delta;
    draw();
  });

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    return () => resize.disconnect();
  }, [draw]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      paletteRef.current = readExhibitPalette();
      draw();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [draw]);

  const findHit = (point: LogicalPoint) => {
    return plate.elements
      .filter((element) => element.movable || element.rotatable)
      .map((definition) => ({
        definition,
        optic: state.find((item) => item.id === definition.id),
      }))
      .filter((item): item is { definition: OpticDefinition; optic: OpticState } => Boolean(item.optic))
      .sort(
        (a, b) =>
          distance(point, a.optic) - a.definition.radius -
          (distance(point, b.optic) - b.definition.radius),
      )
      .find((item) => distance(point, item.optic) <= item.definition.radius + 22);
  };

  const mutate = (id: string, update: (item: OpticState) => OpticState) => {
    onChange(state.map((item) => (item.id === id ? update(item) : { ...item })));
  };

  const commitKeyboardChange = (id: string, update: (item: OpticState) => OpticState) => {
    const before = copyPlateState(state);
    mutate(id, update);
    onCommit(before);
    onActivity?.("move");
  };

  return (
    <div ref={rootRef} className="relative aspect-[900/620] w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none outline-none"
        role="application"
        tabIndex={0}
        aria-label={`${plate.title}. Optical work surface. Select an instrument, then drag or use the keyboard controls.`}
        onPointerDown={(event) => {
          const canvas = canvasRef.current;
          if (!canvas || solved) return;
          const point = pointerToLogical(
            canvas,
            event.clientX,
            event.clientY,
            LUMEN_SIZE.width,
            LUMEN_SIZE.height,
          );
          const hit = findHit(point);
          if (!hit) {
            onSelect(null);
            return;
          }
          onSelect(hit.definition.id);
          onActivity?.("select");
          dragRef.current = {
            definition: hit.definition,
            before: copyPlateState(state),
            startPointer: point,
            startState: { ...hit.optic },
            moved: false,
          };
          canvas.setPointerCapture(event.pointerId);
          canvas.focus({ preventScroll: true });
        }}
        onPointerMove={(event) => {
          const canvas = canvasRef.current;
          const drag = dragRef.current;
          if (!canvas || !drag || solved) return;
          const point = pointerToLogical(
            canvas,
            event.clientX,
            event.clientY,
            LUMEN_SIZE.width,
            LUMEN_SIZE.height,
          );
          if (distance(point, drag.startPointer) > 2) drag.moved = true;
          mutate(drag.definition.id, (item) => {
            if (drag.definition.movable) {
              return {
                ...item,
                x: clamp(drag.startState.x + point.x - drag.startPointer.x, 80, 820),
                y: clamp(drag.startState.y + point.y - drag.startPointer.y, 85, 535),
              };
            }
            if (drag.definition.rotatable) {
              return {
                ...item,
                angle: Math.atan2(point.y - item.y, point.x - item.x),
              };
            }
            return item;
          });
        }}
        onPointerUp={(event) => {
          const canvas = canvasRef.current;
          const drag = dragRef.current;
          if (!canvas || !drag) return;
          if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
          if (drag.moved) {
            onCommit(drag.before);
            onActivity?.("move");
          }
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          const drag = dragRef.current;
          if (drag) onChange(drag.before);
          dragRef.current = null;
        }}
        onKeyDown={(event) => {
          if (!selectedId || solved) return;
          const definition = definitions.get(selectedId);
          if (!definition) return;
          const fine = event.shiftKey ? 2 : 8;
          const angleStep = event.shiftKey ? 0.018 : 0.055;
          let handled = true;
          if (definition.movable && event.key === "ArrowLeft") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, x: clamp(item.x - fine, 80, 820) }));
          } else if (definition.movable && event.key === "ArrowRight") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, x: clamp(item.x + fine, 80, 820) }));
          } else if (definition.movable && event.key === "ArrowUp") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, y: clamp(item.y - fine, 85, 535) }));
          } else if (definition.movable && event.key === "ArrowDown") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, y: clamp(item.y + fine, 85, 535) }));
          } else if (definition.rotatable && (event.key === "[" || event.key === "ArrowLeft")) {
            commitKeyboardChange(selectedId, (item) => ({ ...item, angle: item.angle - angleStep }));
          } else if (definition.rotatable && (event.key === "]" || event.key === "ArrowRight")) {
            commitKeyboardChange(selectedId, (item) => ({ ...item, angle: item.angle + angleStep }));
          } else if (event.key === "Escape") {
            onSelect(null);
          } else {
            handled = false;
          }
          if (handled) event.preventDefault();
        }}
      />
      <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between font-mono text-[0.5rem] uppercase tracking-[0.14em] text-white/35 sm:hidden">
        <span>Optical field</span>
        <span>{plate.numeral} / V</span>
      </div>
    </div>
  );
}
