/**
 * Suite of small animated SVG marks for the About bento.
 * Each uses unique gradient/filter ids so they can sit on one page.
 */

const reduced = `
  @media (prefers-reduced-motion: reduce) {
    .fm-anim { animation: none !important; }
  }
`;

/** Soft lattice / interference — sits behind Who I am */
export function WhoLattice({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 280 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="xMaxYMax meet"
    >
      <style>{`
        .wl-draw { stroke-dasharray: 4 8; animation: wl-d 22s linear infinite; }
        .wl-pulse { animation: wl-p 3.8s ease-in-out infinite; }
        @keyframes wl-d { to { stroke-dashoffset: -120; } }
        @keyframes wl-p { 0%,100%{opacity:.25} 50%{opacity:.85} }
        ${reduced.replace(/fm-anim/g, "wl-draw, .wl-pulse")}
      `}</style>
      <defs>
        <linearGradient id="wl-fade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8F000" stopOpacity="0" />
          <stop offset="50%" stopColor="#B8F000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C4784A" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#wl-fade)" strokeWidth="0.8">
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={i}
            className="wl-draw"
            d={`M${20 + i * 12},160 Q${100 + i * 18},80 ${260},${10 + i * 14}`}
            opacity={0.35 + i * 0.06}
          />
        ))}
      </g>
      <circle cx="220" cy="40" r="3" fill="#B8F000" className="wl-pulse" />
      <circle cx="248" cy="72" r="2" fill="#C4784A" className="wl-pulse" opacity="0.8" />
      <circle cx="190" cy="88" r="1.5" fill="#E6E1D6" opacity="0.4" />
    </svg>
  );
}

/** Concentric method rings — Principle / quote tile */
export function MethodRings({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <style>{`
        .mr-spin { transform-origin: 100px 100px; animation: mr-s 36s linear infinite; }
        .mr-spin-r { transform-origin: 100px 100px; animation: mr-s 52s linear infinite reverse; }
        .mr-dash { stroke-dasharray: 3 7; animation: mr-d 14s linear infinite; }
        .mr-glow { animation: mr-g 4s ease-in-out infinite; }
        @keyframes mr-s { to { transform: rotate(360deg); } }
        @keyframes mr-d { to { stroke-dashoffset: -100; } }
        @keyframes mr-g { 0%,100%{opacity:.3} 50%{opacity:.9} }
        ${reduced.replace(/fm-anim/g, "mr-spin, .mr-spin-r, .mr-dash, .mr-glow")}
      `}</style>
      <defs>
        <radialGradient id="mr-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1c1f2a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#12141a" stopOpacity="0" />
        </radialGradient>
        <filter id="mr-f" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#mr-bg)" />
      <g className="mr-spin" fill="none">
        <circle
          cx="100"
          cy="100"
          r="72"
          stroke="#C4784A"
          strokeWidth="0.8"
          opacity="0.35"
          className="mr-dash"
        />
        <circle cx="172" cy="100" r="2.5" fill="#C4784A" className="mr-glow" filter="url(#mr-f)" />
      </g>
      <g className="mr-spin-r" fill="none">
        <circle
          cx="100"
          cy="100"
          r="48"
          stroke="#B8F000"
          strokeWidth="0.9"
          opacity="0.4"
          className="mr-dash"
        />
        <circle cx="148" cy="100" r="2" fill="#B8F000" className="mr-glow" filter="url(#mr-f)" />
      </g>
      <circle cx="100" cy="100" r="8" fill="none" stroke="#E6E1D6" strokeWidth="1" opacity="0.35" />
      <circle cx="100" cy="100" r="3" fill="#B8F000" className="mr-glow" filter="url(#mr-f)" />
    </svg>
  );
}

/** Academic seal — Education tile */
export function CredentialSeal({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        .cs-spin { transform-origin: 80px 80px; animation: cs-s 40s linear infinite; }
        .cs-pulse { animation: cs-p 3.2s ease-in-out infinite; }
        @keyframes cs-s { to { transform: rotate(360deg); } }
        @keyframes cs-p { 0%,100%{opacity:.45} 50%{opacity:1} }
        ${reduced.replace(/fm-anim/g, "cs-spin, .cs-pulse")}
      `}</style>
      <defs>
        <filter id="cs-g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* outer ring */}
      <circle
        cx="80"
        cy="80"
        r="62"
        fill="none"
        stroke="#2e3140"
        strokeWidth="1.5"
      />
      <circle
        cx="80"
        cy="80"
        r="54"
        fill="none"
        stroke="#B8F000"
        strokeWidth="0.7"
        opacity="0.45"
        strokeDasharray="2 4"
        className="cs-spin"
      />
      {/* diamond facets */}
      <g fill="none" stroke="#C4784A" strokeWidth="1" opacity="0.55">
        <path d="M80 28 L120 80 L80 132 L40 80 Z" />
        <path d="M80 44 L104 80 L80 116 L56 80 Z" opacity="0.7" />
      </g>
      {/* core */}
      <circle cx="80" cy="80" r="14" fill="#1c1f2a" stroke="#E6E1D6" strokeWidth="1" opacity="0.9" />
      <text
        x="80"
        y="84"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="11"
        fill="#B8F000"
        className="cs-pulse"
        filter="url(#cs-g)"
      >
        Φ
      </text>
      {/* tick marks */}
      <g stroke="#8b8790" strokeWidth="1" opacity="0.4">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = 80 + Math.cos(a) * 58;
          const y1 = 80 + Math.sin(a) * 58;
          const x2 = 80 + Math.cos(a) * 64;
          const y2 = 80 + Math.sin(a) * 64;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    </svg>
  );
}

/** Mini: science pole — orbiting node */
export function MarkScience({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Methods"
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        .ms-spin { transform-origin: 100px 58px; animation: ms-s 12s linear infinite; }
        .ms-pulse { animation: ms-p 2.8s ease-in-out infinite; }
        @keyframes ms-s { to { transform: rotate(360deg); } }
        @keyframes ms-p { 0%,100%{opacity:.4} 50%{opacity:1} }
        ${reduced.replace(/fm-anim/g, "ms-spin, .ms-pulse")}
      `}</style>
      <defs>
        <filter id="ms-g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path id="ms-path" d="M100,22 A52,36 0 1,1 99.9,22" fill="none" />
      </defs>
      <ellipse
        cx="100"
        cy="58"
        rx="52"
        ry="36"
        fill="none"
        stroke="#B8F000"
        strokeWidth="1"
        opacity="0.35"
        strokeDasharray="4 6"
      />
      <circle cx="100" cy="58" r="10" fill="#12141a" stroke="#B8F000" strokeWidth="1.2" opacity="0.9" />
      <circle cx="100" cy="58" r="3.5" fill="#B8F000" className="ms-pulse" filter="url(#ms-g)" />
      <g className="ms-spin">
        <circle cx="152" cy="58" r="3.5" fill="#B8F000" filter="url(#ms-g)" />
      </g>
      <circle r="2.5" fill="#E6E1D6" opacity="0.7">
        <animateMotion dur="8s" repeatCount="indefinite">
          <mpath xlinkHref="#ms-path" />
        </animateMotion>
      </circle>
    </svg>
  );
}

/** Mini: builder pole — rising frame */
export function MarkBuild({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Systems"
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        .mb-rise { animation: mb-r 4.5s ease-in-out infinite; }
        .mb-rise2 { animation: mb-r 4.5s ease-in-out infinite; animation-delay: -.8s; }
        .mb-rise3 { animation: mb-r 4.5s ease-in-out infinite; animation-delay: -1.6s; }
        @keyframes mb-r {
          0%,100% { transform: translateY(6px); opacity: .35; }
          50% { transform: translateY(0); opacity: 1; }
        }
        ${reduced.replace(/fm-anim/g, "mb-rise, .mb-rise2, .mb-rise3")}
      `}</style>
      <g fill="none" stroke="#C4784A" strokeWidth="1.2">
        <rect x="48" y="28" width="104" height="68" opacity="0.4" />
        <path d="M48 78h104" opacity="0.3" />
        <path d="M48 54h104" opacity="0.2" />
        <path d="M100 28v68" opacity="0.25" />
      </g>
      <rect className="mb-rise" x="58" y="62" width="22" height="28" fill="#C4784A" opacity="0.55" />
      <rect className="mb-rise2" x="89" y="48" width="22" height="42" fill="#C4784A" opacity="0.7" />
      <rect className="mb-rise3" x="120" y="56" width="22" height="34" fill="#E6E1D6" opacity="0.25" />
      <rect x="94" y="36" width="5" height="16" fill="#B8F000" opacity="0.7" />
      <rect x="101" y="36" width="5" height="16" fill="#B8F000" opacity="0.45" />
    </svg>
  );
}

/** Mini: open network — linked nodes */
export function MarkOpen({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Open tools"
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        .mo-p { animation: mo-p 3s ease-in-out infinite; }
        .mo-p2 { animation: mo-p 3s ease-in-out infinite; animation-delay: -.7s; }
        .mo-p3 { animation: mo-p 3s ease-in-out infinite; animation-delay: -1.4s; }
        .mo-flow { stroke-dasharray: 4 8; animation: mo-f 6s linear infinite; }
        @keyframes mo-p { 0%,100%{opacity:.35; r:3} 50%{opacity:1; r:4.5} }
        @keyframes mo-f { to { stroke-dashoffset: -48; } }
        ${reduced.replace(/fm-anim/g, "mo-p, .mo-p2, .mo-p3, .mo-flow")}
      `}</style>
      <defs>
        <filter id="mo-g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="none" stroke="#8b8790" strokeWidth="0.9" opacity="0.55" className="mo-flow">
        <path d="M40 70 L80 40 L120 75 L160 38" />
        <path d="M80 40 L100 90" opacity="0.5" />
        <path d="M120 75 L90 55" opacity="0.4" />
      </g>
      <circle className="mo-p" cx="40" cy="70" r="4" fill="#E6E1D6" filter="url(#mo-g)" />
      <circle className="mo-p2" cx="80" cy="40" r="4" fill="#B8F000" filter="url(#mo-g)" />
      <circle className="mo-p3" cx="120" cy="75" r="4" fill="#C4784A" filter="url(#mo-g)" />
      <circle className="mo-p" cx="160" cy="38" r="3.5" fill="#B8F000" filter="url(#mo-g)" />
      <circle className="mo-p2" cx="100" cy="90" r="3" fill="#E6E1D6" opacity="0.6" />
    </svg>
  );
}

/** Horizontal instrument strip accent under header */
export function HeaderRule({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 12"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      preserveAspectRatio="none"
    >
      <style>{`
        .hr-flow { stroke-dasharray: 2 10; animation: hr-f 12s linear infinite; }
        @keyframes hr-f { to { stroke-dashoffset: -120; } }
        ${reduced.replace(/fm-anim/g, "hr-flow")}
      `}</style>
      <line
        x1="0"
        y1="6"
        x2="720"
        y2="6"
        stroke="#2e3140"
        strokeWidth="1"
      />
      <line
        x1="0"
        y1="6"
        x2="720"
        y2="6"
        stroke="#B8F000"
        strokeWidth="1"
        opacity="0.35"
        className="hr-flow"
      />
      <circle cx="180" cy="6" r="2" fill="#B8F000" opacity="0.7" />
      <circle cx="360" cy="6" r="2" fill="#C4784A" opacity="0.7" />
      <circle cx="540" cy="6" r="2" fill="#B8F000" opacity="0.5" />
    </svg>
  );
}
