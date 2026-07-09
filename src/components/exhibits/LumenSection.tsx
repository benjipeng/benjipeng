import { motion } from "framer-motion";

import LumenGame from "./lumen/LumenGame.tsx";

const ease = [0.16, 1, 0.3, 1] as const;
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-6% 0px" },
  transition: { duration: 0.62, ease, delay },
});

function SpectrumCard() {
  return (
    <div className="relative min-h-44 overflow-hidden bg-[#0c1110] p-6 sm:min-h-52">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:24px_24px]" />
      <svg
        viewBox="0 0 320 160"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="spectrum-warm" x1="0" x2="1">
            <stop offset="0" stopColor="#e9e3d3" stopOpacity=".3" />
            <stop offset="1" stopColor="#c87958" stopOpacity=".9" />
          </linearGradient>
          <linearGradient id="spectrum-cool" x1="0" x2="1">
            <stop offset="0" stopColor="#e9e3d3" stopOpacity=".3" />
            <stop offset="1" stopColor="#7ebed0" stopOpacity=".9" />
          </linearGradient>
          <filter id="spectrum-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M28 80H145" stroke="#e9e3d3" strokeOpacity=".65" />
        <path d="M145 80L285 35" stroke="url(#spectrum-cool)" filter="url(#spectrum-glow)" />
        <path d="M145 80L285 125" stroke="url(#spectrum-warm)" filter="url(#spectrum-glow)" />
        <path d="M145 50L174 105H116Z" fill="#d9ece7" fillOpacity=".08" stroke="#e9e3d3" strokeOpacity=".38" />
        <circle cx="287" cy="35" r="9" fill="none" stroke="#7ebed0" strokeOpacity=".68" />
        <circle cx="287" cy="125" r="9" fill="none" stroke="#c87958" strokeOpacity=".68" />
      </svg>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-white/45">
          Division study
        </p>
        <p className="mt-24 max-w-[15rem] font-display text-xl font-semibold leading-tight text-[#eee8d9]">
          Light becomes visible when it is asked to choose.
        </p>
      </div>
    </div>
  );
}

export default function LumenSection() {
  return (
    <section id="lumen" className="relative border-t border-rule bg-paper">
      <div className="section-pad mx-auto max-w-content py-24 sm:py-32 lg:py-36">
        <div className="mb-12 grid grid-cols-12 items-end gap-x-4 gap-y-7 sm:mb-16">
          <motion.div {...reveal()} className="col-span-12 sm:col-span-2">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-mute">
              02
            </p>
            <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mark">
              Light studies
            </p>
          </motion.div>
          <motion.div {...reveal(0.04)} className="col-span-12 sm:col-span-6">
            <h2 className="font-display text-[clamp(2.9rem,7vw,5.6rem)] font-semibold leading-[0.86] tracking-[-0.035em] text-ink">
              Lumen
              <span className="block text-ink/55">Cabinet</span>
            </h2>
          </motion.div>
          <motion.div {...reveal(0.08)} className="col-span-12 sm:col-span-4 sm:pb-1">
            <p className="max-w-md font-body text-base leading-relaxed text-mute sm:ml-auto sm:text-lg">
              A playable optical collection. Turn mirrors, tune lenses, divide color, and
              resolve five instruments into living light.
            </p>
          </motion.div>
        </div>

        <motion.div {...reveal(0.1)} className="mb-6 h-px bg-rule" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
          <motion.div {...reveal(0.12)} className="lg:col-span-8 xl:col-span-9">
            <LumenGame />
          </motion.div>

          <aside className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 xl:col-span-3">
            <motion.article
              {...reveal(0.16)}
              className="panel flex min-h-52 flex-col justify-between p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow text-mark">Visitor protocol</p>
                <span className="font-mono text-[0.54rem] tracking-[0.16em] text-mute/60">
                  02.1
                </span>
              </div>
              <ol className="mt-10 space-y-4">
                {[
                  "Select an instrument",
                  "Drag to move or turn",
                  "Hold every receiver",
                ].map((item, index) => (
                  <li key={item} className="flex items-baseline gap-3 border-t border-rule pt-3">
                    <span className="font-mono text-[0.55rem] text-mark">0{index + 1}</span>
                    <span className="font-body text-sm text-mute">{item}</span>
                  </li>
                ))}
              </ol>
            </motion.article>

            <motion.div {...reveal(0.2)} className="panel overflow-hidden">
              <SpectrumCard />
            </motion.div>

            <motion.article
              {...reveal(0.24)}
              className="panel grid min-h-36 grid-cols-3 divide-x divide-rule bg-elev"
            >
              {[
                ["05", "Plates"],
                ["5–10", "Minutes"],
                ["Local", "Archive"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col items-center justify-center px-2 text-center">
                  <span className="font-display text-2xl font-semibold text-ink">{value}</span>
                  <span className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.15em] text-mute">
                    {label}
                  </span>
                </div>
              ))}
            </motion.article>

            <motion.blockquote
              {...reveal(0.28)}
              className="panel relative min-h-44 overflow-hidden bg-mark p-6 text-paper sm:p-7"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10" />
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/10" />
              <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-paper/60">
                Curator's note
              </p>
              <p className="relative mt-8 font-display text-2xl font-semibold leading-tight tracking-[-0.02em]">
                Precision is not sterility. It is attention made visible.
              </p>
            </motion.blockquote>
          </aside>
        </div>
      </div>
    </section>
  );
}
