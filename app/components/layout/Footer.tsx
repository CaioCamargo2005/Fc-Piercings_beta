"use client";

import Link from "next/link";
import { MessageCircle, MapPin, Phone, Clock } from "lucide-react";

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer style={{ background: "var(--black-soft)", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
      {/* linha dourada topo */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent, var(--gold-dark), var(--gold), var(--gold-light), var(--gold), var(--gold-dark), transparent)",
      }} />

      {/* ── NEWSLETTER — texto + campo na mesma linha, tudo centralizado ── */}
      <div style={{
        background: "var(--black-mid)",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
        padding: "24px 32px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            whiteSpace: "nowrap",
            flexShrink: 0,
            background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Receba nossas ofertas
          </p>
          <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 420 }}>
            <input
              type="email"
              placeholder="Seu e-mail"
              style={{
                flex: 1,
                background: "var(--black)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "var(--white)",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              className="btn-gold"
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                flexShrink: 0,
              }}
              onClick={() => {
                // TODO: integrar com Mailchimp, Brevo ou Resend + Supabase
                // Por enquanto apenas feedback visual
                alert("E-mail cadastrado! Em breve você receberá nossas ofertas.");
              }}
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>

      {/* ── COLUNAS com padding lateral explícito ── */}
      <div style={{
        padding: "48px 32px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 32,
      }}>

        {/* marca */}
        <div>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 8,
            background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>FC Piercing</p>
          <p style={{ color: "var(--gray-mid)", fontSize: 13, lineHeight: 1.7 }}>
            Piercings e semi joias de qualidade, com garantia de um ano. Entregamos para todo o Brasil.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {[
              { icon: <IconInstagram />, href: "https://www.instagram.com/fcjoalheria_" },
              { icon: <IconFacebook />, href: "https://www.facebook.com/share/1JPAxYkx3G/" },
              { icon: <MessageCircle size={18} />, href: "https://wa.me/5519997103023" },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{
                  color: "var(--gray-mid)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 8, padding: 8, display: "flex",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.borderColor = "var(--gold)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray-mid)"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; }}
              >{s.icon}</a>
            ))}
          </div>
        </div>

        {/* institucional */}
        <div>
          <p style={{ color: "var(--gold)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Institucional
          </p>
          {[
            { label: "Como Comprar",       href: "/como-comprar"        },
            { label: "Formas de Envio",    href: "/formas-de-envio"     },
            { label: "Frete Grátis",       href: "/frete-gratis"        },
            { label: "Garantia e Prazos",  href: "/garantia-e-prazos"   },
            { label: "Política de Trocas", href: "/politica-de-trocas"  },
            { label: "Quem Somos",         href: "/quem-somos"          },
            { label: "Privacidade",        href: "/privacidade"         },
            { label: "Termos de Uso",       href: "/termos"              },
          ].map((l) => (
            <Link key={l.label} href={l.href}
              style={{ display: "block", color: "var(--gray-mid)", fontSize: 13, marginBottom: 8, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gray-mid)")}
            >{l.label}</Link>
          ))}
        </div>

        {/* contato */}
        <div>
          <p style={{ color: "var(--gold)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Contato
          </p>
          {[
            { icon: <Phone size={14} />, text: "(19) 99710-3023" },
            { icon: <MessageCircle size={14} />, text: "WhatsApp: (19) 99710-3023" },
            { icon: <MapPin size={14} />, text: "Rua Luiz Pântano, 606 – Pq. Novo Mundo" },
            { icon: <Clock size={14} />, text: "Seg. à Sex. 9h às 17h" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12, color: "var(--gray-mid)", fontSize: 13 }}>
              <span style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* pagamento */}
        <div>
          <p style={{ color: "var(--gold)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            Pagamento
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Pix", "Cartão", "Boleto"].map((p) => (
              <span key={p} style={{
                background: "var(--black-mid)", border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "var(--gray-light)",
              }}>{p}</span>
            ))}
          </div>
          <p style={{ color: "var(--gray-mid)", fontSize: 12, marginTop: 12 }}>
            Compra 100% segura.<br />Certificado SSL.
          </p>
        </div>
      </div>

      {/* rodapé */}
      <div style={{
        borderTop: "1px solid rgba(201,168,76,0.1)",
        padding: "16px 32px",
        textAlign: "center",
        color: "var(--gray-dark)",
        fontSize: 12,
      }}>
        FC Piercing e Semi Joias · CNPJ 41.090.304/0001-74 · © Todos os direitos reservados 2026
      </div>
    </footer>
  );
}
