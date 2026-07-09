import { motion } from "framer-motion";

import PalimpsestGame from "./palimpsest/PalimpsestGame.tsx";

const ease = [0.16, 1, 0.3, 1] as const;
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-6% 0px" },
  transition: { duration: 0.62, ease, delay },
});

function MaterialSwatch({
  name,
  number,
  className,
}: {
  name: string;
  number: string;
  className: string;
}) {
  return (
    <div className="group flex items-center gap-4 border-t border-rule py-3 first:border-t-0">
      <span className={`h-8 w-8 shrink-0 border border-black/10 shadow-sm ${className}`} />
      <div className="min-w-0 flex-1">
        <p className="font-body text-sm text-ink">{name}</p>
        <p className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-mute">
          Layer {number}
        </p>
      </div>
      <span className="font-display text-lg text-mute/35 transition-colors group-hover:text-clay">↗</span>
    </div>
  );
}

export default function PalimpsestSection() {
  return (
    <section id="palimpsest" className="relative border-t border-rule bg-elev">
      <div className="section-pad mx-auto max-w-content py-24 sm:py-32 lg:py-36">
        <div className="mb-12 grid grid-cols-12 items-end gap-x-4 gap-y-7 sm:mb-16">
          <motion.div {...reveal()} className="col-span-12 sm:col-span-2">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-mute">
              03
            </p>
            <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-clay">
              Material memory
            </p>
          </motion.div>
          <motion.div {...reveal(0.04)} className="col-span-12 sm:col-span-6">
            <h2 className="font-display text-[clamp(2.9rem,7vw,5.6rem)] font-semibold leading-[0.86] tracking-[-0.035em] text-ink">
              Palimpsest
              <span className="block text-ink/55">Archive</span>
            </h2>
          </motion.div>
          <motion.div {...reveal(0.08)} className="col-span-12 sm:col-span-4 sm:pb-1">
            <p className="max-w-md font-body text-base leading-relaxed text-mute sm:ml-auto sm:text-lg">
              Four broken works held in suspended time. Read the surface, restore the
              layers, and return each composition to motion.
            </p>
          </motion.div>
        </div>

        <motion.div {...reveal(0.1)} className="mb-6 h-px bg-rule" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
          <aside className="order-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-1 lg:col-span-4 lg:grid-cols-1 xl:col-span-3">
            <motion.blockquote
              {...reveal(0.16)}
              className="panel relative min-h-56 overflow-hidden bg-clay p-6 text-paper sm:p-7"
            >
              <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-10 translate-y-10 rotate-12 border border-paper/15" />
              <div className="absolute bottom-10 right-10 h-20 w-20 -rotate-6 border border-paper/15" />
              <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-paper/65">
                Conservation premise
              </p>
              <p className="relative mt-10 max-w-[15rem] font-display text-2xl font-semibold leading-tight tracking-[-0.02em]">
                A fragment is not damage. It is evidence with an edge.
              </p>
            </motion.blockquote>

            <motion.article {...reveal(0.2)} className="panel bg-paper p-6 sm:p-7">
              <div className="flex items-start justify-between">
                <p className="eyebrow text-clay">Material register</p>
                <span className="font-mono text-[0.52rem] text-mute/60">03.2</span>
              </div>
              <div className="mt-7">
                <MaterialSwatch name="Carbon transfer" number="01" className="bg-[#292825]" />
                <MaterialSwatch name="Oxide pigment" number="02" className="bg-[#99553d]" />
                <MaterialSwatch name="Verdigris wash" number="03" className="bg-[#426f61]" />
                <MaterialSwatch name="Vellum ground" number="04" className="bg-[#d8ccb2]" />
              </div>
            </motion.article>

            <motion.article
              {...reveal(0.24)}
              className="panel grid min-h-36 grid-cols-3 divide-x divide-rule bg-elev"
            >
              {[
                ["04", "Works"],
                ["26", "Leaves"],
                ["03", "Planes"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col items-center justify-center px-2 text-center">
                  <span className="font-display text-2xl font-semibold text-ink">{value}</span>
                  <span className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-mute">
                    {label}
                  </span>
                </div>
              ))}
            </motion.article>

            <motion.article
              {...reveal(0.28)}
              className="panel flex min-h-44 flex-col justify-between p-6 sm:p-7"
            >
              <div className="flex items-start justify-between">
                <p className="eyebrow text-clay">Conservation tools</p>
                <span className="font-mono text-[0.52rem] text-mute/60">03.4</span>
              </div>
              <p className="mt-8 font-body text-sm leading-relaxed text-mute">
                Raking light reveals registration ghosts. Rotation restores the cut.
                Depth returns each surface to its correct plane.
              </p>
            </motion.article>
          </aside>

          <motion.div
            {...reveal(0.12)}
            className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9"
          >
            <PalimpsestGame />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
