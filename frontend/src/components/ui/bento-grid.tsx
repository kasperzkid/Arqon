import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"article"> {
  number: string;
  stage: string;
  name: string;
  description: string;
  Icon: LucideIcon;
  background: ReactNode;
  href: string;
  cta: string;
  tone?: "lime" | "sage" | "stone";
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll<HTMLElement>(".arqon-bento-card");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add("bento-card-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("bento-card-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return <div ref={gridRef} className={cn("arqon-bento-grid grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", className)} {...props}>{children}</div>;
}

export function BentoCard({ number, stage, name, description, Icon, background, href, cta, tone = "lime", className, ...props }: BentoCardProps) {
  return (
    <article className={cn("arqon-bento-card group relative flex flex-col justify-between overflow-hidden rounded-xl", `bento-tone-${tone}`, className)} {...props}>
      <div className="bento-card-art" aria-hidden="true">{background}</div>
      <div className="bento-card-wash" aria-hidden="true" />
      <div className="bento-card-meta">
        <span><b>{number}</b><i />{stage}</span>
        <span className="bento-card-icon"><Icon size={19} strokeWidth={1.65} /></span>
      </div>
      <div className="bento-card-copy">
        <h3>{name}</h3>
        <p>{description}</p>
        <Link className="bento-card-cta" to={href}>{cta}<ArrowRight size={15} /></Link>
      </div>
      <div className="bento-card-hover-wash" aria-hidden="true" />
    </article>
  );
}
