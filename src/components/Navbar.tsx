import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useTheme } from "../hooks/useTheme";

const LINKS = [
  { id: "about", label: "About" },
  { id: "lumen", label: "Lumen" },
  { id: "palimpsest", label: "Archive" },
] as const;

/**
 * Gallery wall bar — full bleed, hairline.
 * Day / night follows system; toggle forces light or dark.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);
  const { mode, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["home", ...LINKS.map((l) => l.id)];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.08, 0.25, 0.5] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = scrolled ? 52 : 64;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-out",
        scrolled ? "border-b border-rule" : "border-b border-transparent",
      ].join(" ")}
      style={{
        backgroundColor: scrolled ? "var(--nav-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(2px)" : undefined,
      }}
    >
      <div
        className={[
          "section-pad mx-auto max-w-content flex items-center justify-between gap-4 transition-[height] duration-500 ease-out",
          scrolled ? "h-[3.25rem]" : "h-16 sm:h-[4.25rem]",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => go("home")}
          className="flex items-center gap-3 group min-w-0"
          aria-label="Home"
        >
          <Logo
            className={[
              "shrink-0 transition-[width,height,opacity] duration-500",
              scrolled ? "h-6 w-6 opacity-90" : "h-7 w-7",
            ].join(" ")}
          />
          <span
            className={[
              "font-display font-semibold tracking-tight text-ink truncate transition-[font-size] duration-500",
              scrolled ? "text-base sm:text-lg" : "text-lg sm:text-xl",
            ].join(" ")}
          >
            Benji Peng
          </span>
        </button>

        <div className="flex items-center gap-6 lg:gap-8">
          <nav className="hidden md:block" aria-label="Primary">
            <ul className="flex items-center gap-8 lg:gap-10">
              {LINKS.map((link) => {
                const isOn = active === link.id;
                return (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => go(link.id)}
                      className={[
                        "relative font-body text-[0.8rem] tracking-[0.04em] transition-colors duration-300",
                        "after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-ink",
                        "after:transition-[width] after:duration-300 after:ease-out",
                        isOn
                          ? "text-ink after:w-full"
                          : "text-mute hover:text-ink after:w-0 hover:after:w-full",
                      ].join(" ")}
                    >
                      {link.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Single toggle — click switches day ↔ night */}
          <button
            type="button"
            onClick={toggle}
            className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mute hover:text-ink transition-colors py-2"
            aria-label={mode === "dark" ? "Switch to day" : "Switch to night"}
          >
            {mode === "dark" ? "Day" : "Night"}
          </button>

          <button
            type="button"
            className="md:hidden font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink py-2"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Index"}
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-px bg-ink origin-left transition-transform duration-150 ease-out"
        style={{
          width: "100%",
          transform: `scaleX(${progress})`,
          opacity: scrolled ? 0.35 : 0,
        }}
        aria-hidden
      />

      <div
        id="mobile-menu"
        className={[
          "md:hidden absolute inset-x-0 top-full border-b border-rule bg-paper transition-[opacity,visibility] duration-300",
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none",
        ].join(" ")}
      >
        <ul className="section-pad max-w-content mx-auto py-6 flex flex-col">
          <li>
            <button
              type="button"
              onClick={() => go("home")}
              className={[
                "w-full flex items-baseline justify-between py-4 border-t border-rule font-display text-2xl tracking-tight",
                active === "home" ? "text-ink" : "text-mute",
              ].join(" ")}
            >
              <span>Home</span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] text-mute">
                00
              </span>
            </button>
          </li>
          {LINKS.map((link, i) => (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => go(link.id)}
                className={[
                  "w-full flex items-baseline justify-between py-4 border-t border-rule font-display text-2xl tracking-tight last:border-b",
                  active === link.id ? "text-ink" : "text-mute",
                ].join(" ")}
              >
                <span>{link.label}</span>
                <span className="font-mono text-[0.6rem] tracking-[0.2em] text-mute">
                  0{i + 1}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
