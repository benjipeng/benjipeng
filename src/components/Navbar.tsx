import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "orbital", label: "Orbital" },
  { id: "courier", label: "Courier" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 32);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = scrolled ? 56 : 72;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[padding,background,box-shadow] duration-300",
        scrolled ? "pt-2 px-3 sm:px-4" : "pt-3 px-3 sm:px-5",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto max-w-content transition-all duration-300 border",
          scrolled
            ? "bg-slate-elev/90 backdrop-blur-md border-rule shadow-nav rounded-lg"
            : "bg-graphite/30 backdrop-blur-sm border-transparent rounded-xl",
        ].join(" ")}
      >
        <nav
          className={[
            "flex items-center justify-between gap-4 px-4 transition-[height] duration-300",
            scrolled ? "h-12" : "h-14 sm:h-16",
          ].join(" ")}
          aria-label="Primary"
        >
          <button
            type="button"
            onClick={() => go("home")}
            className="flex items-center gap-2.5 group"
          >
            <Logo className="h-8 w-8 shrink-0" />
            <span className="display text-sm sm:text-base tracking-tight group-hover:text-oxide transition-colors">
              Benji Peng
            </span>
          </button>

          <ul className="hidden md:flex items-center gap-1">
            {LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => go(link.id)}
                  className={[
                    "px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] transition-colors",
                    active === link.id
                      ? "text-signal"
                      : "text-mist hover:text-chalk",
                  ].join(" ")}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="md:hidden p-2 text-chalk"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
            <span className="sr-only">Menu</span>
          </button>
        </nav>

        {/* scroll progress */}
        <div className="h-0.5 w-full bg-rule/60 overflow-hidden rounded-b-lg">
          <div
            className="h-full bg-gradient-to-r from-signal to-oxide origin-left transition-transform duration-150"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>

        {open && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-rule px-4 py-4 bg-slate-elev"
          >
            <ul className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => go(link.id)}
                    className={[
                      "w-full text-left py-3 font-mono text-xs uppercase tracking-[0.16em]",
                      active === link.id ? "text-signal" : "text-chalk",
                    ].join(" ")}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
