interface CandlestickItem {
  id: number;
  bodyHeight: number; // percentage
  bodyBottom: number; // percentage from bottom
  wickTop: number; // extra percentage
  wickBottom: number; // extra percentage
  opacity: number;
  width?: number; // optional width override in px
}

// Pixel-perfect match of the silhouette from the user's reference image
const CANDLESTICKS: CandlestickItem[] = [
  { id: 1, bodyHeight: 14, bodyBottom: 6, wickTop: 8, wickBottom: 6, opacity: 0.25 },
  { id: 2, bodyHeight: 22, bodyBottom: 4, wickTop: 10, wickBottom: 8, opacity: 0.35 },
  { id: 3, bodyHeight: 18, bodyBottom: 8, wickTop: 12, wickBottom: 8, opacity: 0.4 },
  { id: 4, bodyHeight: 28, bodyBottom: 10, wickTop: 14, wickBottom: 10, opacity: 0.5 },
  { id: 5, bodyHeight: 24, bodyBottom: 6, wickTop: 10, wickBottom: 8, opacity: 0.45 },
  { id: 6, bodyHeight: 38, bodyBottom: 12, wickTop: 14, wickBottom: 12, opacity: 0.65 },
  { id: 7, bodyHeight: 52, bodyBottom: 16, wickTop: 18, wickBottom: 14, opacity: 0.85 },
  { id: 8, bodyHeight: 32, bodyBottom: 10, wickTop: 12, wickBottom: 12, opacity: 0.55 },
  { id: 9, bodyHeight: 46, bodyBottom: 14, wickTop: 16, wickBottom: 14, opacity: 0.75 },
  // Center-left dominant peak (tallest in the reference image)
  { id: 10, bodyHeight: 74, bodyBottom: 20, wickTop: 24, wickBottom: 18, opacity: 1.0 },
  { id: 11, bodyHeight: 42, bodyBottom: 14, wickTop: 14, wickBottom: 16, opacity: 0.7 },
  { id: 12, bodyHeight: 62, bodyBottom: 18, wickTop: 20, wickBottom: 16, opacity: 0.9 },
  { id: 13, bodyHeight: 34, bodyBottom: 12, wickTop: 12, wickBottom: 14, opacity: 0.6 },
  { id: 14, bodyHeight: 50, bodyBottom: 16, wickTop: 18, wickBottom: 16, opacity: 0.8 },
  { id: 15, bodyHeight: 66, bodyBottom: 18, wickTop: 22, wickBottom: 16, opacity: 0.95 },
  { id: 16, bodyHeight: 38, bodyBottom: 12, wickTop: 14, wickBottom: 14, opacity: 0.65 },
  { id: 17, bodyHeight: 48, bodyBottom: 14, wickTop: 16, wickBottom: 16, opacity: 0.75 },
  { id: 18, bodyHeight: 28, bodyBottom: 8, wickTop: 10, wickBottom: 12, opacity: 0.45 },
  { id: 19, bodyHeight: 20, bodyBottom: 6, wickTop: 8, wickBottom: 10, opacity: 0.35 },
];

export function CandlestickSilhouette() {
  return (
    <div className="relative w-full h-80 sm:h-96 md:h-[420px] overflow-hidden select-none pointer-events-none">
      {/* Upward Spotlight Beam behind the candlesticks */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 85%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 45%, transparent 75%)",
        }}
      />

      {/* Candlestick Columns */}
      <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 px-6 max-w-6xl mx-auto">
        {CANDLESTICKS.map((candle) => {
          const totalWickHeight = candle.bodyHeight + candle.wickTop + candle.wickBottom;

          return (
            <div
              key={candle.id}
              className="relative flex flex-col items-center justify-end h-full transition-opacity duration-300"
              style={{
                width: "clamp(10px, 2.2vw, 22px)",
                opacity: candle.opacity,
              }}
            >
              {/* Thin Vertical Wick (Upper & Lower) */}
              <div
                className="absolute w-[1.5px] bg-white/50"
                style={{
                  height: `${totalWickHeight}%`,
                  bottom: `${candle.bodyBottom - candle.wickBottom}%`,
                }}
              />

              {/* Candlestick Body */}
              <div
                className="relative z-10 w-full rounded-[3px] bg-gradient-to-t from-white/10 via-white/55 to-white/95 shadow-[0_0_16px_rgba(255,255,255,0.22)] border-t border-white/80"
                style={{
                  height: `${candle.bodyHeight}%`,
                  bottom: `${candle.bodyBottom}%`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Smooth Dark Gradient Mask at bottom to blend into page */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050507] via-[#050507]/85 to-transparent z-20 pointer-events-none" />
    </div>
  );
}
