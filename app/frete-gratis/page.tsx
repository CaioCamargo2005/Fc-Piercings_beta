import InstitucionalLayout from "@/app/components/ui/InstitucionalLayout";
import Link from "next/link";

export const metadata = { title: "Frete Grátis — FC Piercing e Semi Joias" };

export default function FreteGratisPage() {
  return (
    <InstitucionalLayout title="Frete Grátis" breadcrumb="Frete Grátis" sections={[
      {
        title: "Como funciona?", icon: "🎁",
        content: (
          <>
            <p>Oferecemos <strong style={{ color: "var(--black)" }}>frete grátis</strong> para pedidos acima de <strong style={{ color: "var(--black)" }}>R$ 300,00</strong> para todo o Brasil.</p>
            <p style={{ marginTop: 8 }}>O benefício é aplicado automaticamente no carrinho ao atingir o valor mínimo — sem necessidade de nenhuma ação adicional.</p>
          </>
        ),
      },
      {
        title: "Condições", icon: "📋",
        content: (
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Válido para compras acima de R$ 300,00 no valor total dos produtos</li>
            <li>Aplicado automaticamente no carrinho</li>
            <li>Válido para todo o território nacional</li>
          </ul>
        ),
      },
      {
        title: "Continue comprando", icon: "🛒",
        content: (
          <p>
            Acompanhe o valor total do seu carrinho e aproveite o frete grátis.{" "}
            <Link href="/" style={{ color: "var(--gold)", textDecoration: "none" }}>
              Ver produtos →
            </Link>
          </p>
        ),
      },
    ]} />
  );
}
