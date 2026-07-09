type LogoProps = {
  className?: string;
  title?: string;
};

/** Inline BP mark — dual bars + signal wedge + oxide block. */
export function Logo({ className = "h-8 w-8", title = "Benji Peng" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <rect x="12" y="10" width="7" height="44" rx="1" className="fill-chalk" />
      <rect x="24" y="10" width="7" height="44" rx="1" className="fill-chalk" />
      <path d="M36 14h16l-8 14H36V14z" className="fill-signal" />
      <rect x="36" y="36" width="16" height="18" rx="1" className="fill-oxide" />
    </svg>
  );
}
