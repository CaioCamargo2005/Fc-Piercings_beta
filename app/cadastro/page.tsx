"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type AccountType = "pessoa_fisica" | "pessoa_juridica";

export default function CadastroPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("pessoa_fisica");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    cnpj: "",
    password: "",
    confirm: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function formatPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
  }

  function formatCPF(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4").replace(/-$/, "");
  }

  function formatCNPJ(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 14);
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5").replace(/-$/, "");
  }

  const passwordAnalysis = (() => {
    const p = form.password;
    if (!p) return { score: 0, penalties: [] as string[] };

    let score = 0;
    const penalties: string[] = [];

    // BÔNUS
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (p.length >= 16) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const types = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
    if (types >= 4) score++;

    // PENALIDADES — sequências previsíveis
    const sequences = [
      "abcdefghijklmnopqrstuvwxyz","zyxwvutsrqponmlkjihgfedcba",
      "0123456789","9876543210","qwertyuiop","asdfghjkl","zxcvbnm",
    ];
    for (const seq of sequences) {
      for (let i = 0; i <= seq.length - 4; i++) {
        if (p.toLowerCase().includes(seq.slice(i, i + 4))) {
          score -= 2;
          penalties.push("contém sequência previsível");
          break;
        }
      }
    }

    // caracteres repetidos
    if (/(.)1{2,}/.test(p.replace(/(.){2,}/g, (m) => { score -= 2; penalties.push("caracteres repetidos"); return m; }))) {
      // handled inline above
    }
    if (/(.){2,}/.test(p)) {
      score -= 2;
      penalties.push("caracteres repetidos em sequência");
    }

    // senhas comuns
    const common = ["password","senha","123456","111111","abc123","iloveyou",
                    "admin","letmein","welcome","monkey","dragon","master",
                    "sunshine","princess","football"];
    if (common.some(c => p.toLowerCase().includes(c))) {
      score -= 3;
      penalties.push("contém palavra muito comum");
    }

    // sem diversidade
    if (/^[a-zA-Z]+$/.test(p)) { score--; penalties.push("só letras"); }
    if (/^[0-9]+$/.test(p))    { score--; penalties.push("só números"); }

    return { score: Math.max(0, Math.min(5, score)), penalties: [...new Set(penalties)] };
  })();

  const { score: passwordStrength, penalties: pwPenalties } = passwordAnalysis;
  const strengthColor = ["", "#e05555", "#e05555", "#e09055", "#C9A84C", "#4CAF50"][passwordStrength];
  const strengthLabel = ["", "Muito fraca", "Fraca", "Razoável", "Boa", "Forte"][passwordStrength];

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("As senhas não conferem."); return; }
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();

      // 1. Cria o usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.nome },  // passado ao trigger que cria o profile
          emailRedirectTo: `${window.location.origin}/conta`,
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      // 2. Se confirmação de e-mail está desativada, sessão já existe
      //    Se está ativada, signUpData.session é null — tudo bem, o trigger já criou o profile
      const userId = signUpData.user?.id;
      if (!userId) throw new Error("Erro inesperado ao criar conta.");

      // 3. Salva dados extras no profile (funciona mesmo sem sessão via service role no trigger)
      //    Tentamos atualizar — se falhar por RLS, o trigger já terá salvo o básico
      await supabase.from("profiles").upsert({
        id: userId,
        email: form.email,
        name: form.nome,
        phone: form.telefone || null,
        cpf: accountType === "pessoa_fisica" ? form.cpf || null : null,
        cnpj: accountType === "pessoa_juridica" ? form.cnpj || null : null,
        account_type: accountType,
      } as never, { onConflict: "id" });

      setSuccess(true);

      // Se já tem sessão (confirmação de e-mail desativada), vai para /conta
      // Se não tem (confirmação ativada), vai para a tela de verificação de e-mail
      if (signUpData.session) {
        setTimeout(() => router.push("/conta"), 1500);
      } else {
        router.push(`/verificar-email?email=${encodeURIComponent(form.email)}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "var(--black-mid)",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: 10,
    padding: "12px 14px 12px 42px",
    color: "var(--white)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
  } as React.CSSProperties;

  const iconStyle = {
    position: "absolute" as const,
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--gray-mid)",
    display: "flex",
  };

  const labelStyle = {
    display: "block",
    color: "var(--gray-light)",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 8,
  } as React.CSSProperties;

  return (
    <div style={{
      minHeight: "calc(100vh - 120px)",
      background: "var(--white)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* logo + título */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Image src="/logo.png" alt="FC Piercing" width={72} height={72} style={{ objectFit: "contain" }} />
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
            background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 6,
          }}>Criar conta</h1>
          <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>
            Cadastre-se para começar a comprar ✨
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

            {/* tipo de cadastro */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ ...labelStyle, marginBottom: 12 }}>Tipo de cadastro</label>
              <div style={{ display: "flex", gap: 12 }}>
                {([
                  { value: "pessoa_fisica", label: "Pessoa Física", sub: "CPF" },
                  { value: "pessoa_juridica", label: "Pessoa Jurídica", sub: "CNPJ" },
                ] as { value: AccountType; label: string; sub: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAccountType(opt.value)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      border: accountType === opt.value
                        ? "2px solid var(--gold)"
                        : "1px solid rgba(201,168,76,0.2)",
                      background: accountType === opt.value
                        ? "rgba(201,168,76,0.08)"
                        : "var(--black-mid)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: accountType === opt.value ? "var(--gold)" : "var(--gray-light)",
                    }}>{opt.label}</span>
                    <span style={{ fontSize: 11, color: "var(--gray-mid)" }}>{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* nome */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {accountType === "pessoa_fisica" ? "Nome completo" : "Razão social"}
              </label>
              <div style={{ position: "relative" }}>
                <span style={iconStyle}><User size={16} /></span>
                <input
                  type="text"
                  placeholder={accountType === "pessoa_fisica" ? "Seu nome completo" : "Nome da empresa"}
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                />
              </div>
            </div>

            {/* cpf ou cnpj */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{accountType === "pessoa_fisica" ? "CPF" : "CNPJ"}</label>
              <div style={{ position: "relative" }}>
                <span style={iconStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder={accountType === "pessoa_fisica" ? "000.000.000-00" : "00.000.000/0000-00"}
                  value={accountType === "pessoa_fisica" ? form.cpf : form.cnpj}
                  onChange={(e) => {
                    const v = accountType === "pessoa_fisica"
                      ? formatCPF(e.target.value)
                      : formatCNPJ(e.target.value);
                    set(accountType === "pessoa_fisica" ? "cpf" : "cnpj", v);
                  }}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                />
              </div>
            </div>

            {/* e-mail + telefone lado a lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>E-mail</label>
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}><Mail size={16} /></span>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Telefone / WhatsApp</label>
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}><Phone size={16} /></span>
                  <input
                    type="text"
                    placeholder="(19) 99999-9999"
                    value={form.telefone}
                    onChange={(e) => set("telefone", formatPhone(e.target.value))}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                  />
                </div>
              </div>
            </div>

            {/* senha + confirmar lado a lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 8 }}>
              <div>
                <label style={labelStyle}>Senha</label>
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}><Lock size={16} /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-mid)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirmar senha</label>
                <div style={{ position: "relative" }}>
                  <span style={iconStyle}><Lock size={16} /></span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={form.confirm}
                    onChange={(e) => set("confirm", e.target.value)}
                    required
                    style={{
                      ...inputStyle,
                      paddingRight: 44,
                      borderColor: form.confirm && form.confirm !== form.password
                        ? "#e05555"
                        : form.confirm && form.confirm === form.password
                        ? "#4CAF50"
                        : "rgba(201,168,76,0.2)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={(e) => {
                      e.target.style.borderColor = form.confirm !== form.password
                        ? "#e05555"
                        : form.confirm
                        ? "#4CAF50"
                        : "rgba(201,168,76,0.2)";
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-mid)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* força da senha */}
            {form.password && (
              <div style={{ marginBottom: 20 }}>
                {/* 5 barras */}
                <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: i <= passwordStrength ? strengthColor : "rgba(201,168,76,0.1)",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
                {/* label + score */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: strengthColor }}>{strengthLabel}</p>
                  <p style={{ fontSize: 11, color: "var(--gray-mid)" }}>{passwordStrength}/5</p>
                </div>
                {/* penalidades */}
                {pwPenalties.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    {pwPenalties.map((p, i) => (
                      <p key={i} style={{ fontSize: 11, color: "#e09055", display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                        ⚠ {p}
                      </p>
                    ))}
                  </div>
                )}
                {/* dicas quando fraca */}
                {passwordStrength <= 2 && (
                  <div style={{ marginTop: 6, padding: "8px 10px", background: "rgba(201,168,76,0.06)", borderRadius: 6, borderLeft: "2px solid rgba(201,168,76,0.3)" }}>
                    <p style={{ fontSize: 11, color: "var(--gray-mid)", lineHeight: 1.6 }}>
                      💡 Dica: use 12+ caracteres, misture letras maiúsculas, minúsculas, números e símbolos como <span style={{ color: "var(--gold)" }}>@#$%</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* confirmação de senhas ok */}
            {form.confirm && form.confirm === form.password && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, color: "#4CAF50", fontSize: 13 }}>
                <Check size={14} /> Senhas conferem
              </div>
            )}
            {form.confirm && form.confirm !== form.password && (
              <div style={{ marginBottom: 16, color: "#e05555", fontSize: 13 }}>
                ✕ Senhas não conferem
              </div>
            )}

            {/* termos */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24 }}>
              <input type="checkbox" id="termos" required
                style={{ marginTop: 2, accentColor: "var(--gold)", cursor: "pointer" }} />
              <label htmlFor="termos" style={{ color: "var(--gray-mid)", fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
                Li e concordo com os{" "}
                <Link href="/termos" style={{ color: "var(--gold)" }}>Termos de Uso</Link>
                {" "}e a{" "}
                <Link href="/privacidade" style={{ color: "var(--gold)" }}>Política de Privacidade</Link>
              </label>
            </div>

            {/* botão */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{
                width: "100%", padding: "13px", borderRadius: 10,
                fontSize: 15, fontWeight: 600, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)",
                    borderTopColor: "var(--black)", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite", display: "inline-block",
                  }} />
                  Criando conta...
                </span>
              ) : (
                <>Criar conta <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
            <span style={{ color: "var(--gray-dark)", fontSize: 12 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.15)" }} />
          </div>

          <p style={{ textAlign: "center", color: "var(--gray-mid)", fontSize: 14 }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "none" }}>
              Entrar
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
