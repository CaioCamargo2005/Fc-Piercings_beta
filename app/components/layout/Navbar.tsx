"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { navCategories, NavCategory } from "@/lib/nav-data";

function DropdownItem({ cat }: { cat: NavCategory }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }
  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  const hasSub = cat.subcategories && cat.subcategories.length > 0;

  return (
    /* overflow: visible é essencial — sem isso o dropdown fica cortado */
    <div style={{ position: "relative", overflow: "visible" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link href={cat.href} style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "8px 12px", borderRadius: 6, textDecoration: "none",
        color: open ? "var(--gold)" : "var(--gray-light)",
        fontSize: 13, fontWeight: 500, letterSpacing: "0.03em",
        whiteSpace: "nowrap", transition: "color 0.15s",
      }}>
        {cat.label}
        {hasSub && (
          <ChevronDown size={13} style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.7,
          }} />
        )}
      </Link>

      {hasSub && open && (
        <div className="animate-fadeDown" style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: 4,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 12,
          minWidth: 200,
          background: "var(--black-soft)",
          border: "1px solid rgba(201,168,76,0.2)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.8)",
          zIndex: 9999,
        }}>
          <Link href={cat.href} style={{
            display: "block", padding: "6px 16px 10px",
            color: "var(--gold)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            textDecoration: "none",
            borderBottom: "1px solid rgba(201,168,76,0.12)",
            marginBottom: 4,
          }}>
            Ver todos →
          </Link>
          {cat.subcategories!.map(sub => (
            <Link key={sub.href} href={sub.href} style={{
              display: "block", padding: "8px 16px",
              color: "var(--gray-light)", fontSize: 13,
              textDecoration: "none", transition: "all 0.12s",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--gold)";
                e.currentTarget.style.background = "rgba(201,168,76,0.07)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--gray-light)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  return (
    /* overflow: visible para os dropdowns não ficarem cortados */
    <nav style={{
      background: "var(--black)",
      borderBottom: "1px solid rgba(201,168,76,0.15)",
      position: "relative",
      zIndex: 40,
      overflow: "visible",
    }}>
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent, var(--gold-dark), var(--gold), var(--gold-light), var(--gold), var(--gold-dark), transparent)",
      }} />
      <div style={{
        display: "flex", alignItems: "center", gap: 24,
        padding: "4px 32px",
        overflow: "visible",   /* sem isso o dropdown some atrás do próximo elemento */
      }}>
        {navCategories.map(cat => (
          <DropdownItem key={cat.href} cat={cat} />
        ))}
        <div style={{ marginLeft: "auto", height: 24, width: 1, background: "rgba(201,168,76,0.2)", flexShrink: 0 }} />
        <Link href="/ofertas" style={{
          flexShrink: 0, padding: "6px 16px", borderRadius: 6,
          background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
          color: "var(--black)", fontSize: 13, fontWeight: 700,
          letterSpacing: "0.04em", textDecoration: "none",
        }}>
          🔥 Ofertas
        </Link>
      </div>
    </nav>
  );
}
