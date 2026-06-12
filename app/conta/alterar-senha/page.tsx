"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-mock";

export default function AlterarSenhaPage() {
  const { loggedIn } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  }

  const passwordStrength = (() => {
    const p = form.next;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (p.length >= 16) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const sequences = ["abcdefghijklmnopqrstuvwxyz","0123456789","qwertyuiop"];
    for (const seq of sequences)
      for (let i = 0; i <= seq.length - 4; i++)
        if (p.toLowerCase().includes(seq.slice(i, i + 4))) { score -= 2; break; }
    if (/(.)\1{2,}/.test(p)) score -= 2;
    return Math.max(0, Math.min(5, score));
  })();

  const strengthColor = ["","#e05555","#e05555","#e09055","#C9A84C","#4CAF50"][passwordStrength];
  const strengthLabel = ["","Muito fraca","Fraca","Razoável","Boa","Forte"][passwordStrength];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.next !== form.confirm) { setError("As senhas não conferem."); return; }
    if (passwordStrength < 2) { setError("Escolha uma senha mais forte."); return; }
    if (form.current === form.next) { setError("A nova senha deve ser diferente da atual."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1000);
  }

  const inputBase: React.CSSProperties = {
    width: "100%", background: "var(--black-mid)",
    border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10,
    padding: "12px 44px", color: "var(--white)",
    fontSize: 14, outline: "none", transition: "border-color 0.2s",
  };

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "var(--gray-mid)" }}>Você precisa estar logado.</p>
        <Link href="/login" style={{ color: "var(--gold)", fontSize: 14 }}>Entrar</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 120px)", background: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Link href="/conta" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--gold)", fontSize: 13, textDecoration: "none", marginBottom: 24 }}>
          <ArrowLeft size={14} /> Voltar para minha conta
        </Link>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700,
          background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          marginBottom: 6 }}>Alterar Senha</h1>
        <p style={{ color: "var(--gray-mid)", fontSize: 14, marginBottom: 28 }}>
          Preencha os campos abaixo para definir uma nova senha.
        </p>

        <div style={{ background: "var(--black-soft)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, padding: "36px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(76,175,80,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Check size={28} style={{ color: "#4CAF50" }} />
              </div>
              <p style={{ color: "var(--white)", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Senha alterada!</p>
              <p style={{ color: "var(--gray-mid)", fontSize: 14, marginBottom: 20 }}>Sua senha foi atualizada com sucesso.</p>
              <Link href="/conta" className="btn-gold"
                style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Voltar para o perfil
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* senha atual */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", color: "var(--gray-light)", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Senha atual</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-mid)", display: "flex" }}><Lock size={16} /></span>
                  <input type={show.current ? "text" : "password"} placeholder="Sua senha atual"
                    value={form.current} onChange={e => set("current", e.target.value)} required style={inputBase}
                    onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.2)")} />
                  <button type="button" onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-mid)", display: "flex" }}>
                    {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* nova senha */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", color: "var(--gray-light)", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Nova senha</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-mid)", display: "flex" }}><Lock size={16} /></span>
                  <input type={show.next ? "text" : "password"} placeholder="Mínimo 8 caracteres"
                    value={form.next} onChange={e => set("next", e.target.value)} required style={inputBase}
                    onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.2)")} />
                  <button type="button" onClick={() => setShow(s => ({ ...s, next: !s.next }))}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-mid)", display: "flex" }}>
                    {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* força */}
              {form.next && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, transition: "background 0.3s",
                        background: i <= passwordStrength ? strengthColor : "rgba(201,168,76,0.1)" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: strengthColor }}>{strengthLabel}</p>
                    <p style={{ fontSize: 11, color: "var(--gray-mid)" }}>{passwordStrength}/5</p>
                  </div>
                </div>
              )}

              {/* confirmar */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", color: "var(--gray-light)", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Confirmar nova senha</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-mid)", display: "flex" }}><Lock size={16} /></span>
                  <input type={show.confirm ? "text" : "password"} placeholder="Repita a nova senha"
                    value={form.confirm} onChange={e => set("confirm", e.target.value)} required
                    style={{ ...inputBase, borderColor: form.confirm ? form.confirm === form.next ? "#4CAF50" : "#e05555" : "rgba(201,168,76,0.2)" }} />
                  <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gray-mid)", display: "flex" }}>
                    {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirm && (
                  <p style={{ fontSize: 12, marginTop: 6, color: form.confirm === form.next ? "#4CAF50" : "#e05555" }}>
                    {form.confirm === form.next ? "✓ Senhas conferem" : "✕ Senhas não conferem"}
                  </p>
                )}
              </div>

              {error && (
                <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(224,85,85,0.1)", border: "1px solid rgba(224,85,85,0.3)", borderRadius: 8, color: "#e05555", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-gold"
                style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "var(--black)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Salvando...
                  </>
                ) : "Alterar senha"}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
