import OrbitalGame from "./OrbitalGame";

export default function OrbitalSection() {
  return (
    <section id="orbital" className="relative border-t border-rule bg-paper">
      <div className="section-pad py-24 sm:py-32 max-w-content mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.28em] text-mute uppercase mb-2">
                02
              </p>
              <p className="eyebrow mb-4 text-mark">Field study</p>
              <h2 className="font-display font-semibold text-3xl sm:text-4xl xl:text-5xl text-ink mb-5 tracking-[-0.02em]">
                Orbital
              </h2>
              <p className="font-body text-mute text-base sm:text-lg leading-relaxed max-w-md">
                Launch a probe into orbit. Drag to aim, release to fly. Complete
                full orbits without hitting the planet or flying off.
              </p>
            </div>

            <ul className="space-y-3.5 border-t border-rule pt-7">
              {[
                "Drag from the probe to set direction and power",
                "Release to launch — the path shows the orbit",
                "R resets · Esc returns to menu",
              ].map((line, i) => (
                <li key={line} className="flex gap-4 items-baseline">
                  <span className="font-mono text-[0.65rem] text-mark shrink-0">
                    0{i + 1}
                  </span>
                  <span className="font-body text-sm text-mute">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="w-full max-w-[min(100%,400px)]">
              <OrbitalGame />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
