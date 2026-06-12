import InstitucionalLayout from "@/app/components/ui/InstitucionalLayout";

export const metadata = { title: "Política de Trocas — FC Piercing e Semi Joias" };

export default function PoliticaDeTrocasPage() {
  return (
    <InstitucionalLayout title="Trocas e Devoluções" breadcrumb="Política de Trocas" sections={[
      {
        title: "Trocas e Devoluções", icon: "🔄",
        content: (
          <p>Respeitamos seus direitos como consumidor. Confira abaixo as condições e prazos para solicitar trocas ou devoluções.</p>
        ),
      },
      {
        title: "Prazo para Devolução (Desistência da Compra)", icon: "📅",
        content: (
          <>
            <p>De acordo com o <strong style={{ color: "var(--black)" }}>Artigo 49 do Código de Defesa do Consumidor (CDC)</strong>, você pode devolver qualquer produto em até <strong style={{ color: "var(--black)" }}>7 dias corridos</strong> após o recebimento, desde que:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>O produto esteja nas mesmas condições em que foi enviado</li>
              <li>Sem sinais de uso</li>
              <li>Com embalagem original e etiquetas intactas</li>
            </ul>
          </>
        ),
      },
      {
        title: "Política de Troca", icon: "↔️",
        content: (
          <>
            <p>Para trocas por outros motivos (tamanho, modelo, cor), entre em contato com a vendedora para combinar. As condições são avaliadas caso a caso.</p>
            <p style={{ marginTop: 8, fontSize: 12, color: "var(--gray-mid)" }}>
              * Produtos com sinais de uso ou fora do prazo de 7 dias não são elegíveis para troca ou devolução por desistência.
            </p>
          </>
        ),
      },
      {
        title: "Como Solicitar Troca ou Devolução", icon: "💬",
        content: (
          <>
            <p>Para iniciar o processo, entre em contato com nosso atendimento:</p>
            <div style={{ margin: "12px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <a href="https://wa.me/5519997103023" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>
                WhatsApp: (19) 99710-3023
              </a>
            </div>
            <p>Envie as seguintes informações:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Número do pedido</li>
              <li>Detalhes do produto</li>
              <li>Motivo da troca ou devolução</li>
              <li>Fotos do produto</li>
            </ul>
            <p style={{ marginTop: 10 }}>Após o primeiro contato, você receberá uma autorização de devolução com todas as instruções para o envio do produto.</p>
          </>
        ),
      },
    ]} />
  );
}
