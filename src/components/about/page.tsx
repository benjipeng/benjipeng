import { motion } from "framer-motion";
import { educationList, whoAmIData } from "@/utils";
import DualField from "./DualField";
import {
  CredentialSeal,
  HeaderRule,
  MarkBuild,
  MarkOpen,
  MarkScience,
  MethodRings,
  WhoLattice,
} from "./FieldMarks";

const { fullName, profession, whoAmI, quote } = whoAmIData;
const phd = educationList[0];

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.45, ease },
};

const poles = [
  {
    key: "methods",
    label: "Methods",
    blurb: "What holds under scrutiny",
    Mark: MarkScience,
    accent: "text-signal",
  },
  {
    key: "systems",
    label: "Systems",
    blurb: "What people can actually run",
    Mark: MarkBuild,
    accent: "text-oxide",
  },
  {
    key: "open",
    label: "Open tools",
    blurb: "Labs, operators, shared work",
    Mark: MarkOpen,
    accent: "text-chalk",
  },
] as const;

/**
 * Bento with a full field of animated marks:
 *
 *  ┌──────────────────────┬────────────┐
 *  │ Who I am + lattice   │            │
 *  ├───────────┬──────────┤ DualField  │
 *  │ Quote+ring│ PhD+seal │            │
 *  ├───────────┴────┬─────┴────────────┤
 *  │ Science │ Build │ Open            │
 *  └─────────┴───────┴─────────────────┘
 */
export default function About() {
  return (
    <section
      id="about"
      className="section-pad py-24 sm:py-32 max-w-content mx-auto"
    >
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow text-oxide mb-3">About</p>
          <h2 className="display text-4xl sm:text-5xl md:text-6xl">{fullName}</h2>
        </div>
        <p className="font-mono text-sm text-signal tracking-wide">{profession}</p>
      </div>

      <HeaderRule className="w-full h-3 mb-10 sm:mb-12 opacity-90" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        {/* Who I am */}
        <motion.article
          {...fade}
          className="panel md:col-span-7 relative overflow-hidden p-6 sm:p-8 flex flex-col justify-between min-h-[220px]"
        >
          <WhoLattice className="pointer-events-none absolute right-0 bottom-0 w-[70%] max-w-[280px] h-auto opacity-80" />
          <div className="relative z-[1]">
            <h3 className="eyebrow mb-5 text-signal">Who I am</h3>
            <p className="font-body text-lg sm:text-xl leading-relaxed text-chalk/95 max-w-xl">
              {whoAmI}
            </p>
          </div>
        </motion.article>

        {/* Tall dual field */}
        <motion.div
          {...fade}
          transition={{ ...fade.transition, delay: 0.05 }}
          className="panel md:col-span-5 md:row-span-2 relative overflow-hidden min-h-[320px] md:min-h-full bg-[#0a0b10]"
        >
          <DualField />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04] rounded-[inherit]" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-[#0a0b10]/95 via-[#0a0b10]/45 to-transparent pt-16">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-chalk/80">
              Field notes · studio & lab
            </p>
          </div>
        </motion.div>

        {/* Principle + method rings */}
        <motion.blockquote
          {...fade}
          transition={{ ...fade.transition, delay: 0.08 }}
          className="panel md:col-span-4 relative overflow-hidden p-6 sm:p-7 flex flex-col justify-between gap-5 border-l-2 border-l-oxide min-h-[180px]"
        >
          <MethodRings className="pointer-events-none absolute -right-6 -bottom-8 w-44 h-44 opacity-70" />
          <p className="eyebrow text-oxide relative z-[1]">Principle</p>
          <p className="display text-xl sm:text-2xl leading-snug text-chalk relative z-[1]">
            “{quote}”
          </p>
        </motion.blockquote>

        {/* Education + seal */}
        <motion.div
          {...fade}
          transition={{ ...fade.transition, delay: 0.1 }}
          className="panel md:col-span-3 relative overflow-hidden p-5 sm:p-6 flex flex-col min-h-[180px]"
        >
          <h3 className="eyebrow text-oxide relative z-[1]">Education</h3>
          <div className="relative z-[1] flex-1 flex flex-col items-center justify-center py-2">
            <CredentialSeal className="w-28 h-28 sm:w-32 sm:h-32" />
          </div>
          <div className="relative z-[1] text-center">
            <p className="font-display font-semibold text-sm sm:text-base text-chalk leading-snug">
              {phd.school}
            </p>
            <p className="font-mono text-[0.65rem] text-signal mt-2 tracking-wide">
              {phd.years}
            </p>
          </div>
        </motion.div>

        {/* Three pole marks — full width under the main bento */}
        {poles.map(({ key, label, blurb, Mark, accent }, i) => (
          <motion.div
            key={key}
            {...fade}
            transition={{ ...fade.transition, delay: 0.12 + i * 0.04 }}
            className="panel md:col-span-4 p-5 sm:p-6 flex flex-col gap-3 min-h-[160px]"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className={`eyebrow ${accent}`}>{label}</p>
              <span className="font-mono text-[0.6rem] text-mist/60 tracking-widest">
                0{i + 1}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center py-1">
              <Mark className="w-full max-w-[200px] h-[100px]" />
            </div>
            <p className="font-body text-sm text-mist leading-snug">{blurb}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
