export interface HeroBadgeProps {
  badgeText?: string;
}

export function HeroBadge({
  badgeText = "Our Users",
}: HeroBadgeProps) {
  return (
    <div className="inline-flex items-center gap-3 p-1 pl-1.5 pr-4 rounded-full bg-[#13141b]/90 border border-white/10 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/25 hover:bg-[#181a24] cursor-default">
      {/* Solid White Pill Badge */}
      <span className="bg-white text-[#070709] text-xs font-semibold px-3 py-1 rounded-full shadow-sm tracking-tight">
        {badgeText}
      </span>

      {/* 3D-styled Avatar Stack matching the reference */}
      <div className="flex items-center -space-x-1.5">
        {/* Avatar 1: Hat character */}
        <div className="relative w-6 h-6 rounded-full ring-2 ring-[#13141b] bg-gradient-to-b from-amber-200 to-amber-600 flex items-center justify-center overflow-hidden shadow-inner">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect width="36" height="36" fill="#fcd34d" />
            {/* Fedora / Hat brim */}
            <ellipse cx="18" cy="12" rx="14" ry="4" fill="#374151" />
            <rect x="9" y="6" width="18" height="8" rx="2" fill="#1f2937" />
            {/* Face */}
            <circle cx="18" cy="20" r="8" fill="#fbcfe8" />
            {/* Sunglasses */}
            <rect x="12" y="18" width="5" height="3" rx="1" fill="#111827" />
            <rect x="19" y="18" width="5" height="3" rx="1" fill="#111827" />
            {/* Smile */}
            <path d="M15 24 Q18 27 21 24" stroke="#831843" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Avatar 2: Blonde female character */}
        <div className="relative w-6 h-6 rounded-full ring-2 ring-[#13141b] bg-gradient-to-b from-rose-200 to-pink-500 flex items-center justify-center overflow-hidden shadow-inner">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect width="36" height="36" fill="#fb7185" />
            {/* Blonde Hair */}
            <circle cx="18" cy="17" r="10" fill="#fde047" />
            {/* Face */}
            <circle cx="18" cy="19" r="7" fill="#fed7aa" />
            {/* Hair bangs */}
            <path d="M11 15 Q18 10 25 15" fill="#facc15" />
            {/* Eyes */}
            <circle cx="15" cy="18" r="1.2" fill="#1e293b" />
            <circle cx="21" cy="18" r="1.2" fill="#1e293b" />
            {/* Smile */}
            <path d="M16 22 Q18 24 20 22" stroke="#ea580c" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Avatar 3: Male with glasses */}
        <div className="relative w-6 h-6 rounded-full ring-2 ring-[#13141b] bg-gradient-to-b from-sky-200 to-blue-600 flex items-center justify-center overflow-hidden shadow-inner">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
            <rect width="36" height="36" fill="#38bdf8" />
            {/* Hair */}
            <path d="M10 16 Q18 8 26 16" fill="#475569" />
            {/* Face */}
            <circle cx="18" cy="20" r="7.5" fill="#fde68a" />
            {/* Glasses */}
            <rect x="13" y="18" width="4.5" height="3.5" rx="1" stroke="#0f172a" strokeWidth="1.2" fill="none" />
            <rect x="18.5" y="18" width="4.5" height="3.5" rx="1" stroke="#0f172a" strokeWidth="1.2" fill="none" />
            <line x1="17.5" y1="20" x2="18.5" y2="20" stroke="#0f172a" strokeWidth="1.2" />
          </svg>
        </div>
      </div>

    </div>
  );
}
