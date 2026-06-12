"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-mock";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.ok) {
      router.push("/conta");
    } else {
      setError(result.error || "Erro ao entrar");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 120px)",
      background: "var(--white)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* logo + título */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Image
              src="/logo.png"
              alt="FC Piercing"
              width={72}
              height={72}
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 700,
            background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 6,
          }}>
            Entrar na conta
          </h1>
          <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>
            Bem-vinda de volta! 💛
          </p>
        </div>

        {/* card */}
        <div style={{
          background: "var(--black-soft)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        }}>
          <form onSubmit={handleSubmit}>

            {/* e-mail */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "var(--gray-light)", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                E-mail
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--gray-mid)", display: "flex",
                }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: "var(--black-mid)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: 10,
                    padding: "12px 14px 12px 42px",
                    color: "var(--white)",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                />
              </div>
            </div>

            {/* senha */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "var(--gray-light)", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  color: "var(--gray-mid)", display: "flex",
                }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: "var(--black-mid)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: 10,
                    padding: "12px 44px 12px 42px",
                    color: "var(--white)",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--gray-mid)", display: "flex", background: "none", border: "none", cursor: "pointer",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* esqueci */}
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <Link href="/esqueci-senha" style={{
                color: "var(--gold)", fontSize: 13,
                textDecoration: "none", transition: "opacity 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* erro */}
            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(224,85,85,0.1)", border: "1px solid rgba(224,85,85,0.3)", borderRadius: 8, color: "#e05555", fontSize: 13 }}>
                {error}
              </div>
            )}

            {/* botão entrar */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)",
                    borderTopColor: "var(--black)", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }} />
                  Entrando...
                </span>
              ) : (
                <>Entrar <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "24px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
            <span style={{ color: "var(--gray-dark)", fontSize: 12 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
          </div>

          {/* criar conta */}
          <p style={{ textAlign: "center", color: "var(--gray-mid)", fontSize: 14 }}>
            Ainda não tem conta?{" "}
            <Link href="/cadastro" style={{
              color: "var(--gold)", fontWeight: 600, textDecoration: "none",
            }}>
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
