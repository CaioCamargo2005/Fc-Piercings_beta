import { NextRequest, NextResponse } from "next/server";

/* ── GET /api/pix/status?id=123 ─────────────────────────────────
   Consulta o status de um pagamento no Mercado Pago.
   Roda no servidor porque a consulta exige o Access Token.
   O carrinho chama a cada poucos segundos enquanto o QR está
   aberto, até status = approved.
─────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Indisponível." }, { status: 503 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ status: data.status ?? "unknown" });
  } catch {
    return NextResponse.json({ error: "Erro de conexão." }, { status: 502 });
  }
}
