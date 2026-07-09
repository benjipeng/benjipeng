/**
 * DualField — animated SVG for the About bento tall cell.
 * Twin poles: orbital method (signal) + built structure (oxide).
 * 简约而不简单：少元素、慢节奏、校准刻度。
 */
export default function DualField() {
  return (
    <svg
      viewBox="0 0 400 520"
      className="absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Studio and lab field diagram"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="df-void" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#1a1e2a" />
          <stop offset="55%" stopColor="#12141a" />
          <stop offset="100%" stopColor="#0a0b10" />
        </radialGradient>
        <radialGradient id="df-planet" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#2a2f3d" />
          <stop offset="70%" stopColor="#161922" />
          <stop offset="100%" stopColor="#0e1016" />
        </radialGradient>
        <linearGradient id="df-beam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8F000" stopOpacity="0" />
          <stop offset="50%" stopColor="#B8F000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#B8F000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="df-oxide-line" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C4784A" stopOpacity="0" />
          <stop offset="40%" stopColor="#C4784A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#C4784A" stopOpacity="0.15" />
        </linearGradient>
        <filter id="df-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="df-soft" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Orbit path for probe (ellipse as path) */}
        <path
          id="df-orbit-path"
          d="M200,148 A132,88 0 1,1 199.9,148"
          fill="none"
        />
        <path
          id="df-orbit-inner"
          d="M200,188 A78,52 0 1,0 199.9,188"
          fill="none"
        />
      </defs>

      <style>{`
        .df-dash {
          stroke-dasharray: 6 10;
          animation: df-dash 18s linear infinite;
        }
        .df-dash-rev {
          stroke-dasharray: 4 12;
          animation: df-dash 28s linear infinite reverse;
        }
        .df-spin {
          transform-origin: 200px 236px;
          animation: df-spin 48s linear infinite;
        }
        .df-spin-rev {
          transform-origin: 200px 236px;
          animation: df-spin 72s linear infinite reverse;
        }
        .df-pulse {
          animation: df-pulse 3.6s ease-in-out infinite;
        }
        .df-pulse-slow {
          animation: df-pulse 5.2s ease-in-out infinite;
          animation-delay: -1.2s;
        }
        .df-breathe {
          transform-origin: 200px 236px;
          animation: df-breathe 6s ease-in-out infinite;
        }
        .df-scan {
          animation: df-scan 7s ease-in-out infinite;
        }
        .df-fade-in {
          animation: df-fade 1.2s ease-out both;
        }
        .df-node {
          animation: df-node 4s ease-in-out infinite;
        }
        @keyframes df-dash {
          to { stroke-dashoffset: -160; }
        }
        @keyframes df-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes df-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        @keyframes df-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }
        @keyframes df-scan {
          0%, 100% { opacity: 0.15; transform: translateY(-8px); }
          50% { opacity: 0.55; transform: translateY(8px); }
        }
        @keyframes df-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes df-node {
          0%, 100% { r: 2.5; opacity: 0.5; }
          50% { r: 4; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .df-dash, .df-dash-rev, .df-spin, .df-spin-rev,
          .df-pulse, .df-pulse-slow, .df-breathe, .df-scan, .df-node {
            animation: none !important;
          }
          .df-pulse, .df-pulse-slow { opacity: 0.7; }
        }
      `}</style>

      {/* Field */}
      <rect width="400" height="520" fill="url(#df-void)" />

      {/* Micro-stars / data points */}
      <g className="df-fade-in" fill="#E6E1D6" opacity="0.45">
        <circle cx="42" cy="58" r="1" className="df-pulse" />
        <circle cx="88" cy="120" r="0.8" opacity="0.5" />
        <circle cx="340" cy="72" r="1.1" className="df-pulse-slow" />
        <circle cx="368" cy="180" r="0.7" />
        <circle cx="52" cy="300" r="0.9" className="df-pulse" />
        <circle cx="310" cy="390" r="1" className="df-pulse-slow" />
        <circle cx="120" cy="440" r="0.7" />
        <circle cx="280" cy="48" r="0.6" />
        <circle cx="180" cy="90" r="0.5" opacity="0.4" />
        <circle cx="355" cy="310" r="0.8" className="df-pulse" />
      </g>

      {/* Calibration frame */}
      <g
        fill="none"
        stroke="#2e3140"
        strokeWidth="1"
        opacity="0.85"
        className="df-fade-in"
      >
        <path d="M24 24h28M24 24v28" />
        <path d="M376 24h-28M376 24v28" />
        <path d="M24 496h28M24 496v-28" />
        <path d="M376 496h-28M376 496v-28" />
        {/* tick marks */}
        <path d="M200 18v8M200 494v-8M18 236h8M382 236h-8" stroke="#8b8790" opacity="0.5" />
      </g>

      {/* Soft ambient glows */}
      <circle
        cx="200"
        cy="236"
        r="110"
        fill="#B8F000"
        opacity="0.04"
        filter="url(#df-soft)"
        className="df-breathe"
      />
      <circle
        cx="200"
        cy="320"
        r="70"
        fill="#C4784A"
        opacity="0.05"
        filter="url(#df-soft)"
      />

      {/* Blueprint grid — studio pole */}
      <g
        stroke="#C4784A"
        strokeWidth="0.6"
        opacity="0.12"
        className="df-fade-in"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={80 + i * 30}
            y1={340}
            x2={80 + i * 30}
            y2={470}
          />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={80}
            y1={340 + i * 32}
            x2={320}
            y2={340 + i * 32}
          />
        ))}
      </g>

      {/* Structural scaffold (builder) */}
      <g className="df-fade-in" opacity="0.9">
        <rect
          x="118"
          y="360"
          width="164"
          height="88"
          fill="none"
          stroke="#C4784A"
          strokeWidth="1.2"
          opacity="0.55"
        />
        <rect
          x="138"
          y="378"
          width="48"
          height="52"
          fill="none"
          stroke="#C4784A"
          strokeWidth="0.9"
          opacity="0.4"
        />
        <rect
          x="214"
          y="378"
          width="48"
          height="52"
          fill="none"
          stroke="#C4784A"
          strokeWidth="0.9"
          opacity="0.4"
        />
        {/* rising oxide posts */}
        <line
          x1="150"
          y1="448"
          x2="150"
          y2="300"
          stroke="url(#df-oxide-line)"
          strokeWidth="1.5"
          className="df-pulse"
        />
        <line
          x1="250"
          y1="448"
          x2="250"
          y2="300"
          stroke="url(#df-oxide-line)"
          strokeWidth="1.5"
          className="df-pulse-slow"
        />
        {/* dual bars motif (logo echo) */}
        <rect x="188" y="392" width="6" height="36" rx="0.5" fill="#E6E1D6" opacity="0.35" />
        <rect x="200" y="392" width="6" height="36" rx="0.5" fill="#E6E1D6" opacity="0.35" />
        <path d="M214 396h12l-6 10h-6z" fill="#B8F000" opacity="0.55" />
        <rect x="214" y="414" width="12" height="10" rx="0.5" fill="#C4784A" opacity="0.6" />
      </g>

      {/* Outer orbit ring */}
      <g className="df-spin">
        <ellipse
          cx="200"
          cy="236"
          rx="132"
          ry="88"
          fill="none"
          stroke="#E6E1D6"
          strokeWidth="1"
          opacity="0.22"
          className="df-dash"
        />
        {/* orbit nodes */}
        <circle cx="332" cy="236" r="2.5" fill="#B8F000" className="df-pulse" filter="url(#df-glow)" />
        <circle cx="68" cy="236" r="2" fill="#E6E1D6" opacity="0.4" />
        <circle cx="200" cy="148" r="2" fill="#C4784A" opacity="0.7" className="df-pulse-slow" />
      </g>

      {/* Inner counter-orbit */}
      <g className="df-spin-rev">
        <ellipse
          cx="200"
          cy="236"
          rx="78"
          ry="52"
          fill="none"
          stroke="#B8F000"
          strokeWidth="0.9"
          opacity="0.35"
          className="df-dash-rev"
        />
        <circle cx="278" cy="236" r="2" fill="#B8F000" filter="url(#df-glow)" className="df-pulse" />
      </g>

      {/* Meridian cross — method */}
      <g stroke="#8b8790" strokeWidth="0.5" opacity="0.25">
        <line x1="200" y1="120" x2="200" y2="352" />
        <line x1="60" y1="236" x2="340" y2="236" />
      </g>

      {/* Horizontal scan beam */}
      <rect
        x="70"
        y="230"
        width="260"
        height="1.5"
        fill="url(#df-beam)"
        className="df-scan"
        opacity="0.4"
      />

      {/* Planet / nucleus */}
      <g className="df-breathe">
        <circle
          cx="200"
          cy="236"
          r="36"
          fill="url(#df-planet)"
          stroke="#2e3140"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="236"
          r="36"
          fill="none"
          stroke="#B8F000"
          strokeWidth="1"
          opacity="0.25"
          filter="url(#df-glow)"
        />
        <circle cx="200" cy="236" r="14" fill="#C4784A" opacity="0.55" />
        <circle
          cx="200"
          cy="236"
          r="6"
          fill="#B8F000"
          filter="url(#df-glow)"
          className="df-pulse"
        />
        {/* surface arc */}
        <path
          d="M178 220 Q200 210 222 220"
          fill="none"
          stroke="#E6E1D6"
          strokeWidth="0.8"
          opacity="0.3"
        />
      </g>

      {/* Probe on outer orbit */}
      <g filter="url(#df-glow)">
        <circle r="4.5" fill="#B8F000">
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
            <mpath xlinkHref="#df-orbit-path" />
          </animateMotion>
        </circle>
        <circle r="9" fill="#B8F000" opacity="0.15">
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
            <mpath xlinkHref="#df-orbit-path" />
          </animateMotion>
        </circle>
      </g>

      {/* Second slower body — inner */}
      <circle r="3" fill="#C4784A" opacity="0.9">
        <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
          <mpath xlinkHref="#df-orbit-inner" />
        </animateMotion>
      </circle>

      {/* Annotation ticks — scientific instrument language */}
      <g
        fontFamily="'IBM Plex Mono', ui-monospace, monospace"
        fontSize="8"
        fill="#8b8790"
        letterSpacing="0.12em"
        className="df-fade-in"
      >
        <text x="36" y="200" transform="rotate(-90 36 200)" opacity="0.55">
          METHOD
        </text>
        <text x="378" y="280" transform="rotate(90 378 280)" opacity="0.55">
          SYSTEM
        </text>
        <text x="200" y="132" textAnchor="middle" fill="#B8F000" opacity="0.45" fontSize="7">
          Ω
        </text>
      </g>

      {/* Bottom caption area kept clear for HTML overlay */}
      <rect x="0" y="470" width="400" height="50" fill="url(#df-void)" opacity="0.35" />
    </svg>
  );
}
