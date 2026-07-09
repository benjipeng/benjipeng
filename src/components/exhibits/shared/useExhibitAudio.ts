import { useCallback, useEffect, useRef, useState } from "react";

type Tone = "select" | "move" | "solve" | "reset";

const frequencies: Record<Tone, number[]> = {
  select: [220, 330],
  move: [174],
  solve: [261.63, 329.63, 392, 523.25],
  reset: [196, 146.83],
};

export function useExhibitAudio() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  const ensureContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }
    if (contextRef.current.state === "suspended") {
      void contextRef.current.resume();
    }
    return contextRef.current;
  }, []);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      if (next) ensureContext();
      return next;
    });
  }, [ensureContext]);

  const play = useCallback(
    (tone: Tone) => {
      if (!enabled) return;
      const context = ensureContext();
      const now = context.currentTime;
      frequencies[tone].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = tone === "move" ? "sine" : "triangle";
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0, now + index * 0.045);
        gain.gain.linearRampToValueAtTime(
          tone === "solve" ? 0.035 : 0.018,
          now + 0.012 + index * 0.045,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + 0.2 + index * 0.075,
        );
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + index * 0.045);
        oscillator.stop(now + 0.24 + index * 0.075);
      });
    },
    [enabled, ensureContext],
  );

  useEffect(
    () => () => {
      if (contextRef.current) void contextRef.current.close();
    },
    [],
  );

  return { enabled, toggle, play };
}
