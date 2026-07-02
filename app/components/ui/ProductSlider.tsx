"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/products-mock";

type Props = {
  products: Product[];
  seeMoreHref: string;
  seeMoreLabel?: string;
};

export default function ProductSlider({ products, seeMoreHref, seeMoreLabel = "Ver mais" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = 200; // largura aproximada de um card + gap
    el.scrollBy({ left: dir * cardWidth * 2, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div style={{ position: "relative" }}>
      {/* seta esquerda — só desktop */}
      {canScrollLeft && (
        <button onClick={() => scrollBy(-1)}
          className="hidden sm:flex"
          style={{
            position: "absolute", left: -16, top: "calc(50% - 40px)", zIndex: 10,
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--white)", border: "1px solid rgba(0,0,0,0.1)",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}>
          <ChevronLeft size={18} style={{ color: "var(--black)" }} />
        </button>
      )}

      {/* seta direita — só desktop */}
      {canScrollRight && (
        <button onClick={() => scrollBy(1)}
          className="hidden sm:flex"
          style={{
            position: "absolute", right: -16, top: "calc(50% - 40px)", zIndex: 10,
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--white)", border: "1px solid rgba(0,0,0,0.1)",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}>
          <ChevronRight size={18} style={{ color: "var(--black)" }} />
        </button>
      )}

      {/* trilho de scroll */}
      <div
        ref={trackRef}
        className="hide-scrollbar"
        style={{
          display: "flex", gap: 16, overflowX: "auto",
          scrollSnapType: "x mandatory", paddingBottom: 4,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map(p => (
          <div key={p.id} style={{ flex: "0 0 200px", scrollSnapAlign: "start" }}>
            <ProductCard product={p} />
          </div>
        ))}

        {/* card "ver mais" no final do slider */}
        <Link href={seeMoreHref}
          style={{
            flex: "0 0 160px", scrollSnapAlign: "start",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10, borderRadius: 12, textDecoration: "none",
            background: "linear-gradient(135deg, rgba(201,168,76,0.06), rgba(201,168,76,0.12))",
            border: "1px dashed rgba(201,168,76,0.4)",
            minHeight: 280,
          }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg,#8B6914,#C9A84C)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ArrowRight size={20} style={{ color: "var(--black)" }} />
          </div>
          <p style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, textAlign: "center", padding: "0 12px" }}>
            {seeMoreLabel}
          </p>
        </Link>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  );
}
