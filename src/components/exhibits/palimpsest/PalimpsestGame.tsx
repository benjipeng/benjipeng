import { useEffect, useMemo, useRef, useState } from "react";

import { ExhibitFrame, ToolButton } from "../shared/ExhibitFrame.tsx";
import { useVersionedStorage } from "../shared/storage.ts";
import { useExhibitAudio } from "../shared/useExhibitAudio.ts";
import {
  applyWorkHint,
  copyWorkState,
  createWorkState,
  fragmentRegistration,
  snapFragment,
  workAccuracy,
  type FragmentState,
} from "./model.ts";
import PalimpsestCanvas from "./PalimpsestCanvas.tsx";
import { PALIMPSEST_WORKS } from "./works.ts";

type Phase = "intro" | "play" | "complete";

type ArchiveProgress = {
  unlocked: number;
  completed: string[];
  bestScores: Record<string, number>;
};

const STORAGE_KEY = "benji-palimpsest-archive";
const STORAGE_VERSION = 1;
const INITIAL_PROGRESS: ArchiveProgress = {
  unlocked: 0,
  completed: [],
  bestScores: {},
};

function isArchiveProgress(value: unknown): value is ArchiveProgress {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ArchiveProgress>;
  return (
    typeof item.unlocked === "number" &&
    Array.isArray(item.completed) &&
    item.completed.every((id) => typeof id === "string") &&
    Boolean(item.bestScores) &&
    typeof item.bestScores === "object"
  );
}

export default function PalimpsestGame() {
  const [progress, setProgress, hydrated] = useVersionedStorage(
    STORAGE_KEY,
    STORAGE_VERSION,
    INITIAL_PROGRESS,
    isArchiveProgress,
  );
  const [workIndex, setWorkIndex] = useState(0);
  const work = PALIMPSEST_WORKS[workIndex];
  const [state, setState] = useState<FragmentState[]>(() => createWorkState(PALIMPSEST_WORKS[0]));
  const [history, setHistory] = useState<FragmentState[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [inspecting, setInspecting] = useState(false);
  const [moves, setMoves] = useState(0);
  const [hints, setHints] = useState(0);
  const [score, setScore] = useState(0);
  const startTimeRef = useRef(0);
  const choseInitialWork = useRef(false);
  const audio = useExhibitAudio();

  const registrations = useMemo(() => {
    const states = new Map(state.map((item) => [item.id, item]));
    return work.fragments.map((definition) => {
      const fragment = states.get(definition.id);
      return {
        id: definition.id,
        registration: fragment ? fragmentRegistration(definition, fragment) : null,
      };
    });
  }, [state, work]);
  const placed = registrations.filter((item) => item.registration?.placed).length;
  const solved = placed === work.fragments.length;
  const accuracy = Math.round(workAccuracy(work, state) * 100);
  const selectedDefinition = work.fragments.find((item) => item.id === selectedId);
  const selectedState = state.find((item) => item.id === selectedId);

  useEffect(() => {
    if (!hydrated || choseInitialWork.current) return;
    choseInitialWork.current = true;
    const firstOpen = PALIMPSEST_WORKS.findIndex((item) => !progress.completed.includes(item.id));
    const nextIndex = firstOpen >= 0 ? Math.min(firstOpen, progress.unlocked) : progress.unlocked;
    setWorkIndex(nextIndex);
    setState(createWorkState(PALIMPSEST_WORKS[nextIndex]));
  }, [hydrated, progress.completed, progress.unlocked]);

  useEffect(() => {
    if (phase !== "play" || !solved) return;
    const elapsedSeconds = Math.max(0, (performance.now() - startTimeRef.current) / 1000);
    const nextScore = Math.max(160, Math.round(1800 - moves * 22 - hints * 90 - elapsedSeconds * 1.2));
    setScore(nextScore);
    setPhase("complete");
    setSelectedId(null);
    setInspecting(false);
    audio.play("solve");
    setProgress((current) => ({
      unlocked: Math.min(
        PALIMPSEST_WORKS.length - 1,
        Math.max(current.unlocked, workIndex + 1),
      ),
      completed: current.completed.includes(work.id)
        ? current.completed
        : [...current.completed, work.id],
      bestScores: {
        ...current.bestScores,
        [work.id]: Math.max(current.bestScores[work.id] ?? 0, nextScore),
      },
    }));
  }, [audio, hints, moves, phase, setProgress, solved, work.id, workIndex]);

  const beginWork = (index = workIndex) => {
    const nextWork = PALIMPSEST_WORKS[index];
    setWorkIndex(index);
    setState(createWorkState(nextWork));
    setHistory([]);
    setSelectedId(null);
    setMoves(0);
    setHints(0);
    setScore(0);
    setInspecting(true);
    startTimeRef.current = performance.now();
    setPhase("play");
  };

  const selectWork = (index: number) => {
    if (index > progress.unlocked) return;
    beginWork(index);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous || phase !== "play") return;
    setState(copyWorkState(previous));
    setHistory((items) => items.slice(0, -1));
    setSelectedId(null);
    setMoves((value) => value + 1);
    audio.play("reset");
  };

  const reset = () => {
    if (phase === "intro") return;
    setHistory((items) => [...items, copyWorkState(state)].slice(-32));
    setState(createWorkState(work));
    setSelectedId(null);
    setMoves((value) => value + 1);
    setHints(0);
    setScore(0);
    setInspecting(true);
    startTimeRef.current = performance.now();
    setPhase("play");
    audio.play("reset");
  };

  const hint = () => {
    if (phase !== "play") return;
    setHistory((items) => [...items, copyWorkState(state)].slice(-32));
    setState(applyWorkHint(work, state));
    setHints((value) => value + 1);
    setMoves((value) => value + 1);
    audio.play("select");
  };

  const adjustSelected = (update: (fragment: FragmentState) => FragmentState) => {
    if (!selectedId || phase !== "play") return;
    const before = copyWorkState(state);
    const adjusted = state.map((fragment) =>
      fragment.id === selectedId ? update(fragment) : { ...fragment },
    );
    setHistory((items) => [...items, before].slice(-32));
    setState(snapFragment(work, adjusted, selectedId));
    setMoves((value) => value + 1);
    audio.play("move");
  };

  const next = () => {
    beginWork(Math.min(PALIMPSEST_WORKS.length - 1, workIndex + 1));
  };

  const status =
    phase === "intro"
      ? "Archive closed"
      : phase === "complete"
        ? `Conserved · ${score} pts`
        : selectedDefinition && selectedState
          ? `${selectedDefinition.label} · plane ${selectedState.depth + 1}`
          : `${placed}/${work.fragments.length} fragments registered`;

  const instructions =
    phase === "intro"
      ? "Four works under glass"
      : phase === "complete"
        ? workIndex === PALIMPSEST_WORKS.length - 1
          ? "Archive complete"
          : "Proceed to the next work"
        : selectedDefinition
          ? "Drag · rotate · choose depth"
          : inspecting
            ? "Move across the table to rake the surface"
            : "Select a fragment";

  return (
    <ExhibitFrame
      accession="Collection 03"
      title="Palimpsest Archive"
      subtitle={work.subtitle}
      progress={`Work ${work.numeral} of IV · ${progress.completed.length} conserved`}
      status={status}
      instructions={instructions}
      soundEnabled={audio.enabled}
      onToggleSound={audio.toggle}
      state={phase}
      accent="clay"
      toolbar={
        <>
          <ToolButton onClick={undo} disabled={!history.length || phase !== "play"}>
            Undo
          </ToolButton>
          <ToolButton
            onClick={() => setInspecting((value) => !value)}
            disabled={phase !== "play"}
            pressed={inspecting}
            label={inspecting ? "Turn off raking light" : "Turn on raking light"}
          >
            Raking light
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
        <PalimpsestCanvas
          work={work}
          state={state}
          selectedId={selectedId}
          inspecting={inspecting}
          solved={phase === "complete"}
          onSelect={setSelectedId}
          onChange={setState}
          onCommit={(before) => {
            setHistory((items) => [...items, copyWorkState(before)].slice(-32));
            setMoves((value) => value + 1);
          }}
          onActivity={(kind) => audio.play(kind)}
        />

        {phase === "intro" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#110e0c]/72 px-6 text-center backdrop-blur-[3px]">
            <div className="max-w-md">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-[#c48972]">
                Memory as material
              </p>
              <h4 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-[#f1eee6] sm:text-5xl">
                Palimpsest Archive
              </h4>
              <p className="mx-auto mt-4 max-w-[31rem] font-body text-sm leading-relaxed text-[#b3afa5] sm:text-base">
                Four fragmented works. Read their edges under raking light, restore their
                depth, and return each composition to motion.
              </p>
              <button
                type="button"
                onClick={() => beginWork()}
                className="mt-7 min-h-11 border border-[#c48972] bg-[#c48972] px-7 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#130e0c] transition-colors hover:bg-[#d9a08a]"
                data-testid="palimpsest-begin"
              >
                Open the archive
              </button>
            </div>
          </div>
        )}

        {phase === "complete" && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#110e0c]/46 px-6 text-center backdrop-blur-[1.5px]">
            <div className="max-w-sm border border-white/15 bg-[#17110e]/92 p-6 shadow-2xl sm:p-8">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.24em] text-[#c48972]">
                Work {work.numeral} conserved
              </p>
              <h4 className="mt-3 font-display text-3xl font-semibold text-[#f1eee6]">
                {work.title}
              </h4>
              <div className="mx-auto mt-5 grid max-w-xs grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-3">
                <div>
                  <span className="block font-display text-xl text-[#f1eee6]">{score}</span>
                  <span className="font-mono text-[0.48rem] uppercase tracking-[0.14em] text-[#918980]">Score</span>
                </div>
                <div>
                  <span className="block font-display text-xl text-[#f1eee6]">{moves}</span>
                  <span className="font-mono text-[0.48rem] uppercase tracking-[0.14em] text-[#918980]">Actions</span>
                </div>
                <div>
                  <span className="block font-display text-xl text-[#f1eee6]">{accuracy}%</span>
                  <span className="font-mono text-[0.48rem] uppercase tracking-[0.14em] text-[#918980]">Register</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => beginWork(workIndex)}
                  className="min-h-10 border border-white/20 px-5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#c4c0b6] hover:border-white/45"
                >
                  Restore again
                </button>
                {workIndex < PALIMPSEST_WORKS.length - 1 && (
                  <button
                    type="button"
                    onClick={next}
                    className="min-h-10 border border-[#c48972] bg-[#c48972] px-5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[#130e0c] hover:bg-[#d9a08a]"
                    data-testid="palimpsest-next"
                  >
                    Next work
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {phase === "play" && (
        <div className="border-t border-white/10 bg-[#100d0b]">
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-4">
            <span className="mr-1 shrink-0 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-white/30">
              Leaves
            </span>
            {work.fragments.map((fragment) => {
              const registration = registrations.find((item) => item.id === fragment.id)?.registration;
              return (
                <button
                  key={fragment.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(fragment.id);
                    audio.play("select");
                  }}
                  className={`min-h-9 shrink-0 border px-3 font-mono text-[0.52rem] uppercase tracking-[0.13em] transition-colors ${
                    selectedId === fragment.id
                      ? "border-[#c48972] bg-[#c48972] text-[#150e0b]"
                      : registration?.placed
                        ? "border-[#769b8e]/50 text-[#9fc2b6]"
                        : "border-white/10 text-white/45 hover:border-white/30"
                  }`}
                  data-testid={`palimpsest-fragment-${fragment.id}`}
                >
                  {fragment.label} {registration?.placed ? "·" : ""}
                </button>
              );
            })}
            <span className="ml-auto shrink-0 pl-2 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-white/30">
              {accuracy}% register
            </span>
          </div>

          <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2 sm:px-4">
            <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/35">
              {selectedDefinition && selectedState
                ? `${selectedDefinition.material} / plane ${selectedState.depth + 1}`
                : "Select a leaf to adjust its rotation and plane"}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustSelected((fragment) => ({ ...fragment, angle: fragment.angle - 0.1 }))}
                disabled={!selectedId}
                className="min-h-9 border border-white/10 px-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-white/55 hover:border-white/30 disabled:opacity-25"
                aria-label="Rotate selected fragment counterclockwise"
              >
                Rotate −
              </button>
              <button
                type="button"
                onClick={() => adjustSelected((fragment) => ({ ...fragment, angle: fragment.angle + 0.1 }))}
                disabled={!selectedId}
                className="min-h-9 border border-white/10 px-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-white/55 hover:border-white/30 disabled:opacity-25"
                aria-label="Rotate selected fragment clockwise"
              >
                Rotate +
              </button>
              <button
                type="button"
                onClick={() =>
                  adjustSelected((fragment) => ({ ...fragment, depth: (fragment.depth + 1) % 3 }))
                }
                disabled={!selectedId}
                className="min-h-9 border border-white/10 px-3 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-white/55 hover:border-white/30 disabled:opacity-25"
                aria-label="Move selected fragment to the next depth plane"
              >
                Next plane
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        className="grid grid-cols-4 border-t border-white/10 bg-[#0d0b0a]"
        aria-label="Palimpsest works"
      >
        {PALIMPSEST_WORKS.map((item, index) => {
          const unlocked = index <= progress.unlocked;
          const complete = progress.completed.includes(item.id);
          const current = index === workIndex;
          return (
            <button
              key={item.id}
              type="button"
              disabled={!unlocked}
              onClick={() => selectWork(index)}
              aria-current={current ? "step" : undefined}
              className="min-h-14 border-r border-white/10 px-2 text-left last:border-r-0 disabled:cursor-not-allowed disabled:opacity-25 sm:min-h-16 sm:px-3"
              data-testid={`palimpsest-work-${index + 1}`}
            >
              <span
                className={`block font-mono text-[0.52rem] uppercase tracking-[0.16em] ${
                  current ? "text-[#d9a08a]" : "text-[#746b65]"
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
