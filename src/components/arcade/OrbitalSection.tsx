import OrbitalGame from "./OrbitalGame";

export default function OrbitalSection() {
  return (
    <section id="orbital" className="relative border-t border-rule">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 75% 45%, rgba(184,240,0,0.035) 0%, transparent 60%)",
        }}
      />

      <div className="relative section-pad py-20 sm:py-28 max-w-content mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <p className="eyebrow mb-4">Field study</p>
              <h2 className="display text-3xl sm:text-4xl xl:text-5xl text-chalk mb-5">
                Orbital
              </h2>
              <p className="font-body text-mist text-base sm:text-lg leading-relaxed max-w-md">
                Launch a probe into orbit. Drag to aim, release to fly. Complete
                full orbits without hitting the planet or flying off.
              </p>
            </div>

            <ul className="space-y-3.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mist border-t border-rule pt-7">
              <li className="flex gap-4 items-baseline">
                <span className="text-signal shrink-0">01</span>
                <span className="normal-case tracking-normal font-body text-sm text-mist">
                  Drag from the probe to set direction and power
                </span>
              </li>
              <li className="flex gap-4 items-baseline">
                <span className="text-signal shrink-0">02</span>
                <span className="normal-case tracking-normal font-body text-sm text-mist">
                  Release to launch — the path shows the orbit
                </span>
              </li>
              <li className="flex gap-4 items-baseline">
                <span className="text-signal shrink-0">03</span>
                <span className="normal-case tracking-normal font-body text-sm text-mist">
                  R resets · Esc returns to menu
                </span>
              </li>
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
