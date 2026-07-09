import { Logo } from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-rule section-pad py-10">
      <div className="max-w-content mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo className="h-7 w-7" />
          <div>
            <p className="font-display font-semibold text-sm text-chalk">
              Benji Peng
            </p>
            <p className="font-mono text-[0.65rem] text-mist tracking-wide">
              Scientist · Entrepreneur
            </p>
          </div>
        </div>
        <p className="font-mono text-[0.65rem] text-mist">
          © {year} · Built with intention
        </p>
      </div>
    </footer>
  );
}
