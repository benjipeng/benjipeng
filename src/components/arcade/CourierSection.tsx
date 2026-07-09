import CourierGame from "./CourierGame";

export default function CourierSection() {
  return (
    <section id="courier" className="relative border-t border-rule">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 55% at 25% 50%, rgba(196,120,74,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative section-pad py-20 sm:py-28 max-w-content mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 flex justify-center lg:justify-start">
            <div className="w-full max-w-[min(100%,540px)]">
              <CourierGame />
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-8 lg:items-end lg:text-right">
            <div>
              <p className="eyebrow mb-4">Night run</p>
              <h2 className="display text-3xl sm:text-4xl xl:text-5xl text-chalk mb-5">
                Courier
              </h2>
              <p className="font-body text-mist text-base sm:text-lg leading-relaxed max-w-md lg:ml-auto">
                Run the route. Jump over crates and pick up packages. Tap or
                press Space to jump.
              </p>
            </div>

            <ul className="space-y-3.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mist border-t border-rule pt-7 w-full max-w-md lg:ml-auto">
              <li className="flex gap-4 items-baseline lg:flex-row-reverse">
                <span className="text-oxide shrink-0">01</span>
                <span className="normal-case tracking-normal font-body text-sm text-mist">
                  Space or tap to jump
                </span>
              </li>
              <li className="flex gap-4 items-baseline lg:flex-row-reverse">
                <span className="text-oxide shrink-0">02</span>
                <span className="normal-case tracking-normal font-body text-sm text-mist">
                  Clear crates · collect packages
                </span>
              </li>
              <li className="flex gap-4 items-baseline lg:flex-row-reverse">
                <span className="text-oxide shrink-0">03</span>
                <span className="normal-case tracking-normal font-body text-sm text-mist">
                  One hit ends the run
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
