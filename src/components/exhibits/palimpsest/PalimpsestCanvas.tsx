import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  clamp,
  pointerToLogical,
  prepareCanvas,
  readExhibitPalette,
  type LogicalPoint,
} from "../shared/canvas.ts";
import { useExhibitLoop, useReducedMotion } from "../shared/useExhibitLoop.ts";
import {
  copyWorkState,
  pointInFragment,
  snapFragment,
  type FragmentDefinition,
  type FragmentState,
  type PalimpsestWork,
} from "./model.ts";
import { PALIMPSEST_SIZE, renderPalimpsest } from "./render.ts";

type PalimpsestCanvasProps = {
  work: PalimpsestWork;
  state: FragmentState[];
  selectedId: string | null;
  inspecting: boolean;
  solved: boolean;
  onSelect: (id: string | null) => void;
  onChange: (state: FragmentState[]) => void;
  onCommit: (before: FragmentState[]) => void;
  onActivity?: (kind: "select" | "move") => void;
};

type DragState = {
  id: string;
  before: FragmentState[];
  startPointer: LogicalPoint;
  startState: FragmentState;
  moved: boolean;
};

export default function PalimpsestCanvas({
  work,
  state,
  selectedId,
  inspecting,
  solved,
  onSelect,
  onChange,
  onCommit,
  onActivity,
}: PalimpsestCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const lightRef = useRef<LogicalPoint>({ x: 455, y: 250 });
  const stateRef = useRef(state);
  stateRef.current = state;
  const paletteRef = useRef(readExhibitPalette());
  const timeRef = useRef(0);
  const reducedMotion = useReducedMotion();

  const definitions = useMemo(
    () => new Map(work.fragments.map((fragment) => [fragment.id, fragment])),
    [work],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const surface = prepareCanvas(canvas, PALIMPSEST_SIZE.width, PALIMPSEST_SIZE.height);
    if (!surface) return;
    renderPalimpsest(surface.ctx, {
      work,
      state,
      selectedId,
      light: lightRef.current,
      inspecting,
      solved,
      time: timeRef.current,
      reducedMotion,
      palette: paletteRef.current,
    });
  }, [inspecting, reducedMotion, selectedId, solved, state, work]);

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
    return [...state]
      .sort((a, b) => b.depth - a.depth || b.id.localeCompare(a.id))
      .map((fragment) => ({ fragment, definition: definitions.get(fragment.id) }))
      .find(
        (item): item is { fragment: FragmentState; definition: FragmentDefinition } =>
          Boolean(item.definition && pointInFragment(point, item.definition, item.fragment)),
      );
  };

  const mutate = (id: string, update: (item: FragmentState) => FragmentState) => {
    onChange(stateRef.current.map((item) => (item.id === id ? update(item) : { ...item })));
  };

  const commitKeyboardChange = (id: string, update: (item: FragmentState) => FragmentState) => {
    const before = copyWorkState(stateRef.current);
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
        aria-label={`${work.title}. Conservation table. Select a fragment, drag it, rotate with bracket keys, and change its depth with Page Up or Page Down.`}
        onPointerDown={(event) => {
          const canvas = canvasRef.current;
          if (!canvas || solved) return;
          const point = pointerToLogical(
            canvas,
            event.clientX,
            event.clientY,
            PALIMPSEST_SIZE.width,
            PALIMPSEST_SIZE.height,
          );
          lightRef.current = point;
          const hit = findHit(point);
          if (!hit) {
            onSelect(null);
            draw();
            return;
          }
          onSelect(hit.fragment.id);
          onActivity?.("select");
          dragRef.current = {
            id: hit.fragment.id,
            before: copyWorkState(stateRef.current),
            startPointer: point,
            startState: { ...hit.fragment },
            moved: false,
          };
          canvas.setPointerCapture(event.pointerId);
          canvas.focus({ preventScroll: true });
        }}
        onPointerMove={(event) => {
          const canvas = canvasRef.current;
          if (!canvas || solved) return;
          const point = pointerToLogical(
            canvas,
            event.clientX,
            event.clientY,
            PALIMPSEST_SIZE.width,
            PALIMPSEST_SIZE.height,
          );
          if (inspecting) {
            lightRef.current = point;
            draw();
          }
          const drag = dragRef.current;
          if (!drag) return;
          if (Math.hypot(point.x - drag.startPointer.x, point.y - drag.startPointer.y) > 2) {
            drag.moved = true;
          }
          mutate(drag.id, (item) => ({
            ...item,
            x: clamp(drag.startState.x + point.x - drag.startPointer.x, 120, 780),
            y: clamp(drag.startState.y + point.y - drag.startPointer.y, 105, 515),
          }));
        }}
        onPointerUp={(event) => {
          const canvas = canvasRef.current;
          const drag = dragRef.current;
          if (!canvas || !drag) return;
          if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
          if (drag.moved) {
            onChange(snapFragment(work, stateRef.current, drag.id));
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
          const move = event.shiftKey ? 2 : 8;
          const turn = event.shiftKey ? 0.018 : 0.07;
          let handled = true;
          if (event.key === "ArrowLeft") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, x: clamp(item.x - move, 120, 780) }));
          } else if (event.key === "ArrowRight") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, x: clamp(item.x + move, 120, 780) }));
          } else if (event.key === "ArrowUp") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, y: clamp(item.y - move, 105, 515) }));
          } else if (event.key === "ArrowDown") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, y: clamp(item.y + move, 105, 515) }));
          } else if (event.key === "[") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, angle: item.angle - turn }));
          } else if (event.key === "]") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, angle: item.angle + turn }));
          } else if (event.key === "PageUp") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, depth: Math.min(2, item.depth + 1) }));
          } else if (event.key === "PageDown") {
            commitKeyboardChange(selectedId, (item) => ({ ...item, depth: Math.max(0, item.depth - 1) }));
          } else if (event.key === "Escape") {
            onSelect(null);
          } else {
            handled = false;
          }
          if (handled) event.preventDefault();
        }}
      />
      <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between font-mono text-[0.5rem] uppercase tracking-[0.14em] text-white/35 sm:hidden">
        <span>Conservation field</span>
        <span>{work.numeral} / IV</span>
      </div>
    </div>
  );
}
