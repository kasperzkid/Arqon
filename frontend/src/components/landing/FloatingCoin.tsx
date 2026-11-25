export interface FloatingCoinProps {
  type: "btc" | "usdt";
  className?: string;
  size?: number;
}

export function FloatingCoin({ type, className = "", size = 130 }: FloatingCoinProps) {
  const isBtc = type === "btc";

  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
    >
      <div
        className="w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: isBtc
            ? "rotateY(22deg) rotateX(14deg) rotateZ(-6deg)"
            : "rotateY(-24deg) rotateX(14deg) rotateZ(6deg)",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Deep Ambient Glow */}
            <filter id={`ambient-glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.22 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 3D Drop Shadow */}
            <filter id={`coin-shadow-${type}`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx={isBtc ? "16" : "-16"} dy="24" stdDeviation="18" floodColor="#000000" floodOpacity="0.85" />
            </filter>

            {/* Metallic Anisotropic Rim Gradient */}
            <linearGradient id={`metallic-rim-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="18%" stopColor="#8d94a5" />
              <stop offset="35%" stopColor="#30333d" />
              <stop offset="50%" stopColor="#e2e6f0" />
              <stop offset="68%" stopColor="#414652" />
              <stop offset="85%" stopColor="#1a1c22" />
              <stop offset="100%" stopColor="#9da4b5" />
            </linearGradient>

            {/* Bevel Chamfer Gradient */}
            <linearGradient id={`bevel-chamfer-${type}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#131418" />
              <stop offset="35%" stopColor="#3b3f4c" />
              <stop offset="50%" stopColor="#b0b7c7" />
              <stop offset="65%" stopColor="#4f5564" />
              <stop offset="100%" stopColor="#1d1f26" />
            </linearGradient>

            {/* Dark Brushed Inner Face */}
            <radialGradient id={`inner-face-${type}`} cx="45%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#424754" />
              <stop offset="50%" stopColor="#252830" />
              <stop offset="85%" stopColor="#16181d" />
              <stop offset="100%" stopColor="#0d0e12" />
            </radialGradient>

            {/* Embossed Symbol Gradient */}
            <linearGradient id={`symbol-metal-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#edf0f7" />
              <stop offset="75%" stopColor="#a3aab8" />
              <stop offset="100%" stopColor="#69707e" />
            </linearGradient>

            {/* Specular Edge Highlight */}
            <linearGradient id={`edge-highlight-${type}`} x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Diffuse Backlight Glow */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="16"
            filter={`url(#ambient-glow-${type})`}
          />

          {/* 3D Extrusion Side Wall (Gives the coin physical thickness) */}
          <g filter={`url(#coin-shadow-${type})`}>
            {/* Coin Rim / Outer Cylinder */}
            <circle
              cx="100"
              cy="100"
              r="78"
              fill={`url(#metallic-rim-${type})`}
              stroke="#596070"
              strokeWidth="1.5"
            />

            {/* Beveled Chamfer Ring */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill={`url(#bevel-chamfer-${type})`}
            />

            {/* Engraved Rim Groove */}
            <circle
              cx="100"
              cy="100"
              r="64"
              fill="none"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="2"
            />

            {/* Deep Brushed Face */}
            <circle
              cx="100"
              cy="100"
              r="61"
              fill={`url(#inner-face-${type})`}
            />

            {/* Coin Border Texture Ring */}
            <circle
              cx="100"
              cy="100"
              r="56"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="2 3"
            />

            {/* Embossed Center Emblem */}
            {isBtc ? (
              <g transform="translate(62, 53) scale(0.95)">
                {/* Cast Shadow */}
                <text
                  x="40"
                  y="82"
                  textAnchor="middle"
                  fontSize="78"
                  fontWeight="900"
                  fontFamily="'Inter', -apple-system, sans-serif"
                  fill="#000000"
                  opacity="0.85"
                  transform="translate(1.5, 3)"
                >
                  ₿
                </text>
                {/* Embossed Metallic Symbol */}
                <text
                  x="40"
                  y="82"
                  textAnchor="middle"
                  fontSize="78"
                  fontWeight="900"
                  fontFamily="'Inter', -apple-system, sans-serif"
                  fill={`url(#symbol-metal-${type})`}
                >
                  ₿
                </text>
              </g>
            ) : (
              <g transform="translate(62, 53) scale(0.95)">
                {/* Cast Shadow */}
                <text
                  x="40"
                  y="82"
                  textAnchor="middle"
                  fontSize="78"
                  fontWeight="900"
                  fontFamily="'Inter', -apple-system, sans-serif"
                  fill="#000000"
                  opacity="0.85"
                  transform="translate(1.5, 3)"
                >
                  ₮
                </text>
                {/* Embossed Metallic Symbol */}
                <text
                  x="40"
                  y="82"
                  textAnchor="middle"
                  fontSize="78"
                  fontWeight="900"
                  fontFamily="'Inter', -apple-system, sans-serif"
                  fill={`url(#symbol-metal-${type})`}
                >
                  ₮
                </text>
              </g>
            )}

            {/* Top Lip Specular Light Flare */}
            <path
              d="M 50 50 Q 100 32 150 50"
              fill="none"
              stroke={`url(#edge-highlight-${type})`}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Bottom Reflected Bounce Light */}
            <path
              d="M 60 152 Q 100 166 140 152"
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
