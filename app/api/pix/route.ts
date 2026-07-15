import { NextRequest, NextResponse } from "next/server";

/* ── POST /api/pix ──────────────────────────────────────────────
   Cria um pagamento Pix direto na API do Mercado Pago e devolve
   o QR Code (imagem base64) e o código copia-e-cola.
   O cliente paga sem sair do site; o front confere o status em
   /api/pix/status até aprovar.
─────────────────────────────────────────────────────────────── */

type PixBody = {
  amount: number;
  email: string;
  description?: string;
  address?: {
    cep: string; estado: string; cidade: string;
    rua: string; bairro: string; numero: string;
  } | null;
};

export async function POST(req: NextRequest) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Pagamento indisponível no momento." },
      { status: 503 }
    );
  }

  let body: PixBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const amount = Math.round(Number(body.amount) * 100) / 100;
  const email  = String(body.email ?? "").trim();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const external_reference = `FC-${Date.now()}`;

  const payment = {
    transaction_amount: amount,
    payment_method_id: "pix",
    description: String(body.description ?? "Pedido FC Piercing e Semi Joias").slice(0, 250),
    external_reference,
    payer: { email },
    metadata: body.address
      ? {
          endereco: `${body.address.rua}, ${body.address.numero} — ${body.address.bairro}, ${body.address.cidade}/${body.address.estado}, CEP ${body.address.cep}`,
        }
      : undefined,
  };

  try {
    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // exigido pelo MP: evita pagamento duplicado em retry de rede
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payment),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Mercado Pago Pix:", res.status, data);
      return NextResponse.json(
        { error: "Não foi possível gerar o Pix. Tente novamente." },
        { status: 502 }
      );
    }

    const tx = data.point_of_interaction?.transaction_data;
    return NextResponse.json({
      id: data.id,
      external_reference,
      qr_code: tx?.qr_code ?? null,             // copia-e-cola
      qr_code_base64: tx?.qr_code_base64 ?? null, // imagem do QR
    });
  } catch (e) {
    console.error("pix:", e);
    return NextResponse.json(
      { error: "Erro de conexão com o Mercado Pago." },
      { status: 502 }
    );
  }
}
