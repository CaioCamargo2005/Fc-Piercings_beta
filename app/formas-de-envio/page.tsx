import InstitucionalLayout from "@/app/components/ui/InstitucionalLayout";

export const metadata = { title: "Formas de Envio — FC Piercing e Semi Joias" };

export default function FormasDeEnvioPage() {
  return (
    <InstitucionalLayout title="Formas de Envio" breadcrumb="Formas de Envio" sections={[
      {
        title: "Opções de Frete", icon: "🚚",
        content: (
          <p>Pensando na sua comodidade e flexibilidade, oferecemos diversas modalidades de entrega.</p>
        ),
      },
      {
        title: "Correios — SEDEX", icon: "🟠",
        content: (
          <>
            <p>Entrega rápida e segura. Ideal para quem precisa receber o pedido com urgência.</p>
            <p style={{ marginTop: 6 }}>Prazo de entrega: varia de acordo com a localidade.</p>
          </>
        ),
      },

      {
        title: "Prazo de Preparo", icon: "⏱️",
        content: (
          <p>Todos os pedidos são processados em até <strong style={{ color: "var(--black)" }}>1 a 2 dias úteis</strong> após a confirmação do pagamento.</p>
        ),
      },
      {
        title: "Atrasos e Problemas na Entrega", icon: "⚠️",
        content: (
          <>
            <p>Fazemos o possível para garantir a entrega dentro do prazo. No entanto, atrasos podem ocorrer, especialmente em períodos de alta demanda.</p>
            <p style={{ marginTop: 8 }}>Recomendamos:</p>
            <ul style={{ paddingLeft: 20, marginTop: 6 }}>
              <li>Acompanhar seu pedido com o código de rastreio</li>
              <li>Em caso de dúvidas ou problemas, entrar em contato com nosso suporte</li>
            </ul>
          </>
        ),
      },
      {
        title: "Verificação de Endereço", icon: "📍",
        content: (
          <p>Antes de finalizar o pedido, verifique se o endereço está completo e correto. Não nos responsabilizamos por entregas não realizadas devido a erros ou omissões no preenchimento.</p>
        ),
      },
    ]} />
  );
}
