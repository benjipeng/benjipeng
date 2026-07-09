import CourierGame from "./CourierGame";

export default function CourierSection() {
  return (
    <section id="courier" className="relative border-t border-rule bg-elev">
      <div className="section-pad py-24 sm:py-32 max-w-content mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 flex justify-center lg:justify-start">
            <div className="w-full max-w-[min(100%,540px)]">
              <CourierGame />
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-8 lg:items-end lg:text-right">
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.28em] text-mute uppercase mb-2">
                03
              </p>
              <p className="eyebrow mb-4 text-clay">Night run</p>
              <h2 className="font-display font-semibold text-3xl sm:text-4xl xl:text-5xl text-ink mb-5 tracking-[-0.02em]">
                Courier
              </h2>
              <p className="font-body text-mute text-base sm:text-lg leading-relaxed max-w-md lg:ml-auto">
                Run the route. Jump over crates and pick up packages. Tap or
                press Space to jump.
              </p>
            </div>

            <ul className="space-y-3.5 border-t border-rule pt-7 w-full max-w-md lg:ml-auto">
              {[
                "Space or tap to jump",
                "Clear crates · collect packages",
                "One hit ends the run",
              ].map((line, i) => (
                <li
                  key={line}
                  className="flex gap-4 items-baseline lg:flex-row-reverse"
                >
                  <span className="font-mono text-[0.65rem] text-clay shrink-0">
                    0{i + 1}
                  </span>
                  <span className="font-body text-sm text-mute">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
