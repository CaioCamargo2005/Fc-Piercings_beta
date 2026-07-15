import { NextRequest, NextResponse } from "next/server";

/* ── POST /api/checkout ─────────────────────────────────────────
   Cria uma preferência de pagamento no Mercado Pago (Checkout Pro)
   e devolve a URL para redirecionar o cliente.

   Roda NO SERVIDOR: o MERCADOPAGO_ACCESS_TOKEN nunca chega ao
   navegador. Usa fetch direto na API do MP — sem SDK, menos deps.
─────────────────────────────────────────────────────────────── */

type CheckoutItem = {
  title: string;
  quantity: number;
  unit_price: number;
};

type CheckoutBody = {
  items: CheckoutItem[];
  shipping?: { label: string; price: number } | null;
  address?: {
    cep: string; estado: string; cidade: string;
    rua: string; bairro: string; numero: string;
  } | null;
  payerEmail?: string | null;
};

export async function POST(req: NextRequest) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Pagamento online indisponível no momento." },
      { status: 503 }
    );
  }

  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  // valida itens: nomes/preços vêm do cliente, então saneamos o básico
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }
  const items = body.items
    .filter(i => i.title && i.quantity > 0 && i.unit_price > 0)
    .map(i => ({
      title: String(i.title).slice(0, 250),
      quantity: Math.floor(i.quantity),
      unit_price: Math.round(i.unit_price * 100) / 100,
      currency_id: "BRL",
    }));
  if (items.length === 0) {
    return NextResponse.json({ error: "Itens inválidos." }, { status: 400 });
  }

  // frete entra como item para aparecer no total do checkout
  if (body.shipping && body.shipping.price > 0) {
    items.push({
      title: `Frete — ${String(body.shipping.label).slice(0, 100)}`,
      quantity: 1,
      unit_price: Math.round(body.shipping.price * 100) / 100,
      currency_id: "BRL",
    });
  }

  // base para as back_urls: origin da request, com fallback na env
  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const external_reference = `FC-${Date.now()}`;

  const preference = {
    items,
    external_reference,
    back_urls: {
      success: `${origin}/pedido`,
      pending: `${origin}/pedido`,
      failure: `${origin}/pedido`,
    },
    auto_return: "approved",
    statement_descriptor: "FC PIERCING",
    // endereço vai nos metadados — a Fernanda vê no painel do MP
    metadata: body.address
      ? {
          endereco: `${body.address.rua}, ${body.address.numero} — ${body.address.bairro}, ${body.address.cidade}/${body.address.estado}, CEP ${body.address.cep}`,
        }
      : undefined,
    payer: body.payerEmail ? { email: body.payerEmail } : undefined,
  };

  try {
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Mercado Pago:", res.status, data);
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      init_point: data.init_point,
      external_reference,
    });
  } catch (e) {
    console.error("checkout:", e);
    return NextResponse.json(
      { error: "Erro de conexão com o Mercado Pago." },
      { status: 502 }
    );
  }
}
