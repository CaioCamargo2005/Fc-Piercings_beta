"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Clock, XCircle, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";

/* ── /pedido ────────────────────────────────────────────────────
   Página de retorno do Checkout Pro do Mercado Pago.
   O MP redireciona com query params: status (approved | pending |
   rejected...), payment_id e external_reference.

   O resumo do pedido (itens + endereço) foi salvo em localStorage
   pelo carrinho antes do redirect — usamos para montar a mensagem
   de confirmação no WhatsApp da loja.
─────────────────────────────────────────────────────────────── */

type SavedOrder = {
  lines: string[];       // linhas "2x Nome do Produto (Prata)"
  address: string;       // endereço formatado
  total: string;         // "R$ 123,45"
};

function PedidoContent() {
  const params = useSearchParams();
  const { clearCart } = useCart();

  const status  = params.get("status") ?? params.get("collection_status") ?? "";
  const payId   = params.get("payment_id") ?? params.get("collection_id") ?? "";
  const ref     = params.get("external_reference") ?? "";

  const approved = status === "approved";
  const pending  = status === "pending" || status === "in_process";

  const [order, setOrder] = useState<SavedOrder | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fc-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch { /* sem resumo salvo — mensagem sai genérica */ }
    // pagamento aprovado = carrinho cumprido
    if (approved) clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved]);

  function whatsAppMsg() {
    const parts = [
      approved
        ? "Olá! Acabei de pagar meu pedido pelo site ✅"
        : "Olá! Fiz um pedido pelo site e o pagamento está em processamento.",
      ref ? `\nPedido: ${ref}` : null,
      payId ? `Pagamento MP: ${payId}` : null,
      order?.lines?.length ? `\n${order.lines.join("\n")}` : null,
      order?.total ? `\nTotal: ${order.total}` : null,
      order?.address ? `\nEndereço de entrega:\n${order.address}` : null,
    ].filter(Boolean).join("\n");
    return encodeURIComponent(parts);
  }

  const icon = approved
    ? <CheckCircle2 size={44} strokeWidth={1.5} style={{ color: "#4ade80" }} />
    : pending
      ? <Clock size={44} strokeWidth={1.5} style={{ color: "var(--gold)" }} />
      : <XCircle size={44} strokeWidth={1.5} style={{ color: "#f87171" }} />;

  const title = approved
    ? "Pagamento aprovado!"
    : pending
      ? "Pagamento em processamento"
      : "Pagamento não concluído";

  const text = approved
    ? "Recebemos seu pagamento. Envie a confirmação no WhatsApp para agilizarmos o envio do seu pedido."
    : pending
      ? "Seu pagamento está sendo processado (Pix e boleto podem levar alguns minutos). Envie a confirmação no WhatsApp que acompanhamos por lá."
      : "O pagamento não foi concluído. Você pode tentar novamente pelo carrinho ou finalizar direto no WhatsApp.";

  return (
    <div className="px-4" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{
          background: "var(--black-soft)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 16,
          padding: "36px 32px",
          textAlign: "center",
        }}>
          <Image src="/logo.png" alt="FC Piercing e Semi Joias" width={96} height={96}
            style={{ margin: "0 auto 12px", display: "block" }} />

          <div style={{ marginBottom: 14 }}>{icon}</div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700,
            color: "var(--white)", marginBottom: 12,
          }}>
            {title}
          </h1>

          <p style={{ color: "var(--gray-mid)", fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
            {text}
          </p>

          {(ref || payId) && (
            <p style={{ color: "var(--gray-dark)", fontSize: 12, marginBottom: 24 }}>
              {ref && <>Pedido <span style={{ color: "var(--gold-light)" }}>{ref}</span></>}
              {ref && payId && " · "}
              {payId && <>Pagamento <span style={{ color: "var(--gold-light)" }}>{payId}</span></>}
            </p>
          )}

          {(approved || pending) ? (
            <a href={`https://wa.me/5519997103023?text=${whatsAppMsg()}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                textDecoration: "none",
                background: "rgba(37,211,102,0.1)", color: "#25D366",
                border: "1px solid rgba(37,211,102,0.3)", marginBottom: 14,
              }}>
              <MessageCircle size={17} />
              Enviar confirmação no WhatsApp
            </a>
          ) : (
            <Link href="/carrinho" className="btn-gold"
              style={{
                display: "block", padding: "13px", borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 14,
              }}>
              Voltar ao carrinho e tentar novamente
            </Link>
          )}

          <Link href="/" style={{ fontSize: 13, color: "var(--gray-mid)", textDecoration: "none" }}>
            Continuar navegando →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PedidoPage() {
  return (
    <Suspense fallback={null}>
      <PedidoContent />
    </Suspense>
  );
}
