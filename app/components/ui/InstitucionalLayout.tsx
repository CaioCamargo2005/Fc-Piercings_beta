"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Section = {
  title: string;
  icon?: string;
  content: React.ReactNode;
};

type Props = {
  title: string;
  breadcrumb: string;
  sections: Section[];
};

export default function InstitucionalLayout({ title, breadcrumb, sections }: Props) {
  return (
    <div style={{ background: "var(--white-off)", minHeight: "calc(100vh - 120px)", padding: "32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <Link href="/" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>Início</Link>
          <ChevronRight size={12} style={{ color: "var(--gray-mid)" }} />
          <span style={{ color: "var(--gray-mid)", fontSize: 13 }}>{breadcrumb}</span>
        </div>

        {/* título */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--black)",
            letterSpacing: "0.02em", marginBottom: 8,
          }}>{title}</h1>
          <div style={{ height: 3, width: 56, background: "linear-gradient(90deg,#8B6914,#C9A84C)", borderRadius: 2 }} />
        </div>

        {/* seções */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {sections.map((sec, i) => (
            <div key={i} style={{
              background: "var(--white)", border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: 12, overflow: "hidden",
            }}>
              {sec.title && (
                <div style={{
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(201,168,76,0.1)",
                  background: "rgba(201,168,76,0.03)",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  {sec.icon && <span style={{ fontSize: 18 }}>{sec.icon}</span>}
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--black)" }}>{sec.title}</h2>
                </div>
              )}
              <div style={{ padding: "20px 24px", color: "var(--gray-mid)", fontSize: 14, lineHeight: 1.8 }}>
                {sec.content}
              </div>
            </div>
          ))}
        </div>

        {/* links relacionados */}
        <div style={{
          marginTop: 40, padding: "20px 24px",
          background: "var(--black-soft)", borderRadius: 12,
          border: "1px solid rgba(201,168,76,0.15)",
        }}>
          <p style={{ color: "var(--gold)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 14 }}>
            Páginas institucionais
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "Como Comprar",      href: "/como-comprar"       },
              { label: "Formas de Envio",   href: "/formas-de-envio"    },
              { label: "Frete Grátis",      href: "/frete-gratis"       },
              { label: "Garantia e Prazos", href: "/garantia-e-prazos"  },
              { label: "Política de Trocas",href: "/politica-de-trocas" },
              { label: "Quem Somos",        href: "/quem-somos"         },
              { label: "Privacidade",       href: "/privacidade"        },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12,
                border: "1px solid rgba(201,168,76,0.2)", color: "var(--gray-light)",
                textDecoration: "none", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.color = "var(--gray-light)"; }}
              >{link.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
