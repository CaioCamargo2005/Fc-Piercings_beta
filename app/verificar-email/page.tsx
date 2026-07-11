"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MailCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN = 60; // segundos — limite do Supabase é 1 reenvio/min

function VerificarEmailContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  async function handleResend() {
    if (!email || sending || cooldown > 0) return;
    setSending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/conta` },
      });
      if (error) throw new Error(error.message);
      setSent(true);
      // trava o botão por 60s, decrementando a cada segundo
      setCooldown(RESEND_COOLDOWN);
      const timer = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao reenviar e-mail.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="px-4" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* card */}
        <div style={{
          background: "var(--black-soft)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}>
          {/* logo no topo */}
          <Image src="/logo.png" alt="FC Piercing e Semi Joias" width={110} height={110}
            style={{ margin: "0 auto 16px", display: "block" }} />

          <MailCheck size={28} strokeWidth={1.5} style={{ color: "var(--gold)", margin: "0 auto 14px", display: "block" }} />

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 700,
            background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 14,
          }}>
            Confirme seu e-mail
          </h1>

          <p style={{ color: "var(--gray-light)", fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>
            Um e-mail de verificação foi enviado para
          </p>
          <p style={{ color: "var(--gold-light)", fontSize: 15, fontWeight: 600, marginBottom: 18, wordBreak: "break-all" }}>
            {email || "seu e-mail"}
          </p>
          <p style={{ color: "var(--gray-mid)", fontSize: 13, lineHeight: 1.7, marginBottom: 26 }}>
            Clique no link do e-mail para ativar sua conta.
            Confira também a caixa de spam.
          </p>

          {/* feedback */}
          {sent && cooldown > 0 && (
            <p style={{ color: "#4ade80", fontSize: 13, marginBottom: 14 }}>
              ✓ E-mail reenviado! Aguarde alguns instantes para chegar.
            </p>
          )}
          {error && (
            <p style={{ color: "#f87171", fontSize: 13, marginBottom: 14 }}>
              {error}
            </p>
          )}

          {/* reenvio */}
          {email && (
            <button
              onClick={handleResend}
              disabled={sending || cooldown > 0}
              className="btn-gold"
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: sending || cooldown > 0 ? "not-allowed" : "pointer",
                opacity: sending || cooldown > 0 ? 0.55 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}>
              {sending && <Loader2 size={16} className="animate-spin" />}
              {cooldown > 0
                ? `Reenviar disponível em ${cooldown}s`
                : sending ? "Reenviando..." : "Não recebeu? Reenviar e-mail"}
            </button>
          )}

          <p style={{ marginTop: 22, fontSize: 13, color: "var(--gray-mid)" }}>
            Já confirmou?{" "}
            <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificarEmailContent />
    </Suspense>
  );
}
