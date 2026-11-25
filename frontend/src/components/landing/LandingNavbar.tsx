import { Link } from "react-router-dom";

export interface LandingNavbarProps {
  onGetStarted?: () => void;
  brandName?: string;
  activeItem?: string;
}

export function LandingNavbar({
  onGetStarted,
  brandName = "Zcoiny",
  activeItem = "Home",
}: LandingNavbarProps) {
  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "About Us", href: "#about" },
    { label: "Blog", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="relative w-full z-40">
      <div className="w-full px-8 md:px-12 h-24 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-lg md:text-xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            {brandName}
          </Link>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] text-zinc-400 font-mono">
            Arqon v0.1.0
          </span>
        </div>

        {/* Floating Capsule Nav (Matching exact reference) */}
        <nav className="flex items-center gap-2 sm:gap-3 px-6 py-2.5 rounded-full bg-[#13141b]/80 border border-white/10 backdrop-blur-xl shadow-lg">
          {navLinks.map((link, index) => {
            const isActive = link.label === activeItem;

            return (
              <div key={link.label} className="flex items-center gap-2 sm:gap-3">
                <a
                  href={link.href}
                  className={`relative text-[13px] tracking-normal transition-colors px-1 py-0.5 ${
                    isActive
                      ? "text-white font-medium"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Active Underline Dash Indicator */}
                  {isActive && (
                    <span className="block w-3.5 h-[2px] bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </a>

                {/* Bullet Dot Separator */}
                {index < navLinks.length - 1 && (
                  <span className="text-zinc-600 text-xs select-none">·</span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right CTA Button */}
        <div>
          <button
            onClick={onGetStarted}
            className="bg-white text-[#070709] hover:bg-zinc-200 text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-150 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Thin Horizontal Framing Line passing across */}
      <div className="w-full h-[1px] bg-white/[0.08]" />
    </header>
  );
}
