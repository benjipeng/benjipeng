import { motion } from "framer-motion";
import { educationList, whoAmIData } from "@/utils";

const { fullName, profession, whoAmI, quote } = whoAmIData;
const phd = educationList[0];

const PHOTO =
  "https://res.cloudinary.com/aveg/image/upload/v1727985455/brutalist1_cp68e1.jpg";

const ease = [0.16, 1, 0.3, 1] as const;
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" },
  transition: { duration: 0.65, ease, delay },
});

/**
 * Museum wall — paper, ink, hairlines, original field photo.
 */
export default function About() {
  return (
    <section id="about" className="relative border-t border-rule">
      <div className="section-pad py-28 sm:py-36 max-w-content mx-auto">
        <div className="mb-16 sm:mb-20 grid grid-cols-12 gap-4 items-end">
          <motion.div {...reveal(0)} className="col-span-12 sm:col-span-2">
            <p className="font-mono text-[0.62rem] tracking-[0.28em] text-mute uppercase">
              01
            </p>
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-mark uppercase mt-1">
              About
            </p>
          </motion.div>

          <motion.div {...reveal(0.04)} className="col-span-12 sm:col-span-7">
            <h2 className="font-display font-semibold text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.92] tracking-[-0.025em] text-ink">
              {fullName}
            </h2>
          </motion.div>

          <motion.div
            {...reveal(0.06)}
            className="col-span-12 sm:col-span-3 sm:text-right sm:pb-2"
          >
            <p className="font-mono text-[0.65rem] tracking-[0.14em] text-mark leading-relaxed uppercase">
              {profession}
            </p>
          </motion.div>
        </div>

        <motion.div
          {...reveal(0.08)}
          className="mb-10 sm:mb-12 h-px w-full bg-rule"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-rule border border-rule rounded-sm overflow-hidden shadow-soft">
          <motion.article
            {...reveal(0.1)}
            className="lg:col-span-7 bg-elev p-8 sm:p-10 lg:p-12 flex flex-col justify-between gap-12 min-h-[280px]"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="eyebrow text-mark">Who I am</h3>
                <span className="font-mono text-[0.58rem] tracking-[0.22em] text-mute/60">
                  01.1
                </span>
              </div>
              <p className="font-body text-[1.1rem] sm:text-[1.3rem] leading-[1.7] text-ink max-w-[38ch]">
                {whoAmI}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {["AI", "Product", "Shipping"].map((t, i) => (
                <span
                  key={t}
                  className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-mute flex items-center gap-2"
                >
                  <span
                    className={
                      i === 0
                        ? "text-mark"
                        : i === 1
                          ? "text-clay"
                          : "text-ink/40"
                    }
                  >
                    —
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </motion.article>

          {/* Original field photo — restored */}
          <motion.div
            {...reveal(0.14)}
            className="lg:col-span-5 lg:row-span-2 relative min-h-[400px] lg:min-h-[540px] overflow-hidden bg-[#0a0b10]"
          >
            <img
              src={PHOTO}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90 grayscale contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/85">
                Field notes · studio & lab
              </p>
            </div>
          </motion.div>

          <motion.blockquote
            {...reveal(0.16)}
            className="lg:col-span-4 bg-elev p-8 sm:p-10 flex flex-col justify-between gap-10 min-h-[200px] relative"
          >
            <div className="absolute left-0 top-8 bottom-8 w-px bg-clay" />
            <div className="flex items-center justify-between pl-5">
              <p className="eyebrow text-clay">Principle</p>
              <span className="font-mono text-[0.58rem] tracking-[0.22em] text-mute/60">
                01.3
              </span>
            </div>
            <p className="font-display font-semibold text-[1.45rem] sm:text-[1.7rem] leading-[1.25] tracking-[-0.02em] text-ink pl-5">
              “{quote}”
            </p>
          </motion.blockquote>

          <motion.div
            {...reveal(0.18)}
            className="lg:col-span-3 bg-paper p-8 sm:p-10 flex flex-col justify-between gap-10 min-h-[200px]"
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow text-clay">Education</p>
              <span className="font-mono text-[0.58rem] tracking-[0.22em] text-mute/60">
                01.4
              </span>
            </div>
            <div>
              <p className="font-display font-semibold text-lg leading-snug tracking-tight text-ink">
                {phd.school}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-5 bg-mark/50" />
                <p className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-mark">
                  {phd.years}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          {...reveal(0.2)}
          className="mt-10 font-mono text-[0.58rem] tracking-[0.2em] uppercase text-mute/70"
        >
          AI products
        </motion.p>
      </div>
    </section>
  );
}
