import type { ReactNode } from "react";

type ExhibitFrameProps = {
  accession: string;
  title: string;
  subtitle: string;
  progress: string;
  status: string;
  instructions: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  toolbar?: ReactNode;
  children: ReactNode;
  state: string;
  accent?: "mark" | "clay";
};

export function ExhibitFrame({
  accession,
  title,
  subtitle,
  progress,
  status,
  instructions,
  soundEnabled,
  onToggleSound,
  toolbar,
  children,
  state,
  accent = "mark",
}: ExhibitFrameProps) {
  const accentClass = accent === "clay" ? "text-clay" : "text-mark";

  return (
    <article
      className="panel overflow-hidden shadow-soft"
      data-game-state={state}
      aria-label={`${title} interactive exhibit`}
    >
      <header className="grid grid-cols-[1fr_auto] gap-4 border-b border-rule bg-elev px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className={`shrink-0 whitespace-nowrap font-mono text-[0.55rem] uppercase tracking-[0.22em] ${accentClass}`}>
              {accession}
            </span>
            <span className="h-px w-5 shrink-0 bg-rule" />
            <span className="min-w-0 truncate font-mono text-[0.55rem] uppercase tracking-[0.16em] text-mute">
              {subtitle}
            </span>
          </div>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">
            {title}
          </h3>
        </div>

        <div className="flex items-start gap-2">
          <span className="hidden pt-1 text-right font-mono text-[0.55rem] uppercase tracking-[0.16em] text-mute sm:block">
            {progress}
          </span>
          <button
            type="button"
            onClick={onToggleSound}
            className="min-h-9 min-w-9 border border-rule bg-paper px-2 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-mute transition-colors hover:text-ink"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Mute exhibit sound" : "Enable exhibit sound"}
          >
            {soundEnabled ? "Mute" : "Sound"}
          </button>
        </div>
      </header>

      <div className="relative bg-[var(--void)]">{children}</div>

      <footer className="border-t border-rule bg-elev">
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <p
            className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-mute"
            aria-live="polite"
          >
            <span className={accentClass}>{status}</span>
            <span className="mx-2 text-rule">/</span>
            {instructions}
          </p>
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      </footer>
    </article>
  );
}

type ToolButtonProps = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  label?: string;
};

export function ToolButton({
  children,
  onClick,
  disabled,
  pressed,
  label,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      className="min-h-9 border border-rule bg-paper px-3 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-mute transition-[color,background-color,border-color] hover:border-mute hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 data-[pressed=true]:border-ink data-[pressed=true]:bg-ink data-[pressed=true]:text-paper"
      data-pressed={pressed}
    >
      {children}
    </button>
  );
}
