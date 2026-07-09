import { useEffect, useMemo, useRef, useState } from "react";

import { ExhibitFrame, ToolButton } from "../shared/ExhibitFrame.tsx";
import { useExhibitAudio } from "../shared/useExhibitAudio.ts";
import { useVersionedStorage } from "../shared/storage.ts";
import LumenCanvas from "./LumenCanvas.tsx";
import { LUMEN_PLATES } from "./levels.ts";
import {
  applyPlateHint,
  copyPlateState,
  createPlateState,
  plateAccuracy,
  tracePlate,
  type OpticState,
} from "./model.ts";

type Phase = "intro" | "play" | "complete";

type LumenProgress = {
  unlocked: number;
  completed: string[];
  bestScores: Record<string, number>;
};

const STORAGE_KEY = "benji-lumen-cabinet";
const STORAGE_VERSION = 1;
const INITIAL_PROGRESS: LumenProgress = {
  unlocked: 0,
  completed: [],
  bestScores: {},
};

function isLumenProgress(value: unknown): value is LumenProgress {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LumenProgress>;
  return (
    typeof item.unlocked === "number" &&
    Array.isArray(item.completed) &&
    item.completed.every((id) => typeof id === "string") &&
    Boolean(item.bestScores) &&
    typeof item.bestScores === "object"
  );
}

export default function LumenGame() {
  const [progress, setProgress, hydrated] = useVersionedStorage(
    STORAGE_KEY,
    STORAGE_VERSION,
    INITIAL_PROGRESS,
    isLumenProgress,
  );
  const [plateIndex, setPlateIndex] = useState(0);
  const plate = LUMEN_PLATES[plateIndex];
  const [state, setState] = useState<OpticState[]>(() => createPlateState(LUMEN_PLATES[0]));
  const [history, setHistory] = useState<OpticState[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [moves, setMoves] = useState(0);
  const [hints, setHints] = useState(0);
  const [score, setScore] = useState(0);
  const startTimeRef = useRef(0);
  const choseInitialPlate = useRef(false);
  const audio = useExhibitAudio();

  const trace = useMemo(() => tracePlate(plate, state), [plate, state]);
  const solved = plate.targets.every((target) => trace.illuminated.has(target.id));
  const accuracy = Math.round(plateAccuracy(plate, state) * 100);
  const lit = trace.illuminated.size;
  const selectedDefinition = plate.elements.find((item) => item.id === selectedId);

  useEffect(() => {
    if (!hydrated || choseInitialPlate.current) return;
    choseInitialPlate.current = true;
    const firstOpen = LUMEN_PLATES.findIndex((item) => !progress.completed.includes(item.id));
    const nextIndex = firstOpen >= 0 ? Math.min(firstOpen, progress.unlocked) : progress.unlocked;
    setPlateIndex(nextIndex);
    setState(createPlateState(LUMEN_PLATES[nextIndex]));
  }, [hydrated, progress.completed, progress.unlocked]);

  useEffect(() => {
    if (phase !== "play" || !solved) return;
    const elapsedSeconds = Math.max(0, (performance.now() - startTimeRef.current) / 1000);
    const nextScore = Math.max(120, Math.round(1200 - moves * 28 - hints * 95 - elapsedSeconds * 1.5));
    setScore(nextScore);
    setPhase("complete");
    setSelectedId(null);
    audio.play("solve");
    setProgress((current) => ({
      unlocked: Math.min(
        LUMEN_PLATES.length - 1,
        Math.max(current.unlocked, plateIndex + 1),
      ),
      completed: current.completed.includes(plate.id)
        ? current.completed
        : [...current.completed, plate.id],
      bestScores: {
        ...current.bestScores,
        [plate.id]: Math.max(current.bestScores[plate.id] ?? 0, nextScore),
      },
    }));
  }, [audio, hints, moves, phase, plate.id, plateIndex, setProgress, solved]);

  const beginPlate = (index = plateIndex) => {
    const nextPlate = LUMEN_PLATES[index];
    setPlateIndex(index);
    setState(createPlateState(nextPlate));
    setHistory([]);
    setSelectedId(null);
    setMoves(0);
    setHints(0);
    setScore(0);
    startTimeRef.current = performance.now();
    setPhase("play");
  };

  const selectPlate = (index: number) => {
    if (index > progress.unlocked) return;
    beginPlate(index);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous || phase !== "play") return;
    setState(copyPlateState(previous));
    setHistory((items) => items.slice(0, -1));
    setSelectedId(null);
    setMoves((value) => value + 1);
    audio.play("reset");
  };

  const reset = () => {
    if (phase === "intro") return;
    setHistory((items) => [...items, copyPlateState(state)].slice(-24));
    setState(createPlateState(plate));
    setSelectedId(null);
    setMoves((value) => value + 1);
    setPhase("play");
    setScore(0);
    startTimeRef.current = performance.now();
    audio.play("reset");
  };

  const hint = () => {
    if (phase !== "play") return;
    setHistory((items) => [...items, copyPlateState(state)].slice(-24));
    setState(applyPlateHint(plate, state));
    setHints((value) => value + 1);
    setMoves((value) => value + 1);
    audio.play("select");
  };

  const next = () => {
    const nextIndex = Math.min(LUMEN_PLATES.length - 1, plateIndex + 1);
    beginPlate(nextIndex);
  };

  const status =
    phase === "intro"
      ? "Awaiting visitor"
      : phase === "complete"
        ? `Archived · ${score} pts`
        : selectedDefinition
          ? `${selectedDefinition.label} selected`
          : `${lit}/${plate.targets.length} receivers lit`;

  const instructions =
    phase === "intro"
      ? "Five optical plates"
      : phase === "complete"
        ? plateIndex === LUMEN_PLATES.length - 1
          ? "Cabinet complete"
          : "Continue to the next plate"
        : selectedDefinition?.movable
          ? "Drag or use arrow keys"
          : selectedDefinition?.rotatable
            ? "Drag around it or use [ and ]"
            : "Select an optical instrument";

  return (
    <ExhibitFrame
      accession="Collection 02"
      title="Lumen Cabinet"
      subtitle={plate.subtitle}
      progress={`Plate ${plate.numeral} of V · ${progress.completed.length} archived`}
      status={status}
      instructions={instructions}
      soundEnabled={audio.enabled}
      onToggleSound={audio.toggle}
      state={phase}
      toolbar={
        <>
          <ToolButton onClick={undo} disabled={!history.length || phase !== "play"}>
            Undo
          </ToolButton>
          <ToolButton onClick={hint} disabled={phase !== "play"}>
            Hint {hints ? `· ${hints}` : ""}
          </ToolButton>
          <ToolButton onClick={reset} disabled={phase === "intro"}>
            Reset
          </ToolButton>
        </>
      }
    >
      <div className="relative">
        <LumenCanvas
          plate={plate}
          state={state}
          trace={trace}
          selectedId={selectedId}
          solved={phase === "complete"}
          onSelect={setSelectedId}
          onChange={setState}
          onCommit={(before) => {
            setHistory((items) => [...items, copyPlateState(before)].slice(-24));
            setMoves((value) => value + 1);
          }}
          onActivity={(kind) => audio.play(kind)}
        />

        {phase === "intro" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#0b0e0d]/70 px-6 text-center backdrop-blur-[3px]">
            <div className="max-w-sm">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-[#8fb5a8]">
                Light as material
              </p>
              <h4 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-[#f1eee6] sm:text-5xl">
                Lumen Cabinet
              </h4>
              <p className="mx-auto mt-4 max-w-[29rem] font-body text-sm leading-relaxed text-[#b3afa5] sm:text-base">
                A five-plate instrument for reflection, refraction, color, and synthesis.
                Touch the apparatus. Teach the light where to go.
              </p>
              <button
                type="button"
                onClick={() => beginPlate()}
                className="mt-7 min-h-11 border border-[#8fb5a8] bg-[#8fb5a8] px-7 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#0b0e0d] transition-colors hover:bg-[#b1cdc3]"
                data-testid="lumen-begin"
              >
                Enter the cabinet
              </button>
            </div>
          </div>
        )}

        {phase === "complete" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#0b0e0d]/48 px-6 text-center backdrop-blur-[1.5px]">
            <div className="max-w-sm border border-white/15 bg-[#101615]/90 p-6 shadow-2xl sm:p-8">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.24em] text-[#8fb5a8]">
                Plate {plate.numeral} archived
              </p>
              <h4 className="mt-3 font-display text-3xl font-semibold text-[#f1eee6]">
                {plate.title}
              </h4>
              <div className="mx-auto mt-5 grid max-w-xs grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-3">
                <div>
                  <span className="block font-display text-xl text-[#f1eee6]">{score}</span>
                  <span className="font-mono text-[0.48rem] uppercase tracking-[0.14em] text-[#8d918b]">Score</span>
                </div>
                <div>
                  <span className="block font-display text-xl text-[#f1eee6]">{moves}</span>
                  <span className="font-mono text-[0.48rem] uppercase tracking-[0.14em] text-[#8d918b]">Moves</span>
                </div>
                <div>
                  <span className="block font-display text-xl text-[#f1eee6]">{accuracy}%</span>
                  <span className="font-mono text-[0.48rem] uppercase tracking-[0.14em] text-[#8d918b]">Register</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => beginPlate(plateIndex)}
                  className="min-h-10 border border-white/20 px-5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#c4c0b6] hover:border-white/45"
                >
                  Replay
                </button>
                {plateIndex < LUMEN_PLATES.length - 1 && (
                  <button
                    type="button"
                    onClick={next}
                    className="min-h-10 border border-[#8fb5a8] bg-[#8fb5a8] px-5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#0b0e0d] hover:bg-[#b1cdc3]"
                    data-testid="lumen-next"
                  >
                    Next plate
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <nav
        className="grid grid-cols-5 border-t border-white/10 bg-[#0a0d0c]"
        aria-label="Lumen plates"
      >
        {LUMEN_PLATES.map((item, index) => {
          const unlocked = index <= progress.unlocked;
          const complete = progress.completed.includes(item.id);
          const current = index === plateIndex;
          return (
            <button
              key={item.id}
              type="button"
              disabled={!unlocked}
              onClick={() => selectPlate(index)}
              aria-current={current ? "step" : undefined}
              className="group min-h-14 border-r border-white/10 px-2 text-left last:border-r-0 disabled:cursor-not-allowed disabled:opacity-25 sm:min-h-16 sm:px-3"
              data-testid={`lumen-plate-${index + 1}`}
            >
              <span
                className={`block font-mono text-[0.52rem] uppercase tracking-[0.16em] ${
                  current ? "text-[#b1cdc3]" : "text-[#6f756f]"
                }`}
              >
                {item.numeral} {complete ? "·" : ""}
              </span>
              <span className="mt-1 hidden truncate font-display text-sm text-[#d8d3c8] sm:block">
                {item.title}
              </span>
            </button>
          );
        })}
      </nav>
    </ExhibitFrame>
  );
}
