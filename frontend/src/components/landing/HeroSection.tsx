import { ArrowRight } from "lucide-react";
import { FloatingCoin } from "./FloatingCoin";
import { CandlestickSilhouette } from "./CandlestickSilhouette";

export interface HeroSectionProps {
  onGetStarted?: () => void;
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
}

export function HeroSection({
  onGetStarted,
  titleLine1 = "Your Gateway To The",
  titleLine2 = "Decentralized Web3 World",
  description = "Deep insights, real-time data, and unbiased analysis to master the crypto market. Smart investment in digital assets. From analysis to action, all in one secure place.",
}: HeroSectionProps) {
  return (
    <section id="hero" className="relative w-full overflow-hidden bg-transparent text-white pt-12 pb-0">
      {/* Architectural Grid Guidelines (Thin lines matching reference frame) */}
      <div className="absolute inset-y-0 left-8 md:left-14 w-[1px] bg-white/[0.04] pointer-events-none" />
      <div className="absolute inset-y-0 right-8 md:right-14 w-[1px] bg-white/[0.04] pointer-events-none" />

      {/* Center Subtle Ambient Lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle 700px at 50% 28%, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.015) 50%, transparent 80%)",
        }}
      />

      {/* Floating 3D Metallic Coin - Left (Bitcoin) */}
      <div className="hidden lg:block absolute left-14 xl:left-28 top-[28%] -translate-y-8 z-30 animate-float-slow">
        <FloatingCoin type="btc" size={135} />
      </div>

      {/* Floating 3D Metallic Coin - Right (Token / Tether) */}
      <div className="hidden lg:block absolute right-14 xl:right-28 top-[24%] -translate-y-6 z-30 animate-float-delayed">
        <FloatingCoin type="usdt" size={140} />
      </div>

      {/* Main Center Content */}
      <div className="relative z-30 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Hero Title Matching Reference */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold tracking-[-0.03em] text-white leading-[1.06] max-w-3xl">
          <span className="block">{titleLine1}</span>
          <span className="block">{titleLine2}</span>
        </h1>

        {/* Subtitle Paragraph */}
        <p className="mt-6 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed font-normal tracking-normal">
          {description}
        </p>

        {/* Primary CTA Button */}
        <div className="mt-8">
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2.5 bg-white text-[#070709] hover:bg-zinc-200 text-sm font-semibold px-7 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_4px_30px_rgba(255,255,255,0.14)] cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Candlestick Silhouette at the bottom */}
      <div className="relative w-full z-20 mt-4">
        <CandlestickSilhouette />
      </div>
    </section>
  );
}
