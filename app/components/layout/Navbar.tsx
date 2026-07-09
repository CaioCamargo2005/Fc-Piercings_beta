"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, ChevronRight } from "lucide-react";
import { navCategories, NavCategory } from "@/lib/nav-data";

/* ── Desktop dropdown (hover) ── */
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
          position: "absolute", top: "100%", left: 0,
          marginTop: 4, paddingTop: 8, paddingBottom: 8,
          borderRadius: 12, minWidth: 200,
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

/* ── Mobile accordion item (tap to expand) ── */
function MobileAccordionItem({ cat, onNavigate }: { cat: NavCategory; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const hasSub = cat.subcategories && cat.subcategories.length > 0;

  return (
    <div style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link href={cat.href} onClick={onNavigate}
          style={{
            flex: 1, padding: "14px 20px", color: "var(--gray-light)",
            fontSize: 14, fontWeight: 500, textDecoration: "none",
          }}>
          {cat.label}
        </Link>
        {hasSub && (
          <button onClick={() => setOpen(!open)}
            style={{ padding: "14px 20px", background: "none", border: "none", cursor: "pointer", color: "var(--gray-mid)" }}>
            <ChevronDown size={16} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
          </button>
        )}
      </div>
      {hasSub && open && (
        <div style={{ background: "rgba(201,168,76,0.04)", paddingBottom: 4 }}>
          {cat.subcategories!.map(sub => (
            <Link key={sub.href} href={sub.href} onClick={onNavigate}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 20px 10px 32px", color: "var(--gray-mid)",
                fontSize: 13, textDecoration: "none",
              }}>
              <ChevronRight size={12} style={{ opacity: 0.5 }} />
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
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

      {/* ── DESKTOP: linha horizontal com hover dropdown ── */}
      <div className="hidden md:flex" style={{
        alignItems: "center", gap: 24, padding: "4px 16px",
        flexWrap: "wrap", rowGap: 0,
        overflow: "visible",
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

      {/* ── MOBILE: botão de menu (só aparece quando o menu completo não cabe) ──
          IMPORTANTE: display via classe (flex md:hidden), nunca inline —
          style={{ display: "flex" }} vence o md:hidden e faz a linha
          aparecer duplicada no desktop */}
      <div className="flex md:hidden" style={{
        alignItems: "center",
        padding: "8px 16px",
      }}>
        <button onClick={() => setMobileOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--gray-light)", fontSize: 14, fontWeight: 500, padding: "6px 0",
          }}>
          <Menu size={18} />
          Categorias
        </button>
      </div>

      {/* ── MOBILE: drawer lateral (abre à esquerda, mesmo lado do botão) ── */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div className="animate-fadeDown" style={{
            width: "82vw", maxWidth: 320, background: "var(--black-soft)",
            height: "100vh", overflowY: "auto", boxShadow: "8px 0 32px rgba(0,0,0,0.5)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid rgba(201,168,76,0.15)",
            }}>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
                background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Categorias</p>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-mid)" }}>
                <X size={20} />
              </button>
            </div>
            {navCategories.map(cat => (
              <MobileAccordionItem key={cat.href} cat={cat} onNavigate={() => setMobileOpen(false)} />
            ))}
            <Link href="/lancamentos" onClick={() => setMobileOpen(false)}
              style={{ display: "block", padding: "14px 20px", color: "var(--gold)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              ✨ Lançamentos
            </Link>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.6)" }} onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </nav>
  );
}
