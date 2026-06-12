import InstitucionalLayout from "@/app/components/ui/InstitucionalLayout";

export const metadata = { title: "Como Comprar — FC Piercing e Semi Joias" };

const steps = [
  "Navegue pelo catálogo e escolha os produtos que deseja.",
  "Clique em Adicionar para incluir o item no carrinho.",
  "Acesse o carrinho, revise os itens e calcule o frete pelo seu CEP.",
  "Escolha a forma de pagamento: WhatsApp, Pix ou Cartão de Crédito.",
  "Finalize o pedido e aguarde a confirmação.",
];

const payments = [
  { icon: "💬", text: "WhatsApp — finalize diretamente com a vendedora. Pagamento combinado manualmente." },
  { icon: "🟦", text: "Pix — geração automática de QR Code. 5% de desconto no valor total." },
  { icon: "💳", text: "Cartão de Crédito — parcelamento em até 3x sem juros." },
];

export default function ComoComprarPage() {
  return (
    <InstitucionalLayout title="Como Comprar" breadcrumb="Como Comprar" sections={[
      {
        title: "É simples e rápido!", icon: "🛍️",
        content: (
          <>
            <p>Comprar na FC Piercing e Semi Joias é fácil. Siga os passos abaixo:</p>
            <ol style={{ paddingLeft: 20, marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {steps.map((step, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
                    background: "linear-gradient(135deg,#8B6914,#C9A84C)", color: "var(--black)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </>
        ),
      },
      {
        title: "Formas de Pagamento", icon: "💳",
        content: (
          <ul style={{ paddingLeft: 4, display: "flex", flexDirection: "column", gap: 8, listStyle: "none" }}>
            {payments.map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        ),
      },
      {
        title: "Dúvidas?", icon: "❓",
        content: (
          <p>
            Entre em contato pelo WhatsApp{" "}
            <a href="https://wa.me/5519997103023" style={{ color: "var(--gold)", textDecoration: "none" }}>
              (19) 99710-3023
            </a>{" "}
            — nossa equipe responde de seg. a sex., das 9h às 17h.
          </p>
        ),
      },
    ]} />
  );
}
